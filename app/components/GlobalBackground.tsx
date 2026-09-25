import React from 'react';
import styles from './globalBackground.module.css';

export default function GlobalBackground() {
  return (
    <>
      {/* Background "Prototypes" Typographic Watermark at top-left */}
      <div className={styles.bgPrototypesWatermark} aria-hidden="true">
        Prototypes
      </div>

      {/* Background Signature Overlay at bottom-right */}
      <div className={styles.bgSignature} aria-hidden="true">
        <img 
          src="/img/Yiping.svg" 
          alt="" 
          className={styles.bgSignatureImg} 
        />
      </div>
    </>
  );
}
