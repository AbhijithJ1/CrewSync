import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, Send, Zap, HelpCircle, CheckCheck, Timer } from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = [
  { label: 'On My Way', icon: Zap },
  { label: 'Need Help', icon: HelpCircle },
  { label: 'Done', icon: CheckCheck },
  { label: 'Delayed', icon: Timer },
];

export default function TaskCard({ task, role, delay = 0 }) {
  const {
    user,
    acceptTask,
    leaveTask,
    expressInterest,
    sendChatMessage,
    expireTask,
    volunteers,
  } = useApp();

  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(() => {
    if (task.status !== 'pending') return 0;
    // Use expiresAt (wall-clock ms) if available, else fall back to legacy calculation
    if (task.expiresAt) {
      return Math.max(0, Math.floor((task.expiresAt - Date.now()) / 1000));
    }
    const createdTime = new Date(task.createdAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
    return Math.max(0, task.durationLimit - elapsedSeconds);
  });
  const [messageText, setMessageText] = useState('');
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const acceptedCount = (task.acceptedBy || []).length;
  const interestedCount = (task.interestedVolunteers || []).length;
  const isFull = acceptedCount >= task.volunteersNeeded;
  const hasAccepted = (task.acceptedBy || []).includes(user?.id);
  const hasInterested = (task.interestedVolunteers || []).includes(user?.id);
  const isHistoryTask = task.status === 'completed' || task.status === 'expired' || task.status === 'cancelled';

  // Chat panel visibility: organizers always see it; volunteers see it if accepted
  const showChatPanel = role === 'organizer' || hasAccepted;

  // ── Expiry Countdown ──────────────────────────────────────────
  useEffect(() => {
    if (task.status !== 'pending') return;

    const calculateTimeLeft = () => {
      // Prefer expiresAt (accurate wall-clock), fall back to legacy
      if (task.expiresAt) {
        return Math.max(0, Math.floor((task.expiresAt - Date.now()) / 1000));
      }
      const createdTime = new Date(task.createdAt).getTime();
      const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
      return Math.max(0, task.durationLimit - elapsedSeconds);
    };

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        expireTask(task.id);
        toast('A task dispatch has expired.', { id: `expire-${task.id}`, icon: '⏰' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [task.expiresAt, task.createdAt, task.durationLimit, task.status, task.id, expireTask]);

  // ── Auto-scroll chat ──────────────────────────────────────────
  useEffect(() => {
    if (!chatCollapsed && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [task.messages, chatCollapsed]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleAccept = e => {
    e.stopPropagation();
    if (isFull) {
      toast.error("Slots are full! Use 'I'm Interested' instead.");
      return;
    }
    acceptTask(task.id, user.id);
    toast.success('Task accepted. Locked on duty.');
    setChatCollapsed(false);
  };

  const handleInterest = e => {
    e.stopPropagation();
    expressInterest(task.id, user.id);
    toast.success('Interest expressed! Waiting for organizer approval.');
  };

  const handleLeave = e => {
    e.stopPropagation();
    leaveTask(task.id, user.id);
    toast.success('You left the task assignment.');
  };

  const handleSendMessage = e => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendChatMessage(task.id, user.id, user.name, messageText.trim());
    setMessageText('');
    setTimeout(() => chatInputRef.current?.focus(), 50);
  };

  const handleQuickAction = actionLabel => {
    sendChatMessage(task.id, user.id, user.name, `[Quick Action] ${actionLabel}`);
    if (!chatCollapsed) return;
    setChatCollapsed(false);
  };

  // ── Helpers ───────────────────────────────────────────────────
  const formatCountdown = seconds => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isUrgent = task.status === 'pending' && timeLeft <= 60 && timeLeft > 0;

  const getPriorityLabel = priority => {
    switch (priority) {
      case 'critical': return '[!!!] CRITICAL';
      case 'high':     return '[!!] HIGH';
      case 'medium':   return '[!] MEDIUM';
      case 'low':
      default:         return '[·] LOW';
    }
  };

  const getPriorityClass = priority => {
    switch (priority) {
      case 'critical': return 'card-priority-critical';
      case 'high':     return 'card-priority-high';
      case 'medium':   return 'card-priority-medium';
      case 'low':
      default:         return 'card-priority-low';
    }
  };

  const getStatusClass = status => {
    switch (status) {
      case 'accepted':  return 'status-accepted';
      case 'completed': return 'status-completed';
      case 'expired':   return 'status-expired';
      case 'cancelled': return 'status-cancelled';
      case 'pending':
      default:          return 'status-pending';
    }
  };

  const slotPercentage = task.volunteersNeeded > 0
    ? Math.round((acceptedCount / task.volunteersNeeded) * 100)
    : 0;

  return (
    <div
      className={`task-card-container afu ${getPriorityClass(task.priority)} ${isUrgent ? 'task-urgent-pulse' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="task-card-header">
        <div className="title-area">
          <div className="task-id-row">
            <span className="mono-id">#{task.id.slice(-6).toUpperCase()}</span>
            <span className={`status-badge-mono ${getStatusClass(task.status)}`}>
              {task.status.toUpperCase()}
            </span>
          </div>
          <h3 className="task-card-title">{task.title}</h3>
          <div className="task-badges-row">
            <span className="skill-chip">{task.requiredSkill}</span>
            <span className={`priority-label-mono priority-${task.priority}`}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────── */}
      <p className="task-card-desc">{task.description}</p>

      {/* ── Meta Grid ────────────────────────────────────────── */}
      <div className="task-card-meta-grid">
        <div className="meta-spec-item">
          <span className="meta-label">LOCATION</span>
          <span>{task.location}</span>
        </div>
        <div className="meta-spec-item">
          <span className="meta-label">DEADLINE</span>
          <span>{task.deadline}</span>
        </div>
        <div className="meta-spec-item">
          <span className="meta-label">SLOTS</span>
          <span className={isFull ? 'slot-full-text' : ''}>
            {acceptedCount} / {task.volunteersNeeded}
            {isFull && ' · FULL'}
          </span>
        </div>
        {role === 'organizer' && interestedCount > 0 && (
          <div className="meta-spec-item">
            <span className="meta-label">INTERESTED</span>
            <span className="interested-count">{interestedCount} waiting</span>
          </div>
        )}
        {task.status === 'pending' && (
          <div className={`meta-spec-item countdown-timer-mono ${isUrgent ? 'countdown-urgent' : ''}`}>
            <Clock size={11} />
            <span>EXPIRES {formatCountdown(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* ── Slot Progress Bar ─────────────────────────────────── */}
      {!isHistoryTask && (
        <div className="slot-progress-wrapper">
          <div className="slot-progress-bar">
            <div
              className={`slot-progress-fill ${isFull ? 'slot-full-fill' : ''}`}
              style={{ width: `${slotPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Accepted Crew Avatars ─────────────────────────────── */}
      {(task.acceptedBy || []).length > 0 && (
        <div className="accepted-crew-preview-row">
          <span className="preview-label">Crew on duty:</span>
          <div className="preview-crew-avatars">
            {task.acceptedBy.map(id => {
              const v = volunteers.find(vol => vol.id === id);
              if (!v) return null;
              return (
                <div key={id} className="crew-avatar-dot-mono" title={v.name}>
                  {v.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Task Chat Panel ───────────────────────────────────── */}
      {showChatPanel && (
        <div className="task-chat-panel">
          {/* Chat header with collapse toggle */}
          <button
            className="chat-header-toggle"
            onClick={() => setChatCollapsed(c => !c)}
            type="button"
          >
            <span className="chat-header-title">Task Chat Thread</span>
            <span className="chat-msg-count">
              {(task.messages || []).length} msg
            </span>
            <span className={`chat-collapse-icon ${chatCollapsed ? '' : 'open'}`}>▾</span>
          </button>

          {!chatCollapsed && (
            <>
              {/* Messages */}
              <div className="chat-messages-container">
                {(task.messages || []).length === 0 ? (
                  <p className="chat-empty-msg">No messages yet. Start coordinating below.</p>
                ) : (
                  (task.messages || []).map(msg => {
                    const isOwn = msg.senderId === user?.id;
                    const isQuick = msg.text.startsWith('[Quick Action]');
                    return (
                      <div
                        key={msg.id}
                        className={`chat-bubble-mono ${isOwn ? 'sent' : 'received'} ${isQuick ? 'quick-action-msg' : ''}`}
                      >
                        <div className="chat-bubble-info">
                          <span className="chat-sender">{isOwn ? 'You' : msg.senderName}</span>
                          <span className="chat-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="chat-text">
                          {isQuick ? msg.text.replace('[Quick Action] ', '⚡ ') : msg.text}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions Row */}
              {!isHistoryTask && (
                <div className="quick-actions-row">
                  {/* eslint-disable-next-line no-unused-vars */}
                  {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleQuickAction(label)}
                      className="quick-action-btn"
                      title={label}
                    >
                      <Icon size={11} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input */}
              {!isHistoryTask && (
                <form onSubmit={handleSendMessage} className="chat-input-row">
                  <input
                    ref={chatInputRef}
                    type="text"
                    placeholder="Type crew message..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    className="chat-input"
                  />
                  <button type="submit" className="chat-send-btn" disabled={!messageText.trim()}>
                    <Send size={13} />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Action Buttons (Volunteers) ───────────────────────── */}
      {role === 'volunteer' && !isHistoryTask && (
        <div className="task-card-actions-row-mono">
          {!hasAccepted ? (
            isFull ? (
              hasInterested ? (
                <button
                  disabled
                  className="btn btn-secondary"
                  style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }}
                >
                  Interest Logged ✓
                </button>
              ) : (
                <button onClick={handleInterest} className="btn btn-primary" style={{ flex: 1 }}>
                  Express Interest
                </button>
              )
            ) : (
              <button onClick={handleAccept} className="btn btn-primary" style={{ flex: 1 }}>
                Accept Task
              </button>
            )
          ) : (
            <button onClick={handleLeave} className="btn btn-danger" style={{ flex: 1 }}>
              Leave Task
            </button>
          )}

          {/* View full details */}
          <button
            onClick={() => navigate(`/task/${task.id}`)}
            className="btn btn-secondary"
            style={{ padding: '0 12px' }}
            title="View full details"
          >
            ›
          </button>
        </div>
      )}

      {/* ── Organizer View Details button ─────────────────────── */}
      {role === 'organizer' && !isHistoryTask && (
        <div className="task-card-actions-row-mono">
          <button
            onClick={() => navigate(`/task/${task.id}`)}
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: '11px' }}
          >
            Manage Dispatch →
          </button>
        </div>
      )}

      {/* ── Completed task note ───────────────────────────────── */}
      {task.status === 'completed' && task.completionNote && (
        <div className="completion-note-mono">
          <span className="completion-note-label">Completion Note:</span>
          <p>{task.completionNote}</p>
        </div>
      )}
    </div>
  );
}
