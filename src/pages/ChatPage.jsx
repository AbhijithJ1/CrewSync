import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  MessageSquare, MessageCircle, Send, ArrowLeft,
  Zap, Star, CheckCircle2, Shield, User
} from 'lucide-react';

/**
 * ChatPage — Full-page Direct Messaging Hub
 * Mobile: single-panel slide (list → thread), WhatsApp style
 * Tablet: 2-panel split
 * Desktop: 3-panel (list | thread | context)
 *
 * Uses flex + translateX on mobile, NO absolute positioning.
 * This prevents the blank-page bug caused by parent wrappers with no height.
 */
export default function ChatPage() {
  const {
    user,
    volunteers,
    organizer,
    activeTasks,
    directMessages,
    activeDirectChatVolunteerId,
    setActiveDirectChat,
    sendDirectMessage,
    markDirectMessagesRead,
  } = useApp();

  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // On mount only: if a contact was pre-selected (from notification / task details), open it.
  useEffect(() => {
    if (activeDirectChatVolunteerId) {
      setSelectedId(activeDirectChatVolunteerId);
      setActiveDirectChat(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // INTENTIONALLY only on mount

  // ── Thread helpers ────────────────────────────────────────────
  const getThread = (partnerId) => {
    if (!partnerId || !user) return [];
    return (directMessages || []).filter(
      m =>
        (m.senderId === user.id && m.receiverId === partnerId) ||
        (m.senderId === partnerId && m.receiverId === user.id)
    );
  };

  const getUnreadCount = (partnerId) =>
    (directMessages || []).filter(
      m => m.senderId === partnerId && m.receiverId === user?.id && !m.read
    ).length;

  // ── Contact List & Dynamic Sorting ──────────────────────────
  const getContacts = () => {
    if (!user) return [];

    let rawContacts = [];
    if (user.role === 'organizer') {
      rawContacts = volunteers.filter(v => v.role === 'volunteer' && v.approvalStatus === 'approved');
    } else {
      const otherApproved = volunteers.filter(v => v.role === 'volunteer' && v.approvalStatus === 'approved' && v.id !== user.id);
      if (organizer) {
        rawContacts = [organizer, ...otherApproved];
      } else {
        rawContacts = otherApproved;
      }
    }

    const isTaskMember = (contactId) => {
      if (user.role === 'organizer') {
        return activeTasks.some(t =>
          (t.acceptedBy || []).includes(contactId) ||
          (t.interestedVolunteers || []).includes(contactId)
        );
      }
      if (contactId === organizer?.id) {
        return activeTasks.some(t =>
          (t.acceptedBy || []).includes(user.id) ||
          (t.interestedVolunteers || []).includes(user.id)
        );
      }
      return activeTasks.some(t => {
        const crew = [...(t.acceptedBy || []), ...(t.interestedVolunteers || [])];
        return crew.includes(user.id) && crew.includes(contactId);
      });
    };

    return [...rawContacts].sort((a, b) => {
      const unreadA = getUnreadCount(a.id);
      const unreadB = getUnreadCount(b.id);
      if (unreadA > 0 && unreadB === 0) return -1;
      if (unreadB > 0 && unreadA === 0) return 1;

      const isMemberA = isTaskMember(a.id);
      const isMemberB = isTaskMember(b.id);
      if (isMemberA && !isMemberB) return -1;
      if (isMemberB && !isMemberA) return 1;

      const threadA = getThread(a.id);
      const threadB = getThread(b.id);
      const lastTsA = threadA.length > 0 ? threadA[threadA.length - 1].timestamp : 0;
      const lastTsB = threadB.length > 0 ? threadB[threadB.length - 1].timestamp : 0;
      if (lastTsA > 0 && lastTsB > 0) return lastTsB - lastTsA;
      if (lastTsA > 0 && lastTsB === 0) return -1;
      if (lastTsB > 0 && lastTsA === 0) return 1;

      return a.name.localeCompare(b.name);
    });
  };

  const contacts = getContacts();
  const selectedContact = selectedId ? contacts.find(c => c.id === selectedId) : null;
  const thread = selectedId ? getThread(selectedId) : [];

  // ── Auto scroll to latest message ────────────────────────────
  useEffect(() => {
    if (thread.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.length]);

  // ── Mark messages as read when a thread is open ───────────────
  useEffect(() => {
    if (selectedId && user) {
      const hasUnread = (directMessages || []).some(
        m => m.senderId === selectedId && m.receiverId === user.id && !m.read
      );
      if (hasUnread) markDirectMessagesRead(selectedId, user.id);
    }
  }, [selectedId, directMessages, user, markDirectMessagesRead]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setInput('');
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || !selectedId || !user) return;
    sendDirectMessage(
      user.id,
      user.name,
      selectedId,
      selectedContact?.name || 'User',
      input.trim()
    );
    setInput('');
  };

  const sendQuick = (text) => {
    if (!selectedId || !user) return;
    sendDirectMessage(
      user.id,
      user.name,
      selectedId,
      selectedContact?.name || 'User',
      text
    );
  };

  const QUICK_REPLIES = ['Understood ✓', 'On my way!', 'Need help here', 'Task done!'];

  const getContactTasks = (contactId) =>
    activeTasks.filter(t => (t.acceptedBy || []).includes(contactId));

  const getOnlineStatus = (contact) => {
    if (!contact) return { label: 'Offline', dot: 'offline' };
    if (contact.role === 'organizer') return { label: 'Coordinator', dot: 'online' };
    const onTask = activeTasks.some(t => (t.acceptedBy || []).includes(contact.id));
    if (onTask) return { label: 'On Task', dot: 'busy' };
    if (contact.available) return { label: 'Available', dot: 'online' };
    return { label: 'Offline', dot: 'offline' };
  };

  const initials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (!user) return null;

  // ── Sidebar panel JSX ──────────────────────────────────────
  const SidebarPanel = (
    <div className="cp-sidebar">
      <div className="cp-sidebar-header">
        <MessageCircle size={15} />
        <h3>Direct Messages</h3>
      </div>
      <div className="cp-partner-list">
        {contacts.length === 0 ? (
          <div className="cp-empty">
            <User size={28} />
            <p>No contacts yet.</p>
            <span>
              {user.role === 'organizer'
                ? 'Approved volunteers will appear here.'
                : 'Your coordinator will appear here once approved.'}
            </span>
          </div>
        ) : (
          contacts.map(contact => {
            const unread = getUnreadCount(contact.id);
            const lastMsg = getThread(contact.id).slice(-1)[0];
            const status = getOnlineStatus(contact);
            const isSelected = selectedId === contact.id;
            return (
              <button
                key={contact.id}
                className={`cp-partner-item ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelect(contact.id)}
              >
                <div className="cp-partner-avatar-wrap">
                  <div className="cp-partner-avatar">{initials(contact.name)}</div>
                  <span className={`chat-status-dot chat-status-dot--${status?.dot}`} />
                </div>
                <div className="cp-partner-meta">
                  <div className="cp-partner-name-row">
                    <span className="cp-partner-name">{contact.name}</span>
                    {unread > 0 && <span className="cp-unread-badge">{unread}</span>}
                  </div>
                  <span className="cp-partner-preview">
                    {lastMsg
                      ? lastMsg.text.slice(0, 38) + (lastMsg.text.length > 38 ? '…' : '')
                      : <em>Start a conversation</em>}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  // ── Thread panel JSX ───────────────────────────────────────
  const ThreadPanel = (
    <div className="cp-thread">
      {!selectedId ? (
        <div className="cp-thread-placeholder">
          <MessageSquare size={36} />
          <h3>Select a conversation</h3>
          <p>Choose a crew member to start coordination.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="cp-thread-header">
            <button
              className="cp-back-btn"
              onClick={() => setSelectedId(null)}
              aria-label="Back to contacts"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="cp-thread-avatar">{initials(selectedContact?.name)}</div>
            <div className="cp-thread-info">
              <span className="cp-thread-name">{selectedContact?.name || 'Unknown'}</span>
              <span className="cp-thread-role">
                {selectedContact?.role === 'organizer'
                  ? 'Coordinator'
                  : (selectedContact?.rankTitle || 'Volunteer')}
              </span>
            </div>
          </div>

          {/* Messages — justify-content flex-end pushes messages to bottom */}
          <div className="cp-messages" style={{ justifyContent: thread.length > 0 ? 'flex-end' : 'center' }}>
            {thread.length === 0 ? (
              <div className="cp-no-msgs">
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 4
                }}>
                  <MessageSquare size={24} style={{ color: 'var(--accent, #6366f1)', opacity: 0.8 }} />
                </div>
                <p style={{ fontWeight: 600 }}>No messages yet</p>
                <span>Say hi to {selectedContact?.name?.split(' ')[0] || 'your contact'} 👋</span>
              </div>
            ) : (
              <>
                <div className="cp-thread-start-hint">
                  Today
                </div>
                {thread.map(msg => {
                  if (!msg?.text?.trim()) return null;
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`cp-bubble-row ${isMe ? 'mine' : 'theirs'}`}>
                      {!isMe && (
                        <div className="cp-bubble-avatar">
                          {initials(msg.senderName)}
                        </div>
                      )}
                      <div className={`cp-bubble ${isMe ? 'cp-bubble-sent' : 'cp-bubble-received'}`}>
                        {!isMe && <span className="cp-bubble-sender">{msg.senderName}</span>}
                        <p>{msg.text}</p>
                        <span className="cp-bubble-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="cp-quick-replies">
            {QUICK_REPLIES.map(r => (
              <button key={r} className="cp-quick-btn" onClick={() => sendQuick(r)}>
                {r}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className="cp-input-form" onSubmit={handleSend}>
            <input
              type="text"
              className="cp-input-field"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Message ${selectedContact?.name || ''}…`}
              maxLength={300}
              autoComplete="off"
            />
            <button type="submit" className="cp-send-btn" disabled={!input.trim()}>
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </>
      )}
    </div>
  );

  // ── Context panel JSX (desktop only) ──────────────────────
  const ContextPanel = (
    <div className="cp-context">
      {!selectedContact ? (
        <div className="cp-context-empty">
          <Shield size={24} />
          <p>Select a contact to view their profile.</p>
        </div>
      ) : (
        <div className="cp-context-body">
          <div className="cp-ctx-profile">
            <div className="cp-ctx-avatar">{initials(selectedContact.name)}</div>
            <h4 className="cp-ctx-name">{selectedContact.name}</h4>
            <span className="cp-ctx-role">
              {selectedContact.role === 'organizer' ? 'Event Coordinator' : selectedContact.rankTitle || 'Volunteer'}
            </span>
            {(() => {
              const s = getOnlineStatus(selectedContact);
              return (
                <span className={`chat-ctx-status chat-ctx-status--${s?.dot}`}>
                  <span className={`chat-status-dot chat-status-dot--${s?.dot}`} />
                  {s?.label}
                </span>
              );
            })()}
          </div>

          {selectedContact.role !== 'organizer' && (
            <div className="chat-ctx-stats">
              <div className="chat-ctx-stat">
                <span className="chat-ctx-stat-val">{selectedContact.xp || 0}</span>
                <span className="chat-ctx-stat-label">XP</span>
              </div>
              <div className="chat-ctx-stat">
                <span className="chat-ctx-stat-val">Lvl {selectedContact.level || 1}</span>
                <span className="chat-ctx-stat-label">Level</span>
              </div>
              <div className="chat-ctx-stat">
                <span className="chat-ctx-stat-val">{selectedContact.tasksCompleted || 0}</span>
                <span className="chat-ctx-stat-label">Tasks</span>
              </div>
            </div>
          )}

          {selectedContact.role !== 'organizer' && (selectedContact.skills || []).length > 0 && (
            <div className="chat-ctx-section">
              <span className="chat-ctx-section-label">Skills</span>
              <div className="chat-ctx-skills">
                {(selectedContact.skills || []).map(s => (
                  <span key={s} className="chat-ctx-skill-chip">{s}</span>
                ))}
              </div>
            </div>
          )}

          {selectedContact.role !== 'organizer' && (() => {
            const tasks = getContactTasks(selectedContact.id);
            if (tasks.length === 0) return null;
            return (
              <div className="chat-ctx-section">
                <span className="chat-ctx-section-label">Active Tasks</span>
                {tasks.map(t => (
                  <button
                    key={t.id}
                    className="chat-ctx-task-link"
                    onClick={() => navigate(`/task/${t.id}`)}
                  >
                    <Zap size={11} />
                    <span>{t.title}</span>
                  </button>
                ))}
              </div>
            );
          })()}

          {selectedContact.role !== 'organizer' && (
            <div className="chat-ctx-section">
              <span className="chat-ctx-section-label">Performance</span>
              <div className="chat-ctx-perf-row">
                <CheckCircle2 size={11} />
                <span>Response rate: {selectedContact.responseRate || 0}%</span>
              </div>
              {selectedContact.streakCount > 0 && (
                <div className="chat-ctx-perf-row">
                  <Star size={11} />
                  <span>Streak: {selectedContact.streakCount} tasks</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="cp-root">
      {/* Mobile: sliding panels via translateX */}
      <div className={`cp-mobile-slider ${selectedId ? 'cp-thread-open' : ''}`}>
        {SidebarPanel}
        {ThreadPanel}
      </div>

      {/* Tablet/Desktop: flex row */}
      <div className="cp-desktop-layout">
        {SidebarPanel}
        {ThreadPanel}
        {ContextPanel}
      </div>
    </div>
  );
}
