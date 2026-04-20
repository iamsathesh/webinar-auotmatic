import { useState, useEffect } from 'react';

/**
 * Top bar with LIVE badge, viewer count, title, and control buttons.
 * Compact on mobile, sticky on all devices.
 */
export default function TopBar({ title, onToggleChat, isChatOpen, onToggleFullscreen, isFullscreen }) {
  const [viewerCount, setViewerCount] = useState(() => {
    return Math.floor(Math.random() * 70) + 180;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : -1;
        return Math.max(150, prev + change);
      });
    }, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="topbar" id="webinar-topbar">
      <div className="topbar__left">
        <div className="topbar__live-badge" id="live-badge">
          <span className="topbar__live-dot" />
          LIVE
        </div>
        <div className="topbar__viewers" id="viewer-count">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {viewerCount.toLocaleString()}
        </div>
      </div>

      <div className="topbar__title" id="webinar-title">
        {title || 'Live Session'}
      </div>

      <div className="topbar__right">
        {/* Chat toggle */}
        <button
          className={`topbar__btn ${isChatOpen ? 'topbar__btn--active' : ''}`}
          onClick={onToggleChat}
          title={isChatOpen ? 'Hide Chat' : 'Show Chat'}
          aria-label={isChatOpen ? 'Hide Chat' : 'Show Chat'}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* Fullscreen toggle */}
        <button
          className={`topbar__btn ${isFullscreen ? 'topbar__btn--active' : ''}`}
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="4 14 8 14 8 18" />
              <polyline points="20 10 16 10 16 6" />
              <polyline points="14 4 14 8 18 8" />
              <polyline points="10 20 10 16 6 16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <polyline points="21 3 14 10" />
              <polyline points="3 21 10 14" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
