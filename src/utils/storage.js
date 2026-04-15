// localStorage helpers for webinar session management

const STORAGE_KEY = 'webinar_session';

export function saveSession(config) {
  try {
    const data = {
      ...config,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save session:', err);
    return false;
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read session:', err);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDefaultSession() {
  return {
    title: 'Master Digital Marketing in 2026',
    vimeoVideoId: '76979871',
    startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    durationMinutes: 60,
    ctaText: 'Enroll Now for ₹15,000',
    ctaTimeSeconds: 120,
    ctaLink: '#',
    chatMessages: [],
  };
}
