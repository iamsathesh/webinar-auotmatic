import { useState, useEffect, useCallback } from 'react';
import { getSession } from '../utils/storage';
import { getWebinarStatus, getElapsedSeconds, getSecondsUntilStart } from '../utils/timeUtils';

/**
 * Hook that manages webinar session state —
 * determines if we're in countdown, live, or ended state.
 */
export function useWebinarSession() {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | countdown | live | ended | no-session
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [secondsUntilStart, setSecondsUntilStart] = useState(0);

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

  // Initial load
  useEffect(() => {
    refresh();
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
