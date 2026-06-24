import { useNavigate } from 'react-router-dom';

export function EmptyState({
  icon = '📭',
  title = 'No items yet',
  description = 'There\'s nothing to display here.',
  actionLabel = null,
  actionPath = null,
  actionCallback = null,
  variant = 'default' // 'default' | 'compact'
}) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (actionCallback) {
      actionCallback();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`empty-state-container ${isCompact ? 'compact' : ''}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && (
        <button
          onClick={handleAction}
          className="btn btn-primary"
          style={{ marginTop: '12px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyDeployments() {
  return (
    <EmptyState
      icon="🚀"
      title="No Active Deployments"
      description="Tasks you dispatch will appear here. Create your first crew dispatch to get started."
      actionLabel="Create Task"
      actionPath="/create-task"
    />
  );
}

export function EmptyCompletedLogs() {
  return (
    <EmptyState
      icon="✓"
      title="No Completed Tasks Yet"
      description="Completed tasks will appear in your history. Accept tasks to start building your record."
    />
  );
}

export function EmptyApprovals() {
  return (
    <EmptyState
      icon="🔍"
      title="No Pending Approvals"
      description="All applications have been reviewed. Check back later for new volunteer submissions."
      variant="compact"
    />
  );
}

export function EmptyChat() {
  return (
    <EmptyState
      icon="💬"
      title="No Messages Yet"
      description="Start coordinating by sending a message to your crew."
      variant="compact"
    />
  );
}

export function EmptyLeaderboard() {
  return (
    <EmptyState
      icon="🏆"
      title="Leaderboard Coming Soon"
      description="Rankings will update as volunteers complete tasks and earn XP."
      variant="compact"
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon="🔔"
      title="All Caught Up"
      description="You have no new notifications. Great job staying on top of things!"
      variant="compact"
    />
  );
}

export function EmptyActiveTasks() {
  const navigate = useNavigate();
  return (
    <EmptyState
      icon="⚡"
      title="No Active Tasks"
      description="You're not currently assigned to any tasks. Check the feed to find volunteer opportunities."
      actionLabel="Browse Tasks"
      actionCallback={() => navigate('/dashboard?tab=feed')}
    />
  );
}
