import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  X, ChevronLeft, Trash2, AlertTriangle, CheckCircle,
  Bell, BellOff, MessageSquare, UserCheck, Briefcase
} from 'lucide-react';

const formatTime = ts => {
  const elapsed = Date.now() - ts;
  const mins = Math.floor(elapsed / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * NotificationCenter — Slide-out drawer (desktop) / full-screen (mobile)
 * Sections: Direct Messages · Access Approvals · Task Operations
 *
 * Rules:
 * - Self-sent message notifications are NEVER shown.
 * - All cards are informational. Clickable cards navigate silently.
 * - No "Tap to view" hint text — just clean information.
 * - Clicking a task notification that no longer exists still closes drawer gracefully.
 */
export default function NotificationCenter({ isOpen, onClose }) {
  const {
    user,
    notifications,
    dismissNotification,
    clearAllNotifications,
    markNotificationRead,
    setActiveDirectChat
  } = useApp();
  const navigate = useNavigate();

  // Scroll lock on mobile
  useEffect(() => {
    if (isOpen) {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          document.body.classList.add('notif-lock-scroll');
        } else {
          document.body.classList.remove('notif-lock-scroll');
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        document.body.classList.remove('notif-lock-scroll');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNotificationClick = notif => {
    // Mark read
    if (!notif.read) markNotificationRead(notif.id);

    // Route to correct destination
    if (notif.type === 'message') {
      if (notif.volunteerId) {
        setActiveDirectChat(notif.volunteerId);
        navigate('/messages', { state: { from: 'notification' } });
      }
    } else if (notif.isApproval) {
      navigate('/approvals');
    } else if (notif.taskId) {
      navigate(`/task/${notif.taskId}`);
    }

    onClose();
  };

  const getIcon = notif => {
    if (notif.type === 'message')  return <MessageSquare size={13} className="notif-icon-message" />;
    if (notif.isApproval)          return <UserCheck size={13} className="notif-icon-approval" />;
    switch (notif.type) {
      case 'success': return <CheckCircle size={13} className="notif-icon-success" />;
      case 'warning': return <AlertTriangle size={13} className="notif-icon-warning" />;
      default:        return <Briefcase size={13} className="notif-icon-info" />;
    }
  };

  const typeClass = notif => {
    if (notif.type === 'message') return 'notif-message';
    if (notif.isApproval)         return 'notif-approval';
    switch (notif.type) {
      case 'success': return 'notif-success';
      case 'warning': return 'notif-warning';
      default:        return 'notif-info';
    }
  };

  // Group — never include self-sent message notifs
  const messageNotifs  = notifications.filter(n => n.type === 'message' && n.senderId !== user?.id);
  const approvalNotifs = notifications.filter(n => n.isApproval);
  const taskNotifs     = notifications.filter(n => n.type !== 'message' && !n.isApproval);
  const allVisible     = [...messageNotifs, ...approvalNotifs, ...taskNotifs];
  const unreadCount    = allVisible.filter(n => !n.read).length;

  const renderNotifCard = notif => {
    const isClickable = notif.taskId || notif.type === 'message' || notif.isApproval;
    return (
      <div
        key={notif.id}
        className={`notif-card-item ${isClickable ? 'clickable' : ''} ${typeClass(notif)} ${!notif.read ? 'unread' : 'read'}`}
        onClick={() => isClickable && handleNotificationClick(notif)}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={e => e.key === 'Enter' && isClickable && handleNotificationClick(notif)}
      >
        <div className="notif-card-icon-wrapper">
          {getIcon(notif)}
        </div>
        <div className="notif-card-body">
          <div className="notif-card-msg-row">
            <p className="notif-card-msg">{notif.message}</p>
            {!notif.read && <span className="notif-unread-dot" />}
          </div>
          <div className="notif-card-footer">
            <span className="notif-card-time">{formatTime(notif.timestamp)}</span>
          </div>
        </div>
        <button
          className="notif-card-delete-btn"
          onClick={e => { e.stopPropagation(); dismissNotification(notif.id); }}
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <X size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="notif-center-overlay" onClick={onClose}>
      <div className="notif-center-drawer" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="notif-header">
          <button className="notif-back-btn" onClick={onClose} title="Close" aria-label="Close notifications">
            <ChevronLeft size={20} />
          </button>
          <div className="notif-title-group">
            <Bell size={16} className="notif-header-bell" />
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="notif-count-pill">{unreadCount} new</span>
            )}
          </div>
          <div className="notif-header-actions">
            {allVisible.length > 0 && (
              <button
                className="notif-clear-all-btn"
                onClick={clearAllNotifications}
                title="Clear all notifications"
              >
                <Trash2 size={14} />
                <span>Clear all</span>
              </button>
            )}
            <button className="notif-close-btn" onClick={onClose} title="Close" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification Feed */}
        <div className="notif-list-container">
          {allVisible.length > 0 ? (
            <>
              {/* Direct Messages */}
              {messageNotifs.length > 0 && (
                <div className="notif-section notif-messages-section">
                  <div className="notif-section-header">
                    <MessageSquare size={12} />
                    <span>Direct Messages</span>
                  </div>
                  {messageNotifs.map(n => renderNotifCard(n))}
                </div>
              )}

              {/* Access Approvals */}
              {approvalNotifs.length > 0 && (
                <div className="notif-section notif-approvals-section">
                  <div className="notif-section-header">
                    <UserCheck size={12} />
                    <span>Access Approvals</span>
                  </div>
                  {approvalNotifs.map(n => renderNotifCard(n))}
                </div>
              )}

              {/* Task Operations */}
              {taskNotifs.length > 0 && (
                <div className="notif-section notif-tasks-section">
                  <div className="notif-section-header">
                    <Briefcase size={12} />
                    <span>Task Operations</span>
                  </div>
                  {taskNotifs.map(n => renderNotifCard(n))}
                </div>
              )}
            </>
          ) : (
            <div className="notif-empty-state">
              <BellOff size={28} className="notif-empty-icon" />
              <p>All caught up!</p>
              <span>Messages, approvals, and task updates will appear here.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
