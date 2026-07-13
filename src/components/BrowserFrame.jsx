import './BrowserFrame.css';

/**
 * BrowserFrame — wraps a screenshot in a minimal browser chrome
 * (dot controls + url bar) so raw screenshots look intentional
 * instead of pasted-in. Drop this in src/components/.
 *
 * Usage:
 *   <BrowserFrame url="crewsync.app/dashboard" src="/screenshots/dashboard.png" alt="Dashboard" />
 */
export default function BrowserFrame({ url = 'crewsync.app', src, alt = '', accent = false }) {
  return (
    <div className={`bf-frame${accent ? ' bf-accent' : ''}`}>
      <div className="bf-bar">
        <div className="bf-dots">
          <span /><span /><span />
        </div>
        <div className="bf-url">{url}</div>
      </div>
      <div className="bf-body">
        {src ? (
          <img src={src} alt={alt} loading="lazy" />
        ) : (
          <div className="bf-placeholder">
            <span>Drop screenshot here</span>
          </div>
        )}
      </div>
    </div>
  );
}
