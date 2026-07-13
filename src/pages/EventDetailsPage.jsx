import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft, Calendar, MapPin, CheckCircle2, Clock, Users,
  Trash2, AlertTriangle, Plus, ExternalLink, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    events,
    activeTasks,
    taskHistory,
    volunteers,
    completeEvent,
    deleteEvent,
    approveTaskCompletion,
    rejectTaskCompletion,
  } = useApp();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rejectNoteId, setRejectNoteId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const event = events.find(ev => ev.id === id);

  const eventActiveTasks = useMemo(
    () => activeTasks.filter(t => t.eventId === id),
    [activeTasks, id]
  );
  const eventHistoryTasks = useMemo(
    () => taskHistory.filter(t => t.eventId === id),
    [taskHistory, id]
  );
  const pendingReviews = useMemo(
    () => eventActiveTasks.filter(t => t.status === 'waiting_review'),
    [eventActiveTasks]
  );
  const activeDeployments = useMemo(
    () => eventActiveTasks.filter(t => t.status === 'accepted' || t.status === 'pending'),
    [eventActiveTasks]
  );
  const completedTasks = useMemo(
    () => eventHistoryTasks.filter(t => t.status === 'completed'),
    [eventHistoryTasks]
  );

  const totalTasks = eventActiveTasks.length + eventHistoryTasks.length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const isOrganizer = user?.role === 'organizer';

  if (!event) {
    return (
      <div className="details-error-view afu">
        <div className="error-triangle-icon">
          <AlertTriangle size={32} />
        </div>
        <h3>Event not found</h3>
        <p>This event may have been deleted or does not exist.</p>
        <button onClick={() => navigate('/dashboard')} className="details-back-inline-btn">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleCompleteEvent = () => {
    completeEvent(id);
    toast.success(`Event "${event.title}" marked as completed!`);
  };

  const handleDeleteEvent = () => {
    deleteEvent(id);
    toast.success(`Event "${event.title}" deleted.`);
    navigate('/dashboard');
  };

  const handleApprove = (taskId, taskTitle) => {
    approveTaskCompletion(taskId);
    toast.success(`Task "${taskTitle}" approved! Crew XP awarded.`);
  };

  const handleReject = (taskId, taskTitle) => {
    rejectTaskCompletion(taskId, rejectReason);
    toast.error(`Task "${taskTitle}" returned for further work.`);
    setRejectNoteId(null);
    setRejectReason('');
  };

  const priorityColors = {
    low: 'var(--priority-low-border)',
    medium: 'var(--priority-medium-border)',
    high: 'var(--priority-high-border)',
    critical: 'var(--priority-critical-border)',
  };

  const getVolunteerNames = (acceptedBy) => {
    return (acceptedBy || []).map(id => {
      const vol = volunteers.find(v => v.id === id);
      return vol?.name || 'Unknown';
    }).join(', ');
  };

  return (
    <div className="page-content-wrapper">
      <div className="event-details-page afu">
        {/* Event Header */}
        <div className="event-details-header">
          <div className="event-details-title-row">
            <div className="event-details-icon-wrap">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="event-details-title">{event.title}</h1>
              <div className="event-details-meta">
                {event.date && (
                  <span className="event-meta-chip">
                    <Calendar size={12} />
                    {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {event.venue && (
                  <span className="event-meta-chip">
                    <MapPin size={12} />
                    {event.venue}
                  </span>
                )}
                <span className={`event-status-chip event-status-${event.status}`}>
                  {event.status === 'active' ? 'Active' : event.status === 'completed' ? 'Completed' : event.status}
                </span>
              </div>
            </div>
          </div>

          {/* Organizer Actions */}
          {isOrganizer && (
            <div className="event-details-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/create-task')}
              >
                <Plus size={13} />
                <span>Add Task</span>
              </button>
              {event.status === 'active' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleCompleteEvent}
                >
                  <CheckCircle2 size={13} />
                  <span>Complete Event</span>
                </button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="event-desc-block">
            <p>{event.description}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="event-progress-card">
          <div className="event-progress-header">
            <span>Event Progress</span>
            <span className="event-progress-pct">{progressPct}%</span>
          </div>
          <div className="event-progress-bar-track">
            <div
              className="event-progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="event-progress-stats">
            <span><CheckCircle2 size={11} /> {completedTasks.length} completed</span>
            <span><Clock size={11} /> {activeDeployments.length} active</span>
            <span><Users size={11} /> {totalTasks} total tasks</span>
          </div>
        </div>

        {/* Completion Requests Panel (Organizer Only) */}
        {isOrganizer && pendingReviews.length > 0 && (
          <div className="completion-requests-panel">
            <div className="crp-header">
              <div className="crp-badge-dot pulse" />
              <h3>Pending Approval Requests</h3>
              <span className="crp-count-pill">{pendingReviews.length}</span>
            </div>
            <div className="crp-list">
              {pendingReviews.map(task => {
                const requester = volunteers.find(v => v.id === task.requestedBy);
                return (
                  <div key={task.id} className="crp-item">
                    <div className="crp-item-content">
                      <div className="crp-item-title">{task.title}</div>
                      <div className="crp-item-meta">
                        <span
                          className="crp-priority-dot"
                          style={{ background: priorityColors[task.priority] }}
                        />
                        <span className="crp-item-skill">{task.requiredSkill}</span>
                        {requester && (
                          <span className="crp-item-requester">
                            · Requested by <strong>{requester.name}</strong>
                          </span>
                        )}
                      </div>
                      {task.completionNote && (
                        <div className="crp-item-note">
                          &ldquo;{task.completionNote}&rdquo;
                        </div>
                      )}
                    </div>

                    {rejectNoteId === task.id ? (
                      <div className="crp-reject-form">
                        <input
                          type="text"
                          className="crp-reject-input"
                          placeholder="Reason for rejection (optional)"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                        />
                        <div className="crp-reject-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setRejectNoteId(null); setRejectReason(''); }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(task.id, task.title)}
                          >
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="crp-item-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/task/${task.id}`)}
                        >
                          <ExternalLink size={12} />
                          <span>View</span>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm crp-reject-btn"
                          onClick={() => setRejectNoteId(task.id)}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApprove(task.id, task.title)}
                        >
                          <CheckCircle2 size={12} />
                          <span>Approve</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Tasks */}
        <div className="event-tasks-section">
          <div className="event-tasks-section-header">
            <h3>Active Tasks</h3>
            <span className="event-tasks-count">{activeDeployments.length}</span>
          </div>
          {activeDeployments.length > 0 ? (
            <div className="event-tasks-list">
              {activeDeployments.map(task => (
                <div
                  key={task.id}
                  className="event-task-row"
                  style={{ borderLeftColor: priorityColors[task.priority] || 'var(--border)' }}
                  onClick={() => navigate(`/task/${task.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/task/${task.id}`)}
                >
                  <div className="event-task-row-main">
                    <span className="event-task-row-title">{task.title}</span>
                    <span className={`event-task-row-status status-${task.status}`}>
                      {task.status === 'accepted' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <div className="event-task-row-meta">
                    <span><MapPin size={10} /> {task.location}</span>
                    <span><Users size={10} /> {(task.acceptedBy || []).length}/{task.volunteersNeeded}</span>
                    <span>{task.requiredSkill}</span>
                  </div>
                  {(task.acceptedBy || []).length > 0 && (
                    <div className="event-task-row-crew">
                      Crew: {getVolunteerNames(task.acceptedBy)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="event-tasks-empty">
              <Plus size={18} />
              <p>No active tasks yet.</p>
              {isOrganizer && (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/create-task')}>
                  Dispatch First Task
                </button>
              )}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        <div className="event-tasks-section">
          <div className="event-tasks-section-header">
            <h3>Completed Tasks</h3>
            <span className="event-tasks-count done">{completedTasks.length}</span>
          </div>
          {completedTasks.length > 0 ? (
            <div className="event-tasks-list">
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="event-task-row completed-row"
                  onClick={() => navigate(`/task/${task.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/task/${task.id}`)}
                >
                  <div className="event-task-row-main">
                    <span className="event-task-row-title">{task.title}</span>
                    <span className="event-task-row-status status-completed">
                      <CheckCircle2 size={11} /> Done
                    </span>
                  </div>
                  <div className="event-task-row-meta">
                    <span>{task.requiredSkill}</span>
                    {task.completedAt && (
                      <span>
                        {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {getVolunteerNames(task.acceptedBy) && (
                      <span>by {getVolunteerNames(task.acceptedBy)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="event-tasks-empty">
              <CheckCircle2 size={18} />
              <p>No completed tasks yet.</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="crew-remove-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="crew-remove-confirm-box" onClick={e => e.stopPropagation()}>
              <p className="crew-remove-confirm-title">Delete Event?</p>
              <p className="crew-remove-confirm-desc">
                This will permanently delete <strong>{event.title}</strong>. Tasks under this event
                will remain in the task board but lose their event reference. This cannot be undone.
              </p>
              <div className="crew-remove-confirm-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteEvent}
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
