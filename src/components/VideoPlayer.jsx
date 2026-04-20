import { useEffect, useRef, useState, useCallback } from 'react';
import Player from '@vimeo/player';

/**
 * Detects video platform and extracts ID from URL or raw ID.
 */
function parseVideoSource(input) {
  if (!input) return { platform: null, id: null };
  const trimmed = input.trim();

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

  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { platform: 'vimeo', id: vimeoMatch[1] };
  if (/^\d{5,}$/.test(trimmed)) return { platform: 'vimeo', id: trimmed };

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return { platform: 'youtube', id: trimmed };

  return { platform: 'vimeo', id: trimmed };
}

/* ═══════════════════════════════════════════
   YOUTUBE PLAYER
   ═══════════════════════════════════════════ */
function YouTubePlayer({ videoId, elapsedSeconds, onTimeUpdate, onToggleFullscreen, isFullscreen }) {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
  const lastAllowedTimeRef = useRef(elapsedSeconds || 0);
  const hasSeekedRef = useRef(false);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);

  useEffect(() => {
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
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          cc_load_policy: 0,
        },
        events: {
          onReady: (event) => {
            // Fix: set allow attribute properly on the iframe
            const iframe = document.querySelector('#yt-player-el iframe');
            if (iframe) {
              iframe.setAttribute('allow', 'autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture; fullscreen');
              iframe.setAttribute('allowfullscreen', '');
            }

            const duration = event.target.getDuration() || 1;
            const actualSeekTime = elapsedSeconds > 0 ? elapsedSeconds % duration : 0;

            if (actualSeekTime > 0 && !hasSeekedRef.current) {
              event.target.seekTo(actualSeekTime, true);
              hasSeekedRef.current = true;
            }
            event.target.playVideo();
            lastAllowedTimeRef.current = actualSeekTime || 0;
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setShowPlayOverlay(false);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setTimeout(() => {
                try { event.target.playVideo(); } catch { /* Ignore */ }
              }, 300);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (onTimeUpdateRef.current) onTimeUpdateRef.current(-1);
              event.target.seekTo(0);
              event.target.playVideo();
              lastAllowedTimeRef.current = 0;
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
  }, [videoId]);

  // Poll current time + anti-seek
  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      try {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();
          if (currentTime > lastAllowedTimeRef.current + 3) {
            playerRef.current.seekTo(lastAllowedTimeRef.current, true);
            return;
          }
          lastAllowedTimeRef.current = Math.max(lastAllowedTimeRef.current, currentTime);
          if (onTimeUpdateRef.current && currentTime > 0) {
            onTimeUpdateRef.current(currentTime);
          }
        }
      } catch { /* Silently ignore */ }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const handlePlayClick = useCallback(() => {
    if (playerRef.current) {
      try {
        if (playerRef.current.unMute) playerRef.current.unMute();
        if (playerRef.current.setVolume) playerRef.current.setVolume(100);
        playerRef.current.playVideo();
      } catch { /* Ignore */ }
    }
    setShowPlayOverlay(false);
  }, []);

  return (
    <div className="video-wrapper" id="video-player">
      <div className="video-aspect">
        <div id="yt-player-el" style={{ width: '100%', height: '100%' }} />
        {/* Invisible overlay to block YouTube UI interactions */}
        <div className="yt-block-overlay" />
      </div>

      {/* Custom play/unmute overlay */}
      {showPlayOverlay && (
        <div className="video-play-overlay" onClick={handlePlayClick}>
          <div className="video-play-btn">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <polygon points="5,3 19,12 5,21" fill="white" />
            </svg>
          </div>
          <p className="video-play-text">Click to Join Live Session</p>
        </div>
      )}

      {/* Custom fullscreen button */}
      <button
        className="video-fullscreen-btn"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="4 14 8 14 8 18" />
            <polyline points="20 10 16 10 16 6" />
            <polyline points="14 4 14 8 18 8" />
            <polyline points="10 20 10 16 6 16" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <polyline points="21 3 14 10" />
            <polyline points="3 21 10 14" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   VIMEO PLAYER
   ═══════════════════════════════════════════ */
function VimeoPlayer({ videoId, elapsedSeconds, onTimeUpdate, onToggleFullscreen, isFullscreen }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const initializedRef = useRef(false);
  const hasSeekedRef = useRef(false);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);

  useEffect(() => {
    if (!containerRef.current || !videoId || initializedRef.current) return;
    initializedRef.current = true;

    const player = new Player(containerRef.current, {
      id: videoId,
      width: '100%',
      height: '100%',
      autoplay: true,
      muted: true,
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
      player.getDuration().then((duration) => {
        const actualSeekTime = elapsedSeconds % (duration || 1);
        if (elapsedSeconds > 0 && !hasSeekedRef.current) {
          player.setCurrentTime(actualSeekTime).then(() => {
            player.play().catch(() => {});
            hasSeekedRef.current = true;
          });
        } else {
          player.play().catch(() => {});
        }
      }).catch(() => { player.play().catch(() => {}); });

      player.on('timeupdate', (data) => {
        if (onTimeUpdateRef.current) onTimeUpdateRef.current(data.seconds);
      });

      player.on('ended', () => {
        if (onTimeUpdateRef.current) onTimeUpdateRef.current(-1);
        player.setCurrentTime(0).then(() => { player.play().catch(() => {}); });
      });
    }).catch(() => {});

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => {});
        playerRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [videoId]);

  const handlePlayClick = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.setMuted(false);
      playerRef.current.setVolume(1);
      playerRef.current.play().catch(() => {});
    }
    setShowPlayOverlay(false);
  }, []);

  return (
    <div className="video-wrapper" id="video-player">
      <div className="video-aspect">
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {showPlayOverlay && (
        <div className="video-play-overlay" onClick={handlePlayClick}>
          <div className="video-play-btn">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <polygon points="5,3 19,12 5,21" fill="white" />
            </svg>
          </div>
          <p className="video-play-text">Click to Join Live Session</p>
        </div>
      )}

      <button
        className="video-fullscreen-btn"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="4 14 8 14 8 18" />
            <polyline points="20 10 16 10 16 6" />
            <polyline points="14 4 14 8 18 8" />
            <polyline points="10 20 10 16 6 16" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <polyline points="21 3 14 10" />
            <polyline points="3 21 10 14" />
          </svg>
        )}
      </button>
    </div>
  );
}

/**
 * Universal video player — auto-detects YouTube or Vimeo.
 */
export default function VideoPlayer({ vimeoVideoId, elapsedSeconds, onTimeUpdate, onToggleFullscreen, isFullscreen }) {
  const { platform, id } = parseVideoSource(vimeoVideoId);

  if (platform === 'youtube') {
    return <YouTubePlayer videoId={id} elapsedSeconds={elapsedSeconds} onTimeUpdate={onTimeUpdate} onToggleFullscreen={onToggleFullscreen} isFullscreen={isFullscreen} />;
  }
  return <VimeoPlayer videoId={id} elapsedSeconds={elapsedSeconds} onTimeUpdate={onTimeUpdate} onToggleFullscreen={onToggleFullscreen} isFullscreen={isFullscreen} />;
}
