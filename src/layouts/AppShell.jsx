import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { LayoutGrid, PlusCircle, Users, User, Bell, Sun, Moon, Briefcase, LogOut, CheckSquare, MessageSquare, Calendar, Zap, Trophy, Star } from 'lucide-react';
import NotificationCenter from '../components/NotificationCenter';
import DirectChatDrawer from '../components/DirectChatDrawer';

/**
 * Responsive AppShell Layout
 * Adapts across Mobile, Tablet, and Desktop screen sizes.
 */
export default function AppShell({ children }) {
  const { user, volunteers, notifications, theme, toggleTheme, logout, celebration, clearCelebration, activeDirectChatVolunteerId, setActiveDirectChat } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    // When we arrive at /messages, clear the floating widget ID so DCD doesn't show.
    // ChatPage manages its own selectedId internally.
    if (location.pathname === '/messages') {
      setActiveDirectChat(null);
    }
  }, [location.pathname, setActiveDirectChat]);

  if (!user) return <>{children}</>;

  const currentPath = location.pathname;
  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingApprovalsCount = volunteers.filter(v => v.approvalStatus === 'pending').length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Sidebar links based on role
  const orgLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { label: 'Create Event', path: '/create-event', icon: Calendar },
    { label: 'Create Task', path: '/create-task', icon: PlusCircle },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare, badge: pendingApprovalsCount },
    { label: 'Crew Network', path: '/volunteers', icon: Users },
    { label: 'Messages', path: '/messages', icon: MessageSquare, badge: notifications.filter(n => !n.read && n.type === 'message').length },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const volLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { label: 'My Tasks', path: '/tasks', icon: Briefcase },
    { label: 'Messages', path: '/messages', icon: MessageSquare, badge: notifications.filter(n => !n.read && n.type === 'message').length },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const links = user.role === 'organizer' ? orgLinks : volLinks;

  // Tabs for mobile bottom navigation (fits 3-4 items max)
  const organizerTabs = [
    { label: 'Feed', path: '/dashboard', icon: LayoutGrid },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare, badge: pendingApprovalsCount },
    { label: 'Create', path: '/create-task', icon: PlusCircle },
    { label: 'Messages', path: '/messages', icon: MessageSquare, badge: notifications.filter(n => !n.read && n.type === 'message').length },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const volunteerTabs = [
    { label: 'Feed', path: '/dashboard', icon: LayoutGrid },
    { label: 'My Work', path: '/tasks', icon: Briefcase },
    { label: 'Messages', path: '/messages', icon: MessageSquare, badge: notifications.filter(n => !n.read && n.type === 'message').length },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const tabs = user.role === 'organizer' ? organizerTabs : volunteerTabs;

  // Dynamic Page Header Info
  const getHeaderTitle = () => {
    if (currentPath === '/dashboard') return { title: 'Dashboard', sub: 'Overview' };
    if (currentPath === '/create-event') return { title: 'Create Event', sub: 'New Event' };
    if (currentPath === '/create-task') return { title: 'Create Task', sub: 'New Task' };
    if (currentPath === '/approvals') return { title: 'Approvals', sub: 'Pending Review' };
    if (currentPath === '/volunteers') return { title: 'Crew Network', sub: 'All Volunteers' };
    if (currentPath === '/tasks') return { title: 'My Tasks', sub: 'Assigned Work' };
    if (currentPath === '/profile') return { title: 'Profile', sub: 'Account' };
    if (currentPath === '/messages') return { title: 'Messages', sub: 'Direct Messages' };
    if (currentPath.startsWith('/task/')) return { title: 'Task Details', sub: 'Task' };
    if (currentPath.startsWith('/event/')) return { title: 'Event Details', sub: 'Event' };
    return { title: 'CrewSync', sub: '' };
  };

  const { title: headerTitle, sub: headerSub } = getHeaderTitle();

  return (
    <div className="app-shell">
      {/* Desktop/Tablet Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Zap size={14} /></div>
          <span className="sidebar-brand-name">CrewSync</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {links.map(link => {
            const Icon = link.icon;
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                }}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {link.badge > 0 && <span className="nav-badge">{link.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card" onClick={() => {
            navigate('/profile');
          }}>
            <div className="sidebar-avatar">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.role || 'pending'}</div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }} 
              className="header-icon-btn" 
              title="Sign Out"
              style={{ border: 'none', background: 'none', width: '28px', height: '28px' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        {/* Top Navbar */}
        <header className="app-header">
          <div className="header-breadcrumb">
            <h1>{headerTitle}</h1>
            {headerSub && (
              <span className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="header-breadcrumb-sep" style={{ margin: '0 8px' }}>/</span>
                <span className="header-breadcrumb-sub">{headerSub}</span>
              </span>
            )}
          </div>

          <div className="header-actions">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="header-icon-btn" 
              title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications Center Trigger */}
            <button 
              onClick={() => setNotifOpen(!notifOpen)} 
              className="header-icon-btn"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="notif-dot-count">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Shortcut */}
            <div className="header-avatar-btn" onClick={() => navigate('/profile')}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`page-content ${currentPath.startsWith('/messages') ? 'page-content-chat' : ''}`}>
          <div className="page-content-wrapper afu">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="mobile-bottom-nav">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`mob-nav-btn ${isActive ? 'active' : ''}`}
              >
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                  <Icon size={18} />
                  {tab.badge > 0 && (
                    <span className="mob-nav-badge">{tab.badge > 9 ? '9+' : tab.badge}</span>
                  )}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Slide-Out Drawer Notifications */}
      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Floating Direct Chat Widget — only when user explicitly opened a DM and NOT on /messages */}
      {!currentPath.startsWith('/messages') && activeDirectChatVolunteerId && <DirectChatDrawer />}

      {/* Celebration overlay */}
      {celebration && (
        <div className="celebration-overlay afi" onClick={clearCelebration}>
          <div className="celebration-card asc" onClick={e => e.stopPropagation()}>
            {celebration.type === 'level_up' ? (
              <>
                <div className="celebration-badge level-up-badge"><Star size={28} /></div>
                <h2>Level Up!</h2>
                <p>Congratulations! You have reached</p>
                <div className="celebration-value">Level {celebration.value}</div>
                <p className="celebration-sub">Keep completing tasks to advance further.</p>
              </>
            ) : (
              <>
                <div className="celebration-badge achievement-badge"><Trophy size={28} /></div>
                <h2>Badge Unlocked</h2>
                <p>You have earned the achievement</p>
                <div className="celebration-value">{celebration.value}</div>
                <p className="celebration-sub">This badge has been added to your profile.</p>
              </>
            )}
            <button className="btn btn-primary" onClick={clearCelebration} style={{ width: '100%', marginTop: '12px' }}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
