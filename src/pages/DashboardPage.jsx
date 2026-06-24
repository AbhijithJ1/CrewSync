import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import CrewResponseTimer from '../components/CrewResponseTimer';
import {
  Plus, Filter, Lock, CheckCircle2, Trophy,
  LayoutGrid, Activity, Users, PlusCircle, ExternalLink
} from 'lucide-react';


export default function DashboardPage({ screen = 'dashboard' }) {
  const {
    user,
    activeTasks,
    taskHistory,
    volunteers,
    notifications,
    toggleAvailability,
    removeVolunteer,
  } = useApp();

  const [removeConfirmId, setRemoveConfirmId] = useState(null);
  const navigate = useNavigate();

  const [showAllTasks, setShowAllTasks] = useState(false);
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'leaderboard'

  // ──────────────────────────────────────────────────────────────
  // LEADERBOARD DATA
  // ──────────────────────────────────────────────────────────────
  const leaderboardData = useMemo(() => {
    return volunteers
      .filter(v => v.role === 'volunteer' && v.approvalStatus === 'approved')
      .sort((a, b) => (b.xp || 0) - (a.xp || 0));
  }, [volunteers]);

  // Full Leaderboard View
  const renderLeaderboard = () => (
    <div className="leaderboard-container afu">
      <div className="leaderboard-welcome">
        <Trophy size={20} className="leaderboard-icon" />
        <div>
          <h2>Crew Standings</h2>
          <p>Live volunteer rankings based on XP, tasks, and streaks.</p>
        </div>
      </div>

      {/* Podium for top 3 */}
      {leaderboardData.length >= 1 && (
        <div className="leaderboard-podium-wrapper-mono">
          <div className="leaderboard-podium">
            {/* 2nd Place */}
            {leaderboardData[1] && (
              <div className="podium-col silver">
                <div className="avatar-shield-container">
                  <div className="podium-avatar-mono">
                    {leaderboardData[1].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span className="medal-badge-mono">2ND</span>
                </div>
                <h4>{leaderboardData[1].name.split(' ')[0]}</h4>
                <span className="podium-xp">{leaderboardData[1].xp || 0} XP</span>
                <span className="podium-rank-title">{leaderboardData[1].rankTitle}</span>
                <div className="podium-bar-mono silver-bar-mono" />
              </div>
            )}
            {/* 1st Place */}
            <div className="podium-col gold">
              <div className="avatar-shield-container">
                <div className="crown-badge-mono">✦ 1ST ✦</div>
                <div className="podium-avatar-mono gold-avatar-mono">
                  {leaderboardData[0].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              </div>
              <h4>{leaderboardData[0].name.split(' ')[0]}</h4>
              <span className="podium-xp">{leaderboardData[0].xp || 0} XP</span>
              <span className="podium-rank-title">{leaderboardData[0].rankTitle}</span>
              <div className="podium-bar-mono gold-bar-mono" />
            </div>
            {/* 3rd Place */}
            {leaderboardData[2] && (
              <div className="podium-col bronze">
                <div className="avatar-shield-container">
                  <div className="podium-avatar-mono">
                    {leaderboardData[2].name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <span className="medal-badge-mono">3RD</span>
                </div>
                <h4>{leaderboardData[2].name.split(' ')[0]}</h4>
                <span className="podium-xp">{leaderboardData[2].xp || 0} XP</span>
                <span className="podium-rank-title">{leaderboardData[2].rankTitle}</span>
                <div className="podium-bar-mono bronze-bar-mono" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full rankings list */}
      <div className="leaderboard-list">
        {leaderboardData.map((vol, index) => {
          const isCurrentUser = vol.id === user?.id;
          return (
            <div
              key={vol.id}
              className={`leaderboard-item-mono afu ${isCurrentUser ? 'leaderboard-self' : ''}`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <div className="rank-number-mono">#{index + 1}</div>
              <div className="vol-avatar-mono">
                {vol.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="vol-details">
                <h4>{vol.name}{isCurrentUser && <span className="you-tag"> (You)</span>}</h4>
                <span className="rank-name-mono">{vol.rankTitle} · Lvl {vol.level || 1}</span>
              </div>
              <div className="vol-metrics-summary">
                <div className="streak-badge-mono">STREAK {vol.streakCount || 0}</div>
                <div className="vol-score-mono">{vol.xp || 0} XP</div>
              </div>
            </div>
          );
        })}
        {leaderboardData.length === 0 && (
          <p className="empty-feed-text-mono" style={{ textAlign: 'center', marginTop: 30 }}>
            No approved volunteers registered yet.
          </p>
        )}
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  // ORGANIZER DASHBOARD LAYOUT
  // ──────────────────────────────────────────────────────────────
  const orgPendingTasks  = useMemo(() => activeTasks.filter(t => t.status === 'pending'),   [activeTasks]);
  const orgActiveTasks   = useMemo(() => activeTasks.filter(t => t.status === 'accepted'),  [activeTasks]);
  const orgCompletedTasks= useMemo(() => taskHistory.filter(t => t.status === 'completed'), [taskHistory]);

  const pendingApprovals = useMemo(
    () => volunteers.filter(v => v.approvalStatus === 'pending'),
    [volunteers]
  );

  const renderOrganizerFeed = () => {
    const priorityColors = {
      low: 'var(--priority-low-border)',
      medium: 'var(--priority-medium-border)',
      high: 'var(--priority-high-border)',
      critical: 'var(--priority-critical-border)'
    };

    return (
      <div className="org-dashboard afu">
        {/* Welcome Header */}
        <div className="dashboard-welcome-mono">
          <div>
            <h2>Operations Control</h2>
            <p>Real-time task dispatch board and volunteer coordination.</p>
          </div>
          <button
            onClick={() => navigate('/create-task')}
            className="btn btn-primary create-dispatch-btn"
          >
            <Plus size={15} />
            <span>Dispatch Task</span>
          </button>
        </div>

        {/* Analytics Row (4 cards) */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-card-label">Pending Slots</span>
            <span className="stat-card-value">{orgPendingTasks.length}</span>
            <span className="stat-card-sub">Awaiting crew signups</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Active Deployments</span>
            <span className="stat-card-value">{orgActiveTasks.length}</span>
            <span className="stat-card-sub">Tasks currently on-going</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Resolved Logs</span>
            <span className="stat-card-value">{orgCompletedTasks.length}</span>
            <span className="stat-card-sub">Closed coordination tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Available Crew</span>
            <span className="stat-card-value">
              {volunteers.filter(v => v.approvalStatus === 'approved' && v.available).length}
            </span>
            <span className="stat-card-sub">Ready to deploy</span>
          </div>
        </div>

        {/* Main Board Grid: Kanban Board + Sidebar Panel */}
        <div className="dash-bottom-grid">
          {/* Left Column: 3-Col Kanban Board */}
          <div className="kanban-board">
            {/* Pending Column */}
            <div className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title">Pending Dispatch</span>
                <span className="kanban-count-pill">{orgPendingTasks.length}</span>
              </div>
              <div className="kanban-col-body">
                {orgPendingTasks.map(t => (
                  <div
                    key={t.id}
                    className="kanban-task-card"
                    style={{ borderLeftColor: priorityColors[t.priority] || 'var(--border)' }}
                    onClick={() => navigate(`/task/${t.id}`)}
                  >
                    <div className="kanban-task-title">{t.title}</div>
                    <div className="kanban-task-meta">
                      <span className="kanban-task-slots">Slots: {t.acceptedBy.length}/{t.volunteersNeeded}</span>
                      <span className="kanban-task-timer">{t.requiredSkill}</span>
                    </div>
                  </div>
                ))}
                {orgPendingTasks.length === 0 && (
                  <div className="empty-state">
                    <CheckCircle2 size={16} />
                    <p style={{ fontSize: '11px' }}>Queue clear</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Column */}
            <div className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title">Active Deployments</span>
                <span className="kanban-count-pill">{orgActiveTasks.length}</span>
              </div>
              <div className="kanban-col-body">
                {orgActiveTasks.map(t => (
                  <div
                    key={t.id}
                    className="kanban-task-card"
                    style={{ borderLeftColor: priorityColors[t.priority] || 'var(--border)' }}
                    onClick={() => navigate(`/task/${t.id}`)}
                  >
                    <div className="kanban-task-title">{t.title}</div>
                    <div className="kanban-task-meta">
                      <span className="kanban-task-slots">Crew: {t.acceptedBy.length}/{t.volunteersNeeded}</span>
                      <span className="kanban-task-timer">Active</span>
                    </div>
                  </div>
                ))}
                {orgActiveTasks.length === 0 && (
                  <div className="empty-state">
                    <CheckCircle2 size={16} />
                    <p style={{ fontSize: '11px' }}>No active duties</p>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title">Completed Logs</span>
                <span className="kanban-count-pill">{orgCompletedTasks.length}</span>
              </div>
              <div className="kanban-col-body">
                {orgCompletedTasks.slice(0, 15).map(t => (
                  <div
                    key={t.id}
                    className="kanban-task-card"
                    style={{ borderLeftColor: priorityColors[t.priority] || 'var(--border)', opacity: 0.7 }}
                    onClick={() => navigate(`/task/${t.id}`)}
                  >
                    <div className="kanban-task-title">{t.title}</div>
                    <div className="kanban-task-meta">
                      <span className="kanban-task-slots" style={{ textDecoration: 'line-through' }}>Resolved</span>
                      <span className="kanban-task-timer">Done</span>
                    </div>
                  </div>
                ))}
                {orgCompletedTasks.length === 0 && (
                  <div className="empty-state">
                    <CheckCircle2 size={16} />
                    <p style={{ fontSize: '11px' }}>No resolved tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Right Column: Panel Sidebar (Approvals, Leaderboard Mini, System Logs) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pending Approvals Alert Bar */}
          {pendingApprovals.length > 0 && (
            <div className="approval-alert-strip aex">
              <div className="approval-alert-text">
                <strong>Signups Queue:</strong> {pendingApprovals.length} requests pending review.
              </div>
              <button
                onClick={() => navigate('/approvals')}
                className="btn btn-secondary btn-sm"
              >
                Review
              </button>
            </div>
          )}

          {/* Live Crew Progression Snapshot */}
          <div className="activity-feed-card">
            <div className="activity-feed-header">
              <span className="activity-feed-title">Crew Progression</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/volunteers')} style={{ fontSize: '10px' }}>Registry</button>
            </div>
            <div className="activity-feed-body" style={{ maxHeight: '180px' }}>
              {leaderboardData.slice(0, 3).map((vol, index) => (
                <div key={vol.id} className="activity-log-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-disabled)', width: '16px' }}>#{index + 1}</span>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{vol.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lvl {vol.level || 1} · {vol.rankTitle}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700 }}>{vol.xp || 0} XP</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{vol.tasksCompleted || 0} tasks</div>
                  </div>
                </div>
              ))}
              {leaderboardData.length === 0 && (
                <p className="empty-feed-text-mono" style={{ padding: '16px' }}>No active crew members.</p>
              )}
            </div>
          </div>

          {/* System Activity Log */}
          <div className="activity-feed-card">
            <div className="activity-feed-header">
              <span className="activity-feed-title">System Activity Log</span>
            </div>
            <div className="activity-feed-body">
              {notifications.slice(0, 8).map(log => (
                <div key={log.id} className="activity-log-item">
                  <div className={`activity-dot ${log.type === 'success' ? 'activity-dot-white' : ''}`} />
                  <div style={{ flex: 1 }}>
                    <div className="activity-log-msg">{log.message}</div>
                    <div className="activity-log-time">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '12px' }}>
                  No actions logged.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // ──────────────────────────────────────────────────────────────
  // VOLUNTEER DASHBOARD LAYOUT
  // ──────────────────────────────────────────────────────────────
  const volunteerPendingDispatches = useMemo(() => {
    return activeTasks.filter(t => {
      if (t.status !== 'pending') return false;
      if ((t.acceptedBy || []).length >= t.volunteersNeeded) return false;
      if ((t.acceptedBy || []).includes(user.id)) return false;
      if (showAllTasks) return true;
      return (user.skills || []).includes(t.requiredSkill);
    });
  }, [activeTasks, user.skills, showAllTasks, user.id]);

  const myActiveTask = useMemo(
    () => activeTasks.find(t => (t.acceptedBy || []).includes(user.id)),
    [activeTasks, user.id]
  );

  const renderVolunteerQueue = () => {
    const isBusy = !user.available || !!myActiveTask;
    return (
      <div className="vol-dashboard afu">
        {/* Stats Row (4 cards) */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-card-label">Tasks Completed</span>
            <span className="stat-card-value">{user.tasksCompleted || 0}</span>
            <span className="stat-card-sub">Total resolved duties</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Experience Points</span>
            <span className="stat-card-value">{user.xp || 0} XP</span>
            <span className="stat-card-sub">Current progression score</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Active Streak</span>
            <span className="stat-card-value">{user.streakCount || 0}</span>
            <span className="stat-card-sub">Consecutive assignments</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Operational Rank</span>
            <span className="stat-card-value" style={{ fontSize: '18px', paddingTop: '8px' }}>{user.rankTitle || 'Rookie'}</span>
            <span className="stat-card-sub">Level {user.level || 1}</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="view-mode-tabs">
          <button
            onClick={() => setViewMode('feed')}
            className={`view-tab-btn ${viewMode === 'feed' ? 'active' : ''}`}
          >
            <LayoutGrid size={14} />
            <span>Dispatches</span>
          </button>
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`view-tab-btn ${viewMode === 'leaderboard' ? 'active' : ''}`}
          >
            <Trophy size={14} />
            <span>Leaderboard</span>
          </button>
        </div>

        {viewMode === 'feed' ? (
          <div className="vol-page-grid">
            {/* Left Column: Active Duty / Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Availability Status Card */}
              <div className="avail-toggle-card">
                <div className="avail-toggle-info">
                  <h4>Grid Status</h4>
                  <p>
                    {myActiveTask
                      ? 'Busy Lock Active — currently on task assignment.'
                      : !user.available
                      ? 'Unavailable — dispatches paused.'
                      : 'Ready — available to accept incoming dispatches.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (myActiveTask) {
                      toast.error('Finish or leave your active task first!');
                      return;
                    }
                    toggleAvailability(user.id);
                    toast.success(`Status: ${user.available ? 'Busy' : 'Available'}`);
                  }}
                  className={`btn-avail-switch-mono ${!user.available ? 'busy-state' : 'online-state'}`}
                >
                  {user.available ? 'AVAILABLE' : 'BUSY'}
                </button>
              </div>

              {/* Active Task assignment / Standby alert */}
              {myActiveTask ? (
                <div className="active-task-container">
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-disabled)', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 700 }}>
                    [ Active Duty Assignment ]
                  </div>
                  <TaskCard task={myActiveTask} role="volunteer" />
                </div>
              ) : (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px', gap: '12px' }}>
                  <div className="status-field-bar">
                    <div className={`status-dot ${user.available ? 'status-dot-on' : ''}`} />
                    <span>{user.available ? 'Standby Mode' : 'Offline Mode'}</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '240px' }}>
                    {user.available 
                      ? 'Awaiting dispatches. Keep this tab open to monitor incoming alerts.' 
                      : 'Toggle your status to AVAILABLE to join the event dispatch network.'}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Dispatch Feed + Standings preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Live dispatch Queue */}
              <div className="active-dispatch-feed-mono">
                <div className="dispatch-feed-header-mono" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="dispatch-feed-title">Live Dispatch Queue</span>
                  <button
                    onClick={() => setShowAllTasks(s => !s)}
                    className="filter-toggle-btn"
                    style={{ border: showAllTasks ? '1px solid var(--border-strong)' : '1px solid var(--border)', background: showAllTasks ? 'var(--bg-active)' : 'var(--bg-elevated)', color: showAllTasks ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    <Filter size={12} />
                    <span>{showAllTasks ? 'Match Skills' : 'Show All'}</span>
                  </button>
                </div>

                <div className="task-feed-list" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {isBusy && !myActiveTask ? (
                    <div className="empty-state">
                      <Lock size={20} />
                      <p style={{ fontSize: '12px' }}>Dispatches Paused</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Set status to AVAILABLE to view the queue.</span>
                    </div>
                  ) : volunteerPendingDispatches.length > 0 ? (
                    volunteerPendingDispatches.map((t, idx) => (
                      <TaskCard key={t.id} task={t} role="volunteer" delay={idx * 0.03} />
                    ))
                  ) : (
                    <div className="empty-state">
                      <CheckCircle2 size={20} />
                      <p style={{ fontSize: '12px' }}>Queue Clear</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {showAllTasks
                          ? 'No pending dispatches on the grid.'
                          : 'No matching skills found. Try showing all tasks.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Crew XP Snapshot */}
              <div className="activity-feed-card">
                <div className="activity-feed-header">
                  <span className="activity-feed-title">Crew Progression</span>
                </div>
                <div className="activity-feed-body" style={{ maxHeight: '180px' }}>
                  {leaderboardData.slice(0, 3).map((vol, index) => (
                    <div key={vol.id} className="activity-log-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-disabled)', width: '16px' }}>#{index + 1}</span>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{vol.name}{vol.id === user?.id && <span className="you-tag"> (You)</span>}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lvl {vol.level || 1} · {vol.rankTitle}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700 }}>{vol.xp || 0} XP</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{vol.tasksCompleted || 0} tasks</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          renderLeaderboard()
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────
  // VOLUNTEER TASKS PAGE (screen='tasks')
  // ──────────────────────────────────────────────────────────────
  const myTaskHistory = useMemo(
    () => taskHistory.filter(t => (t.acceptedBy || []).includes(user.id)),
    [taskHistory, user.id]
  );

  const renderVolunteerTasks = () => (
    <div className="vol-tasks-page afu" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontFamily: 'Sora', fontSize: '20px', fontWeight: 700 }}>My Contribution Logs</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active commitments and completed work history.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card-label">Completed Tasks</span>
          <span className="stat-card-value">{user.tasksCompleted || 0}</span>
          <span className="stat-card-sub">Total resolved assignments</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">XP Accumulated</span>
          <span className="stat-card-value">{user.xp || 0} XP</span>
          <span className="stat-card-sub">Total score earned</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Current Streak</span>
          <span className="stat-card-value">{user.streakCount || 0}</span>
          <span className="stat-card-sub">Active task streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Response Rate</span>
          <span className="stat-card-value">{user.responseRate || 0}%</span>
          <span className="stat-card-sub">Acceptance ratio</span>
        </div>
      </div>

      {/* Active Assignments */}
      <div className="vol-tasks-section-mono">
        <h3 style={{ fontFamily: 'Sora', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Active Duty Assignment</h3>
        <div className="task-feed-list">
          {myActiveTask ? (
            <TaskCard task={myActiveTask} role="volunteer" />
          ) : (
            <div className="card" style={{ padding: '20px', color: 'var(--text-disabled)', fontSize: '12px', textAlign: 'center' }}>
              No active assignments. Accept a dispatch from the Live Queue.
            </div>
          )}
        </div>
      </div>

      {/* Completed History */}
      <div className="vol-tasks-section-mono" style={{ marginTop: 12 }}>
        <h3 style={{ fontFamily: 'Sora', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Completed Work History</h3>
        <div className="task-feed-list">
          {myTaskHistory.length > 0 ? (
            myTaskHistory.map((t, idx) => (
              <TaskCard key={t.id} task={t} role="volunteer" delay={idx * 0.03} />
            ))
          ) : (
            <div className="card" style={{ padding: '20px', color: 'var(--text-disabled)', fontSize: '12px', textAlign: 'center' }}>
              No history logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  // ORGANIZER CREW MANAGER (screen='volunteers')
  // ──────────────────────────────────────────────────────────────
  const renderOrganizerCrew = () => {
    const approvedVolunteers = volunteers.filter(
      v => v.role === 'volunteer' && v.approvalStatus === 'approved'
    );

    return (
      <div className="org-crew-page afu">
        <div className="crew-page-header-mono" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'Sora', fontSize: '20px', fontWeight: 700 }}>Volunteer Registry</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Verified crew members, registered skills, and availability.</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/approvals')}
          >
            Review Signups {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
          </button>
        </div>

        <div className="crew-card-grid-mono">
          {approvedVolunteers.map((v, idx) => {
            const vActive = activeTasks.find(t => (t.acceptedBy || []).includes(v.id));
            const vInterested = activeTasks.find(t => (t.interestedVolunteers || []).includes(v.id));
            const completedCount = taskHistory.filter(
              t => t.status === 'completed' && (t.acceptedBy || []).includes(v.id)
            ).length;

            let liveStatus = v.available ? 'Ready on grid' : 'Offline';
            if (vActive) {
              const myMsgs = (vActive.messages || []).filter(
                m => m.senderId === v.id && m.text.startsWith('[Quick Action]')
              );
              if (myMsgs.length > 0) {
                liveStatus = myMsgs[myMsgs.length - 1].text.replace('[Quick Action] ', '');
              } else {
                liveStatus = `→ ${vActive.location}`;
              }
            } else if (vInterested) {
              liveStatus = 'Standby — pending slot';
            }

            return (
              <div
                key={v.id}
                className="crew-member-card-mono afu"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="crew-member-header">
                  <div className="crew-member-avatar-mono">
                    {v.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="crew-member-details">
                    <h4>{v.name}</h4>
                    <span className="crew-rank-badge">Lvl {v.level || 1} · {v.rankTitle}</span>
                  </div>
                </div>

                <div className="crew-skills-wrap-mono">
                  {(v.skills || []).map(s => (
                    <span key={s} className="crew-skill-pill-mono">{s}</span>
                  ))}
                </div>

                <div className="crew-card-stats-row">
                  <span className="crew-stat-item">
                    <span className="crew-stat-value">{completedCount}</span>
                    <span className="crew-stat-label">Done</span>
                  </span>
                  <span className="crew-stat-item">
                    <span className="crew-stat-value">{v.xp || 0}</span>
                    <span className="crew-stat-label">XP</span>
                  </span>
                  <span className="crew-stat-item">
                    <span className="crew-stat-value">Lvl {v.level || 1}</span>
                    <span className="crew-stat-label">{v.rankTitle}</span>
                  </span>
                </div>

                <div className="crew-status-zone">
                  <span className="crew-live-status">{liveStatus}</span>
                  {activeTasks
                    .filter(t => t.status === 'pending' && !(t.acceptedBy || []).includes(v.id) && (v.skills || []).includes(t.requiredSkill))
                    .slice(0, 1)
                    .map(t => (
                      <CrewResponseTimer key={t.id} expiresAt={new Date(t.createdAt).getTime() + t.durationLimit * 1000} />
                    ))}
                </div>

                <div className="crew-card-footer-mono">
                  <span className={`crew-avail-pill-mono ${vActive ? 'on-task' : v.available ? 'online' : 'busy'}`}>
                    {vActive ? 'ON TASK' : v.available ? 'READY' : 'BUSY'}
                  </span>
                  <button
                    className="btn btn-danger btn-sm crew-remove-btn"
                    style={{ fontSize: '10px', padding: '4px 10px', marginLeft: 'auto' }}
                    onClick={() => setRemoveConfirmId(v.id)}
                    title="Remove volunteer from crew registry"
                  >
                    Remove
                  </button>
                </div>

                {/* Inline confirmation modal */}
                {removeConfirmId === v.id && (
                  <div className="crew-remove-confirm-overlay">
                    <div className="crew-remove-confirm-box">
                      <p className="crew-remove-confirm-title">Remove Volunteer?</p>
                      <p className="crew-remove-confirm-desc">This action permanently removes <strong>{v.name}</strong> from the crew registry and all active tasks. It cannot be undone.</p>
                      <div className="crew-remove-confirm-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setRemoveConfirmId(null)}
                        >Cancel</button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            removeVolunteer(v.id);
                            setRemoveConfirmId(null);
                            toast.success(`${v.name} removed from crew registry.`);
                          }}
                        >Confirm Remove</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {approvedVolunteers.length === 0 && (
            <p
              className="empty-feed-text-mono"
              style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: 30 }}
            >
              No approved volunteers registered yet.
            </p>
          )}
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────
  // GENERAL RENDER
  // ──────────────────────────────────────────────────────────────
  const renderMainView = () => {
    if (user.role === 'organizer') {
      switch (screen) {
        case 'volunteers': return renderOrganizerCrew();
        case 'dashboard':
        default:           return renderOrganizerFeed();
      }
    } else {
      switch (screen) {
        case 'tasks':    return renderVolunteerTasks();
        case 'dashboard':
        default:         return renderVolunteerQueue();
      }
    }
  };

  return <div className="page-content-wrapper">{renderMainView()}</div>;
}
