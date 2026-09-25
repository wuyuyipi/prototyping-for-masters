'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './musicPlayer.module.css';

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPlayCommandTimeRef = useRef<number>(0);
  const currentLoadedIdRef = useRef<string>('');

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Listen for playback events from the official Spotify Embed Controller and sync with pages
  useEffect(() => {
    // Listen for control commands from child prototypes (e.g. typography-experiments)
    function handleControlCommand(e: Event) {
      const customEvent = e as CustomEvent;
      const { action, uri, id } = customEvent.detail || {};
      const iframe = containerRef.current?.querySelector('iframe') as HTMLIFrameElement | null;

      if (action === 'seekAndPlay') {
        lastPlayCommandTimeRef.current = Date.now();
        const timeSec = typeof customEvent.detail?.timeSec === 'number'
          ? customEvent.detail.timeSec
          : Math.floor((customEvent.detail?.timeMs || 0) / 1000);

        const controller = (window as any).__SPOTIFY_CONTROLLER__;
        if (controller) {
          try {
            if (id && id !== currentLoadedIdRef.current) {
              currentLoadedIdRef.current = id;
              if (typeof controller.loadEntity === 'function') {
                controller.loadEntity(uri || `spotify:track:${id}`, false, Math.floor(timeSec));
              } else {
                controller.loadUri(uri || `spotify:track:${id}`);
                controller.seek(Math.floor(timeSec));
              }
              setTimeout(() => {
                try {
                  controller.seek(Math.floor(timeSec));
                  controller.play();
                } catch (_) {}
              }, 250);
            } else {
              controller.seek(Math.floor(timeSec));
            }
            controller.play();
          } catch (err) {
            console.warn('Spotify controller seek error:', err);
          }
        } else if (iframe && id) {
          currentLoadedIdRef.current = id;
          iframe.src = `https://open.spotify.com/embed/track/${id}?utm_source=generator&autoplay=1`;
        }
        setIsPlaying(true);
      } else if (action === 'playTrack' && id) {
        lastPlayCommandTimeRef.current = Date.now();
        const controller = (window as any).__SPOTIFY_CONTROLLER__;
        if (controller) {
          try {
            if (id !== currentLoadedIdRef.current) {
              currentLoadedIdRef.current = id;
              if (typeof controller.loadEntity === 'function') {
                controller.loadEntity(uri || `spotify:track:${id}`, false, 0);
              } else {
                controller.loadUri(uri || `spotify:track:${id}`);
              }
              setTimeout(() => {
                try {
                  controller.play();
                } catch (_) {}
              }, 200);
            }
            controller.play();
          } catch (err) {
            console.warn('Spotify controller command error:', err);
          }
        } else if (iframe) {
          if (id !== currentLoadedIdRef.current) {
            currentLoadedIdRef.current = id;
            iframe.src = `https://open.spotify.com/embed/track/${id}?utm_source=generator&autoplay=1`;
          }
        }
        setIsPlaying(true);
      } else if (action === 'play') {
        lastPlayCommandTimeRef.current = Date.now();
        const controller = (window as any).__SPOTIFY_CONTROLLER__;
        if (controller) {
          try {
            controller.play();
          } catch (err) {
            console.warn('Spotify controller play error:', err);
          }
        }
        setIsPlaying(true);
      } else if (action === 'pause') {
        lastPlayCommandTimeRef.current = 0;
        const controller = (window as any).__SPOTIFY_CONTROLLER__;
        if (controller) {
          try {
            controller.pause();
          } catch (err) {
            console.warn('Spotify controller pause error:', err);
          }
        }
        setIsPlaying(false);
      }
    }

    window.addEventListener('spotify-control-command', handleControlCommand);

    const setupController = (IFrameAPI: any) => {
      const iframeElem = containerRef.current?.querySelector('[data-testid="embed-iframe"]') as HTMLElement;
      if (!iframeElem || (window as any).__SPOTIFY_CONTROLLER__) return;

      try {
        IFrameAPI.createController(
          iframeElem,
          { uri: 'spotify:playlist:32Xns48YFAaxdWcT8NJ28f' },
          (EmbedController: any) => {
            (window as any).__SPOTIFY_CONTROLLER__ = EmbedController;
            EmbedController.addListener('playback_update', (e: any) => {
              const { position, duration, isPaused, playingURI } = e.data || {};
              const syncDetail = {
                uri: playingURI,
                isPlaying: !isPaused,
                position,
                duration,
              };
              if (typeof window !== 'undefined') {
                (window as any).__CURRENT_SPOTIFY_STATE__ = {
                  ...((window as any).__CURRENT_SPOTIFY_STATE__ || {}),
                  ...syncDetail,
                  ...(playingURI ? { uri: playingURI } : {})
                };
                setIsPlaying(!isPaused);
                window.dispatchEvent(new CustomEvent('spotify-playback-sync', { detail: syncDetail }));
              }
            });
          }
        );
      } catch (err) {
        console.warn('Could not initialize Spotify IFrame controller:', err);
      }
    };

    if ((window as any).SpotifyIframeApi) {
      setupController((window as any).SpotifyIframeApi);
    } else {
      (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
        (window as any).SpotifyIframeApi = IFrameAPI;
        setupController(IFrameAPI);
      };
    }

    // Load Spotify IFrame API script once if not present
    if (!document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]')) {
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      window.removeEventListener('spotify-control-command', handleControlCommand);
    };
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Floating CD Button */}
      <button
        type="button"
        className={styles.cdButton}
        onClick={toggleOpen}
        aria-label={
          isOpen
            ? 'Close Spotify playlist window'
            : isPlaying
            ? 'Open Spotify playlist (Music is playing)'
            : 'Open Spotify playlist window'
        }
        aria-expanded={isOpen}
      >
        {/* Tooltip */}
        <span className={styles.tooltip}>
          {isOpen
            ? 'Close Playlist'
            : isPlaying
            ? 'Playing in background'
            : 'Spotify Playlist'}
        </span>

        {/* CD Disc SVG Art - rotates when music is playing (both open and in background) */}
        <div className={`${styles.cdDisc} ${isPlaying ? styles.spinning : ''}`}>
          <svg
            viewBox="0 0 48 48"
            width="100%"
            height="100%"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Outer disc rim */}
            <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#1A2628" strokeWidth="2" />
            
            {/* Holographic / iridescent subtle reflections */}
            <path
              d="M12 6 C18 3, 30 3, 36 6 L28 20 C26 19, 22 19, 20 20 Z"
              fill="rgba(72, 167, 172, 0.22)"
            />
            <path
              d="M36 42 C30 45, 18 45, 12 42 L20 28 C22 29, 26 29, 28 28 Z"
              fill="rgba(237, 106, 133, 0.22)"
            />

            {/* Vinyl / CD Concentric Audio Grooves */}
            <circle cx="24" cy="24" r="18.5" stroke="#1A2628" strokeWidth="0.75" strokeOpacity="0.4" />
            <circle cx="24" cy="24" r="16" stroke="#48A7AC" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx="24" cy="24" r="13.5" stroke="#1A2628" strokeWidth="0.75" strokeOpacity="0.3" />
            <circle cx="24" cy="24" r="11" stroke="#1A2628" strokeWidth="0.75" strokeOpacity="0.35" />

            {/* Clear Plastic Inner Ring */}
            <circle cx="24" cy="24" r="8.5" fill="#FAFBFB" stroke="#1A2628" strokeWidth="1.2" />

            {/* Pink Accent Spindle Hub */}
            <circle cx="24" cy="24" r="5.5" fill="#ED6A85" stroke="#1A2628" strokeWidth="1.2" />

            {/* Center Spindle Hole */}
            <circle cx="24" cy="24" r="2.8" fill="#FFFFFF" stroke="#1A2628" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Pink dot: ONLY added if playlist window is open; disappears when window is closed */}
        {isOpen && <span className={styles.activeDot} />}

        {/* Little musical notes popping out: ONLY when music is playing (open or background) */}
        {isPlaying && (
          <div className={styles.notesContainer} aria-hidden="true">
            <span className={`${styles.note} ${styles.note1}`}>♪</span>
            <span className={`${styles.note} ${styles.note2}`}>♫</span>
            <span className={`${styles.note} ${styles.note3}`}>♩</span>
            <span className={`${styles.note} ${styles.note4}`}>♬</span>
          </div>
        )}
      </button>

      {/* Embedded Spotify Popover Card - permanently mounted so music keeps playing when closed */}
      <div
        className={`${styles.popover} ${isOpen ? styles.popoverVisible : styles.popoverHidden}`}
        role="dialog"
        aria-label="Spotify Embedded Playlist"
        aria-hidden={!isOpen}
      >
        <div className={styles.popoverHeader}>
          <div className={styles.headerTitleWrapper}>
            <span className={styles.playlistBadge}>SPOTIFY</span>
            <span className={styles.playlistSub}>Yiping&apos;s Selected Playlist</span>
            {isPlaying && (
              <span className={styles.playingPill} title="Music is playing">
                <span className={styles.playingPillDot} />
                PLAYING
              </span>
            )}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Close playlist window"
          >
            ✕
          </button>
        </div>

        <div className={styles.popoverBody}>
          <iframe
            className={styles.spotifyIframe}
            data-testid="embed-iframe"
            src="https://open.spotify.com/embed/playlist/32Xns48YFAaxdWcT8NJ28f?utm_source=generator&si=273098c754554f25"
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
