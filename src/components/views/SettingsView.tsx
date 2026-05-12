import { useState } from 'react';
import { ShieldIcon, DatabaseIcon, SunIcon, MoonIcon, CheckIcon, XIcon } from '../ui/icons';
import { updateAdminProfile } from '../../api/auth';
import type { AdminUser } from '../../types/auth';
import './Views.css';

interface SettingsViewProps {
  admin: AdminUser;
  onUpdateAdmin: (updated: AdminUser) => void;
  onAddActivity: (action: string, details: string, type: 'update' | 'delete' | 'auth' | 'system') => void;
}

export function SettingsView({ admin, onUpdateAdmin, onAddActivity }: SettingsViewProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
  });

  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(admin.two_factor_enabled || false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('admin_theme', newTheme);
  };

  const toggle2FA = async () => {
    const newValue = !is2FAEnabled;
    setIsSaving(true);
    try {
      const updated = await updateAdminProfile(admin.id, { two_factor_enabled: newValue });
      if (updated) {
        setIs2FAEnabled(newValue);
        onUpdateAdmin(updated);
        onAddActivity('Toggle 2FA', `Two-factor authentication ${newValue ? 'enabled' : 'disabled'}.`, 'update');
      }
    } catch (err) {
      alert('2FA Update failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword) return;
    setIsSaving(true);
    try {
      const updated = await updateAdminProfile(admin.id, { password: newPassword });
      if (updated) {
        onUpdateAdmin(updated);
        setIsChangingPass(false);
        setNewPassword('');
        onAddActivity('Change Password', 'Admin updated login password.', 'update');
        alert('Password updated successfully!');
      }
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="view-container blur-fade-in">
      <div className="view-header">
        <h1>Account Settings</h1>
        <p>Configure your preferences and system parameters.</p>
      </div>

      <div className="settings-grid">
        <section className="settings-section">
          <div className="section-title">
            <ShieldIcon size={18} />
            <h3>Security</h3>
          </div>
          <div className="settings-card">
            <div className="setting-row">
              <div className="setting-info">
                <span>Change Password</span>
                <p>Update your login credentials regularly.</p>
              </div>
              {isChangingPass ? (
                <div className="inline-edit-form">
                  <input 
                    type="password" 
                    placeholder="New password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button className="icon-btn success" onClick={handlePasswordUpdate} disabled={isSaving}>
                    <CheckIcon size={16} />
                  </button>
                  <button className="icon-btn danger" onClick={() => setIsChangingPass(false)}>
                    <XIcon size={16} />
                  </button>
                </div>
              ) : (
                <button className="setting-action-btn" onClick={() => setIsChangingPass(true)}>Update</button>
              )}
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span>Two-Factor Authentication</span>
                <p>Add an extra layer of security via Email OTP.</p>
              </div>
              <button 
                className={`theme-toggle-btn ${is2FAEnabled ? 'dark' : 'light'}`} 
                onClick={toggle2FA}
                disabled={isSaving}
              >
                <div className="toggle-track">
                  <div className="toggle-thumb" style={{ left: is2FAEnabled ? '25px' : '3px' }}>
                    {is2FAEnabled ? <CheckIcon size={12} /> : <XIcon size={12} />}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-title">
            <SunIcon size={18} />
            <h3>Appearance</h3>
          </div>
          <div className="settings-card">
            <div className="setting-row">
              <div className="setting-info">
                <span>Dark Mode</span>
                <p>Adjust the interface brightness.</p>
              </div>
              <button className={`theme-toggle-btn ${theme}`} onClick={toggleTheme}>
                <div className="toggle-track">
                  <div className="toggle-thumb">
                    {theme === 'light' ? <SunIcon size={12} /> : <MoonIcon size={12} />}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-title">
            <DatabaseIcon size={18} />
            <h3>System Status</h3>
          </div>
          <div className="settings-card">
            <div className="setting-row">
              <div className="setting-info">
                <span>Supabase Connection</span>
                <p>Status: <span className="status-online">Online</span></p>
              </div>
              <div className="badge success">Active</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
