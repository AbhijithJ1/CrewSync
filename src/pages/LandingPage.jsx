import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Radio, Users, GitBranch, MessageSquare, Lock, Trophy,
  ShieldCheck, ListChecks, CheckCircle2, KeyRound
} from 'lucide-react';
import BrowserFrame from '../components/BrowserFrame';
import './landing.css';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Radio, title: 'Instant broadcasting', desc: 'Organizers post a dispatch. Crew see it immediately and claim a slot in one tap — no scrolling through chat history.' },
    { icon: GitBranch, title: 'Skill-based routing', desc: 'Tag a task with the skills it needs. Volunteers only see the dispatches that match what they can actually do.' },
    { icon: Users, title: 'Slot tracking', desc: 'Set exactly how many people a task needs. Once it’s full, everyone else automatically joins a standby queue.' },
    { icon: MessageSquare, title: 'In-task chat', desc: 'Coordination happens inside the task card it belongs to, not in a group chat with three hundred unread messages.' },
    { icon: Lock, title: 'Busy-state lock', desc: 'Accepting a task pauses new dispatches to that volunteer, so no one is double-booked or overwhelmed mid-shift.' },
    { icon: Trophy, title: 'XP & rank progression', desc: 'Completed tasks earn XP based on priority and streaks. Volunteers rank up from Rookie to Core Leader over the event.' },
  ];

  const steps = [
    { icon: KeyRound, label: 'Sign up', sub: 'Create a volunteer or organizer account' },
    { icon: ShieldCheck, label: 'Get approved', sub: 'Organizer reviews and admits your profile' },
    { icon: ListChecks, label: 'Browse dispatches', sub: 'See open tasks filtered to your skills' },
    { icon: MessageSquare, label: 'Coordinate', sub: 'Chat and check in from inside the task' },
    { icon: CheckCircle2, label: 'Resolve & earn XP', sub: 'Mark it done, level up your rank' },
  ];

  return (
    <div className="ld-root">
      <header className="ld-nav">
        <div className="ld-brand" onClick={() => navigate('/')}>
          <span className="ld-brand-mark">CS</span>
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

      {/* HERO */}
      <section className="ld-hero">
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
              Get started free <ArrowRight size={16} />
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

        {/* Product preview mock — this is the actual UI, not decoration */}
        <motion.div
          className="ld-preview"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
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

      {/* FEATURES */}
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
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
              transition={{ delay: i * 0.06 }}
            >
              <f.icon size={20} strokeWidth={1.75} />
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRODUCT SCREENSHOTS */}
      <section className="ld-section" id="screenshots">
        <motion.div
          className="ld-section-head"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}
        >
          <div className="ld-eyebrow">Inside CrewSync</div>
          <h2 className="ld-h2">What your crew actually sees</h2>
          <p className="ld-sub">No mockups — this is the live dashboard, chat, and task board.</p>
        </motion.div>

        <div className="ld-screens-grid">
          <motion.div
            className="ld-screens-main"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
          >
            <BrowserFrame url="crewsync.app/dashboard" src="/screenshots/dashboard.png" accent />
          </motion.div>
          <div className="ld-screens-side">
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} transition={{ delay: 0.08 }}
            >
              <BrowserFrame url="crewsync.app/chat" src="/screenshots/chat.png" />
            </motion.div>
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} transition={{ delay: 0.16 }}
            >
              <BrowserFrame url="crewsync.app/task/details" src="/screenshots/task.png" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
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
                initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
              >
                <div className="ld-step-icon"><s.icon size={18} strokeWidth={1.75} /></div>
                <div className="ld-step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="ld-step-label">{s.label}</div>
                <div className="ld-step-sub">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRESSION */}
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
          <div className="ld-card">
            <h3>Ranks</h3>
            <div className="ld-rank-list">
              {[
                ['L1', 'Rookie', '0 XP'],
                ['L2', 'Helper', '100 XP'],
                ['L3', 'Operator', '250 XP'],
                ['L4', 'Specialist', '500 XP'],
                ['L5', 'Elite Crew', '900 XP'],
              ].map(([num, name, xp], i) => (
                <div className={`ld-rank-row${i === 2 ? ' ld-rank-current' : ''}`} key={num}>
                  <span>{num}</span>
                  <span>{name}</span>
                  <span>{xp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ld-card">
            <h3>XP per task</h3>
            <div className="ld-xp-list">
              {[
                ['Normal task completed', '+10 XP'],
                ['High priority task completed', '+20 XP'],
                ['Critical task completed', '+40 XP'],
                ['First to accept a dispatch', '+15 XP'],
                ['Consecutive shift streak', '+10 XP'],
              ].map(([task, xp]) => (
                <div className="ld-xp-row" key={task}>
                  <span>{task}</span>
                  <span>{xp}</span>
                </div>
              ))}
            </div>
            <div className="ld-progress-demo">
              <div className="ld-progress-top">
                <span>Alpha_Crew</span>
                <span>Level 3</span>
              </div>
              <div className="ld-progress-track">
                <div className="ld-progress-fill" style={{ width: '72%' }} />
              </div>
              <div className="ld-progress-bottom">
                <span>180 XP</span>
                <span>250 XP to Level 4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ld-cta">
        <h2>Set up your crew board in a few minutes</h2>
        <p>Free for organizers and volunteers. No credit card, no setup call.</p>
        <div className="ld-hero-actions" style={{ justifyContent: 'center' }}>
          <button className="ld-btn-primary ld-btn-lg" onClick={() => navigate('/signup')}>
            Get started free <ArrowRight size={16} />
          </button>
          <button className="ld-btn-ghost ld-btn-lg" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
      </section>

      <footer className="ld-footer">
        <span className="ld-brand"><span className="ld-brand-mark">CS</span>CrewSync</span>
        <span>© 2026 CrewSync. All rights reserved.</span>
      </footer>
    </div>
  );
}
