import { useState, useEffect, useRef } from 'react';
import { SearchIcon, RefreshIcon, UserCircleIcon, SettingsIcon, ActivityIcon } from '../ui/icons';
import type { AdminUser } from '../../types/auth';
import './Topbar.css';

interface TopbarProps {
  onRefresh: () => void;
  isLoading: boolean;
  total: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  adminUser: AdminUser;
  onLogout: () => void;
  onViewProfile: () => void;
  onViewSettings: () => void;
  onViewActivity: () => void;
}

export function Topbar({ 
  onRefresh, 
  isLoading, 
  total, 
  searchQuery, 
  onSearchChange, 
  adminUser, 
  onLogout,
  onViewProfile,
  onViewSettings,
  onViewActivity
}: TopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const adminName = adminUser?.name || adminUser?.email?.split('@')[0] || 'Admin';
  const initial = adminName.charAt(0).toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    onViewProfile();
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    onViewSettings();
  };

  const handleActivityClick = () => {
    setIsDropdownOpen(false);
    onViewActivity();
  };

  return (
    <header className="topbar">
      <div className="search-container">
        <SearchIcon size={16} className="search-svg-icon" />
        <input
          type="text"
          placeholder="Search employees by name..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="topbar-actions">
        <div className="topbar-stats">
          <span className="badge secondary">{total} employees</span>
        </div>
        <button 
          className={`refresh-btn ${isLoading ? 'is-spinning' : ''}`}
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh data"
        >
          <RefreshIcon size={18} />
        </button>
        
        {/* User Profile with Dropdown */}
        <div className="user-profile-wrapper" ref={dropdownRef}>
          <button 
            className={`user-profile-btn ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="User Profile"
          >
            {adminUser?.avatar ? (
              <img src={adminUser.avatar} alt={adminName} className="profile-pic-img" />
            ) : (
              <div className="profile-pic">{initial}</div>
            )}
          </button>
          
          {isDropdownOpen && (
            <div className="user-dropdown blur-fade-in">
              <div className="dropdown-header">
                <span className="user-name">{adminName}</span>
                <span className="user-email">{adminUser?.email}</span>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={handleProfileClick}>
                <UserCircleIcon size={18} />
                <span>My Profile</span>
              </button>
              <button className="dropdown-item" onClick={handleSettingsClick}>
                <SettingsIcon size={18} />
                <span>Account Settings</span>
              </button>
              <button className="dropdown-item" onClick={handleActivityClick}>
                <ActivityIcon size={18} />
                <span>Activity Log</span>
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item logout" onClick={handleLogoutClick}>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
