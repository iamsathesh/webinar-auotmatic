/**
 * Format seconds into HH:MM:SS countdown display
 */
export function formatCountdown(totalSeconds) {
  if (totalSeconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return { days, hours, minutes, seconds };
}

/**
 * Pad a number with leading zero
 */
export function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Format seconds into a readable time like "7:18 PM"
 */
export function formatChatTime(videoSeconds) {
  const mins = Math.floor(videoSeconds / 60);
  const secs = Math.floor(videoSeconds % 60);
  return `${mins}:${pad(secs)}`;
}

/**
 * Calculate elapsed seconds since webinar start
 */
export function getElapsedSeconds(startTimeISO) {
  const startMs = new Date(startTimeISO).getTime();
  const nowMs = Date.now();
  return Math.max(0, Math.floor((nowMs - startMs) / 1000));
}

/**
 * Determine webinar status based on current time
 */
export function getWebinarStatus(startTimeISO, durationMinutes) {
  const startMs = new Date(startTimeISO).getTime();
  const endMs = startMs + durationMinutes * 60 * 1000;
  const nowMs = Date.now();

  if (nowMs < startMs) return 'countdown';
  if (nowMs >= endMs) return 'ended';
  return 'live';
}

/**
 * Get seconds remaining until start
 */
export function getSecondsUntilStart(startTimeISO) {
  const startMs = new Date(startTimeISO).getTime();
  return Math.max(0, Math.floor((startMs - Date.now()) / 1000));
}

/**
 * Generate a deterministic avatar color from a name
 */
export function getAvatarColor(name) {
  const colors = [
    '#e74c5e', '#4b7bec', '#26de81', '#a55eea',
    '#fd9644', '#45e6f5', '#f7b731', '#fc5c65',
    '#2bcbba', '#778ca3', '#eb3b5a', '#3867d6',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
