import { formatCountdown, pad } from '../utils/timeUtils';

/**
 * Full-screen countdown page shown before webinar starts.
 */
export default function CountdownPage({ title, secondsUntilStart }) {
  const { days, hours, minutes, seconds } = formatCountdown(secondsUntilStart);

  return (
    <div className="countdown-page" id="countdown-page">
      <div className="countdown-page__content">
        <div className="countdown-page__badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Starting Soon
        </div>

        <h1 className="countdown-page__title">
          {title || 'Webinar'}
        </h1>

        <p className="countdown-page__subtitle">
          The session will begin shortly. Please stay on this page.
        </p>

        <div className="countdown-timer" id="countdown-timer">
          {days > 0 && (
            <>
              <div className="countdown-timer__block">
                <div className="countdown-timer__value">{pad(days)}</div>
                <div className="countdown-timer__label">Days</div>
              </div>
              <div className="countdown-timer__separator">:</div>
            </>
          )}

          <div className="countdown-timer__block">
            <div className="countdown-timer__value">{pad(hours)}</div>
            <div className="countdown-timer__label">Hours</div>
          </div>

          <div className="countdown-timer__separator">:</div>

          <div className="countdown-timer__block">
            <div className="countdown-timer__value">{pad(minutes)}</div>
            <div className="countdown-timer__label">Minutes</div>
          </div>

          <div className="countdown-timer__separator">:</div>

          <div className="countdown-timer__block">
            <div className="countdown-timer__value">{pad(seconds)}</div>
            <div className="countdown-timer__label">Seconds</div>
          </div>
        </div>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-xs)',
          marginTop: 'var(--space-md)',
        }}>
          This page will automatically redirect when the session starts.
        </p>
      </div>
    </div>
  );
}
