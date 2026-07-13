import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateLevelInfo, ACHIEVEMENTS } from '../data/xpConfig';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const {
    user,
    logout,
    activeTasks,
    taskHistory,
    volunteers,
    toggleAvailability,
    notifications,
  } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const isBusy = !user.available;
  const levelInfo = calculateLevelInfo(user.xp || 0);

  const currentXPInLevel = (user.xp || 0) - levelInfo.prevXPThreshold;
  const neededXPForNextLevel = levelInfo.nextXPThreshold - levelInfo.prevXPThreshold;
  const progressPercentage = Math.min(
    100,
    Math.round((currentXPInLevel / neededXPForNextLevel) * 100)
  );

  // Find user's leaderboard rank
  const leaderboard = volunteers
    .filter(v => v.role === 'volunteer' && v.approvalStatus === 'approved')
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

  const userRank = leaderboard.findIndex(v => v.id === user.id) + 1;

  const milestones = [
    { lvl: 1, label: 'Rookie',    xp: 0 },
    { lvl: 2, label: 'Helper',    xp: 100 },
    { lvl: 3, label: 'Operator',  xp: 250 },
    { lvl: 4, label: 'Specialist',xp: 500 },
    { lvl: 5, label: 'Elite Crew',xp: 900 },
  ];

  const recentActivities = useMemo(() => {
    if (user.role === 'organizer') {
      return notifications.filter(n => n.type !== 'message').slice(0, 6);
    }
    
    return notifications.filter(notif => {
      if (notif.targetVolunteerId === user.id) return true;
      if (notif.taskId) {
        const task = activeTasks.find(t => t.id === notif.taskId) || taskHistory.find(t => t.id === notif.taskId);
        if (task) {
          const isAssigned = (task.acceptedBy || []).includes(user.id);
          const isInterested = (task.interestedVolunteers || []).includes(user.id);
          return isAssigned || isInterested;
        }
      }
      if (!notif.taskId && !notif.targetVolunteerId) {
        return true;
      }
      return false;
    }).slice(0, 5);
  }, [notifications, activeTasks, taskHistory, user.id, user.role]);

  return (
    <div className="profile-page-container afu">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="profile-header-group-mono">
        <h2>My Account</h2>
        <p>Credentials, progression, and operational statistics.</p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="profile-page-layout">
        {/* Left Column: Profile Card, XP Progression, Availability and Action Lists */}
        <div className="profile-left-column">
          {/* Identity Card */}
          <div className="profile-identity-card-mono">
            <div className="profile-avatar-large-mono">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="profile-name-details">
              <h3>{user.name}</h3>
              <span className="profile-email-text">{user.email}</span>
              <div className="profile-role-pill-row-mono">
                <span className="profile-role-pill-mono">
                  {user.role === 'organizer' ? 'COORDINATOR' : 'VOLUNTEER'}
                </span>
                {user.approvalStatus === 'approved' && (
                  <span className="profile-approved-badge">✓ APPROVED</span>
                )}
              </div>
            </div>
          </div>

          {/* XP Progression (Volunteers only) */}
          {user.role === 'volunteer' && (
            <div className="xp-progression-card-mono aex">
              <div className="xp-card-header">
                <div className="xp-rank-group">
                  <span className="xp-rank-title">RANK: {levelInfo.rankTitle.toUpperCase()}</span>
                  <span className="xp-level-title">LVL {levelInfo.level}</span>
                </div>
                {userRank > 0 && (
                  <span className="xp-leaderboard-rank">#{userRank} on board</span>
                )}
              </div>

              <div className="xp-bar-outer-mono">
                <div
                  className="xp-bar-inner-mono"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="xp-bar-labels-mono">
                <span>{currentXPInLevel} / {neededXPForNextLevel} XP this level</span>
                <span>Next: {levelInfo.nextXPThreshold} XP</span>
              </div>

              {/* Level milestones */}
              <div className="xp-milestones-row">
                {milestones.map(m => (
                  <div
                    key={m.lvl}
                    className={`xp-milestone-dot ${(user.xp || 0) >= m.xp ? 'reached' : ''}`}
                    title={`${m.label} — ${m.xp} XP`}
                  >
                    <span className="milestone-lvl">{m.lvl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability Toggle (Volunteers) */}
          {user.role === 'volunteer' && (
            <div className="profile-switch-panel-mono">
              <div className="switch-panel-text">
                <h3>Grid Presence</h3>
                <p>
                  {isBusy ? 'Dispatches paused. You are offline.' : 'Ready on grid. Dispatches incoming.'}
                </p>
              </div>
              <button
                onClick={() => {
                  const activeAssignments = activeTasks.filter(t =>
                    (t.acceptedBy || []).includes(user.id)
                  );
                  if (activeAssignments.length > 0) {
                    toast.error('Finish your active task first!');
                    return;
                  }
                  toggleAvailability(user.id);
                  toast.success(`Status set to ${user.available ? 'Busy' : 'Available'}`);
                }}
                className={`btn-avail-switch-mono ${isBusy ? 'busy-state' : 'online-state'}`}
              >
                {user.available ? 'AVAILABLE' : 'BUSY / PAUSED'}
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="profile-stats-grid-mono">
            {user.role === 'volunteer' ? (
              <>
                <div className="profile-stat-item-mono">
                  <span className="stat-value-mono">{user.tasksCompleted || 0}</span>
                  <span className="stat-label-mono">Tasks Done</span>
                </div>
                <div className="profile-stat-item-mono">
                  <span className="stat-value-mono">{user.criticalTasksCompleted || 0}</span>
                  <span className="stat-label-mono">Critical</span>
                </div>
                <div className="profile-stat-item-mono">
                  <span className="stat-value-mono">{user.responseRate || 0}%</span>
                  <span className="stat-label-mono">Response</span>
                </div>
                <div className="profile-stat-item-mono">
                  <span className="stat-value-mono">{user.streakCount || 0}</span>
                  <span className="stat-label-mono">Streak</span>
                </div>
                <div className="profile-stat-item-mono" style={{ gridColumn: '1 / -1' }}>
                  <span className="stat-value-mono">{Math.max(0, levelInfo.nextXPThreshold - (user.xp || 0))} XP</span>
                  <span className="stat-label-mono">To Next Level</span>
                </div>
              </>
            ) : (
              <>
                <div className="profile-stat-item-mono">
                  <span className="stat-value-mono">
                    {volunteers.filter(v => v.approvalStatus === 'approved').length}
                  </span>
                  <span className="stat-label-mono">Approved Crew</span>
                </div>
                <div className="profile-stat-item-mono">
                  <span className="stat-value-mono">
                    {volunteers.filter(v => v.approvalStatus === 'pending').length}
                  </span>
                  <span className="stat-label-mono">Pending Review</span>
                </div>
                <div className="profile-stat-item-mono">
                  <span className="stat-value-mono">{activeTasks.length}</span>
                  <span className="stat-label-mono">Active Duties</span>
                </div>
                <div className="profile-stat-item-mono">
                  <span className="stat-value-mono">
                    {taskHistory.filter(t => t.status === 'completed').length}
                  </span>
                  <span className="stat-label-mono">Resolved</span>
                </div>
              </>
            )}
          </div>

          {/* Skills (Volunteers) */}
          {user.role === 'volunteer' && (user.skills || []).length > 0 && (
            <div className="profile-skills-panel-mono">
              <h3>Registered Skills</h3>
              <div className="profile-skills-wrap">
                {user.skills.map(s => (
                  <span key={s} className="profile-skill-chip">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Achievements Cabinet, Recent Activity, and Rank Progression */}
        {user.role === 'organizer' ? (
          <div className="profile-right-column">
            {/* Quick Actions Panel */}
            <div className="profile-achievements-panel-mono aex" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3>Administrative Center</h3>
              <p className="skills-helper-mono">Orchestrate crew members, dispatches, and operational status.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate('/approvals')}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span>📝 Review Crew Credentials</span>
                  {volunteers.filter(v => v.approvalStatus === 'pending').length > 0 && (
                    <span className="nav-badge" style={{ margin: 0 }}>
                      {volunteers.filter(v => v.approvalStatus === 'pending').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/create-event')}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span>🗓️ Schedule New Event</span>
                </button>
                <button
                  onClick={() => navigate('/create-task')}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <span>Broadcast Crew Dispatch</span>
                </button>
              </div>
            </div>

            {/* System Operations Log */}
            <div className="profile-recent-activity-panel afu">
              <h3>System Operations Log</h3>
              <div className="recent-activity-list-mono">
                {recentActivities.map(act => (
                  <div key={act.id} className="recent-activity-item-mono">
                    <span className="activity-time-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="activity-msg-mono">{act.message}</p>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="empty-activities-mono">No recent activity logged.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="profile-right-column">
            {/* Achievements Cabinet */}
            <div className="profile-achievements-panel-mono aex">
              <h3>Achievements Cabinet</h3>
              <p className="skills-helper-mono">
                Complete tasks to unlock badges.{' '}
                {(user.achievements || []).length}/{ACHIEVEMENTS.length} unlocked.
              </p>
              <div className="achievements-grid-mono">
                {ACHIEVEMENTS.map(ach => {
                  const isUnlocked = (user.achievements || []).includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`achievement-badge-card-mono ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="ach-badge-icon-mono">{ach.icon}</div>
                      <h4>{ach.name}</h4>
                      <p>{ach.desc}</p>
                      {isUnlocked && <span className="ach-unlocked-tag">✓ UNLOCKED</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Panel */}
            <div className="profile-recent-activity-panel afu">
              <h3>Recent Activity</h3>
              <div className="recent-activity-list-mono">
                {recentActivities.map(act => (
                  <div key={act.id} className="recent-activity-item-mono">
                    <span className="activity-time-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="activity-msg-mono">{act.message}</p>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="empty-activities-mono">No recent activity logged.</p>
                )}
              </div>
            </div>

            {/* Rank Progression Panel */}
            <div className="profile-rank-progress-panel afu">
              <h3>Rank Progression</h3>
              <div className="rank-progress-list-mono">
                {milestones.map(m => {
                  const isReached = levelInfo.level >= m.lvl;
                  const isCurrent = levelInfo.level === m.lvl;
                  return (
                    <div key={m.lvl} className={`rank-progress-step-mono ${isReached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-indicator-mono">
                        {isCurrent ? '●' : isReached ? '✓' : '○'}
                      </div>
                      <div className="step-info-mono">
                        <span className="step-level-mono">Level {m.lvl} — {m.label}</span>
                        <span className="step-xp-mono">{m.xp} XP Required</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unified bottom Sign Out row */}
      <div className="profile-signout-bottom-row" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '20px' }}>
        <button
          onClick={handleLogout}
          className="btn btn-danger btn-lg"
          style={{ width: '100%', maxWidth: '320px', justifyContent: 'center', gap: '8px' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
