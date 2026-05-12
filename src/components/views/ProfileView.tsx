import { useState, useRef } from 'react';
import type { AdminUser } from '../../types/auth';
import { UserCircleIcon, ShieldIcon, CalendarIcon, EditIcon, CheckIcon, XIcon, CameraIcon } from '../ui/icons';
import { updateAdminProfile, uploadAdminAvatar } from '../../api/auth';
import './Views.css';

interface ProfileViewProps {
  admin: AdminUser;
  onUpdate: (updated: AdminUser) => void;
  onAddActivity: (action: string, details: string, type: 'update' | 'delete' | 'auth' | 'system') => void;
}

export function ProfileView({ admin, onUpdate, onAddActivity }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(admin.name || '');
  const [avatar, setAvatar] = useState(admin.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = (admin.name || admin.email).charAt(0).toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadAdminAvatar(admin.id, file);
      setAvatar(publicUrl);
      onAddActivity('Upload Avatar', 'New profile picture uploaded.', 'update');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateAdminProfile(admin.id, { 
        name, 
        avatar: avatar,
        email: admin.email 
      });
      if (updated) {
        onUpdate(updated);
        setIsEditing(false);
        onAddActivity('Update Profile', `Profile info updated for ${name}.`, 'update');
      }
    } catch (err) {
      alert('Update failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="view-container blur-fade-in">
      <div className="view-header">
        <div className="header-with-action">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account information and preferences.</p>
          </div>
          {!isEditing && (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              <EditIcon size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card-main">
          <div className="profile-avatar-container">
            <div className="avatar-wrapper">
              {avatar ? (
                <img src={avatar} alt={name} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-large">{initial}</div>
              )}
              
              {isEditing && (
                <button 
                  className={`avatar-upload-overlay ${uploading ? 'uploading' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <CameraIcon size={24} />
                  <span>{uploading ? '...' : 'Upload'}</span>
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
          
          {isEditing ? (
            <div className="profile-edit-form">
              <div className="edit-group">
                <label>Display Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter name" />
              </div>
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave} disabled={isSaving || uploading}>
                  <CheckIcon size={16} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  <XIcon size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info-basic">
              <h2>{name || admin.email.split('@')[0]}</h2>
              <span className="badge secondary">System Administrator</span>
            </div>
          )}
        </div>

        <div className="profile-details-list">
          <div className="detail-item">
            <div className="detail-icon"><UserCircleIcon size={20} /></div>
            <div className="detail-content">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{admin.email}</span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><ShieldIcon size={20} /></div>
            <div className="detail-content">
              <span className="detail-label">Admin ID</span>
              <span className="detail-value">#{admin.id}</span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon"><CalendarIcon size={20} /></div>
            <div className="detail-content">
              <span className="detail-label">Joined On</span>
              <span className="detail-value">12/05/2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
