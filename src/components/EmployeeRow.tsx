import { useState } from 'react';
import type { Employee } from '../types/employee';
import { resolveAvatarUrl } from '../api/employees';
import { formatDate } from '../utils/date';
import './EmployeeRow.css';

interface EmployeeRowProps {
  employee: Employee;
  index: number;
  onUpdate: (id: string | number, newName: string) => Promise<void>;
  onDeleteClick: (id: string | number) => void;
}

const FALLBACK_NAME = 'Unnamed';

export function EmployeeRow({ employee, index, onUpdate, onDeleteClick }: EmployeeRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const avatarUrl = resolveAvatarUrl(employee.avatar);
  const name = employee.name?.trim() || FALLBACK_NAME;
  const initial = name.charAt(0).toUpperCase();
  const employeeIdLabel = String(employee.id).slice(0, 8);

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
    if (!trimmed) {
      // Could throw error or just return, App handles toast
      return;
    }
    if (trimmed === name) {
      setIsEditing(false);
      return;
    }
    setIsBusy(true);
    try {
      await onUpdate(employee.id, trimmed);
      setIsEditing(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className={`row ${isEditing ? 'is-editing' : ''}`}
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
            className="edit-input"
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
        ) : (
          <span>{name}</span>
        )}
        <span className="tag">ID: {employeeIdLabel}</span>
      </div>
      <div className="cell created">
        {formatDate(employee.created_at)}
      </div>
      <div className="cell actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="ghost save-btn"
              onClick={handleSave}
              disabled={isBusy}
            >
              Save
            </button>
            <button
              type="button"
              className="ghost"
              onClick={cancelEditing}
              disabled={isBusy}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="ghost"
            onClick={startEditing}
          >
            Edit
          </button>
        )}
        <button
          type="button"
          className="danger"
          onClick={() => onDeleteClick(employee.id)}
          disabled={isBusy}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
