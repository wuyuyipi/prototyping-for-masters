import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Loop / Repeat Icon: sleek vector rounded cycle with arrowheads
export const LoopIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

// Shuffle Icon: sleek vector intertwining cross-arrows
export const ShuffleIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

// Forward / Next Track Icon: forward triangle with terminal bar
export const NextIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <polygon points="5 4 15 12 5 20 5 4" />
    <rect x="17" y="4" width="2.6" height="16" rx="1.3" />
  </svg>
);

// Previous Track Icon: terminal bar with backward triangle
export const PrevIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <polygon points="19 20 9 12 19 4 19 20" />
    <rect x="4.4" y="4" width="2.6" height="16" rx="1.3" />
  </svg>
);

// Play Icon: crisp geometric play triangle
export const PlayIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

// Pause Icon: clean dual vertical bars with soft caps
export const PauseIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <rect x="5.5" y="4" width="4.5" height="16" rx="1.5" />
    <rect x="14" y="4" width="4.5" height="16" rx="1.5" />
  </svg>
);

// Dice Icon for Randomizing / Shuffling animations
export const DiceIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="3.5" />
    <circle cx="8" cy="8" r="1.3" fill="currentColor" />
    <circle cx="16" cy="8" r="1.3" fill="currentColor" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    <circle cx="8" cy="16" r="1.3" fill="currentColor" />
    <circle cx="16" cy="16" r="1.3" fill="currentColor" />
  </svg>
);
