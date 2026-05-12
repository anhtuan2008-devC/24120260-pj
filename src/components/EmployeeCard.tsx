import { useState } from 'react';
import type { Employee } from '../types/employee';
import { resolveAvatarUrl } from '../api/employees';
import { formatDate } from '../utils/date';
import { EditIcon, TrashIcon, CheckIcon, XIcon } from './ui/icons';
import './EmployeeCard.css';

interface EmployeeCardProps {
  employee: Employee;
  index: number;
  onUpdate: (id: string | number, newName: string) => Promise<void>;
  onDeleteClick: (id: string | number) => void;
}

const FALLBACK_NAME = 'Unnamed';

export function EmployeeCard({ employee, index, onUpdate, onDeleteClick }: EmployeeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const avatarUrl = resolveAvatarUrl(employee.avatar);
  const name = employee.name?.trim() || FALLBACK_NAME;
  const initial = name.charAt(0).toUpperCase();

  const startEditing = () => {
    setIsEditing(true);
    setDraftName(name);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraftName('');
  };

  const handleSave = async () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === name) {
      setIsEditing(false);
      return;
    }
    setIsBusy(true);
    try {
      await onUpdate(employee.id, trimmed);
      setIsEditing(false);
    } catch {
      // Handled by parent
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className={`employee-card ${isEditing ? 'is-editing' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="card-shimmer-border" />

      <div className="card-header">
        <div className="avatar-wrapper">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} loading="lazy" className="card-avatar" />
          ) : (
            <div className="card-avatar-fallback">{initial}</div>
          )}
        </div>

        <div className="card-actions-menu">
          <button
            className="icon-btn"
            onClick={startEditing}
            title="Edit name"
          >
            <EditIcon size={14} />
          </button>
          <button
            className="icon-btn danger-icon"
            onClick={() => onDeleteClick(employee.id)}
            title="Delete employee"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      <div className="card-body">
        {isEditing ? (
          <div className="edit-mode">
            <input
              className="card-edit-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={64}
              autoFocus
              disabled={isBusy}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') cancelEditing();
              }}
            />
            <div className="edit-actions">
              <button onClick={handleSave} disabled={isBusy} className="action-btn save" title="Save">
                <CheckIcon size={16} />
              </button>
              <button onClick={cancelEditing} disabled={isBusy} className="action-btn cancel" title="Cancel">
                <XIcon size={16} />
              </button>
            </div>
          </div>
        ) : (
          <h3 className="employee-name">{name}</h3>
        )}
      </div>

      <div className="card-footer">
        <div className="footer-stat">
          <span className="stat-label">Joined</span>
          <span className="stat-value">{formatDate(employee.created_at)}</span>
        </div>
        <div className="footer-stat">
          <span className="stat-label">ID</span>
          <span className="stat-value">#{String(employee.id).slice(0, 6)}</span>
        </div>
      </div>
    </div>
  );
}
