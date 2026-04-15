import { useState, useEffect } from 'react';

/**
 * Top bar with LIVE badge, viewer count, and webinar title
 */
export default function TopBar({ title }) {
  const [viewerCount, setViewerCount] = useState(() => {
    return Math.floor(Math.random() * 70) + 180;
  });

  // Slowly increment viewer count
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
          <span className="topbar__live-dot"></span>
          LIVE
        </div>
        <div className="topbar__viewers" id="viewer-count">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {viewerCount.toLocaleString()} watching
        </div>
      </div>
      <div className="topbar__title" id="webinar-title">
        {title || 'Webinar'}
      </div>
      <div className="topbar__right">
        {/* Placeholder for future controls */}
      </div>
    </div>
  );
}
