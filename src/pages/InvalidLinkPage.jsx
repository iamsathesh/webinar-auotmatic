/**
 * Branded error page for invalid or incomplete workshop URLs.
 * Never exposes admin routes or navigation hints.
 */
export default function InvalidLinkPage() {
  return (
    <div className="status-screen">
      <div className="invalid-link-card">
        <div className="invalid-link-card__icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--accent-red)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1>Invalid Link</h1>
        <p>
          The link you followed is invalid or incomplete.
          <br />
          Please check with the person who shared this link with you.
        </p>
        <div className="invalid-link-card__footer">
          © {new Date().getFullYear()} Expertisor Academy
        </div>
      </div>
    </div>
  );
}
