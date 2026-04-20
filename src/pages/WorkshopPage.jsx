import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWebinarSession } from '../hooks/useWebinarSession';

import TopBar from '../components/TopBar';
import VideoPlayer from '../components/VideoPlayer';
import ChatPanel from '../components/ChatPanel';
import CTAButton from '../components/CTAButton';
import CountdownPage from '../components/CountdownPage';
import SessionEnded from '../components/SessionEnded';
import { useFakeChat } from '../hooks/useFakeChat';

export default function WorkshopPage() {
  const { slug } = useParams();
  const { session, status, elapsedSeconds, secondsUntilStart } = useWebinarSession(slug);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevMsgCountRef = useRef(0);
  const layoutRef = useRef(null);

  // Sync fake chat messages with video time
  const { messages, addUserMessage } = useFakeChat(
    status === 'live' ? session?.chatMessages : [],
    elapsedSeconds
  );

  // Track unread messages when chat is closed
  useEffect(() => {
    if (!isChatOpen && messages.length > prevMsgCountRef.current) {
      setUnreadCount(prev => prev + (messages.length - prevMsgCountRef.current));
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length, isChatOpen]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
    setUnreadCount(0);
  }, []);

  // Fullscreen using the browser Fullscreen API
  const toggleFullscreen = useCallback(() => {
    const el = layoutRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() || el.webkitRequestFullscreen?.() || el.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  // Close chat by default on mobile
  useEffect(() => {
    if (window.innerWidth <= 900) {
      setIsChatOpen(false);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="status-screen">
        <div className="loading-spinner" />
        <p>Loading session...</p>
      </div>
    );
  }

  if (status === 'no-session') {
    return (
      <div className="status-screen">
        <div className="error-icon">⚠️</div>
        <h1>Invalid Workshop Link</h1>
        <p>The link you followed is invalid or the workshop has been removed.<br/>Please check with the person who shared this link.</p>
      </div>
    );
  }

  if (status === 'countdown') {
    return <CountdownPage title={session?.title} secondsUntilStart={secondsUntilStart} />;
  }

  if (status === 'ended') {
    return <SessionEnded title={session?.title} />;
  }

  // --- LIVE STATE ---
  const isCTAVisible = elapsedSeconds >= (session?.ctaTimeSeconds || 0);

  return (
    <div
      id="webinar-page"
      ref={layoutRef}
      className={`webinar-page ${isFullscreen ? 'webinar-page--fullscreen' : ''}`}
    >
      <TopBar
        title={session?.title}
        onToggleChat={toggleChat}
        isChatOpen={isChatOpen}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />

      <div className={`webinar-layout ${isChatOpen ? '' : 'webinar-layout--chat-closed'}`}>
        <div className="webinar-main">
          <VideoPlayer
            vimeoVideoId={session?.videoUrl}
            elapsedSeconds={elapsedSeconds}
            onTimeUpdate={() => {}}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />
          <CTAButton
            visible={isCTAVisible}
            text={session?.ctaText}
            link={session?.ctaLink}
          />
        </div>

        <ChatPanel
          messages={messages}
          onSendMessage={addUserMessage}
          isOpen={isChatOpen}
          onToggle={toggleChat}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  );
}
