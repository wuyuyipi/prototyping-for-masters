"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./styles.module.css";
import {
  compilePromptToDoodle,
  extractReferenceVectors,
  drawPresetOverImage,
  type DrawPhase,
} from "./doodleProgram";

// Available texture mediums
type TextureMedium = "clean" | "crayon" | "pencil" | "pastel" | "watercolor" | "oil";

// Tools matching classic MS Paint
type ToolType = "pencil" | "brush" | "spray" | "bucket" | "eraser" | "picker" | "line" | "rect" | "ellipse";

// Shape fill options
type FillMode = "outline" | "filled" | "both";

// Paper grain texture options
type GrainType = "fine" | "medium" | "rough" | "canvas";

// 28 Classic MS Paint Colors
const CLASSIC_PALETTE_ROW_1 = [
  "#000000", // Black
  "#7F7F7F", // Gray
  "#880015", // Dark Red
  "#ED1C24", // Red
  "#FF7F27", // Orange
  "#FFF200", // Yellow
  "#22B14C", // Green
  "#00A2E8", // Turquoise
  "#3F48CC", // Indigo
  "#A349A4", // Purple
  "#B97A57", // Brown
  "#FFAEC9", // Rose
  "#B5E61D", // Lime
  "#99D9EA", // Light Cyan
];

const CLASSIC_PALETTE_ROW_2 = [
  "#FFFFFF", // White
  "#C3C3C3", // Light Gray
  "#A349A4", // Violet
  "#FFAEC9", // Light Pink
  "#FFC90E", // Gold
  "#EFE4B0", // Light Yellow
  "#B5E61D", // Light Lime
  "#7092BE", // Steel Blue
  "#C8BFE7", // Lavender
  "#E5AA70", // Peach
  "#D4708F", // Rose Tint
  "#1A2628", // Deep Ink (Site Theme)
  "#ED6A85", // Pink (Site Theme)
  "#0C4F56", // Dark Teal (Site Theme)
];

// Texture explanations for the banner & help modal
const TEXTURE_INFO: Record<TextureMedium, { title: string; icon: string; short: string; desc: string }> = {
  clean: {
    title: "Clean MS Paint",
    icon: "🧼",
    short: "Classic pixel-sharp strokes without medium texture.",
    desc: "Original MS Paint look with crisp, solid digital pixels and clean flat vector fills.",
  },
  crayon: {
    title: "Crayon",
    icon: "🖍️",
    short: "Waxy pigment adhering to rough paper tooth with organic skips.",
    desc: "Simulates waxy chunks adhering to the peaks of rough paper. Wax skips low paper valleys for a textured, vibrant, nostalgic crayon mark.",
  },
  pencil: {
    title: "Color Pencil",
    icon: "✏️",
    short: "45° directional cross-hatching with fine graphite grain.",
    desc: "Simulates fine colored pencil lead with subtle directional 45° tooth lines, soft pressure transparency, and visible paper sketch fibers.",
  },
  pastel: {
    title: "Pastel",
    icon: "🎨",
    short: "Velvety chalk bloom with powdery diffused edges.",
    desc: "Simulates soft chalk pastel with gentle outward edge diffusion (chalk bloom), porous dust texture, and scattered micro-particles.",
  },
  watercolor: {
    title: "Watercolor",
    icon: "💧",
    short: "Fluid wet bleeds with perimeter pigment pooling (coffee-ring effect).",
    desc: "Simulates fluid wet-on-wet pigments with darker pooling rims at stroke boundaries (the coffee-ring effect) and organic capillary bleeding.",
  },
  oil: {
    title: "Oil Paint",
    icon: "🖌️",
    short: "3D impasto brush grooves, canvas weave, and directional specular sheen.",
    desc: "Simulates rich 3D impasto oil paint with height displacement, directional lighting highlights on stroke ridges, bristle grooves, and canvas texture.",
  },
};

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

export default function DoodleCreator() {
  // Active states
  const [activeMedium, setActiveMedium] = useState<TextureMedium>("watercolor");
  const [textureIntensity, setTextureIntensity] = useState<number>(100);
  const [paperGrain, setPaperGrain] = useState<GrainType>("medium");

  const [activeTool, setActiveTool] = useState<ToolType>("brush");
  const [strokeSize, setStrokeSize] = useState<number>(5);
  const [fillMode, setFillMode] = useState<FillMode>("outline");

  const [color1, setColor1] = useState<string>("#ED1C24"); // Foreground (default red)
  const [color2, setColor2] = useState<string>("#FFFFFF"); // Background (default white)
  const [activeColorSlot, setActiveColorSlot] = useState<1 | 2>(1);

  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [drawingProgress, setDrawingProgress] = useState<number>(0);
  const [drawingStepText, setDrawingStepText] = useState<string>("✏️ Sketching rough MS Paint doodle...");
  const animFrameRef = useRef<number | null>(null);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Undo / Redo history
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // References
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const redoStackRef = useRef<ImageData[]>([]);
  const startCoordRef = useRef<{ x: number; y: number } | null>(null);
  const lastCoordRef = useRef<{ x: number; y: number } | null>(null);
  const sprayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Precomputed smooth noise tables (256x256)
  const noiseTableRef = useRef<Float32Array | null>(null);

  // Initialize Noise Grid once
  useEffect(() => {
    if (!noiseTableRef.current) {
      const size = 256;
      const raw = new Float32Array(size * size);
      for (let i = 0; i < size * size; i++) {
        raw[i] = Math.random();
      }
      const table = new Float32Array(size * size);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = (x + dx + size) % size;
              const ny = (y + dy + size) % size;
              sum += raw[ny * size + nx];
            }
          }
          const smooth = sum / 9;
          table[y * size + x] = smooth * 0.65 + raw[y * size + x] * 0.35;
        }
      }
      noiseTableRef.current = table;
    }
  }, []);

  // Save current base canvas state to Undo History
  const saveStateToUndo = useCallback(() => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const snap = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > 25) {
      undoStackRef.current.shift();
    }
    // Clear redo stack on new action
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  // Primary Texture Renderer
  const applyTextureToDisplay = useCallback(
    (medium: TextureMedium, intensityPct: number, grain: GrainType) => {
      const baseCanvas = baseCanvasRef.current;
      const displayCanvas = displayCanvasRef.current;
      if (!baseCanvas || !displayCanvas) return;

      const baseCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
      const dispCtx = displayCanvas.getContext("2d", { willReadFrequently: true });
      if (!baseCtx || !dispCtx) return;

      const width = CANVAS_WIDTH;
      const height = CANVAS_HEIGHT;
      const baseImageData = baseCtx.getImageData(0, 0, width, height);

      // If Clean MS Paint, straight copy
      if (medium === "clean") {
        dispCtx.putImageData(baseImageData, 0, 0);
        return;
      }

      const noise = noiseTableRef.current;
      if (!noise) {
        dispCtx.putImageData(baseImageData, 0, 0);
        return;
      }

      const src = baseImageData.data;
      const output = dispCtx.createImageData(width, height);
      const dst = output.data;

      const intensity = intensityPct / 100;
      const grainMult = grain === "rough" ? 1.4 : grain === "canvas" ? 1.25 : grain === "fine" ? 0.7 : 1.0;

      // ==========================================
      // TEXTURE 1: CRAYON (蜡笔)
      // Waxy texture with broken paper tooth skips
      // ==========================================
      if (medium === "crayon") {
        const threshold = 0.38 / (intensity * grainMult);
        for (let y = 0; y < height; y++) {
          const rowOffset = y * width;
          for (let x = 0; x < width; x++) {
            const idx = (rowOffset + x) * 4;
            const r = src[idx];
            const g = src[idx + 1];
            const b = src[idx + 2];
            const a = src[idx + 3];

            // Check if pixel is drawn on paper
            const isDrawn = a > 20 && (r < 250 || g < 250 || b < 250);

            if (!isDrawn) {
              // Paper background with subtle construction paper grain
              const tooth = noise[((y & 255) << 8) | (x & 255)];
              const paperShade = (tooth - 0.5) * 8 * grainMult;
              dst[idx] = Math.min(255, Math.max(0, 255 + paperShade));
              dst[idx + 1] = Math.min(255, Math.max(0, 255 + paperShade));
              dst[idx + 2] = Math.min(255, Math.max(0, 255 + paperShade));
              dst[idx + 3] = 255;
            } else {
              const tooth = noise[((y & 255) << 8) | (x & 255)];
              // Wax skip when tooth falls below threshold
              if (tooth < threshold) {
                // Paper grain peaks through
                const skipAmount = (threshold - tooth) / threshold;
                dst[idx] = Math.min(255, r + (255 - r) * skipAmount);
                dst[idx + 1] = Math.min(255, g + (255 - g) * skipAmount);
                dst[idx + 2] = Math.min(255, b + (255 - b) * skipAmount);
              } else {
                // Rich wax accumulation with slight warm saturation boost
                const waxBump = (tooth - 0.5) * 45 * intensity * grainMult;
                dst[idx] = Math.min(255, Math.max(0, r + waxBump + 3));
                dst[idx + 1] = Math.min(255, Math.max(0, g + waxBump));
                dst[idx + 2] = Math.min(255, Math.max(0, b + waxBump - 3));
              }
              dst[idx + 3] = 255;
            }
          }
        }
      }

      // ==========================================
      // TEXTURE 2: COLOR PENCIL (彩色铅笔)
      // 45° directional cross-hatch + graphite grain
      // ==========================================
      else if (medium === "pencil") {
        for (let y = 0; y < height; y++) {
          const rowOffset = y * width;
          for (let x = 0; x < width; x++) {
            const idx = (rowOffset + x) * 4;
            const r = src[idx];
            const g = src[idx + 1];
            const b = src[idx + 2];
            const a = src[idx + 3];

            const isDrawn = a > 20 && (r < 250 || g < 250 || b < 250);

            // 45-degree angle stroke tooth
            const hatch = Math.sin((x + y) * 0.8) * 0.22 + Math.cos((x - y) * 0.4) * 0.1;
            const tooth = noise[((y & 255) << 8) | (x & 255)];
            const pencilTooth = tooth * 0.55 + (hatch + 0.3) * 0.45;

            if (!isDrawn) {
              const bgPaper = (pencilTooth - 0.5) * 12 * grainMult;
              dst[idx] = Math.min(255, Math.max(0, 255 + bgPaper));
              dst[idx + 1] = Math.min(255, Math.max(0, 255 + bgPaper));
              dst[idx + 2] = Math.min(255, Math.max(0, 255 + bgPaper));
              dst[idx + 3] = 255;
            } else {
              // Semi-translucent colored pencil lead revealing paper fibers
              const skip = Math.max(0, 0.82 - pencilTooth) * 0.6 * intensity * grainMult;
              const grit = (pencilTooth - 0.5) * 35 * intensity;

              dst[idx] = Math.min(255, Math.max(0, r + (255 - r) * skip + grit));
              dst[idx + 1] = Math.min(255, Math.max(0, g + (255 - g) * skip + grit));
              dst[idx + 2] = Math.min(255, Math.max(0, b + (255 - b) * skip + grit));
              dst[idx + 3] = 255;
            }
          }
        }
      }

      // ==========================================
      // TEXTURE 3: PASTEL (粉彩 / Chalk Pastel)
      // Chalk bloom diffusion + velvety powdery grain
      // ==========================================
      else if (medium === "pastel") {
        // Fast separable blur for chalk dust diffusion
        const blurBuf = new Uint8ClampedArray(width * height * 4);
        const radius = Math.round(2 * intensity);

        // Horizontal blur pass
        for (let y = 0; y < height; y++) {
          const row = y * width;
          for (let x = 0; x < width; x++) {
            let rAcc = 0, gAcc = 0, bAcc = 0, count = 0;
            for (let dx = -radius; dx <= radius; dx++) {
              const px = Math.min(width - 1, Math.max(0, x + dx));
              const pidx = (row + px) * 4;
              rAcc += src[pidx];
              gAcc += src[pidx + 1];
              bAcc += src[pidx + 2];
              count++;
            }
            const bidx = (row + x) * 4;
            blurBuf[bidx] = rAcc / count;
            blurBuf[bidx + 1] = gAcc / count;
            blurBuf[bidx + 2] = bAcc / count;
          }
        }

        for (let y = 0; y < height; y++) {
          const rowOffset = y * width;
          for (let x = 0; x < width; x++) {
            const idx = (rowOffset + x) * 4;
            const r = src[idx];
            const g = src[idx + 1];
            const b = src[idx + 2];
            const a = src[idx + 3];

            const br = blurBuf[idx];
            const bg = blurBuf[idx + 1];
            const bb = blurBuf[idx + 2];

            const isDrawn = a > 20 && (r < 250 || g < 250 || b < 250);
            const tooth = noise[((y & 255) << 8) | (x & 255)];
            const chalkGrain = (tooth - 0.5) * 36 * intensity * grainMult;

            if (!isDrawn) {
              // Soft chalk halo near borders
              if (br < 248 || bg < 248 || bb < 248) {
                const haloFade = 0.55 * intensity;
                dst[idx] = Math.min(255, Math.max(0, 255 - (255 - br) * haloFade + chalkGrain));
                dst[idx + 1] = Math.min(255, Math.max(0, 255 - (255 - bg) * haloFade + chalkGrain));
                dst[idx + 2] = Math.min(255, Math.max(0, 255 - (255 - bb) * haloFade + chalkGrain));
              } else {
                const bgPaper = (tooth - 0.5) * 6 * grainMult;
                dst[idx] = Math.min(255, Math.max(0, 255 + bgPaper));
                dst[idx + 1] = Math.min(255, Math.max(0, 255 + bgPaper));
                dst[idx + 2] = Math.min(255, Math.max(0, 255 + bgPaper));
              }
              dst[idx + 3] = 255;
            } else {
              // Velvety blend of original pigment and diffused chalk bloom
              const blendedR = r * 0.65 + br * 0.35;
              const blendedG = g * 0.65 + bg * 0.35;
              const blendedB = b * 0.65 + bb * 0.35;

              dst[idx] = Math.min(255, Math.max(0, blendedR + chalkGrain));
              dst[idx + 1] = Math.min(255, Math.max(0, blendedG + chalkGrain));
              dst[idx + 2] = Math.min(255, Math.max(0, blendedB + chalkGrain));
              dst[idx + 3] = 255;
            }
          }
        }
      }

      // ==========================================
      // TEXTURE 4: WATERCOLOR (水彩)
      // Coffee-ring wet-edge pooling + fluid bleed
      // ==========================================
      else if (medium === "watercolor") {
        // Pre-detect stroke boundaries for pigment pooling
        const isPaint = new Uint8Array(width * height);
        for (let i = 0; i < width * height; i++) {
          const idx = i * 4;
          if (src[idx + 3] > 20 && (src[idx] < 248 || src[idx + 1] < 248 || src[idx + 2] < 248)) {
            isPaint[i] = 1;
          }
        }

        const isEdge = new Uint8Array(width * height);
        for (let y = 1; y < height - 1; y++) {
          const row = y * width;
          for (let x = 1; x < width - 1; x++) {
            const i = row + x;
            if (isPaint[i]) {
              // Check 4 neighbors
              if (!isPaint[i - 1] || !isPaint[i + 1] || !isPaint[i - width] || !isPaint[i + width]) {
                isEdge[i] = 2; // Immediate boundary
              } else if (
                !isPaint[i - 2] || !isPaint[i + 2] || !isPaint[i - width * 2] || !isPaint[i + width * 2]
              ) {
                isEdge[i] = 1; // Sub-boundary
              }
            }
          }
        }

        for (let y = 0; y < height; y++) {
          const rowOffset = y * width;
          for (let x = 0; x < width; x++) {
            const pIdx = rowOffset + x;
            const idx = pIdx * 4;

            // Organic capillary wobble displacement
            const wobbleX = Math.round(
              Math.sin(y * 0.045) * 2.2 * intensity + Math.cos(x * 0.035) * 1.2
            );
            const wobbleY = Math.round(
              Math.cos(x * 0.045) * 2.2 * intensity + Math.sin(y * 0.035) * 1.2
            );

            const sx = Math.min(width - 1, Math.max(0, x + wobbleX));
            const sy = Math.min(height - 1, Math.max(0, y + wobbleY));
            const sampleIdx = (sy * width + sx) * 4;

            const r = src[sampleIdx];
            const g = src[sampleIdx + 1];
            const b = src[sampleIdx + 2];
            const a = src[sampleIdx + 3];

            const drawn = a > 20 && (r < 248 || g < 248 || b < 248);
            const tooth = noise[((y & 255) << 8) | (x & 255)];
            const paperGranulation = (tooth - 0.5) * 32 * intensity * grainMult;

            if (!drawn) {
              // Cold-press dimpled watercolor paper background
              const bgPaper = (tooth - 0.5) * 10 * grainMult;
              dst[idx] = Math.min(255, Math.max(0, 255 + bgPaper));
              dst[idx + 1] = Math.min(255, Math.max(0, 255 + bgPaper));
              dst[idx + 2] = Math.min(255, Math.max(0, 255 + bgPaper));
              dst[idx + 3] = 255;
            } else {
              // Coffee-ring effect: darken pigment accumulation along stroke edges
              const edgeType = isEdge[pIdx];
              let darken = 1.0;
              if (edgeType === 2) {
                darken = 1.0 - 0.36 * intensity; // Strong dark perimeter rim
              } else if (edgeType === 1) {
                darken = 1.0 - 0.18 * intensity;
              }

              // Translucent glaze luminosity
              const outR = Math.min(255, Math.max(0, r * darken + paperGranulation));
              const outG = Math.min(255, Math.max(0, g * darken + paperGranulation));
              const outB = Math.min(255, Math.max(0, b * darken + paperGranulation));

              dst[idx] = outR;
              dst[idx + 1] = outG;
              dst[idx + 2] = outB;
              dst[idx + 3] = 255;
            }
          }
        }
      }

      // ==========================================
      // TEXTURE 5: OIL PAINT (油画)
      // 3D impasto light glints + bristle ridges
      // ==========================================
      else if (medium === "oil") {
        // Height calculation: paint thickness
        const heightMap = new Float32Array(width * height);
        for (let i = 0; i < width * height; i++) {
          const idx = i * 4;
          if (src[idx + 3] > 20 && (src[idx] < 250 || src[idx + 1] < 250 || src[idx + 2] < 250)) {
            // Darker colors or dense strokes have physical body
            const lum = (255 - (src[idx] + src[idx + 1] + src[idx + 2]) / 3) / 255;
            heightMap[i] = 0.5 + lum * 0.5;
          }
        }

        // Directional light vector from upper-left
        const lx = -0.577;
        const ly = -0.577;
        const lz = 0.577;

        for (let y = 1; y < height - 1; y++) {
          const rowOffset = y * width;
          for (let x = 1; x < width - 1; x++) {
            const pIdx = rowOffset + x;
            const idx = pIdx * 4;

            const r = src[idx];
            const g = src[idx + 1];
            const b = src[idx + 2];
            const a = src[idx + 3];

            const isDrawn = a > 20 && (r < 250 || g < 250 || b < 250);

            // Linen canvas weave pattern
            const weave = (Math.sin(x * 1.1) * Math.sin(y * 1.1)) * 9 * grainMult;

            if (!isDrawn) {
              const tooth = noise[((y & 255) << 8) | (x & 255)];
              const canvasShade = (tooth - 0.5) * 8 + weave;
              dst[idx] = Math.min(255, Math.max(0, 255 + canvasShade));
              dst[idx + 1] = Math.min(255, Math.max(0, 255 + canvasShade));
              dst[idx + 2] = Math.min(255, Math.max(0, 255 + canvasShade));
              dst[idx + 3] = 255;
            } else {
              // Bristle ridges
              const bristle =
                Math.sin((x * 0.35 - y * 0.25) * 1.6) * 0.16 +
                Math.cos((x * 0.18 + y * 0.45) * 1.3) * 0.09;

              // Height gradient (Normal calculation)
              const dzdx = (heightMap[pIdx + 1] - heightMap[pIdx - 1]) + bristle * 0.3;
              const dzdy = (heightMap[pIdx + width] - heightMap[pIdx - width]) + bristle * 0.3;

              let nx = -dzdx * 2.8 * intensity;
              let ny = -dzdy * 2.8 * intensity;
              let nz = 1.0;
              const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
              nx /= len;
              ny /= len;
              nz /= len;

              // Diffuse reflection
              const diffuse = Math.max(0, nx * lx + ny * ly + nz * lz);
              const diffuseFactor = 0.8 + (diffuse - 0.5) * 0.65 * intensity;

              // Specular shine on paint ridges
              const reflectZ = 2 * diffuse * nz - lz;
              const specular = Math.pow(Math.max(0, reflectZ), 14) * 115 * intensity;

              dst[idx] = Math.min(255, Math.max(0, r * diffuseFactor + specular + weave * 0.5));
              dst[idx + 1] = Math.min(255, Math.max(0, g * diffuseFactor + specular + weave * 0.5));
              dst[idx + 2] = Math.min(255, Math.max(0, b * diffuseFactor + specular + weave * 0.5));
              dst[idx + 3] = 255;
            }
          }
        }
      }

      dispCtx.putImageData(output, 0, 0);
    },
    []
  );

  // Initialize Canvas and draw default cute starter doodle
  useEffect(() => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;

    baseCanvas.width = CANVAS_WIDTH;
    baseCanvas.height = CANVAS_HEIGHT;

    const displayCanvas = displayCanvasRef.current;
    if (displayCanvas) {
      displayCanvas.width = CANVAS_WIDTH;
      displayCanvas.height = CANVAS_HEIGHT;
    }

    const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Fill with pure white
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw starter doodle (Cute Whimsical Cat)
    drawPresetCat(ctx);

    // Save initial state to undo
    saveStateToUndo();

    // Render active texture
    applyTextureToDisplay("watercolor", 100, "medium");
  }, [applyTextureToDisplay, saveStateToUndo]);

  // Re-render when medium, intensity or grain changes
  const handleMediumChange = (medium: TextureMedium) => {
    setActiveMedium(medium);
    applyTextureToDisplay(medium, textureIntensity, paperGrain);
  };

  const handleIntensityChange = (val: number) => {
    setTextureIntensity(val);
    applyTextureToDisplay(activeMedium, val, paperGrain);
  };

  const handleGrainChange = (val: GrainType) => {
    setPaperGrain(val);
    applyTextureToDisplay(activeMedium, textureIntensity, val);
  };

  // Preset Drawing Functions
  const drawPresetCat = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Soft ground shadow
    ctx.beginPath();
    ctx.ellipse(400, 420, 160, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#DDE5E7";
    ctx.fill();

    // Cat Body
    ctx.beginPath();
    ctx.ellipse(400, 310, 85, 110, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FF7F27"; // Orange tabby
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Cat White Chest
    ctx.beginPath();
    ctx.ellipse(400, 335, 45, 65, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Cat Head
    ctx.beginPath();
    ctx.ellipse(400, 185, 90, 75, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#FF7F27";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Ears (Outer)
    ctx.beginPath();
    ctx.moveTo(330, 140);
    ctx.lineTo(315, 65);
    ctx.lineTo(380, 115);
    ctx.closePath();
    ctx.fillStyle = "#FF7F27";
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(470, 140);
    ctx.lineTo(485, 65);
    ctx.lineTo(420, 115);
    ctx.closePath();
    ctx.fillStyle = "#FF7F27";
    ctx.fill();
    ctx.stroke();

    // Ears (Inner Pink)
    ctx.beginPath();
    ctx.moveTo(338, 130);
    ctx.lineTo(326, 82);
    ctx.lineTo(370, 115);
    ctx.closePath();
    ctx.fillStyle = "#FFAEC9";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(462, 130);
    ctx.lineTo(474, 82);
    ctx.lineTo(430, 115);
    ctx.closePath();
    ctx.fillStyle = "#FFAEC9";
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.ellipse(365, 175, 12, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(435, 175, 12, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#22B14C"; // Green eyes
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Pupils
    ctx.beginPath();
    ctx.ellipse(366, 175, 6, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(434, 175, 6, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1A2628";
    ctx.fill();

    // Eye catchlights
    ctx.beginPath();
    ctx.arc(363, 170, 3, 0, Math.PI * 2);
    ctx.arc(431, 170, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.moveTo(400, 195);
    ctx.lineTo(392, 185);
    ctx.lineTo(408, 185);
    ctx.closePath();
    ctx.fillStyle = "#ED6A85";
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(393, 204, 8, Math.PI * 0.1, Math.PI * 0.9);
    ctx.arc(407, 204, 8, Math.PI * 0.1, Math.PI * 0.9);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Whiskers
    ctx.beginPath();
    ctx.moveTo(350, 195);
    ctx.lineTo(290, 185);
    ctx.moveTo(350, 202);
    ctx.lineTo(285, 205);
    ctx.moveTo(350, 210);
    ctx.lineTo(295, 222);

    ctx.moveTo(450, 195);
    ctx.lineTo(510, 185);
    ctx.moveTo(450, 202);
    ctx.lineTo(515, 205);
    ctx.moveTo(450, 210);
    ctx.lineTo(505, 222);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Collar
    ctx.beginPath();
    ctx.ellipse(400, 255, 60, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ED1C24";
    ctx.fill();
    ctx.stroke();

    // Bell
    ctx.beginPath();
    ctx.arc(400, 275, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#FFC90E"; // Gold bell
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(475, 360);
    ctx.bezierCurveTo(570, 370, 560, 260, 510, 250);
    ctx.lineWidth = 20;
    ctx.strokeStyle = "#FF7F27";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Little hearts above
    ctx.fillStyle = "#ED6A85";
    ctx.beginPath();
    ctx.arc(295, 120, 10, 0, Math.PI * 2);
    ctx.arc(310, 120, 10, 0, Math.PI * 2);
    ctx.lineTo(302, 138);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const drawPresetFlowers = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Rolling green hills
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.bezierCurveTo(240, 320, 520, 410, 800, 340);
    ctx.lineTo(800, 500);
    ctx.lineTo(0, 500);
    ctx.closePath();
    ctx.fillStyle = "#B5E61D"; // Light lime
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.bezierCurveTo(280, 440, 560, 370, 800, 410);
    ctx.lineTo(800, 500);
    ctx.lineTo(0, 500);
    ctx.closePath();
    ctx.fillStyle = "#22B14C"; // Green
    ctx.fill();
    ctx.stroke();

    // Smiling Sun
    ctx.beginPath();
    ctx.arc(140, 120, 55, 0, Math.PI * 2);
    ctx.fillStyle = "#FFF200";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Sun Rays
    const rays = [
      [140, 45, 140, 25],
      [195, 65, 215, 45],
      [215, 120, 235, 120],
      [195, 175, 215, 195],
      [140, 195, 140, 215],
      [85, 175, 65, 195],
      [65, 120, 45, 120],
      [85, 65, 65, 45],
    ];
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#FF7F27";
    ctx.lineCap = "round";
    rays.forEach(([x1, y1, x2, y2]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Sun Face
    ctx.beginPath();
    ctx.arc(125, 115, 5, 0, Math.PI * 2);
    ctx.arc(155, 115, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#1A2628";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(140, 128, 14, Math.PI * 0.15, Math.PI * 0.85);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Flower 1 (Red Tulip)
    ctx.beginPath();
    ctx.moveTo(250, 430);
    ctx.quadraticCurveTo(245, 330, 260, 270);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#22B14C";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(260, 245, 32, 0, Math.PI);
    ctx.lineTo(235, 220);
    ctx.lineTo(260, 235);
    ctx.lineTo(285, 220);
    ctx.closePath();
    ctx.fillStyle = "#ED1C24";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Flower 2 (Daisy)
    ctx.beginPath();
    ctx.moveTo(430, 460);
    ctx.quadraticCurveTo(440, 360, 430, 290);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#22B14C";
    ctx.stroke();

    // Daisy Petals
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const px = 430 + Math.cos(angle) * 36;
      const py = 290 + Math.sin(angle) * 36;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#1A2628";
      ctx.stroke();
    }
    // Center
    ctx.beginPath();
    ctx.arc(430, 290, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#FFC90E";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Flower 3 (Purple Bellflower)
    ctx.beginPath();
    ctx.moveTo(620, 420);
    ctx.quadraticCurveTo(600, 330, 610, 260);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#22B14C";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(610, 230, 35, 0, Math.PI * 2);
    ctx.fillStyle = "#A349A4";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Butterfly
    ctx.beginPath();
    ctx.ellipse(680, 140, 24, 16, Math.PI * 0.25, 0, Math.PI * 2);
    ctx.ellipse(710, 140, 24, 16, -Math.PI * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "#00A2E8";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    ctx.restore();
  };

  const drawPresetCafe = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Table Surface
    ctx.beginPath();
    ctx.moveTo(0, 390);
    ctx.lineTo(800, 390);
    ctx.lineTo(800, 500);
    ctx.lineTo(0, 500);
    ctx.closePath();
    ctx.fillStyle = "#E5AA70"; // Warm table
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Saucer
    ctx.beginPath();
    ctx.ellipse(310, 385, 110, 25, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#99D9EA";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Cup Body
    ctx.beginPath();
    ctx.moveTo(230, 270);
    ctx.bezierCurveTo(235, 380, 385, 380, 390, 270);
    ctx.closePath();
    ctx.fillStyle = "#00A2E8";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Cup Rim (Coffee inside)
    ctx.beginPath();
    ctx.ellipse(310, 270, 80, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#880015"; // Rich coffee
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Foam Heart Latte Art
    ctx.beginPath();
    ctx.arc(300, 268, 12, 0, Math.PI * 2);
    ctx.arc(320, 268, 12, 0, Math.PI * 2);
    ctx.lineTo(310, 284);
    ctx.closePath();
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Cup Handle
    ctx.beginPath();
    ctx.arc(405, 315, 25, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#00A2E8";
    ctx.stroke();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Steam Swirls
    ctx.beginPath();
    ctx.moveTo(280, 220);
    ctx.bezierCurveTo(270, 180, 310, 150, 290, 120);
    ctx.moveTo(330, 220);
    ctx.bezierCurveTo(340, 175, 310, 150, 335, 115);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#7092BE";
    ctx.lineCap = "round";
    ctx.stroke();

    // Pink Frosted Donut
    // Outer Dough
    ctx.beginPath();
    ctx.ellipse(540, 345, 80, 70, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#B97A57"; // Golden fried dough
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Pink Icing
    ctx.beginPath();
    ctx.ellipse(540, 340, 75, 62, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ED6A85"; // Pink icing
    ctx.fill();

    // Donut Hole
    ctx.beginPath();
    ctx.ellipse(540, 345, 26, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#E5AA70";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#1A2628";
    ctx.stroke();

    // Sprinkles on Donut
    const sprinkleColors = ["#FFF200", "#FFFFFF", "#22B14C", "#00A2E8", "#A349A4"];
    const sprinklePositions = [
      [500, 305, 0.4],
      [530, 295, -0.2],
      [570, 305, 0.7],
      [590, 335, 0.1],
      [580, 375, -0.6],
      [540, 390, 0.3],
      [495, 365, -0.3],
      [480, 335, 0.5],
      [515, 325, 0.8],
      [560, 330, -0.4],
    ];

    sprinklePositions.forEach(([sx, sy, rot], idx) => {
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(rot);
      ctx.fillStyle = sprinkleColors[idx % sprinkleColors.length];
      ctx.fillRect(-6, -2.5, 12, 5);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#1A2628";
      ctx.strokeRect(-6, -2.5, 12, 5);
      ctx.restore();
    });

    ctx.restore();
  };

  // Delegate procedural doodle compilation to standalone doodleProgram.ts
  const drawPromptDoodle = (
    prompt: string,
    ctx: CanvasRenderingContext2D,
    phase: DrawPhase = "full"
  ) => {
    return compilePromptToDoodle(prompt, ctx, phase);
  };

  // Uses the preset program to draw over any reference image in the authentic MS Paint style
  const drawOverReferenceImage = useCallback(
    (img: HTMLImageElement, label: string): Promise<void> => {
      return new Promise((resolve) => {
        const baseCanvas = baseCanvasRef.current;
        const displayCanvas = displayCanvasRef.current;
        if (!baseCanvas || !displayCanvas) {
          resolve();
          return;
        }

        const baseCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
        const dispCtx = displayCanvas.getContext("2d", { willReadFrequently: true });
        if (!baseCtx || !dispCtx) {
          resolve();
          return;
        }

        setIsGeneratingPrompt(true);
        setDrawingProgress(20);
        setDrawingStepText(`✏️ Tracing rough pencil draft of ${label}...`);

        // 1. Extract vector contours & quantized palette flats from reference image
        const vectorData = extractReferenceVectors(img);

        // 2. Draft Phase: draw faint blue pencil sketch along contours
        drawPresetOverImage(vectorData, baseCtx, "draft");
        dispCtx.drawImage(baseCanvas, 0, 0);

        // 3. Inking Phase: stroke bold black MS Paint outlines over the sketch
        setTimeout(() => {
          setDrawingProgress(55);
          setDrawingStepText("🖋️ Inking bold MS Paint outlines...");
          drawPresetOverImage(vectorData, baseCtx, "ink");
          dispCtx.drawImage(baseCanvas, 0, 0);

          // 4. Fill Phase: pour flat color bucket fills
          setTimeout(() => {
            setDrawingProgress(85);
            setDrawingStepText(`🪣 Pouring color fills for ${label}...`);
            drawPresetOverImage(vectorData, baseCtx, "fill");
            dispCtx.drawImage(baseCanvas, 0, 0);

            // 5. Texture Phase: complete doodle & apply active artistic medium
            setTimeout(() => {
              setDrawingProgress(100);
              setDrawingStepText(`🎨 Applying tactile ${activeMedium} texture...`);
              drawPresetOverImage(vectorData, baseCtx, "full");

              saveStateToUndo();
              applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);

              setTimeout(() => {
                setIsGeneratingPrompt(false);
                setDrawingProgress(0);
                resolve();
              }, 250);
            }, 350);
          }, 350);
        }, 350);
      });
    },
    [activeMedium, textureIntensity, paperGrain, applyTextureToDisplay, saveStateToUndo]
  );

  // Animated procedural doodle generator with live drawing phases (draft -> ink -> fill -> texture)
  const animatePromptDrawing = useCallback(
    (promptText: string): Promise<void> => {
      return new Promise((resolve) => {
        const baseCanvas = baseCanvasRef.current;
        const displayCanvas = displayCanvasRef.current;
        if (!baseCanvas || !displayCanvas) {
          resolve();
          return;
        }

        const baseCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
        const dispCtx = displayCanvas.getContext("2d", { willReadFrequently: true });
        if (!baseCtx || !dispCtx) {
          resolve();
          return;
        }

        const cleanPrompt = promptText.trim();
        setIsGeneratingPrompt(true);
        setDrawingProgress(5);
        // Initial draft phase
        const info = drawPromptDoodle(cleanPrompt, baseCtx, "draft");
        dispCtx.drawImage(baseCanvas, 0, 0);

        const subjectName = info?.title || cleanPrompt;
        setDrawingStepText(`✏️ Sketching rough draft of ${subjectName}...`);

        const startTime = performance.now();
        const duration = 1400; // ms

        let currentPhase: DrawPhase = "draft";

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(100, Math.round((elapsed / duration) * 100));
          setDrawingProgress(progress);

          if (progress < 35) {
            if (currentPhase !== "draft") {
              currentPhase = "draft";
              setDrawingStepText(`✏️ Sketching rough pencil draft of ${subjectName}...`);
              drawPromptDoodle(cleanPrompt, baseCtx, "draft");
              dispCtx.drawImage(baseCanvas, 0, 0);
            }
          } else if (progress < 70) {
            if (currentPhase !== "ink") {
              currentPhase = "ink";
              setDrawingStepText("🖋️ Inking bold MS Paint outlines...");
              drawPromptDoodle(cleanPrompt, baseCtx, "ink");
              dispCtx.drawImage(baseCanvas, 0, 0);
            }
          } else if (progress < 95) {
            if (currentPhase !== "fill") {
              currentPhase = "fill";
              setDrawingStepText(`🪣 Pouring color fills for ${subjectName}...`);
              drawPromptDoodle(cleanPrompt, baseCtx, "fill");
              dispCtx.drawImage(baseCanvas, 0, 0);
            }
          }

          if (elapsed < duration) {
            animFrameRef.current = requestAnimationFrame(tick);
          } else {
            // Finalize doodle
            setDrawingProgress(100);
            setDrawingStepText("🎨 Applying tactile medium texture...");
            drawPromptDoodle(cleanPrompt, baseCtx, "full");
            saveStateToUndo();
            applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);

            setTimeout(() => {
              setIsGeneratingPrompt(false);
              setDrawingProgress(0);
              resolve();
            }, 250);
          }
        };

        animFrameRef.current = requestAnimationFrame(tick);
      });
    },
    [activeMedium, textureIntensity, paperGrain, applyTextureToDisplay, saveStateToUndo]
  );

  // Searches the term, retrieves reference image, and uses preset program to draw over that image
  const handleGeneratePromptDoodle = async (promptText: string) => {
    if (!promptText || !promptText.trim()) return;
    const cleanPrompt = promptText.trim();
    setIsGeneratingPrompt(true);
    setDrawingProgress(10);
    setDrawingStepText(`🔍 Searching reference image for "${cleanPrompt}"...`);

    let progressTimer: ReturnType<typeof setInterval> | null = null;
    let currentPct = 10;
    progressTimer = setInterval(() => {
      currentPct = Math.min(30, currentPct + 3);
      setDrawingProgress(currentPct);
    }, 300);

    try {
      // 1. Search reference image for user prompt
      const res = await fetch("/api/draw-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });

      if (progressTimer) clearInterval(progressTimer);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.image) {
          const img = new Image();
          img.onload = () => {
            // 2. Use the preset program to draw over that image!
            drawOverReferenceImage(img, cleanPrompt);
          };
          img.src = data.image;
          return;
        }
      }
    } catch (err) {
      console.warn("Reference image search error, falling back to local drawing engine:", err);
    }

    if (progressTimer) clearInterval(progressTimer);

    // Fallback: draw directly with local preset program if search was unreachable
    await animatePromptDrawing(cleanPrompt);
  };

  // Upload custom reference image from user device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        drawOverReferenceImage(img, fileName);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLoadPreset = (preset: "cat" | "flowers" | "cafe") => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    if (preset === "cat") drawPresetCat(ctx);
    if (preset === "flowers") drawPresetFlowers(ctx);
    if (preset === "cafe") drawPresetCafe(ctx);

    saveStateToUndo();
    applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);
  };

  const handleClearCanvas = () => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    saveStateToUndo();
    applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);
  };

  // Undo / Redo Actions
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length <= 1) return;
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const current = undoStackRef.current.pop();
    if (current) {
      redoStackRef.current.push(current);
    }
    const previous = undoStackRef.current[undoStackRef.current.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);
    }

    setCanUndo(undoStackRef.current.length > 1);
    setCanRedo(redoStackRef.current.length > 0);
  }, [activeMedium, textureIntensity, paperGrain, applyTextureToDisplay]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const next = redoStackRef.current.pop();
    if (next) {
      undoStackRef.current.push(next);
      ctx.putImageData(next, 0, 0);
      applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);
    }

    setCanUndo(undoStackRef.current.length > 1);
    setCanRedo(redoStackRef.current.length > 0);
  }, [activeMedium, textureIntensity, paperGrain, applyTextureToDisplay]);

  // Keyboard Shortcuts (Undo, Redo, Tools)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === "p") {
        setActiveTool("pencil");
      } else if (e.key.toLowerCase() === "b") {
        setActiveTool("brush");
      } else if (e.key.toLowerCase() === "e") {
        setActiveTool("eraser");
      } else if (e.key.toLowerCase() === "f") {
        setActiveTool("bucket");
      } else if (e.key.toLowerCase() === "a") {
        setActiveTool("spray");
      } else if (e.key.toLowerCase() === "l") {
        setActiveTool("line");
      } else if (e.key.toLowerCase() === "r") {
        setActiveTool("rect");
      } else if (e.key.toLowerCase() === "o") {
        setActiveTool("ellipse");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  // Flood Fill Algorithm (BFS on Uint32 Typed Buffer)
  const floodFill = (startX: number, startY: number, fillColorHex: string) => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const data = imgData.data;

    const startIdx = (startY * CANVAS_WIDTH + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];

    // Convert fillColorHex to RGB
    const fillR = parseInt(fillColorHex.slice(1, 3), 16);
    const fillG = parseInt(fillColorHex.slice(3, 5), 16);
    const fillB = parseInt(fillColorHex.slice(5, 7), 16);

    // If identical, return
    if (
      Math.abs(targetR - fillR) < 5 &&
      Math.abs(targetG - fillG) < 5 &&
      Math.abs(targetB - fillB) < 5 &&
      targetA === 255
    ) {
      return;
    }

    const colorMatch = (idx: number) => {
      const dr = Math.abs(data[idx] - targetR);
      const dg = Math.abs(data[idx + 1] - targetG);
      const db = Math.abs(data[idx + 2] - targetB);
      return dr + dg + db <= 36; // tolerance
    };

    const queue = new Int32Array(CANVAS_WIDTH * CANVAS_HEIGHT);
    let head = 0;
    let tail = 0;

    queue[tail++] = (startY << 16) | startX;
    const visited = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT);
    visited[startY * CANVAS_WIDTH + startX] = 1;

    while (head < tail) {
      const pos = queue[head++];
      const x = pos & 0xffff;
      const y = pos >> 16;
      const currentIdx = (y * CANVAS_WIDTH + x) * 4;

      data[currentIdx] = fillR;
      data[currentIdx + 1] = fillG;
      data[currentIdx + 2] = fillB;
      data[currentIdx + 3] = 255;

      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < CANVAS_WIDTH && ny >= 0 && ny < CANVAS_HEIGHT) {
          const nPixel = ny * CANVAS_WIDTH + nx;
          if (!visited[nPixel]) {
            visited[nPixel] = 1;
            const nIdx = nPixel * 4;
            if (colorMatch(nIdx)) {
              queue[tail++] = (ny << 16) | nx;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    saveStateToUndo();
    applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);
  };

  // Spray can tool generator
  const sprayDots = (x: number, y: number, color: string, radius: number) => {
    const baseCanvas = baseCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    if (!baseCanvas || !displayCanvas) return;
    const bCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
    const dCtx = displayCanvas.getContext("2d", { willReadFrequently: true });
    if (!bCtx || !dCtx) return;

    const density = radius * 4;
    bCtx.fillStyle = color;
    dCtx.fillStyle = color;

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const dotX = x + Math.cos(angle) * r;
      const dotY = y + Math.sin(angle) * r;

      bCtx.fillRect(dotX, dotY, 1.5, 1.5);
      dCtx.fillRect(dotX, dotY, 1.5, 1.5);
    }
  };

  // Convert client mouse coordinates to canvas pixels
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    startCoordRef.current = { x, y };
    lastCoordRef.current = { x, y };

    const activeColor = e.button === 2 ? color2 : color1;

    // Eyedropper Tool
    if (activeTool === "picker") {
      const baseCanvas = baseCanvasRef.current;
      if (!baseCanvas) return;
      const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      if (activeColorSlot === 1) setColor1(hex);
      else setColor2(hex);
      setActiveTool("brush");
      setIsDrawing(false);
      return;
    }

    // Paint Bucket Tool
    if (activeTool === "bucket") {
      floodFill(x, y, activeColor);
      setIsDrawing(false);
      return;
    }

    // Spray Can Tool
    if (activeTool === "spray") {
      const radius = strokeSize * 2;
      sprayDots(x, y, activeColor, radius);
      sprayIntervalRef.current = setInterval(() => {
        if (lastCoordRef.current) {
          sprayDots(lastCoordRef.current.x, lastCoordRef.current.y, activeColor, radius);
        }
      }, 35);
      return;
    }

    // Freehand Brush / Pencil / Eraser initial dot
    if (activeTool === "pencil" || activeTool === "brush" || activeTool === "eraser") {
      const baseCanvas = baseCanvasRef.current;
      const displayCanvas = displayCanvasRef.current;
      if (!baseCanvas || !displayCanvas) return;
      const bCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
      const dCtx = displayCanvas.getContext("2d", { willReadFrequently: true });
      if (!bCtx || !dCtx) return;

      const size = activeTool === "pencil" ? 2 : strokeSize;
      const drawColor = activeTool === "eraser" ? "#FFFFFF" : activeColor;

      [bCtx, dCtx].forEach((ctx) => {
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = drawColor;
        ctx.fill();
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setMouseCoord({ x, y });

    if (!isDrawing) return;

    const baseCanvas = baseCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    if (!baseCanvas || !displayCanvas) return;
    const bCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
    const dCtx = displayCanvas.getContext("2d", { willReadFrequently: true });
    if (!bCtx || !dCtx) return;

    const activeColor = e.buttons === 2 ? color2 : color1;
    const drawColor = activeTool === "eraser" ? "#FFFFFF" : activeColor;
    const size = activeTool === "pencil" ? 2 : strokeSize;

    // Spray can moving
    if (activeTool === "spray") {
      lastCoordRef.current = { x, y };
      return;
    }

    // Freehand Pencil / Brush / Eraser
    if (activeTool === "pencil" || activeTool === "brush" || activeTool === "eraser") {
      const prev = lastCoordRef.current || { x, y };

      [bCtx, dCtx].forEach((ctx) => {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      });

      lastCoordRef.current = { x, y };
      return;
    }

    // Geometric Shapes Live Preview: Line, Rect, Ellipse
    if (activeTool === "line" || activeTool === "rect" || activeTool === "ellipse") {
      const start = startCoordRef.current || { x, y };

      // Redraw display canvas from base canvas + overlay rubberband shape
      dCtx.drawImage(baseCanvas, 0, 0);

      dCtx.lineWidth = strokeSize;
      dCtx.strokeStyle = drawColor;
      dCtx.fillStyle = color2;

      if (activeTool === "line") {
        dCtx.beginPath();
        dCtx.moveTo(start.x, start.y);
        dCtx.lineTo(x, y);
        dCtx.stroke();
      } else if (activeTool === "rect") {
        const rx = Math.min(start.x, x);
        const ry = Math.min(start.y, y);
        const rw = Math.abs(x - start.x);
        const rh = Math.abs(y - start.y);

        if (fillMode === "filled") {
          dCtx.fillStyle = drawColor;
          dCtx.fillRect(rx, ry, rw, rh);
        } else if (fillMode === "both") {
          dCtx.fillRect(rx, ry, rw, rh);
          dCtx.strokeRect(rx, ry, rw, rh);
        } else {
          dCtx.strokeRect(rx, ry, rw, rh);
        }
      } else if (activeTool === "ellipse") {
        const cx = (start.x + x) / 2;
        const cy = (start.y + y) / 2;
        const rx = Math.abs(x - start.x) / 2;
        const ry = Math.abs(y - start.y) / 2;

        dCtx.beginPath();
        dCtx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);

        if (fillMode === "filled") {
          dCtx.fillStyle = drawColor;
          dCtx.fill();
        } else if (fillMode === "both") {
          dCtx.fill();
          dCtx.stroke();
        } else {
          dCtx.stroke();
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (sprayIntervalRef.current) {
      clearInterval(sprayIntervalRef.current);
      sprayIntervalRef.current = null;
    }

    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;
    const bCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
    if (!bCtx) return;

    const { x, y } = getCanvasCoords(e);
    const activeColor = e.button === 2 ? color2 : color1;
    const drawColor = activeTool === "eraser" ? "#FFFFFF" : activeColor;

    // Finalize shape onto Base Canvas
    if (activeTool === "line" || activeTool === "rect" || activeTool === "ellipse") {
      const start = startCoordRef.current || { x, y };
      bCtx.lineWidth = strokeSize;
      bCtx.strokeStyle = drawColor;
      bCtx.fillStyle = color2;

      if (activeTool === "line") {
        bCtx.beginPath();
        bCtx.moveTo(start.x, start.y);
        bCtx.lineTo(x, y);
        bCtx.stroke();
      } else if (activeTool === "rect") {
        const rx = Math.min(start.x, x);
        const ry = Math.min(start.y, y);
        const rw = Math.abs(x - start.x);
        const rh = Math.abs(y - start.y);

        if (fillMode === "filled") {
          bCtx.fillStyle = drawColor;
          bCtx.fillRect(rx, ry, rw, rh);
        } else if (fillMode === "both") {
          bCtx.fillRect(rx, ry, rw, rh);
          bCtx.strokeRect(rx, ry, rw, rh);
        } else {
          bCtx.strokeRect(rx, ry, rw, rh);
        }
      } else if (activeTool === "ellipse") {
        const cx = (start.x + x) / 2;
        const cy = (start.y + y) / 2;
        const rx = Math.abs(x - start.x) / 2;
        const ry = Math.abs(y - start.y) / 2;

        bCtx.beginPath();
        bCtx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);

        if (fillMode === "filled") {
          bCtx.fillStyle = drawColor;
          bCtx.fill();
        } else if (fillMode === "both") {
          bCtx.fill();
          bCtx.stroke();
        } else {
          bCtx.stroke();
        }
      }
    }

    // Save stroke to undo history
    saveStateToUndo();

    // Run medium texture refinement pass
    applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);

    startCoordRef.current = null;
    lastCoordRef.current = null;
  };

  const handlePointerLeave = () => {
    setMouseCoord(null);
    if (isDrawing) {
      if (sprayIntervalRef.current) {
        clearInterval(sprayIntervalRef.current);
        sprayIntervalRef.current = null;
      }
      setIsDrawing(false);
      saveStateToUndo();
      applyTextureToDisplay(activeMedium, textureIntensity, paperGrain);
    }
  };

  // Save / Download PNG
  const handleSaveImage = () => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const link = document.createElement("a");
    link.download = `doodle-creator-${activeMedium}.png`;
    link.href = displayCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={styles.container}>
      {/* Floating Bottom Course & Copyright Tag */}
      <div className={styles.footerContainer}>
        <span className={styles.footerText}>© 2026 Yiping Dong</span>
        <span className={styles.footerTag}>04 / Prototype</span>
      </div>

      {/* Central Framed Paper Sheet */}
      <div className={styles.main}>
        <div className={styles.contentWrapper}>
          {/* Top Navigation */}
          <div className={styles.topNav}>
            <Link href="/" className={styles.backButton}>
              <span>←</span>
              <span>Prototypes</span>
            </Link>
            <span className={styles.categoryBadge}>
              <span className={styles.squareBullet} />
              04 / Doodle Creator
            </span>
          </div>

          {/* Header Section */}
          <h1 className={styles.heading1}>Doodle Creator</h1>

          {/* Prototype Area: MS Paint Studio Window */}
          <main className={styles.prototypeArea}>
            <div className={styles.paintWindow}>
              {/* Retro MS Paint Titlebar */}
              <div className={styles.windowTitleBar}>
                <div className={styles.windowTitle}>
                  <span className={styles.windowTitleIcon}>🎨</span>
                  <span>Doodle Paint 98 - [Untitled.png] - Texture Studio</span>
                </div>
                <div className={styles.windowControls}>
                  <button className={styles.windowControlButton} title="Minimize" aria-label="Minimize">_</button>
                  <button className={styles.windowControlButton} title="Maximize" aria-label="Maximize">□</button>
                  <button
                    className={styles.windowControlButton}
                    title="Clear Canvas"
                    aria-label="Clear Canvas"
                    onClick={handleClearCanvas}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Window Menu Bar */}
              <div className={styles.windowMenuBar}>
                <button className={styles.menuItemButton} onClick={handleClearCanvas}>
                  New
                </button>
                <button className={styles.menuItemButton} onClick={handleSaveImage}>
                  Save PNG
                </button>
                <button
                  className={styles.menuItemButton}
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                >
                  Undo
                </button>
                <button
                  className={styles.menuItemButton}
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                >
                  Redo
                </button>
                <button className={styles.menuItemButton} onClick={() => handleLoadPreset("cat")}>
                  Load Cat
                </button>
                <button className={styles.menuItemButton} onClick={() => setShowAboutModal(true)}>
                  Help
                </button>
              </div>

              {/* ========================================= */}
              {/* ARTISTIC TEXTURE BUTTONS (PRIMARY REQUEST) */}
              {/* ========================================= */}
              <div className={styles.textureSection}>
                <div className={styles.textureHeaderRow}>
                  <div className={styles.textureTitleWrapper}>
                    <span className={styles.textureHeading}>Textures</span>
                  </div>

                  <div className={styles.slidersGroup}>
                    <div className={styles.controlField}>
                      <label htmlFor="intensitySlider" className={styles.controlFieldLabel}>
                        Depth:
                      </label>
                      <input
                        id="intensitySlider"
                        type="range"
                        min="40"
                        max="160"
                        step="5"
                        value={textureIntensity}
                        onChange={(e) => handleIntensityChange(Number(e.target.value))}
                        className={styles.sliderInput}
                      />
                      <span className={styles.sliderValueTag}>{textureIntensity}%</span>
                    </div>

                    <div className={styles.controlField}>
                      <label htmlFor="grainSelect" className={styles.controlFieldLabel}>
                        Paper:
                      </label>
                      <select
                        id="grainSelect"
                        value={paperGrain}
                        onChange={(e) => handleGrainChange(e.target.value as GrainType)}
                        className={styles.grainSelect}
                      >
                        <option value="fine">Fine Paper</option>
                        <option value="medium">Medium Tooth</option>
                        <option value="rough">Rough Cold-Press</option>
                        <option value="canvas">Linen Canvas</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* The 6 Medium Buttons */}
                <div className={styles.textureButtonsGrid}>
                  {/* Clean */}
                  <button
                    type="button"
                    className={`${styles.textureButton} ${activeMedium === "clean" ? styles.textureButtonActive : ""}`}
                    onClick={() => handleMediumChange("clean")}
                    title="Classic crisp MS Paint pixels"
                  >
                    <span className={styles.textureButtonIcon}>🧼</span>
                    <span className={styles.textureButtonName}>Original</span>
                  </button>

                  {/* Crayon */}
                  <button
                    type="button"
                    className={`${styles.textureButton} ${activeMedium === "crayon" ? styles.textureButtonActive : ""}`}
                    onClick={() => handleMediumChange("crayon")}
                    title="Waxy crayon with paper tooth skips"
                  >
                    <span className={styles.textureButtonIcon}>🖍️</span>
                    <span className={styles.textureButtonName}>Crayon</span>
                  </button>

                  {/* Color Pencil */}
                  <button
                    type="button"
                    className={`${styles.textureButton} ${activeMedium === "pencil" ? styles.textureButtonActive : ""}`}
                    onClick={() => handleMediumChange("pencil")}
                    title="Directional 45° cross-hatch graphite tooth"
                  >
                    <span className={styles.textureButtonIcon}>✏️</span>
                    <span className={styles.textureButtonName}>Color Pencil</span>
                  </button>

                  {/* Pastel */}
                  <button
                    type="button"
                    className={`${styles.textureButton} ${activeMedium === "pastel" ? styles.textureButtonActive : ""}`}
                    onClick={() => handleMediumChange("pastel")}
                    title="Velvety soft chalk bloom & powdery diffusion"
                  >
                    <span className={styles.textureButtonIcon}>🎨</span>
                    <span className={styles.textureButtonName}>Pastel</span>
                  </button>

                  {/* Watercolor */}
                  <button
                    type="button"
                    className={`${styles.textureButton} ${activeMedium === "watercolor" ? styles.textureButtonActive : ""}`}
                    onClick={() => handleMediumChange("watercolor")}
                    title="Fluid wet pooling & dark perimeter coffee-ring rim"
                  >
                    <span className={styles.textureButtonIcon}>💧</span>
                    <span className={styles.textureButtonName}>Watercolor</span>
                  </button>

                  {/* Oil Paint */}
                  <button
                    type="button"
                    className={`${styles.textureButton} ${activeMedium === "oil" ? styles.textureButtonActive : ""}`}
                    onClick={() => handleMediumChange("oil")}
                    title="3D impasto light glints, bristle ridges, and weave"
                  >
                    <span className={styles.textureButtonIcon}>🖌️</span>
                    <span className={styles.textureButtonName}>Oil Paint</span>
                  </button>
                </div>

              </div>

              {/* Presets Bar */}
              <div className={styles.presetsBar}>
                <div className={styles.presetGroup}>
                  <span className={styles.presetBarLabel}>Presets:</span>
                  <button
                    type="button"
                    className={styles.presetPillButton}
                    onClick={() => handleLoadPreset("cat")}
                  >
                    🐱 Cute Cat
                  </button>
                  <button
                    type="button"
                    className={styles.presetPillButton}
                    onClick={() => handleLoadPreset("flowers")}
                  >
                    🌸 Flower Meadow
                  </button>
                  <button
                    type="button"
                    className={styles.presetPillButton}
                    onClick={() => handleLoadPreset("cafe")}
                  >
                    ☕ Coffee &amp; Donut
                  </button>

                  {/* Custom Prompt Type-in & Draw Button */}
                  <form
                    className={styles.promptForm}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGeneratePromptDoodle(customPrompt);
                    }}
                  >
                    <input
                      type="text"
                      className={styles.promptInput}
                      placeholder="Prompt doodle... e.g. dino, rocket"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                    <button
                      type="submit"
                      className={`${styles.promptDrawButton} ${isGeneratingPrompt ? styles.promptDrawButtonLoading : ""}`}
                      disabled={isGeneratingPrompt}
                      title="Draw doodle from prompt"
                    >
                      {isGeneratingPrompt ? "✏️ Drawing..." : "✨ Draw"}
                    </button>
                    <label className={styles.uploadRefButton} title="Upload a reference photo to turn into a doodle">
                      📷
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                    </label>
                  </form>
                </div>

                <div className={styles.presetGroup}>
                  <button
                    type="button"
                    className={`${styles.presetPillButton} ${styles.presetPillPrimary}`}
                    onClick={handleSaveImage}
                  >
                    💾 Save PNG
                  </button>
                  <button
                    type="button"
                    className={`${styles.presetPillButton} ${styles.presetPillDanger}`}
                    onClick={handleClearCanvas}
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>

              {/* ========================================= */}
              {/* MAIN WORKSPACE: TOOLBAR + CANVAS          */}
              {/* ========================================= */}
              <div className={styles.workspaceArea}>
                {/* Left Sidebar Toolbar */}
                <div className={styles.toolsSidebar}>
                  <div className={styles.toolsGrid}>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "pencil" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("pencil")}
                      title="Pencil (P) - 1px crisp freehand"
                      aria-label="Pencil Tool"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "brush" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("brush")}
                      title="Paint Brush (B) - Smooth strokes"
                      aria-label="Brush Tool"
                    >
                      🖌️
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "spray" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("spray")}
                      title="Airbrush / Spray Can (A) - Stippling dots"
                      aria-label="Airbrush Tool"
                    >
                      💨
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "bucket" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("bucket")}
                      title="Paint Bucket (F) - Flood fill areas"
                      aria-label="Fill Bucket Tool"
                    >
                      🪣
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "eraser" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("eraser")}
                      title="Eraser (E) - Clean white eraser"
                      aria-label="Eraser Tool"
                    >
                      🧽
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "picker" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("picker")}
                      title="Color Picker / Eyedropper"
                      aria-label="Eyedropper Tool"
                    >
                      💧
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "line" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("line")}
                      title="Straight Line (L)"
                      aria-label="Line Tool"
                    >
                      📏
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "rect" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("rect")}
                      title="Rectangle (R)"
                      aria-label="Rectangle Tool"
                    >
                      ⬜
                    </button>
                    <button
                      type="button"
                      className={`${styles.toolButton} ${activeTool === "ellipse" ? styles.toolButtonActive : ""}`}
                      onClick={() => setActiveTool("ellipse")}
                      title="Circle / Ellipse (O)"
                      aria-label="Ellipse Tool"
                    >
                      ⭕
                    </button>
                  </div>

                  {/* Size Selector Box */}
                  <div className={styles.sidebarSectionBox}>
                    <div className={styles.sidebarBoxTitle}>Line Size</div>
                    <div
                      className={`${styles.sizeOptionRow} ${strokeSize === 2 ? styles.sizeOptionRowActive : ""}`}
                      onClick={() => setStrokeSize(2)}
                      title="Thin (2px)"
                    >
                      <div className={styles.sizeBar2px} />
                    </div>
                    <div
                      className={`${styles.sizeOptionRow} ${strokeSize === 5 ? styles.sizeOptionRowActive : ""}`}
                      onClick={() => setStrokeSize(5)}
                      title="Medium (5px)"
                    >
                      <div className={styles.sizeBar5px} />
                    </div>
                    <div
                      className={`${styles.sizeOptionRow} ${strokeSize === 10 ? styles.sizeOptionRowActive : ""}`}
                      onClick={() => setStrokeSize(10)}
                      title="Thick (10px)"
                    >
                      <div className={styles.sizeBar10px} />
                    </div>
                    <div
                      className={`${styles.sizeOptionRow} ${strokeSize === 20 ? styles.sizeOptionRowActive : ""}`}
                      onClick={() => setStrokeSize(20)}
                      title="Chunky (20px)"
                    >
                      <div className={styles.sizeBar20px} />
                    </div>
                  </div>

                  {/* Shape Fill Mode */}
                  <div className={styles.sidebarSectionBox}>
                    <div className={styles.sidebarBoxTitle}>Shape Fill</div>
                    <div className={styles.fillModeGrid}>
                      <button
                        type="button"
                        className={`${styles.fillModeButton} ${fillMode === "outline" ? styles.fillModeButtonActive : ""}`}
                        onClick={() => setFillMode("outline")}
                        title="Outline only"
                      >
                        <div className={styles.fillIconOutline} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.fillModeButton} ${fillMode === "filled" ? styles.fillModeButtonActive : ""}`}
                        onClick={() => setFillMode("filled")}
                        title="Solid Filled"
                      >
                        <div className={styles.fillIconSolid} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.fillModeButton} ${fillMode === "both" ? styles.fillModeButtonActive : ""}`}
                        onClick={() => setFillMode("both")}
                        title="Outline + Fill"
                      >
                        <div className={styles.fillIconBoth} />
                      </button>
                    </div>
                  </div>

                  {/* Quick Undo / Redo */}
                  <div className={styles.historyButtonGroup}>
                    <button
                      type="button"
                      className={styles.actionButtonMini}
                      onClick={handleUndo}
                      disabled={!canUndo}
                      title="Undo (Ctrl+Z)"
                    >
                      ↶
                    </button>
                    <button
                      type="button"
                      className={styles.actionButtonMini}
                      onClick={handleRedo}
                      disabled={!canRedo}
                      title="Redo (Ctrl+Y)"
                    >
                      ↷
                    </button>
                  </div>
                </div>

                {/* Canvas Viewport */}
                <div className={styles.canvasContainer}>
                  <div className={styles.canvasBevelWrapper}>
                    {/* Hidden Base Canvas storing pure vector/pixel strokes */}
                    <canvas ref={baseCanvasRef} style={{ display: "none" }} />

                    {/* Visible Display Canvas with Texture Filter applied */}
                    <canvas
                      ref={displayCanvasRef}
                      className={styles.paintCanvasElement}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerLeave}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <div className={styles.canvasCornerHandle} />

                    {/* Live Animated Drawing Progression Overlay */}
                    {isGeneratingPrompt && (
                      <div className={styles.drawingOverlay} aria-live="polite">
                        <div className={styles.drawingDialog}>
                          <div className={styles.drawingDialogTitle}>
                            <span>Drawing...</span>
                            <span className={styles.drawingPencilAnim}>✏️</span>
                          </div>
                          <div className={styles.drawingDialogBody}>
                            <div className={styles.drawingStatusText}>
                              {drawingStepText}
                            </div>
                            <div className={styles.drawingProgressBar}>
                              <div
                                className={styles.drawingProgressFill}
                                style={{ width: `${drawingProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ========================================= */}
              {/* BOTTOM PALETTE & COLOR BOX                */}
              {/* ========================================= */}
              <div className={styles.bottomBarArea}>
                {/* Active Primary & Secondary Color Wells */}
                <div className={styles.activeColorsBox} title="Color 1 (Foreground) & Color 2 (Background)">
                  <div
                    className={`${styles.colorSlotSecondary} ${activeColorSlot === 2 ? styles.colorSlotActiveIndicator : ""}`}
                    style={{ backgroundColor: color2 }}
                    onClick={() => setActiveColorSlot(2)}
                    title="Secondary / Background Color (Click to select)"
                  />
                  <div
                    className={`${styles.colorSlotPrimary} ${activeColorSlot === 1 ? styles.colorSlotActiveIndicator : ""}`}
                    style={{ backgroundColor: color1 }}
                    onClick={() => setActiveColorSlot(1)}
                    title="Primary / Foreground Color (Click to select)"
                  />
                </div>

                {/* 28 Classic Color Swatches */}
                <div className={styles.swatchesContainer}>
                  <div className={styles.swatchesRow}>
                    {CLASSIC_PALETTE_ROW_1.map((hex, i) => (
                      <button
                        key={`r1-${i}`}
                        type="button"
                        className={styles.swatchButton}
                        style={{ backgroundColor: hex }}
                        onClick={() => {
                          if (activeColorSlot === 1) setColor1(hex);
                          else setColor2(hex);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setColor2(hex);
                        }}
                        title={`${hex} (Left-click Color 1, Right-click Color 2)`}
                        aria-label={`Color ${hex}`}
                      />
                    ))}
                  </div>

                  <div className={styles.swatchesRow}>
                    {CLASSIC_PALETTE_ROW_2.map((hex, i) => (
                      <button
                        key={`r2-${i}`}
                        type="button"
                        className={styles.swatchButton}
                        style={{ backgroundColor: hex }}
                        onClick={() => {
                          if (activeColorSlot === 1) setColor1(hex);
                          else setColor2(hex);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setColor2(hex);
                        }}
                        title={`${hex} (Left-click Color 1, Right-click Color 2)`}
                        aria-label={`Color ${hex}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color Picker Input */}
                <div className={styles.customColorWrapper}>
                  <input
                    type="color"
                    id="customColor"
                    value={activeColorSlot === 1 ? color1 : color2}
                    onChange={(e) => {
                      if (activeColorSlot === 1) setColor1(e.target.value);
                      else setColor2(e.target.value);
                    }}
                    className={styles.colorPickerInput}
                  />
                  <label htmlFor="customColor" className={styles.colorPickerLabel}>
                    Custom Hue
                  </label>
                </div>
              </div>

              {/* ========================================= */}
              {/* RETRO STATUS BAR                          */}
              {/* ========================================= */}
              <div className={styles.statusBar}>
                <div className={`${styles.statusItem} ${styles.statusCoord}`}>
                  📍 {mouseCoord ? `${mouseCoord.x}, ${mouseCoord.y}px` : "Canvas ready"}
                </div>
                <div className={styles.statusItem}>
                  📐 {CANVAS_WIDTH} × {CANVAS_HEIGHT}px
                </div>
                <div className={`${styles.statusItem} ${styles.statusMedium}`}>
                  Active Medium: {TEXTURE_INFO[activeMedium].icon} {TEXTURE_INFO[activeMedium].title}
                </div>
                <div className={`${styles.statusItem} ${styles.statusHint}`}>
                  Shortcuts: P (Pencil) | B (Brush) | A (Airbrush) | F (Fill) | E (Eraser) | Ctrl+Z (Undo)
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* About / Help Modal */}
      {showAboutModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAboutModal(false)}>
          <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>About Doodle Paint &amp; Artistic Textures</h2>
              <button
                className={styles.modalCloseButton}
                onClick={() => setShowAboutModal(false)}
                aria-label="Close Help"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalParagraph}>
                <strong>Doodle Paint</strong> blends 90s MS Paint nostalgic tools with client-side procedural shaders
                that instantly transform your doodles into physical fine-art mediums.
              </p>
              <div className={styles.mediumDescriptionList}>
                {(Object.keys(TEXTURE_INFO) as TextureMedium[]).map((med) => (
                  <div key={med} className={styles.mediumDescriptionItem}>
                    <div className={styles.mediumDescriptionItemTitle}>
                      {TEXTURE_INFO[med].icon} {TEXTURE_INFO[med].title}
                    </div>
                    <p className={styles.mediumDescriptionItemBody}>{TEXTURE_INFO[med].desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalConfirmButton}
                onClick={() => setShowAboutModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}