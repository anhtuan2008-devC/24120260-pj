import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Employee } from './types/employee'
import {
  deleteEmployee,
  listEmployees,
  resolveAvatarUrl,
  updateEmployeeName,
} from './api/employees'
import { isSupabaseConfigured } from './lib/supabase'
import { formatDate } from './utils/date'

const FALLBACK_NAME = 'Unnamed'

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const totalEmployees = employees.length

  const loadEmployees = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await listEmployees()
      setEmployees(data)
      setLastUpdated(new Date().toISOString())
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load employees.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEmployees()
  }, [loadEmployees])

  const startEditing = (employee: Employee) => {
    setEditingId(employee.id)
    setDraftName(employee.name ?? '')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setDraftName('')
  }

  const saveEditing = async (employeeId: string) => {
    const trimmed = draftName.trim()
    if (!trimmed) {
      setError('Name is required before saving.')
      return
    }

    setBusyId(employeeId)
    setError(null)

    try {
      const updated = await updateEmployeeName(employeeId, trimmed)
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === employeeId
            ? { ...employee, ...(updated ?? {}), name: trimmed }
            : employee,
        ),
      )
      cancelEditing()
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : 'Failed to update the employee.'
      setError(message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (employeeId: string) => {
    const confirmed = window.confirm('Delete this employee?')
    if (!confirmed) {
      return
    }

    setBusyId(employeeId)
    setError(null)

    try {
      await deleteEmployee(employeeId)
      setEmployees((prev) => prev.filter((employee) => employee.id !== employeeId))
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete the employee.'
      setError(message)
    } finally {
      setBusyId(null)
    }
  }

  const emptyStateMessage = useMemo(() => {
    if (!isSupabaseConfigured) {
      return 'Add your Supabase credentials to begin loading data.'
    }

    if (isLoading) {
      return 'Loading employees from Supabase.'
    }

    if (error) {
      return error
    }

    return 'No employees found. Import CSV data in Supabase to populate this list.'
  }, [error, isLoading, isSupabaseConfigured])

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">React + Supabase</p>
          <h1>Employee Directory</h1>
          <p className="sub">
            Browse, rename, and remove employees. Dates follow the{' '}
            <strong>dd/MM/yyyy</strong> format.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary"
              onClick={loadEmployees}
              disabled={!isSupabaseConfigured || isLoading}
            >
              {isLoading ? 'Refreshing…' : 'Refresh data'}
            </button>
            <div className="meta">
              <span className="chip">{totalEmployees} employees</span>
              <span className="chip">
                Updated {lastUpdated ? formatDate(lastUpdated) : '—'}
              </span>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <p className="card-title">Checklist</p>
          <ul>
            <li>Supabase table: Employee (name, avatar)</li>
            <li>Storage bucket: avatars</li>
            <li>Policy: allow select for all</li>
          </ul>
          <p className="card-note">
            Import the CSV, upload avatars, and the UI syncs instantly.
          </p>
        </div>
      </header>

      {!isSupabaseConfigured ? (
        <section className="notice">
          <h2>Connect Supabase</h2>
          <p>
            Add <strong>VITE_SUPABASE_URL</strong> and{' '}
            <strong>VITE_SUPABASE_ANON_KEY</strong> to your local environment.
            Copy <strong>.env.example</strong> to <strong>.env</strong>.
          </p>
        </section>
      ) : null}

      <section className="table">
        <div className="table-head">
          <span>Employee</span>
          <span>Name</span>
          <span>Created</span>
          <span>Actions</span>
        </div>

        {employees.length === 0 ? (
          <div className="empty-state">{emptyStateMessage}</div>
        ) : (
          <div className="table-body">
            {employees.map((employee, index) => {
              const avatarUrl = resolveAvatarUrl(employee.avatar)
              const name = employee.name?.trim() || FALLBACK_NAME
              const isEditing = editingId === employee.id
              const initial = name.charAt(0).toUpperCase()

              return (
                <div
                  className="row"
                  key={employee.id}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="cell avatar">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} loading="lazy" />
                    ) : (
                      <div className="avatar-fallback">{initial}</div>
                    )}
                  </div>
                  <div className="cell name">
                    {isEditing ? (
                      <input
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        maxLength={64}
                      />
                    ) : (
                      <span>{name}</span>
                    )}
                    <span className="tag">ID: {employee.id.slice(0, 8)}</span>
                  </div>
                  <div className="cell created">
                    {formatDate(employee.created_at)}
                  </div>
                  <div className="cell actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => saveEditing(employee.id)}
                          disabled={busyId === employee.id}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="ghost"
                          onClick={cancelEditing}
                          disabled={busyId === employee.id}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => startEditing(employee)}
                        disabled={busyId === employee.id}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(employee.id)}
                      disabled={busyId === employee.id}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <footer className="foot">
        <p>
          Need help? Check the assignment in{' '}
          <strong>references/paper.md</strong>.
        </p>
      </footer>
    </div>
  )
}

export default App
