import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  ArrowRight, Radio, Users, GitBranch, MessageSquare, Lock, Trophy,
  ShieldCheck, ListChecks, CheckCircle2, KeyRound
} from 'lucide-react';
import BrowserFrame from '../components/BrowserFrame';
import './landing.css';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

function CrewSyncLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 46" fill="none" aria-hidden="true">
      <path
        d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
        fill="currentColor"
      />
    </svg>
  );
}

const TICKER_ITEMS = [
  'Real-time task dispatch', 'Skill-based routing', 'Live slot tracking',
  'In-task coordination', 'XP & rank progression', 'Role-based access control',
  'Instant crew alerts', 'Volunteer accountability', 'Event operations board',
];

export default function LandingPage() {
  const navigate = useNavigate();

  /* Scroll-linked parallax on the hero preview card */
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const rawY = useTransform(heroScroll, [0, 1], [0, 60]);
  const previewY = useSpring(rawY, { stiffness: 60, damping: 18 });

  /* Scroll-linked text strip (parallax marquee layer) */
  const stripRef = useRef(null);
  const { scrollYProgress: stripScroll } = useScroll({
    target: stripRef,
    offset: ['start end', 'end start'],
  });
  const stripXLeft = useTransform(stripScroll, [0, 1], ['0%', '-25%']);
  const stripXRight = useTransform(stripScroll, [0, 1], ['-25%', '0%']);

  const features = [
    { icon: Radio,       title: 'Instant broadcasting',  desc: 'Organizers post a dispatch. Crew see it immediately and claim a slot in one tap — no scrolling through chat history.' },
    { icon: GitBranch,   title: 'Skill-based routing',   desc: 'Tag a task with the skills it needs. Volunteers only see the dispatches that match what they can actually do.' },
    { icon: Users,       title: 'Slot tracking',         desc: "Set exactly how many people a task needs. Once it's full, everyone else automatically joins a standby queue." },
    { icon: MessageSquare, title: 'In-task chat',        desc: 'Coordination happens inside the task card it belongs to, not in a group chat with three hundred unread messages.' },
    { icon: Lock,        title: 'Busy-state lock',       desc: 'Accepting a task pauses new dispatches to that volunteer, so no one is double-booked or overwhelmed mid-shift.' },
    { icon: Trophy,      title: 'XP & rank progression', desc: 'Completed tasks earn XP based on priority and streaks. Volunteers rank up from Rookie to Core Leader over the event.' },
  ];

  const steps = [
    { icon: KeyRound,    label: 'Sign up',           sub: 'Create a volunteer or organizer account' },
    { icon: ShieldCheck, label: 'Get approved',      sub: 'Organizer reviews and admits your profile' },
    { icon: ListChecks,  label: 'Browse dispatches', sub: 'See open tasks filtered to your skills' },
    { icon: MessageSquare, label: 'Coordinate',      sub: 'Chat and check in from inside the task' },
    { icon: CheckCircle2, label: 'Resolve & earn XP', sub: 'Mark it done, level up your rank' },
  ];

  return (
    <div className="ld-root">

      {/* ── NAV ── */}
      <header className="ld-nav">
        <div className="ld-brand" onClick={() => navigate('/')}>
          <span className="ld-brand-mark">
            <CrewSyncLogo size={16} />
          </span>
          <span>CrewSync</span>
        </div>
        <nav className="ld-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#progression">Progression</a>
        </nav>
        <div className="ld-nav-actions">
          <button className="ld-btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
          <button className="ld-btn-primary" onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="ld-hero" ref={heroRef}>
        <motion.div className="ld-hero-copy" initial="hidden" animate="show" variants={fadeUp}>
          <div className="ld-eyebrow">Event crew coordination</div>
          <h1 className="ld-h1">
            Run your event crew<br />without the WhatsApp chaos.
          </h1>
          <p className="ld-lead">
            CrewSync replaces buried group chats with a live task board built for
            hackathons, college fests, and volunteer-run events — dispatch tasks,
            track who's on what, and keep everyone accountable in real time.
          </p>
          <div className="ld-hero-actions">
            <button className="ld-btn-primary ld-btn-lg" onClick={() => navigate('/signup')}>
              Get started free <ArrowRight size={15} />
            </button>
            <button className="ld-btn-ghost ld-btn-lg" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
          <div className="ld-hero-stats">
            <div><strong>0s</strong><span>Dispatch delay</span></div>
            <div><strong>100%</strong><span>Task accountability</span></div>
            <div><strong>Live</strong><span>Status updates</span></div>
          </div>
        </motion.div>

        {/* Product preview — parallax on scroll */}
        <motion.div
          className="ld-preview"
          style={{ y: previewY }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ld-preview-bar">
            <div className="ld-preview-dot" />
            <span>Operations board</span>
            <span className="ld-preview-tag">Volunteer view</span>
          </div>
          <div className="ld-preview-body">
            <div className="ld-task-card ld-task-critical">
              <div className="ld-task-top">
                <span className="ld-task-id">TASK-408</span>
                <span className="ld-badge ld-badge-critical">Critical</span>
              </div>
              <h4>Main stage audio failure</h4>
              <p>Troubleshoot feed drop on speaker line B. Bring a spare XLR cable.</p>
              <div className="ld-task-bottom">
                <span>1 / 2 slots filled</span>
                <span>08:42 left</span>
              </div>
            </div>
            <div className="ld-task-card">
              <div className="ld-task-top">
                <span className="ld-task-id">TASK-402</span>
                <span className="ld-badge">Medium</span>
              </div>
              <h4>Registration desk rotation</h4>
              <p>Relieve the morning crew at the badge distribution counter.</p>
              <div className="ld-task-bottom">
                <span>0 / 1 slots filled</span>
                <span>22:15 left</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SCROLL TICKER ── */}
      <div className="ld-ticker">
        <div className="ld-ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ld-ticker-item">
              <span className="ld-ticker-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="ld-section" id="features">
        <motion.div
          className="ld-section-head"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
        >
          <div className="ld-eyebrow">Why teams switch</div>
          <h2 className="ld-h2">Everything a chat group can't do</h2>
          <p className="ld-sub">Built to replace the specific failure points of running a crew over WhatsApp.</p>
        </motion.div>

        <div className="ld-features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="ld-feature-card"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              transition={{ delay: i * 0.07 }}
            >
              <f.icon size={20} strokeWidth={1.75} />
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SCROLL-LINKED TEXT STRIP ── */}
      <div ref={stripRef} style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '24px 0', background: 'var(--c-950)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <motion.div
          style={{ x: stripXLeft, display: 'flex', alignItems: 'center', gap: '48px', paddingLeft: '48px' }}
        >
          {['Real-time', 'Accountable', 'Structured', 'Scalable', 'Transparent', 'Live', 'Efficient', 'Synchronized'].map((word, i) => (
            <span
              key={word}
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                fontWeight: 700,
                color: i % 2 === 0 ? 'var(--c-0)' : 'transparent',
                WebkitTextStroke: i % 2 !== 0 ? '1px var(--c-600)' : 'none',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.02em',
                flexShrink: 0,
                userSelect: 'none',
              }}
            >
              {word}
            </span>
          ))}
        </motion.div>
        
        <motion.div
          style={{ x: stripXRight, display: 'flex', alignItems: 'center', gap: '48px', paddingLeft: '48px' }}
        >
          {['No Chaos', 'Zero Delay', 'Skill Routing', 'Approved Staff', 'Live Board', 'XP Streak', 'Level Up', 'Elite Crew'].map((word, i) => (
            <span
              key={word}
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                fontWeight: 700,
                color: i % 2 !== 0 ? 'var(--c-0)' : 'transparent',
                WebkitTextStroke: i % 2 === 0 ? '1px var(--c-600)' : 'none',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.02em',
                flexShrink: 0,
                userSelect: 'none',
              }}
            >
              {word}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── PRODUCT SCREENSHOTS ── */}
      <section className="ld-section" id="screenshots">
        <motion.div
          className="ld-section-head"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
        >
          <div className="ld-eyebrow">Inside CrewSync</div>
          <h2 className="ld-h2">What your crew actually sees</h2>
          <p className="ld-sub">The live dashboard, task board, and chat view — not a mockup.</p>
        </motion.div>

        <div className="ld-screens-grid">
          <motion.div
            className="ld-screens-main"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
          >
            <BrowserFrame url="crewsync.app/dashboard" src="/screenshots/dashboard.png" alt="CrewSync dashboard" accent />
          </motion.div>
          <div className="ld-screens-side">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ delay: 0.1 }}>
              <BrowserFrame url="crewsync.app/messages" src="/screenshots/chat.png" alt="CrewSync messages" />
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ delay: 0.2 }}>
              <BrowserFrame url="crewsync.app/task" src="/screenshots/task.png" alt="CrewSync task detail" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ld-section-full" id="how-it-works">
        <div className="ld-section">
          <motion.div
            className="ld-section-head"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
          >
            <div className="ld-eyebrow">How it works</div>
            <h2 className="ld-h2">Five steps, start to finish</h2>
          </motion.div>

          <div className="ld-steps">
            {steps.map((s, i) => (
              <motion.div
                key={s.label}
                className="ld-step"
                initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
              >
                <div className="ld-step-icon"><s.icon size={17} strokeWidth={1.75} /></div>
                <div className="ld-step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="ld-step-label">{s.label}</div>
                <div className="ld-step-sub">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRESSION ── */}
      <section className="ld-section" id="progression">
        <motion.div
          className="ld-section-head"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
        >
          <div className="ld-eyebrow">Volunteer motivation</div>
          <h2 className="ld-h2">A reason to do the unglamorous tasks too</h2>
          <p className="ld-sub">Every completed task earns XP. XP builds rank. Rank is visible to the whole crew.</p>
        </motion.div>

        <div className="ld-gamif-grid">
          <motion.div className="ld-card" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <h3>Volunteer ranks</h3>
            <div className="ld-rank-list">
              {[
                ['L1', 'Rookie',    '0 XP'],
                ['L2', 'Helper',    '100 XP'],
                ['L3', 'Operator',  '250 XP'],
                ['L4', 'Specialist','500 XP'],
                ['L5', 'Elite Crew','900 XP'],
              ].map(([num, name, xp], i) => (
                <div className={`ld-rank-row${i === 2 ? ' ld-rank-current' : ''}`} key={num}>
                  <span>{num}</span>
                  <span>{name}</span>
                  <span>{xp}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="ld-card" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} transition={{ delay: 0.1 }}>
            <h3>XP per task</h3>
            <div className="ld-xp-list">
              {[
                ['Standard task completed',    '+10 XP'],
                ['High priority task',         '+20 XP'],
                ['Critical task completed',    '+40 XP'],
                ['First to accept a dispatch', '+15 XP'],
                ['Consecutive shift streak',   '+10 XP'],
              ].map(([task, xp]) => (
                <div className="ld-xp-row" key={task}>
                  <span>{task}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--c-0)', flexShrink: 0 }}>{xp}</span>
                </div>
              ))}
            </div>
            <div className="ld-progress-demo">
              <div className="ld-progress-top">
                <span>Alpha_Crew — Level 3</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>72%</span>
              </div>
              <div className="ld-progress-track">
                <div className="ld-progress-fill" style={{ width: '72%' }} />
              </div>
              <div className="ld-progress-bottom">
                <span>180 XP</span>
                <span>250 XP to Level 4</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.section
        className="ld-cta"
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
      >
        <h2>Set up your crew board in minutes</h2>
        <p>Free for organizers and volunteers. No credit card, no setup call.</p>
        <div className="ld-hero-actions" style={{ justifyContent: 'center' }}>
          <button className="ld-btn-primary ld-btn-lg" onClick={() => navigate('/signup')}>
            Get started free <ArrowRight size={15} />
          </button>
          <button className="ld-btn-ghost ld-btn-lg" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer className="ld-footer">
        <div className="ld-brand" style={{ cursor: 'default' }}>
          <span className="ld-brand-mark"><CrewSyncLogo size={14} /></span>
          <span style={{ color: 'var(--c-400)' }}>CrewSync</span>
        </div>
        <span>© 2026 CrewSync. All rights reserved.</span>
      </footer>

    </div>
  );
}
