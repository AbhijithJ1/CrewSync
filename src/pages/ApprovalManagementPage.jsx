import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Check, X, Lock, Users, ShieldCheck, Search, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApprovalManagementPage() {
  const { user, volunteers, approveUser, rejectUser } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('volunteers');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin = hardcoded admin@crewsync.com (or any approved organizer can approve volunteers)
  const isAdmin = user?.email === 'admin@crewsync.com';

  // Separate pending lists by roleRequest
  const pendingVolunteers = volunteers.filter(
    v => v.approvalStatus === 'pending' && v.roleRequest === 'volunteer'
  );
  const pendingOrganizers = volunteers.filter(
    v => v.approvalStatus === 'pending' && v.roleRequest === 'organizer'
  );
  // All-time stats
  const approvedCount = volunteers.filter(v => v.approvalStatus === 'approved').length;
  const rejectedCount = volunteers.filter(v => v.approvalStatus === 'rejected').length;

  const filteredVolunteers = pendingVolunteers.filter(
    v =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrganizers = pendingOrganizers.filter(
    o =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = targetUser => {
    if (targetUser.roleRequest === 'organizer' && !isAdmin) {
      toast.error('Admin credentials required to approve organizers.');
      return;
    }
    approveUser(targetUser.id);
    toast.success(`✓ Approved ${targetUser.name} as ${targetUser.roleRequest.toUpperCase()}`);
  };

  const handleReject = targetUser => {
    if (targetUser.roleRequest === 'organizer' && !isAdmin) {
      toast.error('Admin credentials required to reject organizer requests.');
      return;
    }
    rejectUser(targetUser.id);
    toast.success(`Rejected request for ${targetUser.name}`);
  };

  const RequestCard = ({ person, isOrgRequest = false }) => (
    <div className="approval-request-card aex">
      <header className="req-card-header">
        <div className="req-avatar-mono">
          {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div className="req-header-info">
          <h4>{person.name}</h4>
          <span className="req-status-pill pending">PENDING</span>
        </div>
      </header>
      
      <div className="req-card-body">
        <div className="req-detail-row">
          <span className="req-label">Email:</span>
          <span className="req-value">{person.email}</span>
        </div>
        <div className="req-detail-row">
          <span className="req-label">Requested Role:</span>
          <span className="req-value badge-role-req">
            {isOrgRequest ? 'Coordinator / Organizer' : 'Volunteer'}
          </span>
        </div>
        {person.skills && person.skills.length > 0 && (
          <div className="req-skills-section">
            <span className="req-label">Skills:</span>
            <div className="req-skills-row-mono">
              {person.skills.map(s => (
                <span key={s} className="req-skill-pill-mono">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="req-card-footer">
        <div className="req-meta-row">
          <Clock size={11} />
          <span className="req-timestamp">
            Requested {
              person.id
                ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Recently'
            }
          </span>
        </div>
        <div className="req-actions">
          <button
            onClick={() => handleReject(person)}
            className="action-btn-danger reject-btn-mono"
            title="Reject Request"
          >
            <X size={14} />
            <span>Reject</span>
          </button>
          <button
            onClick={() => handleApprove(person)}
            className="action-btn-success approve-btn-mono"
            title="Approve Access"
          >
            <Check size={14} />
            <span>Approve</span>
          </button>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="approvals-page-container afu">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="approvals-header-mono">
        <div className="approvals-title-group-mono">
          <h2>Access Approvals</h2>
          <span className="privilege-label-mono">
            {isAdmin ? 'ADMIN AUTH' : 'COORDINATOR MODE'}
          </span>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────── */}
      <div className="approvals-summary-row">
        <div className="approval-summary-chip pending-chip">
          <span className="chip-num">{pendingVolunteers.length + pendingOrganizers.length}</span>
          <span className="chip-lbl">Pending</span>
        </div>
        <div className="approval-summary-chip approved-chip">
          <span className="chip-num">{approvedCount}</span>
          <span className="chip-lbl">Approved</span>
        </div>
        <div className="approval-summary-chip rejected-chip">
          <span className="chip-num">{rejectedCount}</span>
          <span className="chip-lbl">Rejected</span>
        </div>
      </div>

      {/* ── Search Bar ───────────────────────────────────────── */}
      <div className="search-bar-container-mono">
        <Search size={14} className="search-icon-mono" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input-mono"
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Sub-tabs ─────────────────────────────────────────── */}
      <div className="approvals-tabs-row-mono">
        <button
          onClick={() => { setActiveTab('volunteers'); setSearchQuery(''); }}
          className={`approvals-tab-btn-mono ${activeTab === 'volunteers' ? 'active' : ''}`}
        >
          <Users size={13} />
          <span>Volunteers</span>
          {pendingVolunteers.length > 0 && (
            <span className="count-pill-mono">{pendingVolunteers.length}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('organizers'); setSearchQuery(''); }}
          className={`approvals-tab-btn-mono ${activeTab === 'organizers' ? 'active' : ''}`}
        >
          {isAdmin ? <ShieldCheck size={13} /> : <Lock size={13} />}
          <span>Organizers</span>
          {pendingOrganizers.length > 0 && (
            <span className="count-pill-mono">{pendingOrganizers.length}</span>
          )}
        </button>
      </div>

      {/* ── Request Listings ─────────────────────────────────── */}
      <div className="approvals-list-mono">
        {activeTab === 'volunteers' ? (
          filteredVolunteers.length > 0 ? (
            filteredVolunteers.map(vol => (
              <RequestCard key={vol.id} person={vol} />
            ))
          ) : (
            <div className="empty-queue-panel-mono">
              <Users size={28} />
              <h3>
                {searchQuery ? 'No results found' : 'Volunteer queue is clear'}
              </h3>
              <p>
                {searchQuery
                  ? `No pending volunteers match "${searchQuery}".`
                  : 'All volunteer requests have been processed.'}
              </p>
            </div>
          )
        ) : (
          /* ── Organizers Tab ────────────────────────────────── */
          !isAdmin ? (
            <div className="lockout-panel-mono aex">
              <Lock size={36} />
              <h3>Admin Authorization Required</h3>
              <p>
                Organizer registrations are restricted to the System Administrator.
                Your coordinator credentials cannot modify these requests.
              </p>
            </div>
          ) : filteredOrganizers.length > 0 ? (
            filteredOrganizers.map(org => (
              <RequestCard key={org.id} person={org} isOrgRequest />
            ))
          ) : (
            <div className="empty-queue-panel-mono">
              <ShieldCheck size={28} />
              <h3>
                {searchQuery ? 'No results found' : 'Organizer queue is clear'}
              </h3>
              <p>
                {searchQuery
                  ? `No pending organizers match "${searchQuery}".`
                  : 'All organizer requests have been processed.'}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
