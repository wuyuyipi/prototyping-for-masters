import React from 'react';
import styles from './paintBackground.module.css';

export default function PaintBackground() {
  return (
    <div className={styles.canvasBackground} aria-hidden="true">
      {/* Background Watermark Typography */}
      <div className={styles.watermarkContainer}>
        <span className={styles.watermarkNumber}>2026</span>
        <span className={styles.watermarkText}>PROTOTYPES</span>
      </div>

      {/* SVG Layer: Paint Brush Strokes, Paint Splatters, and Geometric Ruler Guides */}
      <svg
        className={styles.svgLayer}
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Filter for subtle rough acrylic texture on brush strokes */}
          <filter id="brushTurbulence" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.15" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Deep Teal Paint Gradient */}
          <linearGradient id="tealPaintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B4B51" />
            <stop offset="60%" stopColor="#0E5860" />
            <stop offset="100%" stopColor="#083E43" />
          </linearGradient>

          {/* Coral Pink Paint Gradient */}
          <linearGradient id="pinkPaintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ED6A85" />
            <stop offset="100%" stopColor="#E05471" />
          </linearGradient>
        </defs>

        {/* 1. Large Deep Teal Sweeping Diagonal Paint Brush Stroke */}
        <g className={styles.brushGroupTeal} filter="url(#brushTurbulence)">
          {/* Main heavy sweep */}
          <path
            d="M-80,240 
               C120,210 320,170 540,190 
               C760,210 980,270 1220,290 
               C1420,310 1640,360 1720,410 
               L1740,540 
               C1580,510 1360,450 1140,430 
               C920,410 700,370 480,390 
               C260,410 80,480 -80,520 Z"
            fill="url(#tealPaintGrad)"
            opacity="0.94"
          />
          {/* Secondary dynamic stroke for dry-brush layered texture */}
          <path
            d="M-50,160 
               C180,140 420,110 680,140 
               C940,170 1180,240 1440,280 
               C1560,300 1680,340 1760,370
               L1730,420 
               C1600,380 1420,330 1200,300 
               C960,270 720,220 460,210 
               C220,200 40,230 -50,260 Z"
            fill="#093C41"
            opacity="0.88"
          />
          {/* Bristle dry-brush wisps & streaks */}
          <path
            d="M-30,290 C300,240 700,270 1100,350 C1350,400 1580,470 1750,560"
            stroke="#0C525A"
            strokeWidth="18"
            strokeDasharray="140, 18, 70, 24, 210, 30"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M-80,330 C250,290 600,310 1000,390 C1300,450 1520,510 1720,620"
            stroke="#083E43"
            strokeWidth="12"
            strokeDasharray="90, 25, 180, 40"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M-40,190 C320,170 750,210 1150,280 C1400,320 1600,380 1750,440"
            stroke="#0D5962"
            strokeWidth="8"
            strokeDasharray="80, 30, 120, 20"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* 2. Coral Pink Paint Stroke in Bottom Corner / Lower Edge */}
        <g className={styles.brushGroupPink} filter="url(#brushTurbulence)">
          <path
            d="M-60,780 
               C140,750 360,770 560,820 
               C700,860 840,920 980,980 
               L950,1050 
               C780,990 620,940 440,900 
               C260,860 80,870 -60,920 Z"
            fill="url(#pinkPaintGrad)"
            opacity="0.92"
          />
          <path
            d="M-40,820 C180,800 420,840 680,920 L660,960 C420,880 180,840 -40,860 Z"
            fill="#E64A6B"
            opacity="0.85"
          />
          <path
            d="M-30,760 C200,740 450,780 720,870"
            stroke="#ED6A85"
            strokeWidth="14"
            strokeDasharray="100, 25, 60, 20, 150, 35"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* 3. Authentic Paint Splatters & Droplets (Scattered across the composition) */}
        <g className={styles.splatterGroup}>
          {/* Deep Teal Splatters & Droplets */}
          <circle cx="210" cy="140" r="14" fill="#0A444A" />
          <circle cx="185" cy="120" r="6" fill="#0A444A" />
          <circle cx="235" cy="155" r="4.5" fill="#0A444A" />
          <circle cx="200" cy="175" r="3" fill="#0A444A" />
          
          <circle cx="480" cy="95" r="9" fill="#0C4F56" />
          <circle cx="505" cy="85" r="4" fill="#0C4F56" />
          <circle cx="465" cy="115" r="3" fill="#0C4F56" />

          <circle cx="1320" cy="220" r="18" fill="#0A444A" />
          <circle cx="1360" cy="205" r="7" fill="#0A444A" />
          <circle cx="1290" cy="245" r="5" fill="#0A444A" />
          <circle cx="1340" cy="260" r="3.5" fill="#0A444A" />
          <circle cx="1380" cy="190" r="2.5" fill="#0A444A" />

          <circle cx="1490" cy="380" r="12" fill="#0C4F56" />
          <circle cx="1520" cy="360" r="5" fill="#0C4F56" />
          <circle cx="1470" cy="405" r="4" fill="#0C4F56" />

          <circle cx="780" cy="440" r="8" fill="#0A444A" />
          <circle cx="800" cy="455" r="4" fill="#0A444A" />
          <circle cx="760" cy="430" r="3" fill="#0A444A" />

          <circle cx="1120" cy="510" r="15" fill="#0A444A" />
          <circle cx="1155" cy="495" r="6" fill="#0A444A" />
          <circle cx="1100" cy="535" r="4.5" fill="#0A444A" />

          {/* Coral Pink Splatters */}
          <circle cx="140" cy="690" r="11" fill="#ED6A85" />
          <circle cx="165" cy="675" r="5" fill="#ED6A85" />
          <circle cx="120" cy="715" r="4" fill="#ED6A85" />
          <circle cx="155" cy="725" r="2.5" fill="#ED6A85" />

          <circle cx="340" cy="710" r="8" fill="#ED6A85" />
          <circle cx="360" cy="695" r="3.5" fill="#ED6A85" />
          <circle cx="325" cy="730" r="2" fill="#ED6A85" />

          <circle cx="720" cy="780" r="10" fill="#ED6A85" />
          <circle cx="745" cy="765" r="4" fill="#ED6A85" />
          <circle cx="700" cy="800" r="3" fill="#ED6A85" />

          <circle cx="860" cy="860" r="13" fill="#ED6A85" />
          <circle cx="890" cy="845" r="5.5" fill="#ED6A85" />
          <circle cx="840" cy="885" r="4" fill="#ED6A85" />

          {/* White Accent Paint Spray / Droplets */}
          <circle cx="950" cy="180" r="7" fill="#FFFFFF" opacity="0.8" />
          <circle cx="970" cy="165" r="3" fill="#FFFFFF" opacity="0.8" />
          <circle cx="935" cy="195" r="2" fill="#FFFFFF" opacity="0.8" />
          
          <circle cx="620" cy="280" r="6" fill="#FFFFFF" opacity="0.75" />
          <circle cx="638" cy="270" r="2.5" fill="#FFFFFF" opacity="0.75" />

          <circle cx="1240" cy="380" r="8" fill="#FFFFFF" opacity="0.8" />
          <circle cx="1260" cy="365" r="3.5" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* 4. White Architectural Ruler Guide Lines & Circle (From Image 1) */}
        <g className={styles.guidesGroup}>
          {/* Large Thin White Circle Arc */}
          <circle
            cx="1080"
            cy="360"
            r="380"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            opacity="0.88"
          />

          {/* Slicing 14-degree Diagonal White Line */}
          <line
            x1="-100"
            y1="780"
            x2="1750"
            y2="330"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            opacity="0.92"
          />

          {/* Accent tick marks along the diagonal ruler */}
          <line x1="280" y1="675" x2="276" y2="690" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
          <line x1="560" y1="610" x2="556" y2="625" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
          <line x1="840" y1="545" x2="836" y2="560" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
          <line x1="1120" y1="480" x2="1116" y2="495" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
          <line x1="1400" y1="415" x2="1396" y2="430" stroke="#FFFFFF" strokeWidth="2" opacity="0.75" />
        </g>
      </svg>
    </div>
  );
}
