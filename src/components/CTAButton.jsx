/**
 * CTA button that appears after a specific video timestamp.
 * Shows animated call-to-action overlay.
 */
export default function CTAButton({ visible, text, link }) {
  if (!visible) return null;

  return (
    <div className="cta-container" id="cta-container">
      <a
        href={link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="cta-button"
        id="cta-button"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            fill="currentColor"
          />
        </svg>
        {text || 'Enroll Now'}
      </a>
    </div>
  );
}
