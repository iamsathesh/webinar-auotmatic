import { useEffect, useRef, useState } from 'react';
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
 * Patches the YouTube iframe 'allow' attribute so the browser permits
 * autoplay, encrypted-media, etc. inside the cross-origin iframe.
 */
function patchYouTubeIframe() {
  const iframe = document.querySelector('#yt-player-el iframe, #yt-player-el');
  if (iframe && iframe.tagName === 'IFRAME') {
    iframe.setAttribute(
      'allow',
      'autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture; fullscreen'
    );
  }
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
  const hasSeekedRef = useRef(false);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep ref up to date
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

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
          mute: 1,              // Mute to ensure autoplay works in all browsers
          controls: 0,          // Hide ALL controls
          modestbranding: 1,    // Minimize branding
          rel: 0,               // No related videos
          showinfo: 0,          // No title/channel
          iv_load_policy: 3,    // No annotations
          disablekb: 1,         // Disable keyboard (no seeking)
          fs: 0,                // No fullscreen button
          playsinline: 1,       // Inline on mobile
          cc_load_policy: 0,    // No captions by default
          cc_load_policy: 0,    // No captions by default
          // Wait to fetch accurate duration before seeking.
          // NOTE: 'origin' is intentionally omitted to avoid postMessage
          // mismatch on http subdomains (sslip.io, etc.)
        },
        events: {
          onReady: (event) => {
            // Patch the iframe allow attribute for permissions policy
            patchYouTubeIframe();

            const duration = event.target.getDuration() || 1;
            const actualSeekTime = elapsedSeconds % duration;

            if (elapsedSeconds > 0 && !hasSeekedRef.current) {
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
              // Auto-resume if paused (prevent pausing)
              setTimeout(() => {
                try { event.target.playVideo(); } catch { /* Ignore */ }
              }, 300);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (onTimeUpdateRef.current) onTimeUpdateRef.current(-1);
              // Seamlessly loop the video to keep the "live" illusion running
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

          if (onTimeUpdateRef.current && currentTime > 0) {
            onTimeUpdateRef.current(currentTime);
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const handlePlayClick = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      if (playerRef.current.unMute) playerRef.current.unMute();
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

      {/* Custom play button / unmute button shown on first load */}
      {showPlayOverlay && (
        <div className="yt-play-overlay" onClick={handlePlayClick}>
          <div className="yt-play-btn">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <polygon points="5,3 19,12 5,21" fill="white" />
            </svg>
          </div>
          <p style={{ color: 'white', marginTop: '12px', fontWeight: 500 }}>
            Click to Participate in Webinar
          </p>
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
  const hasSeekedRef = useRef(false);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep ref up to date
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    if (!containerRef.current || !videoId || initializedRef.current) return;
    initializedRef.current = true;

    const player = new Player(containerRef.current, {
      id: videoId,
      width: '100%',
      height: '100%',
      autoplay: true,
      muted: true, // Auto-mute for better compatibility
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
        const actualExt = duration || 1;
        const actualSeekTime = elapsedSeconds % actualExt;

        // Perform initial seek only once
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
        player.setCurrentTime(0).then(() => {
           player.play().catch(() => {});
        });
      });
    }).catch(() => {
      // Handle Vimeo initialization failure
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => { /* Cleanly ignore destroy errors */ });
        playerRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [videoId]); // CRITICAL: Only depend on videoId

  return (
    <div className="video-container" id="video-player">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {/* Tap to Unmute overlay for Vimeo */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 10, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => {
          if (playerRef.current) playerRef.current.setMuted(false);
          const overlay = document.getElementById('vimeo-unmute-overlay');
          if (overlay) overlay.style.display = 'none';
        }}
        id="vimeo-unmute-overlay"
      >
        <div className="yt-play-btn">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <polygon points="5,3 19,12 5,21" fill="white" />
          </svg>
        </div>
        <p style={{ color: 'white', marginTop: '12px', fontWeight: 500 }}>
          Click to Participate in Webinar
        </p>
      </div>
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
