import { useState, useCallback } from 'react';
import { useWebinarSession } from '../hooks/useWebinarSession';
import { useFakeChat } from '../hooks/useFakeChat';
import TopBar from '../components/TopBar';
import VideoPlayer from '../components/VideoPlayer';
import ChatPanel from '../components/ChatPanel';
import CTAButton from '../components/CTAButton';
import CountdownPage from '../components/CountdownPage';
import SessionEnded from '../components/SessionEnded';

/**
 * Main webinar viewing page.
 * Orchestrates video, chat, CTA, and session state.
 */
export default function WebinarPage() {
  const { session, status, elapsedSeconds, secondsUntilStart } = useWebinarSession();
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  const handleTimeUpdate = useCallback((seconds) => {
    if (seconds === -1) {
      // Video ended naturally
      return;
    }
    setCurrentVideoTime(seconds);
  }, []);

  const { messages, hasNewMessage, addUserMessage } = useFakeChat(
    session?.chatMessages || [],
    currentVideoTime
  );

  // Loading state
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  // No session configured
  if (status === 'no-session') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M23 7l-7 5 7 5V7z" stroke="var(--text-muted)" strokeWidth="2" fill="none"/>
            <rect x="1" y="5" width="15" height="14" rx="2" stroke="var(--text-muted)" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.4rem', marginBottom: 8 }}>
          No Webinar Scheduled
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Set up a webinar session from the admin panel to get started.
        </p>
        <a href="/admin" className="btn btn--primary">
          Go to Admin Panel →
        </a>
      </div>
    );
  }

  // Countdown
  if (status === 'countdown') {
    return <CountdownPage title={session.title} secondsUntilStart={secondsUntilStart} />;
  }

  // Ended
  if (status === 'ended') {
    return <SessionEnded title={session.title} />;
  }

  // Live — main webinar view
  const showCTA = currentVideoTime >= (session.ctaTimeSeconds || 2700);

  return (
    <div id="webinar-page">
      <TopBar title={session.title} />

      <div className="webinar-layout">
        <div className="webinar-main">
          <VideoPlayer
            vimeoVideoId={session.vimeoVideoId}
            elapsedSeconds={elapsedSeconds}
            onTimeUpdate={handleTimeUpdate}
          />

          <CTAButton
            visible={showCTA}
            text={session.ctaText}
            link={session.ctaLink}
          />
        </div>

        <ChatPanel
          messages={messages}
          hasNewMessage={hasNewMessage}
          onSendMessage={addUserMessage}
        />
      </div>
    </div>
  );
}
