export interface AdminUser {
  id: string | number;
  email: string;
  password?: string;
  name?: string;
  avatar?: string; // Đã đổi từ avatar_url thành avatar
  two_factor_enabled?: boolean;
  created_at?: string;
}
