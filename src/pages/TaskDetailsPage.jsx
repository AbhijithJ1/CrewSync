import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  MapPin, Clock, Users, ShieldAlert, BadgeInfo,
  ChevronLeft, Loader2, CheckCircle2, MessageSquare,
  Trash2, LogOut, Star, UserPlus, AlertTriangle,
  MessageCircle, Ban, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';


export default function TaskDetailsPage() {
  const id = useParams().id;
  const navigate = useNavigate();
  const {
    user,
    activeTasks,
    taskHistory,
    volunteers,
    acceptTask,
    leaveTask,
    completeTask,
    cancelTask,
    deleteTask,
    expressInterest,
    approveInterest,
    setActiveDirectChat,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState('');
  const [focusedInput, setFocusedInput] = useState(false);

  const activeTask = activeTasks.find(t => t.id === id);
  const historicTask = taskHistory.find(t => t.id === id);
  const task = activeTask || historicTask;


  if (!task) {
    return (
      <div className="details-error-view afu">
        <div className="error-triangle-icon">
          <AlertTriangle size={32} />
        </div>
        <h3>Task no longer exists</h3>
        <p>This task may have expired, been cancelled, or permanently deleted.</p>
        <button onClick={() => navigate('/dashboard')} className="details-back-inline-btn">
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  const acceptedCount = (task.acceptedBy || []).length;
  const isFull = acceptedCount >= task.volunteersNeeded;
  const hasAccepted = (task.acceptedBy || []).includes(user.id);
  const hasInterest = (task.interestedVolunteers || []).includes(user.id);
  const progressPercent = Math.min(100, Math.round((acceptedCount / task.volunteersNeeded) * 100));
  const isHistoric = !!historicTask;
  const isActive = !!activeTask;
  const isOrganizerView = user.role === 'organizer';

  const priorityColors = {
    low: 'var(--priority-low-border)',
    medium: 'var(--priority-medium-border)',
    high: 'var(--priority-high-border)',
    critical: 'var(--priority-critical-border)',
  };

  const statusLabels = {
    pending: 'Pending',
    accepted: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    expired: 'Expired',
  };

  // ── Action Handlers ─────────────────────────────────────────

  const handleAccept = async () => {
    if (isFull) { toast.error('Slots are already full!'); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
    acceptTask(task.id, user.id);
    toast.success('Locked into event task crew!');
  };

  const handleInterest = async () => {
    if (hasInterest) { toast('Already on standby.', { icon: '⏳' }); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setIsLoading(false);
    expressInterest(task.id, user.id);
    toast.success('Standby interest logged. Awaiting organizer approval.');
  };

  const handleLeave = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setIsLoading(false);
    leaveTask(task.id, user.id);
    toast('You left this task.', { icon: '🚪' });
    navigate('/dashboard');
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!note.trim()) { toast.error('Please enter a short completion description.'); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    completeTask(task.id, user.id, note);
    toast.success('Resolution logged. You are now available!');
    navigate('/dashboard');
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this dispatch? All crew members will be released.')) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setIsLoading(false);
    cancelTask(task.id);
    toast.error('Task dispatch cancelled.');
    navigate('/dashboard');
  };

  const handleMarkComplete = async () => {
    if (!window.confirm('Mark this task as complete? This will resolve all assignments.')) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setIsLoading(false);
    completeTask(task.id, user.id, 'Marked complete by organizer.');
    toast.success('Task marked as complete.');
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this record? This cannot be undone.')) return;
    deleteTask(task.id);
    toast.success('Record permanently deleted.');
    navigate('/dashboard');
  };

  const handleApproveInterest = (volunteerId) => {
    approveInterest(task.id, volunteerId);
    const vol = volunteers.find(v => v.id === volunteerId);
    toast.success(`${vol?.name || 'Volunteer'} promoted to active crew.`);
  };


  // Deadline countdown display
  const deadlineDisplay = task.deadline && task.deadline !== 'ASAP'
    ? task.deadline
    : 'ASAP';

  return (
    <div className="task-details-page afu">

      {/* ── Back Button ── */}
      <button onClick={() => navigate(-1)} className="details-back-inline-btn">
        <ChevronLeft size={14} />
        <span>Back to Dashboard</span>
      </button>

      {/* ── Main Responsive Grid ── */}
      <div className="task-details-grid">

        {/* ════════════════════════════════════════
            LEFT COLUMN — Header, Status, Scope, Crew
            ════════════════════════════════════════ */}
        <div className="task-details-left">

          {/* Section 1: Task Header Card */}
          <section className="details-section-panel details-header-card"
            style={{ borderLeftColor: priorityColors[task.priority] }}>

            {/* Title first — largest visual element */}
            <h2 className="details-task-title">{task.title}</h2>

            {/* Badge row below */}
            <div className="details-badge-row">
              <span
                className="details-priority-badge"
                style={{ borderColor: priorityColors[task.priority], color: priorityColors[task.priority] }}
              >
                {task.priority.toUpperCase()}
              </span>
              <span className={`details-status-badge status-${task.status}`}>
                {statusLabels[task.status] || task.status}
              </span>
              <span className="details-skill-badge">
                <BadgeInfo size={10} />
                {task.requiredSkill}
              </span>
            </div>

            {/* Metadata row */}
            <div className="details-meta-row">
              <span className="details-meta-item">
                <MapPin size={12} />
                {task.location}
              </span>
              <span className="details-meta-item">
                <Clock size={12} />
                {deadlineDisplay}
              </span>
              <span className="details-meta-item">
                <Users size={12} />
                {task.volunteersNeeded} crew needed
              </span>
            </div>
          </section>

          {/* Section 2: Status Card */}
          <section className="details-section-panel details-status-card">
            <h3><Zap size={13} /> Live Status</h3>
            <div className="status-card-grid">
              <div className="status-card-item">
                <span className="status-card-label">Status</span>
                <span className={`status-card-value status-badge-mono status-${task.status}`}>
                  {statusLabels[task.status] || task.status}
                </span>
              </div>
              <div className="status-card-item">
                <span className="status-card-label">Priority</span>
                <span className="status-card-value" style={{ color: priorityColors[task.priority], fontWeight: 700 }}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              <div className="status-card-item">
                <span className="status-card-label">Crew Slots</span>
                <span className="status-card-value">{acceptedCount} / {task.volunteersNeeded}</span>
              </div>
              <div className="status-card-item">
                <span className="status-card-label">Fill Rate</span>
                <div className="status-slot-bar">
                  <div
                    className="status-slot-fill"
                    style={{ width: `${progressPercent}%`, backgroundColor: priorityColors[task.priority] }}
                  />
                </div>
                <span className="status-card-value-sm">{progressPercent}%</span>
              </div>
            </div>
          </section>

          {/* Section 3: Assignment Scope */}
          <section className="details-section-panel">
            <h3><ShieldAlert size={13} /> Assignment Scope</h3>
            <p className="details-scope-desc">{task.description || 'No additional description provided.'}</p>
          </section>

          {/* Section 4: Crew Check-in Slots */}
          <section className="details-section-panel">
            <div className="slot-ratio-header">
              <h3><Users size={13} /> Crew Check-in Slots</h3>
              <span className="ratio-readout">{acceptedCount} / {task.volunteersNeeded} Filled</span>
            </div>
            <div className="slot-progress-bar-track">
              <div
                className="slot-progress-fill"
                style={{ width: `${progressPercent}%`, backgroundColor: priorityColors[task.priority] }}
              />
            </div>

            {/* Premium crew member cards */}
            <div className="crew-checkin-list">
              {(task.acceptedBy || []).length > 0 ? (
                task.acceptedBy.map(vid => {
                  const v = volunteers.find(vol => vol.id === vid);
                  if (!v) return null;
                  return (
                    <div key={vid} className="crew-checkin-card">
                      <div className="crew-checkin-avatar">
                        {v.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="crew-checkin-info">
                        <span className="crew-checkin-name">{v.name}</span>
                        <span className="crew-checkin-meta">
                          Lvl {v.level || 1} · {v.rankTitle || 'Rookie'} · {v.xp || 0} XP
                        </span>
                        <span className="crew-checkin-status">
                          <CheckCircle2 size={10} />
                          Checked-in
                        </span>
                      </div>
                      {isOrganizerView && (
                        <button
                          className="crew-checkin-msg-btn"
                          onClick={() => { setActiveDirectChat(v.id); navigate('/messages'); }}
                          title={`Message ${v.name}`}
                        >
                          <MessageCircle size={12} />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="no-crew-placeholder">No volunteers checked in yet.</p>
              )}
            </div>
          </section>

          {/* Section 5: Standby Interest Queue (organizer, active only) */}
          {isActive && isOrganizerView && (task.interestedVolunteers || []).length > 0 && (
            <section className="details-section-panel standby-panel">
              <div className="standby-panel-header">
                <Star size={13} />
                <h3>Standby Interest Queue</h3>
                <span className="standby-count-chip">{task.interestedVolunteers.length}</span>
              </div>
              <p className="standby-helper-text">
                Volunteers on standby. Approve to promote to active crew.
              </p>
              <div className="crew-checkin-list">
                {task.interestedVolunteers.map(vid => {
                  const v = volunteers.find(vol => vol.id === vid);
                  if (!v) return null;
                  return (
                    <div key={vid} className="crew-checkin-card standby-checkin-card">
                      <div className="crew-checkin-avatar" style={{ opacity: 0.7 }}>
                        {v.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="crew-checkin-info">
                        <span className="crew-checkin-name">{v.name}</span>
                        <span className="crew-checkin-meta">{v.email}</span>
                      </div>
                      <button
                        className="standby-approve-btn"
                        onClick={() => handleApproveInterest(vid)}
                      >
                        <UserPlus size={12} />
                        <span>Approve</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ════════════════════════════════════════
            RIGHT COLUMN — Chat, Resolution, Controls
            ════════════════════════════════════════ */}
        <div className="task-details-right">

          {/* Section 6: Task Discussion Link */}
          <section className="details-section-panel details-chat-panel">
            <h3><MessageSquare size={13} /> Task Discussion</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '-4px' }}>
              Direct messages and active coordination live in the messages hub.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => {
                if (isOrganizerView) {
                  const firstCrew = task.acceptedBy?.[0];
                  if (firstCrew) {
                    setActiveDirectChat(firstCrew);
                  }
                } else {
                  setActiveDirectChat('org-1');
                }
                navigate('/messages');
              }}
            >
              <MessageSquare size={14} />
              <span>Open in Messages</span>
            </button>
          </section>


          {/* Section 7: Resolution Report (completed/cancelled/expired) */}
          {(task.status === 'completed' || task.status === 'cancelled' || task.status === 'expired') && (
            <section className="details-section-panel resolution-report-card">
              <div className="report-header-row">
                {task.status === 'completed' && <CheckCircle2 size={16} className="report-icon-success" />}
                {task.status === 'cancelled' && <Ban size={16} className="report-icon-warn" />}
                {task.status === 'expired' && <Clock size={16} className="report-icon-muted" />}
                <h3 className="report-heading">
                  {task.status === 'completed' && 'Resolution Report'}
                  {task.status === 'cancelled' && 'Dispatch Cancelled'}
                  {task.status === 'expired' && 'Dispatch Expired'}
                </h3>
              </div>

              <div className="resolution-meta-grid">
                <div className="resolution-meta-item">
                  <span className="resolution-meta-label">Outcome</span>
                  <span className="resolution-meta-value capitalize">{task.status}</span>
                </div>
                <div className="resolution-meta-item">
                  <span className="resolution-meta-label">Final Crew</span>
                  <span className="resolution-meta-value">{(task.acceptedBy || []).length} members</span>
                </div>
                {task.completedAt && (
                  <div className="resolution-meta-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="resolution-meta-label">Timestamp</span>
                    <span className="resolution-meta-value">
                      {new Date(task.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {task.cancelledAt && (
                  <div className="resolution-meta-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="resolution-meta-label">Cancelled At</span>
                    <span className="resolution-meta-value">
                      {new Date(task.cancelledAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {task.completionNote && (
                <div className="resolution-note-block">
                  <span className="resolution-meta-label">Completion Note</span>
                  <p className="resolution-note-text">"{task.completionNote}"</p>
                </div>
              )}
              {task.status === 'cancelled' && !task.completionNote && (
                <p className="resolution-note-text" style={{ fontStyle: 'italic' }}>
                  This dispatch was cancelled by the event coordinator.
                </p>
              )}
              {task.status === 'expired' && (
                <p className="resolution-note-text" style={{ fontStyle: 'italic' }}>
                  The acceptance window closed before crew could be assembled.
                </p>
              )}
            </section>
          )}

          {/* Section 8: Action Controls */}
          {isActive && task.status !== 'completed' && task.status !== 'expired' && task.status !== 'cancelled' && (
            <section className="details-section-panel details-action-dock">
              <h3>{isOrganizerView ? 'Organizer Controls' : 'Volunteer Actions'}</h3>

              {/* Volunteer actions */}
              {!isOrganizerView && (
                <div className="volunteer-dock-controls">
                  {!hasAccepted ? (
                    isFull ? (
                      hasInterest ? (
                        <button className="dock-full-btn standby-waiting-btn" disabled>
                          <Star size={14} />
                          <span>On Standby — Awaiting Approval</span>
                        </button>
                      ) : (
                        <button onClick={handleInterest} disabled={isLoading} className="dock-interest-btn">
                          {isLoading ? <Loader2 className="spin-loader" size={15} /> : <Star size={15} />}
                          <span>Express Interest (Standby)</span>
                        </button>
                      )
                    ) : (
                      <button onClick={handleAccept} disabled={isLoading} className="dock-accept-btn">
                        {isLoading ? <Loader2 className="spin-loader" size={15} /> : 'Check-in to Task'}
                      </button>
                    )
                  ) : (
                    <div className="vol-active-workspace">
                      <form onSubmit={handleComplete} className="completion-report-form">
                        <label>Log Resolution Report</label>
                        <p className="form-helper-text">Describe what was accomplished to resolve this task.</p>
                        <div className={`report-textarea-wrap ${focusedInput ? 'focused' : ''}`}>
                          <MessageSquare size={14} className="textarea-icon" />
                          <textarea
                            placeholder="e.g. Set up the audio receiver, tested wireless mics..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            onFocus={() => setFocusedInput(true)}
                            onBlur={() => setFocusedInput(false)}
                            disabled={isLoading}
                            rows={3}
                            maxLength={200}
                          />
                        </div>
                        <div className="workspace-buttons-row">
                          <button type="button" onClick={handleLeave} disabled={isLoading} className="dock-leave-btn">
                            <LogOut size={13} />
                            <span>Leave Task</span>
                          </button>
                          <button type="submit" disabled={isLoading} className="dock-resolve-btn">
                            {isLoading ? <Loader2 className="spin-loader" size={13} /> : <CheckCircle2 size={13} />}
                            <span>Submit Resolution</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Organizer controls */}
              {isOrganizerView && (
                <div className="organizer-dock-controls">
                  <button onClick={handleCancel} disabled={isLoading} className="dock-cancel-btn">
                    {isLoading ? <Loader2 className="spin-loader" size={14} /> : <Ban size={14} />}
                    <span>Cancel Task</span>
                  </button>
                  <button onClick={handleMarkComplete} disabled={isLoading} className="dock-complete-btn">
                    {isLoading ? <Loader2 className="spin-loader" size={14} /> : <CheckCircle2 size={14} />}
                    <span>Mark Complete</span>
                  </button>
                  <button onClick={handleDelete} className="dock-delete-btn">
                    <Trash2 size={14} />
                    <span>Delete Task</span>
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Permanent delete (organizer, historic only) */}
          {isHistoric && isOrganizerView && (
            <section className="details-section-panel details-action-dock danger-dock">
              <h3>Organizer Controls</h3>
              <div className="organizer-dock-controls">
                <button onClick={handleDelete} className="dock-delete-btn">
                  <Trash2 size={14} />
                  <span>Permanently Delete Record</span>
                </button>
              </div>
            </section>
          )}

        </div>{/* end right column */}
      </div>{/* end grid */}
    </div>
  );
}
