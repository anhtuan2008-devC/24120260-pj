import { ActivityIcon, ClockIcon, EditIcon, TrashIcon, LogInIcon, RefreshIcon } from '../ui/icons';
import './Views.css';

export interface ActivityRecord {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'update' | 'delete' | 'auth' | 'system';
}

interface ActivityViewProps {
  activities: ActivityRecord[];
  onRefresh: () => void;
}

export function ActivityView({ activities, onRefresh }: ActivityViewProps) {
  const getIcon = (type: ActivityRecord['type']) => {
    switch (type) {
      case 'update': return <EditIcon size={16} />;
      case 'delete': return <TrashIcon size={16} />;
      case 'auth': return <LogInIcon size={16} />;
      case 'system': return <RefreshIcon size={16} />;
      default: return <ActivityIcon size={16} />;
    }
  };

  return (
    <div className="view-container blur-fade-in">
      <div className="view-header">
        <div className="header-with-action">
          <div>
            <h1>Activity Log</h1>
            <p>Recent actions performed in the management system.</p>
          </div>
          <button className="refresh-btn" onClick={onRefresh} title="Refresh logs">
            <RefreshIcon size={18} />
          </button>
        </div>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="empty-logs">
            <ClockIcon size={48} />
            <p>No activities recorded yet.</p>
          </div>
        ) : (
          activities.map((log) => (
            <div key={log.id} className="activity-item">
              <div className={`activity-icon-box ${log.type}`}>
                {getIcon(log.type)}
              </div>
              <div className="activity-content">
                <div className="activity-main">
                  <span className="activity-action">{log.action}</span>
                  <span className="activity-details">{log.details}</span>
                </div>
                <span className="activity-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
