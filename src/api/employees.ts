import type { Employee } from '../types/employee'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const TABLE_ENV = import.meta.env.VITE_EMPLOYEE_TABLE as string | undefined
const BUCKET_ENV = import.meta.env.VITE_AVATAR_BUCKET as string | undefined

const normalizeTableCandidates = (table?: string) => {
  if (!table) {
    return [] as string[]
  }

  const normalizedTable = table.includes('.')
    ? table.split('.').pop() || table
    : table

  const variants = new Set<string>([normalizedTable])
  const lower = normalizedTable.toLowerCase()
  const upper = normalizedTable.toUpperCase()

  if (table !== lower) {
    variants.add(lower)
  }

  if (table !== upper) {
    variants.add(upper)
  }

  if (
    /[A-Z]/.test(normalizedTable) &&
    !normalizedTable.startsWith('"') &&
    !normalizedTable.endsWith('"')
  ) {
    variants.add(`"${normalizedTable}"`)
  }

  return Array.from(variants)
}

const buildTableCandidates = () =>
  Array.from(
    new Set<string>([
      ...normalizeTableCandidates(TABLE_ENV),
      'employee',
      'Employee',
      '"Employee"',
    ]),
  )

const TABLE_CANDIDATES = buildTableCandidates()
const AVATAR_BUCKET = BUCKET_ENV || 'avatars'

const isTableMissing = (error: { message?: string; code?: string }) => {
  if (error.code === '42P01') {
    return true
  }

  return Boolean(error.message?.toLowerCase().includes('does not exist'))
}

const isColumnMissing = (error: { message?: string; code?: string }) => {
  if (error.code === '42703') {
    return true
  }

  return Boolean(error.message?.toLowerCase().includes('column') && error.message?.toLowerCase().includes('does not exist'))
}

const runWithTable = async <T,>(
  runner: (table: string) => Promise<{ data: T; error: { message: string; code?: string } | null }>,
): Promise<{ data: T; table: string }> => {
  let lastError: { message: string; code?: string } | null = null

  for (const table of TABLE_CANDIDATES) {
    const { data, error } = await runner(table)
    if (!error) {
      return { data, table }
    }

    lastError = error
    if (!isTableMissing(error)) {
      break
    }
  }

  const details = lastError?.message || 'Unknown Supabase error'
  throw new Error(
    `Supabase table lookup failed. Tried: ${TABLE_CANDIDATES.join(', ')}. ${details}`,
  )
}

export const listEmployees = async (): Promise<Employee[]> => {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  try {
    const { data } = await runWithTable<Employee[] | null>((table) =>
      supabase
        .from(table)
        .select('id,name,avatar,created_at')
        .order('created_at', { ascending: false }),
    )

    return data ?? []
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }

    if (!isColumnMissing({ message: error.message })) {
      throw error
    }

    const { data } = await runWithTable<Employee[] | null>((table) =>
      supabase.from(table).select('id,name,avatar').order('id', { ascending: false }),
    )

    return data ?? []
  }
}

export const deleteEmployee = async (id: string): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  await runWithTable<null>((table) =>
    supabase.from(table).delete().eq('id', id),
  )
}

export const updateEmployeeName = async (
  id: string,
  name: string,
): Promise<Employee | null> => {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data } = await runWithTable<Employee | null>((table) =>
    supabase
      .from(table)
      .update({ name })
      .eq('id', id)
      .select('id,name,avatar,created_at')
      .maybeSingle(),
  )

  return data ?? null
}

export const resolveAvatarUrl = (avatar: string | null): string | null => {
  if (!avatar) {
    return null
  }

  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }

  if (!isSupabaseConfigured || !supabase) {
    return null
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatar)

  return data.publicUrl ?? null
}
