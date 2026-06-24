import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function AccessDeniedPage() {
  const { user, logout } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.approvalStatus === 'approved') {
    return <Navigate to="/role-selection" replace />;
  }

  if (user.approvalStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  return (
    <div className="auth-page-container">
      <div className="auth-bg-ambient animate-pulse" style={{ opacity: 0.15 }} />
      <div className="auth-card denied-card afu">
        <div className="auth-card-header">
          <div className="denied-icon-glow">
            <ShieldAlert size={32} className="text-red" />
          </div>
          <h2>Request Rejected</h2>
          <p>Access Denied for <strong>{user.name}</strong></p>
        </div>

        <div className="pending-status-panel bg-red-glow">
          <p>
            Your request for <strong>{user.roleRequest === 'organizer' ? 'Organizer' : 'Volunteer'} Access</strong> has been rejected by an administrator.
          </p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            If you believe this decision is in error or wish to appeal the rejection, please coordinate directly with the event operations leads.
          </p>
        </div>

        <button 
          onClick={logout} 
          className="auth-submit-btn logout-action-btn"
          style={{ background: 'var(--bg-accent)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '10px' }}
        >
          <LogOut size={16} />
          <span>Sign Out / Switch Account</span>
        </button>
      </div>
    </div>
  );
}
