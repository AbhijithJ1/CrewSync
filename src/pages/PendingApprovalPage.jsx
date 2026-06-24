import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Clock, LogOut, ShieldCheck, UserCheck, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function PendingApprovalPage() {
  const { user, logout } = useApp();
  const [dots, setDots] = useState('');
  const [pulse, setPulse] = useState(false);
  const intervalRef = useRef(null);

  // Animated waiting dots
  useEffect(() => {
    let count = 0;
    intervalRef.current = setInterval(() => {
      count = (count + 1) % 4;
      setDots('.'.repeat(count));
    }, 600);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Pulse every 4s to show "checking"
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 800);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.approvalStatus === 'approved') return <Navigate to="/role-selection" replace />;
  if (user.approvalStatus === 'rejected') return <Navigate to="/access-denied" replace />;

  const roleLabel = user.roleRequest === 'organizer' ? 'Coordinator' : 'Volunteer';
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const steps = [
    { icon: CheckCircle2, label: 'Account Created', desc: 'Your profile was registered successfully.', done: true },
    { icon: UserCheck,    label: 'Verification Submitted', desc: `Role request: ${roleLabel} Access`, done: true },
    { icon: ShieldCheck,  label: 'Admin Review', desc: 'Coordinator is reviewing your credentials.', done: false, active: true },
    { icon: Lock,         label: 'Access Granted', desc: 'Full dashboard access will unlock.', done: false },
  ];

  return (
    <div className="pending-page-root">
      {/* Ambient orbs */}
      <div className="pending-orb pending-orb-1" />
      <div className="pending-orb pending-orb-2" />
      <div className="pending-orb pending-orb-3" />

      <div className="pending-card-shell afu">

        {/* ── Top Identity Strip ────────────────────────────── */}
        <div className="pending-identity-strip">
          <div className="pending-avatar-ring">
            <div className={`pending-avatar-inner ${pulse ? 'ping-once' : ''}`}>{initials}</div>
            <div className="pending-avatar-orbit" />
          </div>
          <div className="pending-identity-text">
            <h2>{user.name}</h2>
            <span className="pending-email">{user.email}</span>
            <div className="pending-role-chip">
              <Clock size={10} />
              <span>{roleLabel} Access — Pending Review</span>
            </div>
          </div>
        </div>

        {/* ── Status Banner ─────────────────────────────────── */}
        <div className="pending-status-banner">
          <div className="pending-live-dot" />
          <span className="pending-live-text">Monitoring approval status{dots}</span>
          <RefreshCw size={11} className={`pending-refresh-icon ${pulse ? 'spin-once' : ''}`} />
        </div>

        {/* ── Step Tracker ──────────────────────────────────── */}
        <div className="pending-steps-track">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`pending-step ${step.done ? 'step-done' : ''} ${step.active ? 'step-active' : ''}`}
              >
                <div className="step-icon-col">
                  <div className={`step-icon-circle ${step.done ? 'done-circle' : step.active ? 'active-circle' : 'idle-circle'}`}>
                    <Icon size={14} />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`step-connector ${step.done ? 'connector-done' : 'connector-idle'}`} />
                  )}
                </div>
                <div className="step-text-col">
                  <span className="step-label">{step.label}</span>
                  <span className="step-desc">{step.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Info Panel ────────────────────────────────────── */}
        <div className="pending-info-panel">
          <p className="pending-info-line">
            All new registrations go through a secure, coordinator-led verification process.
            Your profile is in the queue and will be reviewed shortly.
          </p>
          <p className="pending-info-hint">
            ⓘ Once approved, you'll be automatically redirected — no action needed.
          </p>
        </div>

        {/* ── Action Footer ─────────────────────────────────── */}
        <div className="pending-actions-footer">
          <button onClick={logout} className="pending-signout-btn">
            <LogOut size={14} />
            <span>Sign Out / Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
