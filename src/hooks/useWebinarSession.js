import { useState, useEffect, useCallback } from 'react';
import { getSession } from '../utils/storage';
import { getWebinarStatus, getElapsedSeconds, getSecondsUntilStart } from '../utils/timeUtils';

/**
 * Hook that manages webinar session state —
 * determines if we're in countdown, live, or ended state.
 */
export function useWebinarSession() {
  const [session, setSession] = useState(() => getSession());

  const [status, setStatus] = useState(() => {
    const s = getSession();
    if (!s) return 'no-session';
    return getWebinarStatus(s.startTime, s.durationMinutes);
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    const s = getSession();
    if (!s) return 0;
    return getWebinarStatus(s.startTime, s.durationMinutes) === 'live' ? getElapsedSeconds(s.startTime) : 0;
  });

  const [secondsUntilStart, setSecondsUntilStart] = useState(() => {
    const s = getSession();
    if (!s) return 0;
    return getWebinarStatus(s.startTime, s.durationMinutes) === 'countdown' ? getSecondsUntilStart(s.startTime) : 0;
  });

  const refresh = useCallback(() => {
    const s = getSession();
    if (!s) {
      setStatus('no-session');
      return;
    }
    setSession(s);

    const newStatus = getWebinarStatus(s.startTime, s.durationMinutes);
    setStatus(newStatus);

    if (newStatus === 'live') {
      setElapsedSeconds(getElapsedSeconds(s.startTime));
    } else if (newStatus === 'countdown') {
      setSecondsUntilStart(getSecondsUntilStart(s.startTime));
    }
  }, []);

  // Initial load sync is now handled by useState initializers.
  // We keep useEffect for external updates if needed, but remove the synchronous refresh call.
  useEffect(() => {
    // Session could have changed in localStorage from another tab
    const handleStorage = () => refresh();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refresh]);

  // Tick every second for countdown or live updates
  useEffect(() => {
    if (status === 'loading' || status === 'no-session' || status === 'ended') return;

    const interval = setInterval(() => {
      if (!session) return;

      const newStatus = getWebinarStatus(session.startTime, session.durationMinutes);

      if (newStatus !== status) {
        setStatus(newStatus);
      }

      if (newStatus === 'countdown') {
        setSecondsUntilStart(getSecondsUntilStart(session.startTime));
      } else if (newStatus === 'live') {
        setElapsedSeconds(getElapsedSeconds(session.startTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, session]);

  return { session, status, elapsedSeconds, secondsUntilStart, refresh };
}
