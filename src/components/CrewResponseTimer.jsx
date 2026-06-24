import { useState, useEffect } from 'react';

/**
 * CrewResponseTimer
 * A self-contained countdown component for crew network volunteer cards.
 * Manages its own interval — safe to render inside .map() loops.
 *
 * Props:
 *   expiresAt  {number}  Unix ms timestamp when the task expires
 *              = new Date(task.createdAt).getTime() + task.durationLimit * 1000
 *
 * Renders nothing once the timer hits 0 (caller handles disappearance naturally).
 */
export default function CrewResponseTimer({ expiresAt }) {
  const getSecondsLeft = () => Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const interval = setInterval(() => {
      const s = getSecondsLeft();
      setSecondsLeft(s);
      if (s <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  if (secondsLeft <= 0) return null;

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const ss = (secondsLeft % 60).toString().padStart(2, '0');
  const isUrgent = secondsLeft <= 60;

  return (
    <div className={`response-timer-badge ${isUrgent ? 'timer-urgent' : ''}`}>
      <span className="timer-label">Respond in:</span>
      <span className="timer-value">{mm}:{ss}</span>
    </div>
  );
}
