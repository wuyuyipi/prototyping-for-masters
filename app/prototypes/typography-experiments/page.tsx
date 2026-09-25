"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import { PLAYLIST_TRACKS, TrackLyrics, getLineTimestamp } from './lyricsData';

const ANIMATION_TYPES = [
  'wave',
  'jump',
  'dissolve',
  'float',
  'glitch',
  'stretch',
  'twist',
] as const;

type AnimationType = typeof ANIMATION_TYPES[number];

const getRandomAnimation = (): AnimationType => {
  return ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)];
};

export default function TypographyExperimentsPrototype() {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(29);
  const [amplitude, setAmplitude] = useState<number>(36);
  const [frequency, setFrequency] = useState<number>(1.2);
  const [waveSpeed, setWaveSpeed] = useState<number>(2.5);

  const activeTrack = PLAYLIST_TRACKS[selectedTrackIndex];

  // Random animation assignment per line
  const [lineAnimations, setLineAnimations] = useState<AnimationType[]>([]);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const hoveredLineRef = useRef<number | null>(null);

  useEffect(() => {
    hoveredLineRef.current = hoveredLineIndex;
  }, [hoveredLineIndex]);

  // Assign random animations when activeTrack changes
  useEffect(() => {
    setLineAnimations(activeTrack.lyrics.map(() => getRandomAnimation()));
    charElementsMap.current.clear();
  }, [activeTrack]);

  // Re-roll random animations for all lines
  const shuffleLineAnimations = () => {
    setLineAnimations(activeTrack.lyrics.map(() => getRandomAnimation()));
  };

  const stageRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef<number>(0);
  const selectedTrackIndexRef = useRef<number>(selectedTrackIndex);

  const [playbackMode, setPlaybackMode] = useState<'loop' | 'shuffle'>('loop');
  const playbackModeRef = useRef<'loop' | 'shuffle'>('loop');
  const durationRef = useRef<number>(duration);
  const lastTrackAdvanceTimeRef = useRef<number>(0);
  const advanceToNextTrackRef = useRef<() => void>(() => {});

  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const handleModeChange = (mode: 'loop' | 'shuffle') => {
    setPlaybackMode(mode);
    playbackModeRef.current = mode;
  };

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    selectedTrackIndexRef.current = selectedTrackIndex;
  }, [selectedTrackIndex]);

  // Master Playhead Synchronization Anchor
  const playheadRef = useRef({
    anchorTime: 0,
    anchorTimestamp: 0,
    isPlaying: false,
    seekTarget: 0,
    seekTimestamp: 0,
  });

  // Mouse tracking state for wave physics
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  const charElementsMap = useRef<Map<string, HTMLSpanElement>>(new Map());
  const animFrameRef = useRef<number | null>(null);

  // Sync with top-right CD MusicPlayer (Spotify embed)
  useEffect(() => {
    // Check initial cached state from CD player
    if (typeof window !== 'undefined') {
      const cached = (window as any).__CURRENT_SPOTIFY_STATE__;
      if (cached?.uri) {
        const foundIdx = PLAYLIST_TRACKS.findIndex(
          (t) => t.spotifyUri === cached.uri || cached.uri.includes(t.id) || t.id.includes(cached.uri)
        );
        if (foundIdx !== -1) {
          setSelectedTrackIndex(foundIdx);
          selectedTrackIndexRef.current = foundIdx;
        }
      }
      if (typeof cached?.isPlaying === 'boolean') {
        setIsPlaying(cached.isPlaying);
        playheadRef.current.isPlaying = cached.isPlaying;
      }
      if (typeof cached?.position === 'number' && cached.position > 0) {
        const secs = cached.position / 1000;
        playheadRef.current.anchorTime = secs;
        playheadRef.current.anchorTimestamp = performance.now();
        setCurrentTime(secs);
      }
      if (typeof cached?.duration === 'number' && cached.duration > 10000) {
        setDuration(Math.round(cached.duration / 1000));
      }
    }

    const handleSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { uri, isPlaying: playerIsPlaying, position, duration: playerDuration } = customEvent.detail || {};

      const isRecentSeek = Date.now() - playheadRef.current.seekTimestamp < 3500;

      if (uri) {
        const foundIdx = PLAYLIST_TRACKS.findIndex(
          (t) => t.spotifyUri === uri || (typeof uri === 'string' && (uri.includes(t.id) || t.id.includes(uri)))
        );
        if (foundIdx !== -1 && foundIdx !== selectedTrackIndexRef.current) {
          if (isRecentSeek) {
            // User just clicked a lyric to play on the current track!
            // Re-command the current track to prevent Spotify accidental playlist-skips
            const curTrack = PLAYLIST_TRACKS[selectedTrackIndexRef.current];
            if (typeof window !== 'undefined' && curTrack) {
              window.dispatchEvent(
                new CustomEvent('spotify-control-command', {
                  detail: {
                    action: 'seekAndPlay',
                    uri: curTrack.spotifyUri,
                    id: curTrack.id,
                    timeSec: Math.floor(playheadRef.current.seekTarget),
                  },
                })
              );
            }
            return;
          }
          selectedTrackIndexRef.current = foundIdx;
          setSelectedTrackIndex(foundIdx);
          playheadRef.current = {
            anchorTime: 0,
            anchorTimestamp: performance.now(),
            isPlaying: true,
            seekTarget: 0,
            seekTimestamp: 0,
          };
          setCurrentTime(0);
        }
      }

      if (typeof playerDuration === 'number' && playerDuration > 10000) {
        const durSecs = Math.round(playerDuration / 1000);
        setDuration(durSecs);
        durationRef.current = durSecs;
      }

      if (typeof playerIsPlaying === 'boolean') {
        const currentPos = typeof position === 'number' ? position / 1000 : playheadRef.current.anchorTime;
        const totalDur = (typeof playerDuration === 'number' && playerDuration > 10000)
          ? Math.round(playerDuration / 1000)
          : (durationRef.current || 29);

        // If Spotify paused because song completed (near the end), and NOT because the user just sought!
        if (!isRecentSeek && !playerIsPlaying && currentPos >= totalDur - 2 && currentPos > 5) {
          advanceToNextTrackRef.current();
          return;
        }

        setIsPlaying(playerIsPlaying);
        playheadRef.current.isPlaying = playerIsPlaying;
        if (!playerIsPlaying) {
          playheadRef.current.anchorTime = currentTimeRef.current;
          playheadRef.current.anchorTimestamp = performance.now();
        }
      }

      if (typeof position === 'number' && position >= 0) {
        const spotifySecs = position / 1000;
        const playhead = playheadRef.current;
        const isRecentSeek = Date.now() - playhead.seekTimestamp < 2500;

        if (isRecentSeek) {
          // While buffering a seek, ignore stale old positions until Spotify reaches near the seek target
          if (Math.abs(spotifySecs - playhead.seekTarget) <= 3.5) {
            playhead.seekTimestamp = 0;
            playhead.anchorTime = spotifySecs;
            playhead.anchorTimestamp = performance.now();
          }
        } else {
          // Seamlessly update anchor time to match Spotify audio without visual jumping
          playhead.anchorTime = spotifySecs;
          playhead.anchorTimestamp = performance.now();
        }
      }
    };

    window.addEventListener('spotify-playback-sync', handleSync);
    return () => {
      window.removeEventListener('spotify-playback-sync', handleSync);
    };
  }, []);

  // Handle Play / Pause Toggle with CD player coordination
  const togglePlay = useCallback(() => {
    const nextPlayState = !isPlaying;
    setIsPlaying(nextPlayState);

    const now = performance.now();
    const playhead = playheadRef.current;
    if (nextPlayState) {
      playhead.anchorTimestamp = now;
      playhead.isPlaying = true;
    } else {
      const elapsed = (now - playhead.anchorTimestamp) / 1000;
      playhead.anchorTime = playhead.anchorTime + Math.max(0, elapsed);
      playhead.anchorTimestamp = now;
      playhead.isPlaying = false;
    }

    // Send control command to top-right CD player
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('spotify-control-command', {
          detail: {
            action: nextPlayState ? 'play' : 'pause',
            uri: activeTrack.spotifyUri,
            id: activeTrack.id,
            timeSec: Math.floor(currentTime),
          },
        })
      );
    }
  }, [isPlaying, activeTrack, currentTime]);

  // Select a different track and sync with CD player
  const handleSelectTrack = useCallback((index: number) => {
    setSelectedTrackIndex(index);
    selectedTrackIndexRef.current = index;

    playheadRef.current = {
      anchorTime: 0,
      anchorTimestamp: performance.now(),
      isPlaying: true,
      seekTarget: 0,
      seekTimestamp: Date.now(),
    };

    setCurrentTime(0);
    setIsPlaying(true);
    const targetTrack = PLAYLIST_TRACKS[index];

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('spotify-control-command', {
          detail: {
            action: 'playTrack',
            uri: targetTrack.spotifyUri,
            id: targetTrack.id,
          },
        })
      );
    }
  }, []);

  const advanceToNextTrack = useCallback(() => {
    if (Date.now() - lastTrackAdvanceTimeRef.current < 1500) {
      return;
    }
    lastTrackAdvanceTimeRef.current = Date.now();

    const currentIdx = selectedTrackIndexRef.current;
    let nextIdx: number;

    if (playbackModeRef.current === 'shuffle' && PLAYLIST_TRACKS.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * PLAYLIST_TRACKS.length);
      } while (nextIdx === currentIdx);
    } else {
      nextIdx = (currentIdx + 1) % PLAYLIST_TRACKS.length;
    }

    handleSelectTrack(nextIdx);
  }, [handleSelectTrack]);

  advanceToNextTrackRef.current = advanceToNextTrack;

  const handleNextTrack = () => {
    advanceToNextTrack();
  };

  const handlePrevTrack = () => {
    const currentIdx = selectedTrackIndexRef.current;
    const prevIdx = (currentIdx - 1 + PLAYLIST_TRACKS.length) % PLAYLIST_TRACKS.length;
    handleSelectTrack(prevIdx);
  };

  // Play audio starting exactly from the clicked lyric line
  const handleLineClick = (lineIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const totalDuration = durationRef.current || duration || 29;
    const targetTime = getLineTimestamp(activeTrack, lineIndex, totalDuration);

    playheadRef.current = {
      anchorTime: targetTime,
      anchorTimestamp: performance.now(),
      isPlaying: true,
      seekTarget: targetTime,
      seekTimestamp: Date.now(),
    };

    setCurrentTime(targetTime);
    setIsPlaying(true);

    // Broadcast seekAndPlay command with both seconds and ms to top-right CD Spotify player
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('spotify-control-command', {
          detail: {
            action: 'seekAndPlay',
            uri: activeTrack.spotifyUri,
            id: activeTrack.id,
            timeSec: Math.floor(targetTime),
            timeMs: Math.round(targetTime * 1000),
          },
        })
      );
    }
  };

  // Continuous smooth playback timer: calculates precise interpolated position 10 times per second
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const playhead = playheadRef.current;
      if (!playhead.isPlaying) return;

      const isRecentSeek = Date.now() - playhead.seekTimestamp < 4000;
      const elapsed = (performance.now() - playhead.anchorTimestamp) / 1000;
      const calculated = playhead.anchorTime + Math.max(0, elapsed);
      const totalDuration = durationRef.current || duration || 29;

      if (!isRecentSeek && calculated >= totalDuration - 0.2) {
        advanceToNextTrack();
      } else {
        setCurrentTime(Math.min(totalDuration, calculated));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration, advanceToNextTrack]);

  // Determine currently active line based on playback time using monotonic reverse search
  const currentLineIndex = isPlaying
    ? (() => {
        const totalDuration = durationRef.current || duration || 29;
        for (let i = activeTrack.lyrics.length - 1; i >= 0; i--) {
          if (currentTime >= getLineTimestamp(activeTrack, i, totalDuration)) {
            return i;
          }
        }
        return 0;
      })()
    : -1;

  // Physics animation loop: ONLY the hovered line animates with its assigned animation!
  useEffect(() => {
    let startTime = performance.now();

    const renderAnimations = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const { x: mx, y: my, active: mouseActive } = mousePos.current;
      const activeLine = hoveredLineRef.current;

      const waveRadius = 260; // Interaction radius around cursor

      charElementsMap.current.forEach((span) => {
        if (!span) return;

        const lineIndex = Number(span.dataset.lineindex);
        const charIndex = Number(span.dataset.charindex);
        const animType = (span.dataset.animtype || 'wave') as AnimationType;

        // ONLY the line the cursor is currently hovering on executes its animation!
        if (activeLine !== lineIndex || !mouseActive) {
          span.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
          span.style.opacity = '1';
          span.style.filter = 'none';
          span.style.fontWeight = '400';
          span.style.color = '';
          span.style.textShadow = 'none';
          return;
        }

        const rect = span.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;

        const dx = charCenterX - mx;
        const dy = charCenterY - my;
        const dist = Math.hypot(dx, dy);

        const influence = Math.max(0, 1 - dist / waveRadius);

        let transform = 'translate3d(0, 0, 0)';
        let opacity = '1';
        let filter = 'none';
        let weight = '400';
        let color = '';
        let textShadow = 'none';

        switch (animType) {
          case 'wave': {
            // Normal fluid sine wave
            const wavePhase = (dx * 0.038 * frequency) - (elapsed * waveSpeed);
            const yOffset = -Math.sin(wavePhase) * amplitude * influence;
            const rotation = -Math.cos(wavePhase) * (amplitude * 0.18) * influence;
            const scale = 1 + influence * 0.08;
            transform = `translate3d(0, ${yOffset.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
            break;
          }

          case 'jump': {
            const jumpPhase = (charIndex * 0.55) - (elapsed * (waveSpeed * 2.5));
            const bounce = Math.max(0, Math.sin(jumpPhase));
            const yOffset = -bounce * amplitude * 1.35 * Math.max(0.35, influence);
            const scaleX = 1 - bounce * 0.22 * Math.max(0.35, influence);
            const scaleY = 1 + bounce * 0.38 * Math.max(0.35, influence);
            weight = bounce > 0.45 ? '700' : '400';
            transform = `translate3d(0, ${yOffset.toFixed(2)}px, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
            break;
          }

          case 'dissolve': {
            const scatterX = Math.sin(charIndex * 19.3 + elapsed * 7) * amplitude * 0.85 * influence;
            const scatterY = -Math.cos(charIndex * 13.7 + elapsed * 5) * amplitude * 0.85 * influence;
            const scatterRot = Math.sin(charIndex * 9.1 + elapsed * 4) * 35 * influence;
            const blurPx = (influence * 7).toFixed(1);
            const opVal = Math.max(0.08, 1 - influence * 0.88);
            const scale = 1 + influence * 0.25;
            opacity = opVal.toFixed(2);
            filter = influence > 0.05 ? `blur(${blurPx}px)` : 'none';
            transform = `translate3d(${scatterX.toFixed(2)}px, ${scatterY.toFixed(2)}px, 0) rotate(${scatterRot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
            break;
          }

          case 'float': {
            const floatPhase = elapsed * (waveSpeed * 0.9) + charIndex * 0.55;
            const yOffset = -Math.sin(floatPhase) * (amplitude * 0.75) * Math.max(0.4, influence);
            const rotation = Math.cos(floatPhase * 0.8) * 12 * Math.max(0.4, influence);
            const scale = 1 + Math.sin(floatPhase * 1.2) * 0.12 * Math.max(0.4, influence);
            opacity = (1 - Math.sin(floatPhase) * 0.15 * influence).toFixed(2);
            transform = `translate3d(0, ${yOffset.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
            break;
          }

          case 'glitch': {
            const step = Math.floor(elapsed * 14);
            const jitterX = (Math.sin(step * 43 + charIndex * 9) * 2 - 1) * amplitude * 0.8 * influence;
            const jitterY = (Math.cos(step * 29 + charIndex * 13) * 2 - 1) * (amplitude * 0.25) * influence;
            const skew = Math.sin(step * 31 + charIndex * 7) * 26 * influence;
            color = influence > 0.25 ? (charIndex % 2 === 0 ? '#ED6A85' : '#48A7AC') : '';
            textShadow = influence > 0.2 ? '2px 0px #ED6A85, -2px 0px #48A7AC' : 'none';
            transform = `translate3d(${jitterX.toFixed(2)}px, ${jitterY.toFixed(2)}px, 0) skewX(${skew.toFixed(2)}deg)`;
            break;
          }

          case 'stretch': {
            const stretchY = 1 + influence * 0.85;
            const stretchX = 1 - influence * 0.2;
            const yOffset = -influence * (amplitude * 0.35);
            weight = Math.min(900, Math.round(400 + influence * 500)).toString();
            transform = `translate3d(0, ${yOffset.toFixed(2)}px, 0) scale(${stretchX.toFixed(3)}, ${stretchY.toFixed(3)})`;
            break;
          }

          case 'twist': {
            const twistAngle = Math.sin(elapsed * (waveSpeed * 1.5) + charIndex * 0.6) * 75 * Math.max(0.35, influence);
            const tiltZ = Math.cos(elapsed * waveSpeed + charIndex * 0.4) * 16 * Math.max(0.35, influence);
            const yOffset = -Math.abs(Math.sin(elapsed * waveSpeed + charIndex * 0.6)) * (amplitude * 0.45) * Math.max(0.35, influence);
            transform = `perspective(600px) translate3d(0, ${yOffset.toFixed(2)}px, 0) rotateY(${twistAngle.toFixed(2)}deg) rotateZ(${tiltZ.toFixed(2)}deg)`;
            break;
          }
        }

        span.style.transform = transform;
        span.style.opacity = opacity;
        span.style.filter = filter;
        span.style.fontWeight = weight;
        span.style.color = color;
        span.style.textShadow = textShadow;
      });

      animFrameRef.current = requestAnimationFrame(renderAnimations);
    };

    animFrameRef.current = requestAnimationFrame(renderAnimations);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [amplitude, frequency, waveSpeed]);

  // Stage Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mousePos.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    mousePos.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mousePos.current = {
      x: -1000,
      y: -1000,
      active: false,
    };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainFrame}>
        {/* Navigation Bar */}
        <header className={styles.topNav}>
          <Link href="/" className={styles.backButton}>
            <span>←</span>
            <span>Prototypes</span>
          </Link>
          <span className={styles.categoryBadge}>
            <span className={styles.squareBullet} />
            <span>03 / Typography Experiments</span>
          </span>
        </header>

        {/* Header Section */}
        <section className={styles.headerSection}>
          <h1 className={styles.projectTitle}>Kinetic Lyric Waves</h1>
        </section>

        {/* Toolbar & Wave Controls */}
        <section className={styles.controlsBar}>
          <div className={styles.controlsGroupLeft}>
            {/* Wave Height / Amplitude */}
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>Wave Height:</span>
              <input
                type="range"
                min="10"
                max="80"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className={styles.sliderInput}
              />
              <span className={styles.valueIndicator}>{amplitude}px</span>
            </div>

            {/* Wave Frequency */}
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>Frequency:</span>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className={styles.sliderInput}
              />
              <span className={styles.valueIndicator}>{frequency}x</span>
            </div>

            {/* Wave Speed */}
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>Speed:</span>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={waveSpeed}
                onChange={(e) => setWaveSpeed(Number(e.target.value))}
                className={styles.sliderInput}
              />
              <span className={styles.valueIndicator}>{waveSpeed}x</span>
            </div>

            {/* Playlist Mode Toggle: Loop vs Shuffle */}
            <div className={styles.controlItem}>
              <span className={styles.controlLabel}>Playlist Mode:</span>
              <div className={styles.modeToggleGroup} role="group" aria-label="Playlist playback mode">
                <button
                  type="button"
                  className={`${styles.modeToggleButton} ${playbackMode === 'loop' ? styles.modeToggleButtonActive : ''}`}
                  onClick={() => handleModeChange('loop')}
                  title="Loop playlist sequentially"
                >
                  <span className={styles.modeIcon}>🔁</span>
                  <span>Loop</span>
                </button>
                <button
                  type="button"
                  className={`${styles.modeToggleButton} ${playbackMode === 'shuffle' ? styles.modeToggleButtonActive : ''}`}
                  onClick={() => handleModeChange('shuffle')}
                  title="Shuffle playlist randomly"
                >
                  <span className={styles.modeIcon}>🔀</span>
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            {/* Shuffle Animations */}
            <div className={styles.controlItem}>
              <button
                type="button"
                className={styles.shuffleButton}
                onClick={shuffleLineAnimations}
                title="Randomize animations for each line"
              >
                <span>🎲</span>
                <span>Shuffle Animations</span>
              </button>
            </div>
          </div>
        </section>

        {/* Playlist Track Chip Selector */}
        <section className={styles.playlistChipsContainer}>
          <div className={styles.playlistHeaderRow}>
            <span className={styles.playlistLabel}>
              Track List ({PLAYLIST_TRACKS.length})
            </span>
          </div>
          <div className={styles.playlistScrollRow}>
            {PLAYLIST_TRACKS.map((track, idx) => (
              <button
                key={track.id}
                type="button"
                className={`${styles.trackChip} ${idx === selectedTrackIndex ? styles.trackChipActive : ''}`}
                onClick={() => handleSelectTrack(idx)}
              >
                <span className={styles.trackChipIcon}>
                  {idx === selectedTrackIndex && isPlaying ? '▶' : '♫'}
                </span>
                <span>{track.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Wavy Typography Stage Area */}
        <main
          ref={stageRef}
          className={styles.stageContainer}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Active Track Metadata */}
          <div className={styles.stageTrackMeta}>
            <div className={styles.stageTrackTitleGroup}>
              <h2 className={styles.stageTrackTitle}>{activeTrack.title}</h2>
              <span className={styles.stageTrackArtist}>{activeTrack.artist}</span>
            </div>

            <div className={styles.stageActions} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.playTrackButton}
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause music" : "Play music"}
              >
                <span>{isPlaying ? '❚❚ Pause' : '▶ Play Song'}</span>
              </button>

              <a
                href={activeTrack.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.spotifyBadgeLink}
                title="Listen on Spotify"
              >
                <span>Spotify</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* Interactive Lyrics with Line-Specific Animations & Click-to-Seek */}
          <div className={styles.lyricsWrapper}>
            {activeTrack.lyrics.map((line, lineIndex) => {
              const lineAnim = lineAnimations[lineIndex] || 'wave';
              const isHovered = hoveredLineIndex === lineIndex;
              const isCurrent = currentLineIndex === lineIndex;
              const lineTimestamp = getLineTimestamp(activeTrack, lineIndex, durationRef.current || duration || 29);

              return (
                <div
                  key={lineIndex}
                  className={`${styles.lyricRow} ${isHovered ? styles.lyricRowHovered : ''} ${
                    isCurrent ? styles.lyricRowCurrent : ''
                  }`}
                  onClick={(e) => handleLineClick(lineIndex, e)}
                  onMouseEnter={() => {
                    setHoveredLineIndex(lineIndex);
                  }}
                  onMouseLeave={() => {
                    setHoveredLineIndex(null);
                  }}
                  title={`Click to play from ${formatTime(lineTimestamp)}`}
                >
                  <span className={styles.lineTimestamp}>
                    {isCurrent ? '▶ ' : ''}{formatTime(lineTimestamp)}
                  </span>
                  <div
                    className={`${styles.lyricLine} ${isHovered ? styles.lyricLineHovered : ''} ${
                      isCurrent || isPlaying ? styles.lyricLineActive : ''
                    } ${styles.sansFont}`}
                  >
                    {line.split('').map((char, charIndex) => (
                      <span
                        key={charIndex}
                        ref={(el) => {
                          const key = `${lineIndex}-${charIndex}`;
                          if (el) {
                            charElementsMap.current.set(key, el);
                          } else {
                            charElementsMap.current.delete(key);
                          }
                        }}
                        data-lineindex={lineIndex}
                        data-charindex={charIndex}
                        data-animtype={lineAnim}
                        className={styles.charSpan}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Bottom Course & Copyright Tag */}
        <footer className={styles.footerContainer}>
          <span className={styles.footerText}>© 2026 Yiping Dong</span>
          <span className={styles.footerTag}>03 / Experiment</span>
        </footer>
      </div>

      {/* Floating Bottom Sticky Audio Bar */}
      <aside className={styles.playerStickyBar}>
        <div className={styles.playerTrackMeta}>
          <img
            src={activeTrack.coverUrl}
            alt={activeTrack.title}
            className={styles.playerCover}
          />
          <div className={styles.playerTrackText}>
            <span className={styles.playerTrackTitle}>{activeTrack.title}</span>
            <span className={styles.playerTrackArtist}>{activeTrack.artist}</span>
          </div>
        </div>

        <div className={styles.playerControlsCenter}>
          <div className={styles.playerButtonsRow}>
            <button
              type="button"
              className={styles.playerNavButton}
              onClick={handlePrevTrack}
              title="Previous song"
            >
              ⏮
            </button>
            <button
              type="button"
              className={styles.playerRoundButton}
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button
              type="button"
              className={styles.playerNavButton}
              onClick={handleNextTrack}
              title={playbackMode === 'shuffle' ? "Next random song (Shuffle)" : "Next song (Loop)"}
            >
              ⏭
            </button>
            <button
              type="button"
              className={styles.playerModeButton}
              onClick={() => handleModeChange(playbackMode === 'loop' ? 'shuffle' : 'loop')}
              title={playbackMode === 'loop' ? "Loop Mode: Playing in order (Click for Shuffle)" : "Shuffle Mode: Playing randomly (Click for Loop)"}
            >
              {playbackMode === 'loop' ? '🔁' : '🔀'}
            </button>
          </div>

          <div className={styles.progressBarContainer}>
            <span className={styles.timeText}>{formatTime(currentTime)}</span>
            <div
              className={styles.progressTrack}
              onClick={(e) => {
                const totalDuration = duration || 29;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
                const seekTo = Math.round(newRatio * totalDuration * 10) / 10;

                playheadRef.current = {
                  anchorTime: seekTo,
                  anchorTimestamp: performance.now(),
                  isPlaying: true,
                  seekTarget: seekTo,
                  seekTimestamp: Date.now(),
                };

                setCurrentTime(seekTo);
                setIsPlaying(true);

                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('spotify-control-command', {
                      detail: {
                        action: 'seekAndPlay',
                        uri: activeTrack.spotifyUri,
                        id: activeTrack.id,
                        timeSec: Math.floor(seekTo),
                        timeMs: Math.round(seekTo * 1000),
                      },
                    })
                  );
                }
              }}
            >
              <div
                className={styles.progressFilled}
                style={{
                  width: `${Math.min(100, Math.max(0, (currentTime / (duration || 29)) * 100))}%`,
                }}
              />
            </div>
            <span className={styles.timeText}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Live Audio Equalizer Animation */}
        <div className={styles.equalizerContainer}>
          {isPlaying ? (
            <>
              <div className={styles.equalizerBar} />
              <div className={styles.equalizerBar} />
              <div className={styles.equalizerBar} />
              <div className={styles.equalizerBar} />
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#4A5F62', fontWeight: 600 }}>PAUSED</span>
          )}
        </div>
      </aside>
    </div>
  );
}