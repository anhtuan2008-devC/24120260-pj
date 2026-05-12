import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AdminUser } from '../types/auth';

/**
 * Verify Admin from 'admins' table
 */
export async function verifyAdmin(email: string, pass: string): Promise<AdminUser> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured. Please check your .env file');
  }

  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .eq('password', pass)
    .single();

  if (error || !data) {
    throw new Error('Invalid email or password.');
  }

  return data as AdminUser;
}

/**
 * Update Admin profile (with diagnostic logging)
 */
export async function updateAdminProfile(adminId: string | number, updates: Partial<AdminUser>) {
  if (!isSupabaseConfigured || !supabase) return null;

  console.log('[DEBUG] Starting Admin update:', { adminId, updates });

  // Step 1: Try update by ID
  const { data: idMatch, error: idError } = await supabase
    .from('admins')
    .update(updates)
    .eq('id', adminId)
    .select()
    .maybeSingle();

  if (idMatch) {
    console.log('[DEBUG] Update successful via ID.');
    return idMatch as AdminUser;
  }

  if (idError) {
    console.error('[DEBUG] Error updating via ID:', idError.message);
  }

  // Step 2: Fallback - Try update by Email
  const targetEmail = updates.email;
  if (targetEmail) {
    console.log('[DEBUG] Attempting fallback update via Email:', targetEmail);
    const { data: emailMatch, error: emailError } = await supabase
      .from('admins')
      .update(updates)
      .eq('email', targetEmail)
      .select()
      .maybeSingle();

    if (emailMatch) {
      console.log('[DEBUG] Update successful via Email.');
      return emailMatch as AdminUser;
    }
    
    if (emailError) {
      console.error('[DEBUG] Error updating via Email:', emailError.message);
    }
  }

  // Step 3: If all fail, throw detailed error
  const errorMsg = `Account not found for update (ID: ${adminId}, Email: ${targetEmail || 'N/A'}). Please check the 'admins' table.`;
  console.error('[DEBUG]', errorMsg);
  throw new Error(errorMsg);
}

/**
 * Upload Avatar to Supabase Storage (bucket: avatars)
 */
export async function uploadAdminAvatar(adminId: string | number, file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  const fileExt = file.name.split('.').pop();
  const fileName = `${adminId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `admin-avatars/${fileName}`;

  // 1. Upload file
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error('Avatar upload failed: ' + uploadError.message);
  }

  // 2. Lấy Public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Generate OTP and save to database
 */
export async function generateOTP(email: string): Promise<string> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  // Delete old OTPs for this email
  await supabase.from('otp_codes').delete().eq('email', email);

  // Lưu mã mới
  const { error } = await supabase.from('otp_codes').insert([{
    email,
    code,
    expires_at: expiresAt
  }]);

  if (error) throw new Error('Failed to generate OTP: ' + error.message);

  // Trigger Edge Function to send real email
  try {
    await supabase.functions.invoke('send-otp', {
      body: { email, code }
    });
  } catch (fnError) {
    console.error('Failed to send real email, falling back to mock:', fnError);
  }

  return code;
}

/**
 * Verify OTP code
 */
export async function verifyOTP(email: string, code: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  const { data, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return false;

  // Delete code after successful use
  await supabase.from('otp_codes').delete().eq('email', email);
  
  return true;
}
