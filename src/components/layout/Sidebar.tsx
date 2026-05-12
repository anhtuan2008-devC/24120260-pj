import { UsersIcon, SettingsIcon, ActivityIcon } from '../ui/icons';
import './Sidebar.css';
import React from 'react';
import type { DashboardView } from '../../types/navigation';

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onOpenHelp: () => void;
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export function Sidebar({ activeView, onViewChange, onOpenHelp }: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'employees', label: 'Employees', icon: UsersIcon },
    { id: 'activity', label: 'Activity Log', icon: ActivityIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">E</div>
        <span className="logo-text">EmpSys</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              data-tooltip={item.label}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={20} className="nav-svg-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="help-box-btn" onClick={onOpenHelp}>
          <div className="help-box">
            <p>Need help?</p>
            <span>View User Guide</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
