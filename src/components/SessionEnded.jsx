/**
 * Session ended page shown after the webinar duration has passed.
 */
export default function SessionEnded({ title }) {
  return (
    <div className="session-ended" id="session-ended">
      <div className="session-ended__icon">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 10l3 3 7-7" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 className="session-ended__title">
        Session Has Ended
      </h1>

      <p className="session-ended__text">
        The webinar <strong>"{title || 'Webinar'}"</strong> has concluded. 
        Thank you for your interest. Stay tuned for future sessions!
      </p>

      <div style={{ marginTop: 'var(--space-2xl)', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
        &copy; 2026 Expertisor Academy. All rights reserved.
      </div>
    </div>
  );
}
