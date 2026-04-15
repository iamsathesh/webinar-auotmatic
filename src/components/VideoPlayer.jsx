import { useEffect, useRef, useCallback, useState } from 'react';
import Player from '@vimeo/player';

/**
 * Detects video platform and extracts ID from URL or raw ID.
 */
function parseVideoSource(input) {
  if (!input) return { platform: null, id: null };
  const trimmed = input.trim();

  // YouTube patterns
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of ytPatterns) {
    const match = trimmed.match(pattern);
    if (match) return { platform: 'youtube', id: match[1] };
  }
  if (trimmed.includes('youtu')) {
    const fallback = trimmed.split('/').pop().split('?v=').pop().split('&')[0];
    if (fallback && fallback.length === 11) return { platform: 'youtube', id: fallback };
  }

  // Vimeo patterns
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { platform: 'vimeo', id: vimeoMatch[1] };
  if (/^\d{5,}$/.test(trimmed)) return { platform: 'vimeo', id: trimmed };

  // 11-char alphanumeric = YouTube
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return { platform: 'youtube', id: trimmed };

  return { platform: 'vimeo', id: trimmed };
}

/**
 * YouTube Player — all branding, controls, logo, play button HIDDEN.
 * Seeking and fast-forward disabled via overlay + API.
 */
function YouTubePlayer({ videoId, elapsedSeconds, onTimeUpdate }) {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const lastAllowedTimeRef = useRef(elapsedSeconds || 0);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => initPlayer();
    } else {
      initPlayer();
    }

    function initPlayer() {
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-player-el', {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,          // Hide ALL controls
          modestbranding: 1,    // Minimize branding
          rel: 0,               // No related videos
          showinfo: 0,          // No title/channel
          iv_load_policy: 3,    // No annotations
          disablekb: 1,         // Disable keyboard (no seeking)
          fs: 0,                // No fullscreen button
          playsinline: 1,       // Inline on mobile
          cc_load_policy: 0,    // No captions by default
          start: Math.floor(elapsedSeconds || 0),
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (elapsedSeconds > 0) {
              event.target.seekTo(elapsedSeconds, true);
            }
            event.target.playVideo();
            lastAllowedTimeRef.current = elapsedSeconds || 0;
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setShowPlayOverlay(false);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              // Auto-resume if paused (prevent pausing)
              setTimeout(() => {
                try { event.target.playVideo(); } catch { /* Ignore */ }
              }, 300);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (onTimeUpdate) onTimeUpdate(-1);
            }
          }
        }
      });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch { /* Ignore */ }
        playerRef.current = null;
      }
    };
  }, [videoId, elapsedSeconds, onTimeUpdate]);

  // Poll current time + anti-seek enforcement
  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      try {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();

          // Anti-seek: if user somehow skipped ahead, snap them back
          if (currentTime > lastAllowedTimeRef.current + 3) {
            playerRef.current.seekTo(lastAllowedTimeRef.current, true);
            return;
          }

          lastAllowedTimeRef.current = Math.max(lastAllowedTimeRef.current, currentTime);

          if (onTimeUpdate && currentTime > 0) {
            onTimeUpdate(currentTime);
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, onTimeUpdate]);

  const handlePlayClick = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
    setShowPlayOverlay(false);
  };

  return (
    <div className="video-container" id="video-player">
      {/* The actual YouTube iframe */}
      <div id="yt-player-el" style={{ width: '100%', height: '100%' }} />

      {/* Invisible overlay to block all mouse interaction with YouTube UI */}
      <div className="yt-block-overlay" />

      {/* Custom play button shown on first load */}
      {showPlayOverlay && (
        <div className="yt-play-overlay" onClick={handlePlayClick}>
          <div className="yt-play-btn">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <polygon points="5,3 19,12 5,21" fill="white" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Vimeo Player using @vimeo/player SDK
 */
function VimeoPlayer({ videoId, elapsedSeconds, onTimeUpdate }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const initializedRef = useRef(false);

  const handleTimeUpdate = useCallback((data) => {
    if (onTimeUpdate) onTimeUpdate(data.seconds);
  }, [onTimeUpdate]);

  useEffect(() => {
    if (!containerRef.current || !videoId || initializedRef.current) return;
    initializedRef.current = true;

    const player = new Player(containerRef.current, {
      id: videoId,
      width: '100%',
      height: '100%',
      autoplay: true,
      muted: false,
      controls: false,
      loop: false,
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
      pip: false,
      dnt: true,
    });

    playerRef.current = player;

    player.ready().then(() => {
      if (elapsedSeconds > 0) {
        player.setCurrentTime(elapsedSeconds).then(() => {
          player.play().catch(() => {});
        });
      } else {
        player.play().catch(() => {});
      }
      player.on('timeupdate', handleTimeUpdate);
      player.on('ended', () => { if (onTimeUpdate) onTimeUpdate(-1); });
    }).catch(() => {
      // Handle Vimeo initialization failure
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.off('timeupdate', handleTimeUpdate);
        playerRef.current.destroy().catch(() => { /* Cleanly ignore destroy errors */ });
        playerRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [videoId, elapsedSeconds, handleTimeUpdate, onTimeUpdate]);

  return (
    <div className="video-container" id="video-player">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/**
 * Universal video player — auto-detects YouTube or Vimeo.
 */
export default function VideoPlayer({ vimeoVideoId, elapsedSeconds, onTimeUpdate }) {
  const { platform, id } = parseVideoSource(vimeoVideoId);

  if (platform === 'youtube') {
    return <YouTubePlayer videoId={id} elapsedSeconds={elapsedSeconds} onTimeUpdate={onTimeUpdate} />;
  }
  return <VimeoPlayer videoId={id} elapsedSeconds={elapsedSeconds} onTimeUpdate={onTimeUpdate} />;
}
