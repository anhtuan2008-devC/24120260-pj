import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Employee } from './types/employee'
import type { AdminUser } from './types/auth'
import type { DashboardView } from './types/navigation'
import {
  deleteEmployee,
  listEmployees,
  updateEmployeeName,
} from './api/employees'
import { logActivity, listActivities } from './api/activities'
import { isSupabaseConfigured } from './lib/supabase'
import { formatDate } from './utils/date'
import { Toast, type ToastMessage } from './components/ui/Toast'
import { ConfirmModal } from './components/ui/ConfirmModal'
import { HelpModal } from './components/ui/HelpModal'
import { Skeleton } from './components/ui/Skeleton'
import { EmployeeCard } from './components/EmployeeCard'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { Login } from './components/auth/Login'
import { UsersIcon, ActivityIcon, ClockIcon, InboxIcon, SortIcon, CheckIcon } from './components/ui/icons'

// New Functional Views
import { ProfileView } from './components/views/ProfileView'
import { ActivityView, type ActivityRecord } from './components/views/ActivityView'
import { SettingsView } from './components/views/SettingsView'

const FALLBACK_NAME = 'Unnamed'
type EmployeeId = Employee['id']

function App() {
  // Auth state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem('admin_session');
      }
    }
    return null;
  });

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Activity tracking state - Loaded from DB
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<DashboardView>('employees')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const sortLabels = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    name_asc: 'Name (A-Z)',
    name_desc: 'Name (Z-A)'
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load activities from DB - Fixed linter warning by moving inside useEffect or wrapping differently
  useEffect(() => {
    if (adminUser) {
      const fetchLogs = async () => {
        const logs = await listActivities();
        setActivities(logs);
      };
      void fetchLogs();
    }
  }, [adminUser]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addActivity = useCallback(async (action: string, details: string, type: ActivityRecord['type'] = 'system') => {
    if (!adminUser) return;
    
    // Optimistic update for UI
    const tempId = Math.random().toString(36).substring(2, 9);
    const newLog: ActivityRecord = {
      id: tempId,
      action,
      details,
      timestamp: new Date().toISOString(),
      type,
    };
    setActivities((prev) => [newLog, ...prev].slice(0, 50));

    // Persist to DB
    try {
      await logActivity(action, details, type, adminUser.id);
    } catch (err) {
      console.error('Activity Log sync failed:', err);
      addToast('Failed to sync activity log to Supabase', 'error');
    }
  }, [adminUser, addToast]);

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    localStorage.setItem('admin_session', JSON.stringify(user));
    addToast('Welcome back, Admin!');
    void addActivity('Admin login', `User ${user.email} signed in.`, 'auth');
  };

  const handleLogout = () => {
    void addActivity('Admin logout', `User ${adminUser?.email} signed out.`, 'auth');
    setAdminUser(null);
    localStorage.removeItem('admin_session');
    addToast('Logged out successfully.');
  };

  const totalEmployees = employees.length

  /* Search & Sort filter */
  const filteredEmployees = useMemo(() => {
    let result = [...employees];
    
    // 1. Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((employee) =>
        (employee.name ?? '').toLowerCase().includes(query)
      );
    }

    // 2. Sort results
    result.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;

      switch (sortBy) {
        case 'newest':
          return timeB - timeA;
        case 'oldest':
          return timeA - timeB;
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });

    return result;
  }, [employees, searchQuery, sortBy]);

  const loadEmployees = useCallback(async (isSilent = false) => {
    if (!isSupabaseConfigured || !adminUser) {
      return
    }

    if (!isSilent) setIsLoading(true)
    setError(null)

    try {
      const data = await listEmployees()
      setEmployees(data)
      setLastUpdated(new Date().toISOString())
      if (!isSilent) void addActivity('Data Refresh', 'Manual sync with Supabase triggered.', 'system');
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load employees.'
      setError(message)
    } finally {
      if (!isSilent) setIsLoading(false)
    }
  }, [adminUser, addActivity])

  useEffect(() => {
    if (adminUser) {
      const timer = window.setTimeout(() => {
        void loadEmployees(true) // Initial load is silent
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [loadEmployees, adminUser])

  const handleUpdateEmployee = async (employeeId: EmployeeId, newName: string) => {
    try {
      const updated = await updateEmployeeName(employeeId, newName)
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === employeeId
            ? { ...employee, ...(updated ?? {}), name: newName }
            : employee,
        ),
      )
      addToast('Employee updated successfully!');
      void addActivity('Update employee', `Name changed to "${newName}".`, 'update');
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Failed to update employee.'
      addToast(message, 'error')
      throw updateError;
    }
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    const deletedName = employeeToDelete.name || FALLBACK_NAME;
    setIsDeleting(true);
    try {
      await deleteEmployee(employeeToDelete.id)
      setEmployees((prev) => prev.filter((employee) => employee.id !== employeeToDelete.id))
      addToast('Employee deleted!');
      void addActivity('Delete employee', `Removed ${deletedName} from system.`, 'delete');
      setEmployeeToDelete(null);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete employee.'
      addToast(message, 'error')
    } finally {
      setIsDeleting(false);
    }
  }

  const emptyStateMessage = useMemo(() => {
    if (!isSupabaseConfigured) {
      return 'Add your Supabase credentials to begin loading data.'
    }
    if (error) {
      return error
    }
    if (searchQuery.trim() && filteredEmployees.length === 0) {
      return `No employees matching "${searchQuery}".`
    }
    return 'No employees found.'
  }, [error, searchQuery, filteredEmployees.length])

  if (!adminUser) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <Toast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onOpenHelp={() => setIsHelpOpen(true)}
      />
      <div className="main-content">
        <Topbar
          onRefresh={() => loadEmployees(false)}
          isLoading={isLoading}
          total={totalEmployees}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          adminUser={adminUser}
          onLogout={handleLogout}
          onViewProfile={() => setActiveView('profile')}
          onViewSettings={() => setActiveView('settings')}
          onViewActivity={() => setActiveView('activity')}
        />

        <main className="dashboard-content">
          {activeView === 'employees' ? (
            <>
              <div className="dashboard-header blur-fade-in">
                <div>
                  <h1>Team Directory</h1>
                  <p className="sub">Manage your team members and their roles.</p>
                </div>
                
                <div className="header-actions">
                  <div className="sort-container">
                    <button 
                      className={`sort-trigger ${isSortOpen ? 'active' : ''}`}
                      onClick={() => setIsSortOpen(!isSortOpen)}
                    >
                      <SortIcon size={16} className="sort-icon-accent" />
                      <span className="sort-current-label">{sortLabels[sortBy]}</span>
                      <div className="sort-arrow" />
                    </button>

                    {isSortOpen && (
                      <>
                        <div className="sort-overlay" onClick={() => setIsSortOpen(false)} />
                        <div className="sort-dropdown-menu blur-fade-in">
                          {(Object.keys(sortLabels) as Array<keyof typeof sortLabels>).map((option) => (
                            <button
                              key={option}
                              className={`sort-option ${sortBy === option ? 'selected' : ''}`}
                              onClick={() => {
                                setSortBy(option);
                                setIsSortOpen(false);
                              }}
                            >
                              {sortLabels[option]}
                              {sortBy === option && <CheckIcon size={14} className="check-indicator" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {!isSupabaseConfigured ? (
                    <div className="notice-small">
                      <span>⚠️ Connect Supabase in .env</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-card" style={{ animationDelay: '100ms' }}>
                  <div className="stat-card-icon accent">
                    <UsersIcon size={22} />
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">Total Employees</span>
                    <span className="stat-card-value">{totalEmployees}</span>
                  </div>
                </div>
                <div className="stat-card" style={{ animationDelay: '200ms' }}>
                  <div className="stat-card-icon secondary">
                    <ActivityIcon size={22} />
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">Showing</span>
                    <span className="stat-card-value">{filteredEmployees.length}</span>
                  </div>
                </div>
                <div className="stat-card" style={{ animationDelay: '300ms' }}>
                  <div className="stat-card-icon muted">
                    <ClockIcon size={22} />
                  </div>
                  <div className="stat-card-info">
                    <span className="stat-card-label">Last Updated</span>
                    <span className="stat-card-value">{lastUpdated ? formatDate(lastUpdated) : '—'}</span>
                  </div>
                </div>
              </div>

              {searchQuery.trim() && (
                <div className="search-results-info blur-fade-in">
                  Showing <strong>{filteredEmployees.length}</strong> of <strong>{totalEmployees}</strong> employees for &ldquo;{searchQuery}&rdquo;
                </div>
              )}

              <section className="grid-section">
                {isLoading ? (
                  <div className="card-grid">
                    <Skeleton count={8} />
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="empty-state-large">
                    <div className="empty-icon-wrapper">
                      <div className="empty-dot-pattern" />
                      <div className="empty-icon-circle">
                        {searchQuery.trim() ? (
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                            <path d="M8 11h6" />
                          </svg>
                        ) : (
                          <InboxIcon size={40} />
                        )}
                      </div>
                    </div>
                    <h3>{searchQuery.trim() ? 'No results found' : 'No employees found'}</h3>
                    <p>{emptyStateMessage}</p>
                  </div>
                ) : (
                  <div className="card-grid">
                    {filteredEmployees.map((employee, index) => (
                      <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        index={index}
                        onUpdate={handleUpdateEmployee}
                        onDeleteClick={() => setEmployeeToDelete(employee)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : activeView === 'profile' ? (
            <ProfileView admin={adminUser} onUpdate={setAdminUser} onAddActivity={addActivity} />
          ) : activeView === 'activity' ? (
            <ActivityView activities={activities} onRefresh={async () => {
              const logs = await listActivities();
              setActivities(logs);
              addToast('Activity log updated');
            }} />
          ) : (
            <SettingsView admin={adminUser} onUpdateAdmin={setAdminUser} onAddActivity={addActivity} />
          )}
        </main>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />

      <ConfirmModal
        isOpen={!!employeeToDelete}
        title="Delete Employee?"
        message={`Are you sure you want to delete ${employeeToDelete?.name || FALLBACK_NAME}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setEmployeeToDelete(null)}
        isBusy={isDeleting}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}

export default App
