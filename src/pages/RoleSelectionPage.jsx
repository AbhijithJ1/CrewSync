import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Users, FolderKanban, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleSelectionPage() {
  const { user } = useApp();
  const navigate = useNavigate();

  const selectRole = (targetRole) => {
    if (targetRole === 'organizer' && user.role !== 'organizer') {
      toast.error("Access Denied. Organizer credentials required for this panel.", {
        icon: '🔒',
        style: {
          borderLeft: '3px solid var(--priority-critical-border)'
        }
      });
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="role-portal-container">
      <div className="role-portal-bg" />

      <div className="role-card-shell afu">
        <div className="role-shell-header">
          <div className="role-logo-badge">⚡</div>
          <h2>Select Work Portal</h2>
          <p>Logged in as <strong>{user.name}</strong> ({user.email})</p>
        </div>

        <div className="role-cards-grid">
          {/* Card 1: Organizer */}
          <div 
            onClick={() => selectRole('organizer')}
            className={`portal-card-tile ${user.role !== 'organizer' ? 'tile-restricted' : ''}`}
          >
            {user.role !== 'organizer' && (
              <span className="tile-restricted-badge">
                <ShieldAlert size={10} />
                Restricted
              </span>
            )}
            <div className="portal-icon-wrapper">
              <FolderKanban size={24} />
            </div>
            <h3>Organizer Console</h3>
            <p>
              Dispatch volunteer slots, coordinate staging locations, monitor active queues, and verify crew completions.
            </p>
            <div className="portal-tile-footer">
              <span>Launch Console</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 2: Volunteer */}
          <div 
            onClick={() => selectRole('volunteer')}
            className="portal-card-tile"
          >
            <div className="portal-icon-wrapper">
              <Users size={24} />
            </div>
            <h3>Volunteer Portal</h3>
            <p>
              Manage your availability, review real-time dispatch alerts, accept open slots, and submit proof notes.
            </p>
            <div className="portal-tile-footer">
              <span>Enter Portal</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>

        <div className="role-portal-footer">
          <button 
            onClick={() => {
              // Signout link
              localStorage.removeItem('crewsync-user');
              window.location.href = '/login';
            }} 
            className="role-logout-btn"
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
}
