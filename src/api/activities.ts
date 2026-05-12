import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ActivityRecord } from '../components/views/ActivityView';

/**
 * Lấy danh sách nhật ký hoạt động từ Supabase
 */
export async function listActivities(): Promise<ActivityRecord[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return data as ActivityRecord[];
}

/**
 * Thêm một bản ghi nhật ký mới vào Supabase
 */
export async function logActivity(
  action: string, 
  details: string, 
  type: ActivityRecord['type'],
  adminId: string | number
) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase not configured, skipping log.');
    return;
  }

  // Ensure adminId is a number if it's a numeric string (for int8 column)
  const numericId = typeof adminId === 'string' ? parseInt(adminId, 10) : adminId;

  const { error } = await supabase
    .from('activity_logs')
    .insert([{
      admin_id: numericId,
      action,
      details,
      type,
      timestamp: new Date().toISOString()
    }]);

  if (error) {
    console.error('FAILED TO LOG TO SUPABASE:', error.message, error.details);
    // Optionally re-throw or handle based on app needs
    throw new Error(`Logging failed: ${error.message}`);
  }
}
