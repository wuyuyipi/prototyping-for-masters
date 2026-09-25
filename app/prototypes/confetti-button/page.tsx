"use client";

import { useState } from 'react';
import styles from './styles.module.css';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function ConfettiButtonPrototype() {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerConfetti = () => {
    setIsAnimating(true);
    
    // Confetti matching cutting-mat & riso personal branding palette
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ED6A85', '#48A7AC', '#0C4F56', '#1A2628', '#FFFFFF'],
      shapes: ['square'],
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={styles.container}>


      {/* Floating Bottom Course Tag */}
      <div className={styles.footerContainer}>
        <span className={styles.footerText}>
          © 2026 Yiping Dong
        </span>
        <span className={styles.footerTag}>02 / Interactive</span>
      </div>

      {/* Central Framed Window */}
      <div className={styles.main}>
        <Link href="/" className={styles.backButton}>
          <span>←</span>
          <span>Prototypes</span>
        </Link>

        <div className={styles.frameCard}>
          <div className={styles.categoryBadge}>
            <span className={styles.squareBullet} />
            <span>Interactive Experiment</span>
          </div>

          <h1 className={styles.title}>Congratulations!</h1>

          <p className={styles.description}>
            You have set up your first prototype repository. Click below to celebrate!
          </p>

          <button 
            className={`${styles.celebrateButton} ${isAnimating ? styles.animate : ''}`}
            onClick={triggerConfetti}
          >
            <span>Celebrate ✦</span>
          </button>
        </div>
      </div>
    </div>
  );
}