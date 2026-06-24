import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Zap, ArrowRight, Check, Users, MessageSquare, Award, Lock, ShieldAlert, CheckSquare, BarChart, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [rotationOffset, setRotationOffset] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let animId;
    const tick = () => {
      setRotationOffset(prev => (prev + 0.12) % 360);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const orbitNodes = [
    { label: 'Dispatches', icon: '📡', desc: 'Real-time broadcast alerts and instant slot assignments', ring: 1, angle: 45 },
    { label: 'Crew Network', icon: '👥', desc: 'Unified operator dashboard and active volunteer directories', ring: 1, angle: 225 },
    { label: 'Task Routing', icon: '🔀', desc: 'Intelligent skill-based task sorting and queue routing', ring: 2, angle: 120 },
    { label: 'Live Communication', icon: '💬', desc: 'In-task communication threads and direct quick updates', ring: 2, angle: 300 },
    { label: 'Leaderboard', icon: '🏆', desc: 'Gamified event standings and engagement rankings', ring: 3, angle: 0 },
    { label: 'Progress System', icon: '📊', desc: 'Experience points (XP) metrics and level progressions', ring: 3, angle: 135 },
    { label: 'Approval Control', icon: '🔑', desc: 'Closed access authorization gates and role verification', ring: 3, angle: 270 }
  ];

  const getRadius = (ring) => {
    const isMobile = windowWidth < 600;
    const r1 = isMobile ? 65 : 90;
    const r2 = isMobile ? 105 : 150;
    const r3 = isMobile ? 147.5 : 210;
    if (ring === 1) return r1;
    if (ring === 2) return r2;
    return r3;
  };

  return (
    <div className="landing-root">
      <header className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-icon">⚡</div>
          <span>CrewSync</span>
        </div>
        <div className="landing-nav-actions">
          <button className="landing-nav-link" onClick={() => navigate('/login')}>Sign In</button>
          <button className="landing-nav-cta" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </header>

      {/* 1. HERO SECTION & ORBIT SYSTEM */}
      <section className="landing-hero">
        <div className="hero-eyebrow">OPERATIONAL PROTOCOL 01</div>
        <h1 className="hero-title">
          Sync Your Event Crew.<br />
          <span className="hero-title-accent">Real-Time. Task-First.</span>
        </h1>
        <p className="hero-subtitle">
          The task dispatch engine designed for hackathons, college fests, and event operations.
          Ditch buried WhatsApp messages for a structured, live coordination system.
        </p>

        {/* Orbit System */}
        <div className="orbit-system">
          {/* Core Center */}
          <div className="orbit-core">
            <span className="orbit-core-label">CORE</span>
            <span className="orbit-core-icon">{hoveredNode ? hoveredNode.icon : '⚡'}</span>
          </div>

          {/* Orbit Rings */}
          <div className="orbit-ring orbit-ring-1" />
          <div className="orbit-ring orbit-ring-2" />
          <div className="orbit-ring orbit-ring-3" />

          {/* SVG Connections */}
          <svg style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}>
            {orbitNodes.map((node, i) => {
              const angle = node.ring === 1
                ? (node.angle + rotationOffset) % 360
                : node.ring === 2
                ? (node.angle - rotationOffset + 360) % 360
                : (node.angle + rotationOffset * 0.5) % 360;
              const radius = getRadius(node.ring);
              const x = radius * Math.cos((angle * Math.PI) / 180);
              const y = radius * Math.sin((angle * Math.PI) / 180);
              return (
                <line
                  key={i}
                  x1={0}
                  y1={0}
                  x2={x}
                  y2={y}
                  className="orbit-signal-line"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Subsystem Nodes */}
          {orbitNodes.map((node, i) => {
            const angle = node.ring === 1
              ? (node.angle + rotationOffset) % 360
              : node.ring === 2
              ? (node.angle - rotationOffset + 360) % 360
              : (node.angle + rotationOffset * 0.5) % 360;
            const radius = getRadius(node.ring);
            const x = Math.round(radius * Math.cos((angle * Math.PI) / 180));
            const y = Math.round(radius * Math.sin((angle * Math.PI) / 180));
            const style = {
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
            };

            return (
              <div
                key={i}
                className="orbit-node-wrapper"
                style={style}
              >
                <div
                  className="orbit-node"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <span className="orbit-node-icon">{node.icon}</span>
                  <span className="orbit-node-label">{node.label.split(' ')[0]}</span>
                  <div className="orbit-node-tooltip">{node.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HUD Subsystem Info Bar */}
        <div style={{ minHeight: '60px', width: '100%', maxWidth: '400px', margin: '-20px auto 40px auto' }}>
          {hoveredNode ? (
            <div className="afu" style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', fontWeight: 700, color: 'var(--c-300)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Subsystem Connected</div>
              <h4 style={{ fontFamily: 'Sora', fontSize: '13px', fontWeight: 700, color: 'var(--c-0)' }}>{hoveredNode.label}</h4>
              <p style={{ fontSize: '11px', color: 'var(--c-400)', marginTop: '2px' }}>{hoveredNode.desc}</p>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--c-500)', fontFamily: 'JetBrains Mono', letterSpacing: '0.5px' }}>
              [ hover nodes to query subsystem status ]
            </div>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="hero-cta-row">
          <button className="hero-cta-primary" onClick={() => navigate('/login')}>
            <span>Launch Dashboard</span>
            <ArrowRight size={16} />
          </button>
          <button className="hero-cta-secondary" onClick={() => navigate('/signup')}>
            Join Event Crew
          </button>
        </div>

        {/* Hero Stats */}
        <div className="hero-stat-row">
          <div className="hero-stat">
            <div className="hero-stat-num">0s</div>
            <div className="hero-stat-lbl">Dispatch Delay</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }} />
          <div className="hero-stat">
            <div className="hero-stat-num">100%</div>
            <div className="hero-stat-lbl">Accountability</div>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }} />
          <div className="hero-stat">
            <div className="hero-stat-num">Live</div>
            <div className="hero-stat-lbl">Status Feeds</div>
          </div>
        </div>
      </section>

      {/* 2. SYSTEM PREVIEW */}
      <section className="landing-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="landing-section-label">Operations Console</div>
        <h2 className="landing-section-title">Dynamic Control Grid</h2>
        <p className="landing-section-sub">Experience a structured coordination terminal engineered to replace chaotic messaging groups.</p>
        
        <div className="card" style={{ padding: '24px', textAlign: 'left', background: 'var(--c-900)', border: '1px solid rgba(255,255,255,0.06)', width: '100%', maxWidth: '800px', margin: '40px auto 0 auto', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '13px' }}>Operations Control Board</span>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--c-400)' }}>VOLUNTEER VIEW</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Active task representation */}
            <div style={{ background: 'var(--c-950)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', borderLeft: '3px solid #fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--c-500)' }}>TASK-408</span>
                <span className="badge badge-white">CRITICAL</span>
              </div>
              <h4 style={{ fontFamily: 'Sora', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>[!!!] Main Stage Audio Failure</h4>
              <p style={{ fontSize: '11px', color: 'var(--c-400)', lineHeight: '1.4', marginBottom: '10px' }}>Troubleshoot feed drop on speaker line B. Bring spare XLR cable.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--c-500)' }}>Slots: 1 / 2 Filled</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#fff' }}>08:42 Left</span>
              </div>
            </div>

            {/* Normal priority task */}
            <div style={{ background: 'var(--c-950)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', borderLeft: '1px solid rgba(255,255,255,0.2)', opacity: 0.85 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--c-500)' }}>TASK-402</span>
                <span className="badge badge-default">MEDIUM</span>
              </div>
              <h4 style={{ fontFamily: 'Sora', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>[!] Registration Desk Rotation</h4>
              <p style={{ fontSize: '11px', color: 'var(--c-400)', lineHeight: '1.4', marginBottom: '10px' }}>Relieve morning crew at the badge distribution counter.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--c-500)' }}>Slots: 0 / 1 Filled</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--c-300)' }}>22:15 Left</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID (6 CARDS) */}
      <section className="landing-section">
        <div className="landing-section-label">System Architecture</div>
        <h2 className="landing-section-title">Core Operations Engine</h2>
        <p className="landing-section-sub">Engineered features that replace messaging group weaknesses with structured coordination logic.</p>

        <div className="features-grid">
          {[
            { icon: '📡', title: 'Instant Broadcasting', desc: 'Organizers issue operational dispatches. Crew members receive clean alerts and accept slots instantly.' },
            { icon: '🔀', title: 'Skill Routing', desc: 'Configure required tags for tasks. Filter dispatches automatically to match volunteer expertise.' },
            { icon: '👥', title: 'Slot Tracking Control', desc: 'Set precise volunteer numbers. Once full, allow others to express interest as a backup queue.' },
            { icon: '💬', title: 'In-Task Live Chat', desc: 'Task-specific communication feeds. Keep coordination notes buried inside the card, not the main inbox.' },
            { icon: '🔒', title: 'Busy Lock Prevention', desc: 'Volunteers are locked into a busy state upon accepting a task, pausing incoming dispatches to prevent distraction.' },
            { icon: '🏆', title: 'Level & XP Progression', desc: 'Award XP on task resolution based on priority and streaks. Unlock ranks from Rookie to Core Leader.' }
          ].map((f, index) => (
            <div
              key={index}
              className="feature-card afu"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className="feature-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WORKFLOW TIMELINE (7 STEPS) */}
      <section className="landing-section-full">
        <div className="landing-section">
          <div className="landing-section-label">Operations Flow</div>
          <h2 className="landing-section-title">System Timeline</h2>
          <p className="landing-section-sub">How CrewSync operates from initial sign up to task dispatch and completion.</p>

          <div className="workflow-timeline">
            <div className="timeline-step">
              <div className="timeline-node">🔑</div>
              <div className="timeline-step-label">1. Sign Up</div>
              <div className="timeline-step-sub">Register account</div>
            </div>

            <div className="timeline-step">
              <div className="timeline-node">🛡️</div>
              <div className="timeline-step-label">2. Gate check</div>
              <div className="timeline-step-sub">Admin review</div>
            </div>

            <div className="timeline-step">
              <div className="timeline-node">📡</div>
              <div className="timeline-step-label">3. Browse Feed</div>
              <div className="timeline-step-sub">Inspect active dispatches</div>
            </div>

            <div className="timeline-step">
              <div className="timeline-node">📥</div>
              <div className="timeline-step-label">4. Accept Slot</div>
              <div className="timeline-step-sub">Locks user state</div>
            </div>

            <div className="timeline-step">
              <div className="timeline-node">💬</div>
              <div className="timeline-step-label">5. Sync Chat</div>
              <div className="timeline-step-sub">Coordination updates</div>
            </div>

            <div className="timeline-step">
              <div className="timeline-node">✓</div>
              <div className="timeline-step-label">6. Resolve</div>
              <div className="timeline-step-sub">Submit notes</div>
            </div>

            <div className="timeline-step">
              <div className="timeline-node">🏆</div>
              <div className="timeline-step-label">7. Claim XP</div>
              <div className="timeline-step-sub">Level progression</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GAMIFICATION SHOWCASE */}
      <section className="landing-section">
        <div className="landing-section-label">Volunteer Motivation</div>
        <h2 className="landing-section-title">Progression Cabinet</h2>
        <p className="landing-section-sub">Keep volunteers engaged with a structured level progression hierarchy and clear reward weights.</p>

        <div className="gamif-grid">
          {/* Ranks showcase */}
          <div className="gamif-card">
            <h3>Operational Ranks</h3>
            <div className="rank-levels-list">
              <div className="rank-level-item">
                <span className="rank-level-num">L1</span>
                <span className="rank-level-name">Rookie</span>
                <span className="rank-level-xp">0 XP</span>
              </div>
              <div className="rank-level-item">
                <span className="rank-level-num">L2</span>
                <span className="rank-level-name">Helper</span>
                <span className="rank-level-xp">100 XP</span>
              </div>
              <div className="rank-level-item" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)' }}>
                <span className="rank-level-num" style={{ color: '#fff' }}>L3</span>
                <span className="rank-level-name" style={{ color: '#fff' }}>Operator</span>
                <span className="rank-level-xp">250 XP</span>
              </div>
              <div className="rank-level-item">
                <span className="rank-level-num">L4</span>
                <span className="rank-level-name">Specialist</span>
                <span className="rank-level-xp">500 XP</span>
              </div>
              <div className="rank-level-item">
                <span className="rank-level-num">L5</span>
                <span className="rank-level-name">Elite Crew</span>
                <span className="rank-level-xp">900 XP</span>
              </div>
            </div>
          </div>

          {/* XP Rewards list */}
          <div className="gamif-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3>XP Reward Matrix</h3>
              <div className="xp-reward-list">
                <div className="xp-reward-item">
                  <span className="xp-reward-task">Normal Task Completed</span>
                  <span className="xp-reward-pts">+10 XP</span>
                </div>
                <div className="xp-reward-item">
                  <span className="xp-reward-task">High Priority Task Completed</span>
                  <span className="xp-reward-pts">+20 XP</span>
                </div>
                <div className="xp-reward-item">
                  <span className="xp-reward-task">Critical Status Task Completed</span>
                  <span className="xp-reward-pts">+40 XP</span>
                </div>
                <div className="xp-reward-item">
                  <span className="xp-reward-task">First Responder Acceptance Bonus</span>
                  <span className="xp-reward-pts">+15 XP</span>
                </div>
                <div className="xp-reward-item">
                  <span className="xp-reward-task">Consecutive Coordination Streak</span>
                  <span className="xp-reward-pts">+10 XP</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '24px', background: 'var(--c-950)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600 }}>Active Volunteer: Alpha_Crew</span>
                <span style={{ color: 'var(--c-400)', fontFamily: 'JetBrains Mono' }}>LVL 3</span>
              </div>
              <div className="progress-bar" style={{ height: '6px', marginBottom: '6px' }}>
                <div className="progress-bar-fill" style={{ width: '72%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--c-500)', fontFamily: 'JetBrains Mono' }}>
                <span>180 XP</span>
                <span>250 XP TO L4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (CTA) SECTION */}
      <section className="landing-section-full" style={{ background: 'var(--c-950)' }}>
        <div className="landing-cta-section">
          <h2>Deploy CrewSync For Your Event</h2>
          <p>Ditch the whatsapp clutter. Put task accountability first. Streamline communications, level up volunteer motivation, and maintain absolute operations visibility.</p>
          <div className="hero-cta-row">
            <button className="hero-cta-primary" onClick={() => navigate('/login')}>
              <span>Enter Control Hub</span>
              <ArrowRight size={16} />
            </button>
            <button className="hero-cta-secondary" onClick={() => navigate('/signup')}>
              Sign Up Volunteer Account
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <span>⚡ CrewSync Event OS</span>
        </div>
        <div className="landing-footer-copy">
          © 2026 CrewSync. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
