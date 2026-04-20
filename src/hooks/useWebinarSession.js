import { useState, useEffect, useCallback } from 'react';
import { getWorkshopBySlug } from '../utils/storage';
import { getWebinarStatus, getElapsedSeconds, getSecondsUntilStart } from '../utils/timeUtils';

/**
 * Hook that manages a specific workshop session state —
 * determines if we're in countdown, live, or ended state for a given slug.
 */
export function useWebinarSession(slug) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [secondsUntilStart, setSecondsUntilStart] = useState(0);

  const refresh = useCallback(async () => {
    if (!slug) {
      setStatus('no-session');
      return;
    }
    
    const s = await getWorkshopBySlug(slug);
    if (!s) {
      setStatus('no-session');
      setSession(null);
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
  }, [slug]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Tick every second
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
