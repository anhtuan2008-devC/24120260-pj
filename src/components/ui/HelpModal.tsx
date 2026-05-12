import { useEffect } from 'react';
import './HelpModal.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content blur-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>User Guide</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="help-modal-body">
          <section className="help-section">
            <h3>Employee Management</h3>
            <p>Welcome to the Employee Management System. Here are the basic operations:</p>
            <ul className="help-list">
              <li><strong>Search:</strong> Use the search bar at the top to quickly find employees by name.</li>
              <li><strong>Sorting:</strong> Use the "Sort" dropdown to change the list order (Newest, A-Z, etc.).</li>
              <li><strong>Update:</strong> Click the "Edit" icon on an employee card to change their name.</li>
              <li><strong>Delete:</strong> Click the "Trash" icon to remove an employee from the system.</li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Account & Security</h3>
            <ul className="help-list">
              <li><strong>Profile:</strong> Click your avatar in the top right to change your name and profile picture.</li>
              <li><strong>2FA Security:</strong> You can enable 2-Factor Authentication via Email in Settings.</li>
              <li><strong>Logs:</strong> Review system activities in the Activity Log section.</li>
            </ul>
          </section>
        </div>
        <div className="help-modal-footer">
          <button className="primary-btn" onClick={onClose}>Got it!</button>
        </div>
      </div>
    </div>
  );
}
