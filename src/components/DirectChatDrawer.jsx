import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, ChevronDown, MessageSquare } from 'lucide-react';

/**
 * DirectChatDrawer
 * Floating, persistent direct-message chat between organizer and a volunteer.
 * On desktop: floating bottom-right panel.
 * On mobile: slides up full-screen.
 *
 * Controlled by state.activeDirectChatVolunteerId in AppContext.
 */
export default function DirectChatDrawer() {
  const {
    user,
    volunteers,
    organizer,
    directMessages,
    activeDirectChatVolunteerId,
    setActiveDirectChat,
    sendDirectMessage,
    markDirectMessagesRead,
  } = useApp();

  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const partnerId = activeDirectChatVolunteerId;
  const partner = partnerId
    ? volunteers.find(v => v.id === partnerId) || (partnerId === organizer?.id ? organizer : null)
    : null;

  // Derive thread messages for this pair
  const thread = (directMessages || []).filter(
    m =>
      (m.senderId === user?.id && m.receiverId === partnerId) ||
      (m.senderId === partnerId && m.receiverId === user?.id)
  );

  // Auto scroll to bottom
  useEffect(() => {
    if (!minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread.length, minimized]);

  // Mark messages read when chat opens
  useEffect(() => {
    if (partnerId && user?.id) {
      markDirectMessagesRead(partnerId, user.id);
    }
  }, [partnerId, user?.id, thread.length, markDirectMessagesRead]);

  if (!partnerId || !user) return null;

  const partnerName = partner?.name || 'Coordinator';
  const partnerInitials = partnerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSend = e => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    sendDirectMessage(
      user.id,
      user.name,
      partnerId,
      partnerName,
      text
    );
    setInput('');
  };

  const quickReplies = ['Understood ✓', 'On my way!', 'Need help here', 'Task done!'];

  return (
    <div className={`dcd-container ${minimized ? 'dcd-minimized' : ''}`}>
      {/* Header */}
      <div className="dcd-header" onClick={() => setMinimized(m => !m)}>
        <div className="dcd-header-left">
          <div className="dcd-partner-avatar">{partnerInitials}</div>
          <div className="dcd-partner-info">
            <span className="dcd-partner-name">{partnerName}</span>
            <span className="dcd-partner-role">{partner?.role === 'organizer' ? 'Coordinator' : (partner?.rankTitle || 'Volunteer')}</span>
          </div>
        </div>
        <div className="dcd-header-actions" onClick={e => e.stopPropagation()}>
          <button
            className="dcd-icon-btn"
            onClick={() => setMinimized(m => !m)}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            <ChevronDown size={15} style={{ transform: minimized ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          <button
            className="dcd-icon-btn"
            onClick={() => setActiveDirectChat(null)}
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div className="dcd-messages">
            {thread.length === 0 ? (
              <div className="dcd-empty">
                <MessageSquare size={22} />
                <p>Start the conversation with {partnerName}.</p>
              </div>
            ) : (
              thread.map(msg => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`dcd-bubble-row ${isMe ? 'dcd-mine' : 'dcd-theirs'}`}>
                    {!isMe && (
                      <div className="dcd-bubble-avatar">
                        {msg.senderName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                      </div>
                    )}
                    <div className={`dcd-bubble ${isMe ? 'message-bubble-sent' : 'message-bubble-received'}`}>
                      <p>{msg.text}</p>
                      <span className="dcd-bubble-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="dcd-quick-replies">
            {quickReplies.map(r => (
              <button key={r} className="dcd-quick-btn" onClick={() => {
                sendDirectMessage(
                  user.id,
                  user.name,
                  partnerId,
                  partnerName,
                  r
                );
              }}>
                {r}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className="dcd-input-form" onSubmit={handleSend}>
            <input
              className="dcd-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message…"
              maxLength={300}
            />
            <button type="submit" className="dcd-send-btn" disabled={!input.trim()}>
              <Send size={14} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
