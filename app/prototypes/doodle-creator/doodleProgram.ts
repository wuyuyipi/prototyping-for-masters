/**
 * Doodle Generation Program (doodleProgram.ts)
 * 
 * A standalone procedural visual compiler that transforms any user text prompt
 * into authentic, rough hand-drawn Microsoft Paint-style artwork.
 * 
 * Features:
 * - Natural Language & Semantic Analyzer (subjects, colors, traits, emotions)
 * - Multi-Phase Drawing Support (draft sketch -> bold ink -> flat fills -> texture ready)
 * - Hand-Drawn MS Paint Geometry Engine (rough lines, jittered curves, comic proportions)
 * - Comprehensive Visual Subject Modules (hundreds of real-world & fantasy subjects)
 * - Universal Component Synthesizer for arbitrary unknown phrases
 */

export type DrawPhase = "draft" | "ink" | "fill" | "full";

export interface DoodleSubjectInfo {
  title: string;
  category: string;
  primaryColor: string;
  accentColor: string;
}

// Windows 95 / Classic MS Paint Palette
const PAINT_PALETTE = {
  black: "#1A2628",
  white: "#FFFFFF",
  gray: "#808080",
  silver: "#C0C0C0",
  red: "#ED1C24",
  darkRed: "#880015",
  orange: "#FF7F27",
  yellow: "#FFF200",
  lightYellow: "#EFE4B0",
  gold: "#FFC90E",
  green: "#22B14C",
  lime: "#B5E61D",
  darkGreen: "#0E6B23",
  blue: "#00A2E8",
  deepBlue: "#3F48CC",
  darkBlue: "#1C39BB",
  lightBlue: "#99D9EA",
  draftBlue: "rgba(112, 146, 190, 0.75)",
  purple: "#A349A4",
  violet: "#702963",
  pink: "#FFAEC9",
  hotPink: "#ED6A85",
  brown: "#B97A57",
  darkBrown: "#583015",
  cream: "#FFF9BD",
  peach: "#FAD6A5",
  tan: "#E5AA70",
};

/**
 * Color extraction helper from user prompt string
 */
function extractPromptColor(prompt: string, fallback: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("red") || p.includes("crimson")) return PAINT_PALETTE.red;
  if (p.includes("dark red") || p.includes("maroon") || p.includes("burgundy")) return PAINT_PALETTE.darkRed;
  if (p.includes("orange")) return PAINT_PALETTE.orange;
  if (p.includes("yellow") || p.includes("blonde")) return PAINT_PALETTE.yellow;
  if (p.includes("gold") || p.includes("golden")) return PAINT_PALETTE.gold;
  if (p.includes("green") || p.includes("emerald")) return PAINT_PALETTE.green;
  if (p.includes("lime") || p.includes("neon green")) return PAINT_PALETTE.lime;
  if (p.includes("blue") || p.includes("azure")) return PAINT_PALETTE.blue;
  if (p.includes("navy") || p.includes("dark blue")) return PAINT_PALETTE.deepBlue;
  if (p.includes("sky") || p.includes("light blue") || p.includes("cyan")) return PAINT_PALETTE.lightBlue;
  if (p.includes("purple") || p.includes("violet") || p.includes("lavender")) return PAINT_PALETTE.purple;
  if (p.includes("pink") || p.includes("rose") || p.includes("magenta")) return PAINT_PALETTE.pink;
  if (p.includes("brown") || p.includes("chocolate")) return PAINT_PALETTE.brown;
  if (p.includes("black") || p.includes("dark")) return PAINT_PALETTE.black;
  if (p.includes("white") || p.includes("snow")) return PAINT_PALETTE.white;
  if (p.includes("gray") || p.includes("grey") || p.includes("silver")) return PAINT_PALETTE.silver;
  return fallback;
}

/**
 * Deterministic pseudo-random number generator seeded with prompt string
 */
function createPromptRNG(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let s = Math.abs(hash) + 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Doodle Canvas Assistant: Wraps standard 2D canvas with rough MS Paint vector tools
 */
class MSDrawingTool {
  ctx: CanvasRenderingContext2D;
  phase: DrawPhase;
  rng: () => number;

  constructor(ctx: CanvasRenderingContext2D, phase: DrawPhase, seed: string) {
    this.ctx = ctx;
    this.phase = phase;
    this.rng = createPromptRNG(seed);
  }

  // Jitter offset for authentic hand-drawn feel
  jitter(amount = 2): number {
    return (this.rng() - 0.5) * amount;
  }

  // Draw circle / ellipse
  circle(cx: number, cy: number, r: number, fillColor: string, strokeColor = PAINT_PALETTE.black, strokeWidth = 5) {
    const { ctx, phase } = this;
    ctx.beginPath();
    ctx.arc(cx + this.jitter(1), cy + this.jitter(1), r, 0, Math.PI * 2);

    if (phase === "draft") {
      ctx.strokeStyle = PAINT_PALETTE.draftBlue;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      return;
    }

    if (phase === "fill" || phase === "full") {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    if (phase === "ink" || phase === "full") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }

  // Ellipse with rotation
  ellipse(cx: number, cy: number, rx: number, ry: number, fillColor: string, strokeColor = PAINT_PALETTE.black, strokeWidth = 5, rot = 0) {
    const { ctx, phase } = this;
    ctx.beginPath();
    ctx.ellipse(cx + this.jitter(1), cy + this.jitter(1), rx, ry, rot, 0, Math.PI * 2);

    if (phase === "draft") {
      ctx.strokeStyle = PAINT_PALETTE.draftBlue;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      return;
    }

    if (phase === "fill" || phase === "full") {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    if (phase === "ink" || phase === "full") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }

  // Rounded rectangle
  roundRect(x: number, y: number, w: number, h: number, radius: number, fillColor: string, strokeColor = PAINT_PALETTE.black, strokeWidth = 5) {
    const { ctx, phase } = this;
    ctx.beginPath();
    ctx.roundRect(x + this.jitter(1), y + this.jitter(1), w, h, radius);

    if (phase === "draft") {
      ctx.strokeStyle = PAINT_PALETTE.draftBlue;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      return;
    }

    if (phase === "fill" || phase === "full") {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    if (phase === "ink" || phase === "full") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }

  // Rough hand-drawn line
  line(x1: number, y1: number, x2: number, y2: number, strokeColor = PAINT_PALETTE.black, strokeWidth = 5) {
    const { ctx, phase } = this;
    if (phase === "fill") return; // Fills pass skips lone line strokes

    ctx.beginPath();
    const mx = (x1 + x2) / 2 + this.jitter(4);
    const my = (y1 + y2) / 2 + this.jitter(4);
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(mx, my, x2, y2);

    if (phase === "draft") {
      ctx.strokeStyle = PAINT_PALETTE.draftBlue;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      return;
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Polygon path
  polygon(points: [number, number][], fillColor: string, strokeColor = PAINT_PALETTE.black, strokeWidth = 5) {
    if (points.length < 3) return;
    const { ctx, phase } = this;
    ctx.beginPath();
    ctx.moveTo(points[0][0] + this.jitter(1), points[0][1] + this.jitter(1));
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0] + this.jitter(1), points[i][1] + this.jitter(1));
    }
    ctx.closePath();

    if (phase === "draft") {
      ctx.strokeStyle = PAINT_PALETTE.draftBlue;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      return;
    }

    if (phase === "fill" || phase === "full") {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    if (phase === "ink" || phase === "full") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }

  // Cute MS Paint Mascot Face
  face(cx: number, cy: number, scale = 1, style: "happy" | "cool" | "wink" | "cat" | "curious" = "happy") {
    const { ctx, phase } = this;
    if (phase === "draft") {
      ctx.strokeStyle = PAINT_PALETTE.draftBlue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 20 * scale, cy - 5 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 20 * scale, cy - 5 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    if (phase === "fill") {
      // Pink blushing cheeks
      ctx.fillStyle = PAINT_PALETTE.pink;
      ctx.beginPath();
      ctx.ellipse(cx - 32 * scale, cy + 5 * scale, 9 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 32 * scale, cy + 5 * scale, 9 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Cheeks fill during full phase
    if (phase === "full") {
      ctx.fillStyle = PAINT_PALETTE.pink;
      ctx.beginPath();
      ctx.ellipse(cx - 32 * scale, cy + 5 * scale, 9 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 32 * scale, cy + 5 * scale, 9 * scale, 6 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (style === "cool") {
      // Sunglasses
      ctx.fillStyle = PAINT_PALETTE.black;
      ctx.beginPath();
      ctx.roundRect(cx - 38 * scale, cy - 12 * scale, 34 * scale, 20 * scale, 4);
      ctx.roundRect(cx + 4 * scale, cy - 12 * scale, 34 * scale, 20 * scale, 4);
      ctx.fill();
      this.line(cx - 5 * scale, cy - 4 * scale, cx + 5 * scale, cy - 4 * scale, PAINT_PALETTE.black, 4 * scale);
      // Glint
      ctx.strokeStyle = PAINT_PALETTE.white;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - 32 * scale, cy - 8 * scale);
      ctx.lineTo(cx - 16 * scale, cy + 4 * scale);
      ctx.stroke();
      // Smile
      this.line(cx - 14 * scale, cy + 18 * scale, cx + 14 * scale, cy + 20 * scale, PAINT_PALETTE.black, 4 * scale);
      return;
    }

    // Eyes
    ctx.fillStyle = PAINT_PALETTE.black;
    ctx.beginPath();
    ctx.arc(cx - 20 * scale, cy - 6 * scale, 7 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 20 * scale, cy - 6 * scale, 7 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkles
    ctx.fillStyle = PAINT_PALETTE.white;
    ctx.beginPath();
    ctx.arc(cx - 22 * scale, cy - 8 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 18 * scale, cy - 8 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(cx, cy + 6 * scale, 14 * scale, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.strokeStyle = PAINT_PALETTE.black;
    ctx.lineWidth = 4 * scale;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Comic Sparkles around subject
  sparkles(cx: number, cy: number, count = 4, radius = 160) {
    if (this.phase === "draft") return;
    const colors = [PAINT_PALETTE.yellow, PAINT_PALETTE.lightBlue, PAINT_PALETTE.pink, PAINT_PALETTE.gold];
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + 0.3;
      const dist = radius + this.jitter(20);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;

      if (this.phase === "fill" || this.phase === "full") {
        this.ctx.fillStyle = colors[i % colors.length];
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        this.ctx.fill();
      }

      if (this.phase === "ink" || this.phase === "full") {
        this.ctx.strokeStyle = PAINT_PALETTE.black;
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(sx - 10, sy);
        this.ctx.lineTo(sx + 10, sy);
        this.ctx.moveTo(sx, sy - 10);
        this.ctx.lineTo(sx, sy + 10);
        this.ctx.stroke();
      }
    }
  }

  // Ground line or horizon
  groundLine(y = 430, color = PAINT_PALETTE.green) {
    if (this.phase === "draft") {
      this.line(50, y, 750, y, PAINT_PALETTE.draftBlue, 2);
      return;
    }
    if (this.phase === "fill" || this.phase === "full") {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(40, y, 720, 500 - y - 10);
    }
    if (this.phase === "ink" || this.phase === "full") {
      this.line(40, y, 760, y, PAINT_PALETTE.black, 5);
      // Grass tufts
      for (let x = 120; x < 700; x += 110) {
        this.line(x, y, x - 8, y - 16, PAINT_PALETTE.black, 3.5);
        this.line(x, y, x + 8, y - 18, PAINT_PALETTE.black, 3.5);
      }
    }
  }
}

/**
 * Main Standalone Program: compiles prompt text into a procedural MS Paint doodle
 */
export function compilePromptToDoodle(
  promptText: string,
  ctx: CanvasRenderingContext2D,
  phase: DrawPhase = "full"
): DoodleSubjectInfo {
  const p = promptText.trim().toLowerCase();
  const d = new MSDrawingTool(ctx, phase, p);

  // Background is clean paper
  ctx.fillStyle = PAINT_PALETTE.white;
  ctx.fillRect(0, 0, 800, 500);

  // =========================================================================
  // 1. VEHICLES: Skateboard, Guitar, Bike, Car, Plane, Spaceship, Boat, Train
  // =========================================================================

  // SKATEBOARD / LONGBOARD
  if (p.includes("skateboard") || p.includes("skate") || p.includes("longboard")) {
    const deckColor = extractPromptColor(p, PAINT_PALETTE.orange);
    const wheelColor = PAINT_PALETTE.yellow;

    // Motion speed lines
    d.line(160, 240, 260, 240, PAINT_PALETTE.blue, 4);
    d.line(140, 280, 230, 280, PAINT_PALETTE.blue, 4);
    d.line(170, 320, 250, 320, PAINT_PALETTE.blue, 4);

    // Wheels
    d.circle(310, 350, 30, wheelColor, PAINT_PALETTE.black, 6);
    d.circle(310, 350, 10, PAINT_PALETTE.silver, PAINT_PALETTE.black, 4);
    d.circle(530, 350, 30, wheelColor, PAINT_PALETTE.black, 6);
    d.circle(530, 350, 10, PAINT_PALETTE.silver, PAINT_PALETTE.black, 4);

    // Trucks (metal axle mounts)
    d.roundRect(290, 305, 40, 22, 4, PAINT_PALETTE.silver, PAINT_PALETTE.black, 5);
    d.roundRect(510, 305, 40, 22, 4, PAINT_PALETTE.silver, PAINT_PALETTE.black, 5);

    // Deck (tilted aerodynamic curve)
    d.polygon(
      [
        [200, 265],
        [240, 300],
        [580, 300],
        [640, 260],
        [630, 235],
        [565, 275],
        [250, 275],
        [210, 240],
      ],
      deckColor,
      PAINT_PALETTE.black,
      6
    );

    // Racing stripe on grip tape
    d.line(260, 285, 560, 285, PAINT_PALETTE.yellow, 6);
    d.line(260, 278, 560, 278, PAINT_PALETTE.white, 3);

    // Character sneakers riding board
    d.roundRect(330, 205, 75, 42, 12, PAINT_PALETTE.red, PAINT_PALETTE.black, 5);
    d.roundRect(470, 205, 75, 42, 12, PAINT_PALETTE.red, PAINT_PALETTE.black, 5);
    d.roundRect(325, 235, 85, 14, 5, PAINT_PALETTE.white, PAINT_PALETTE.black, 4);
    d.roundRect(465, 235, 85, 14, 5, PAINT_PALETTE.white, PAINT_PALETTE.black, 4);

    d.sparkles(420, 260, 4, 180);
    d.groundLine(390, PAINT_PALETTE.silver);

    return { title: "Skateboard", category: "Sport", primaryColor: deckColor, accentColor: wheelColor };
  }

  // GUITAR / BASS / UKULELE
  if (p.includes("guitar") || p.includes("bass") || p.includes("ukulele") || p.includes("rock") || p.includes("music")) {
    const bodyColor = extractPromptColor(p, PAINT_PALETTE.red);

    // Musical notes floating
    d.circle(230, 150, 10, PAINT_PALETTE.purple, PAINT_PALETTE.black, 3);
    d.line(240, 150, 240, 110, PAINT_PALETTE.black, 4);
    d.circle(270, 140, 10, PAINT_PALETTE.purple, PAINT_PALETTE.black, 3);
    d.line(280, 140, 280, 100, PAINT_PALETTE.black, 4);
    d.line(240, 110, 280, 100, PAINT_PALETTE.black, 5);

    // Headstock & Tuning pegs
    d.roundRect(190, 80, 50, 75, 8, PAINT_PALETTE.brown, PAINT_PALETTE.black, 5);
    d.circle(180, 95, 8, PAINT_PALETTE.silver, PAINT_PALETTE.black, 3);
    d.circle(180, 130, 8, PAINT_PALETTE.silver, PAINT_PALETTE.black, 3);
    d.circle(250, 95, 8, PAINT_PALETTE.silver, PAINT_PALETTE.black, 3);
    d.circle(250, 130, 8, PAINT_PALETTE.silver, PAINT_PALETTE.black, 3);

    // Fretboard Neck
    d.polygon(
      [
        [220, 155],
        [350, 255],
        [375, 225],
        [245, 125],
      ],
      PAINT_PALETTE.darkBrown,
      PAINT_PALETTE.black,
      5
    );

    // Frets
    d.line(255, 175, 275, 155, PAINT_PALETTE.silver, 3);
    d.line(285, 200, 305, 180, PAINT_PALETTE.silver, 3);
    d.line(315, 225, 335, 205, PAINT_PALETTE.silver, 3);

    // Guitar Body (Figure-8)
    d.ellipse(420, 300, 75, 60, bodyColor, PAINT_PALETTE.black, 6, 0.6);
    d.ellipse(490, 340, 95, 80, bodyColor, PAINT_PALETTE.black, 6, 0.6);

    // Sound Hole
    d.circle(440, 310, 26, PAINT_PALETTE.black, PAINT_PALETTE.black, 4);

    // Pickguard
    d.ellipse(470, 325, 32, 16, PAINT_PALETTE.white, PAINT_PALETTE.black, 3, 0.4);

    // Strings
    d.line(215, 120, 520, 355, PAINT_PALETTE.silver, 2);
    d.line(220, 125, 525, 360, PAINT_PALETTE.silver, 2);
    d.line(225, 130, 530, 365, PAINT_PALETTE.silver, 2);

    d.sparkles(420, 260, 5, 200);

    return { title: "Guitar", category: "Music", primaryColor: bodyColor, accentColor: PAINT_PALETTE.yellow };
  }

  // CASTLE / FORTRESS / PALACE
  if (p.includes("castle") || p.includes("palace") || p.includes("fortress") || p.includes("kingdom")) {
    const wallColor = extractPromptColor(p, PAINT_PALETTE.silver);
    const roofColor = PAINT_PALETTE.blue;

    // Rolling hill
    d.ellipse(400, 480, 380, 140, PAINT_PALETTE.green, PAINT_PALETTE.black, 5);

    // Left Tower
    d.roundRect(220, 180, 80, 190, 2, wallColor, PAINT_PALETTE.black, 6);
    // Battlements
    d.roundRect(210, 160, 100, 24, 2, wallColor, PAINT_PALETTE.black, 5);
    d.polygon([[210, 160], [260, 70], [310, 160]], roofColor, PAINT_PALETTE.black, 5);
    // Flag
    d.line(260, 70, 260, 35, PAINT_PALETTE.black, 4);
    d.polygon([[260, 35], [295, 48], [260, 60]], PAINT_PALETTE.red, PAINT_PALETTE.black, 3);

    // Right Tower
    d.roundRect(500, 180, 80, 190, 2, wallColor, PAINT_PALETTE.black, 6);
    d.roundRect(490, 160, 100, 24, 2, wallColor, PAINT_PALETTE.black, 5);
    d.polygon([[490, 160], [540, 70], [590, 160]], roofColor, PAINT_PALETTE.black, 5);
    d.line(540, 70, 540, 35, PAINT_PALETTE.black, 4);
    d.polygon([[540, 35], [575, 48], [540, 60]], PAINT_PALETTE.red, PAINT_PALETTE.black, 3);

    // Central Keep
    d.roundRect(290, 220, 220, 150, 2, wallColor, PAINT_PALETTE.black, 6);
    // Crenellations on wall
    for (let bx = 300; bx < 500; bx += 36) {
      d.roundRect(bx, 205, 24, 18, 2, wallColor, PAINT_PALETTE.black, 4);
    }

    // Great Arched Wooden Gate
    d.roundRect(365, 280, 70, 90, 35, PAINT_PALETTE.brown, PAINT_PALETTE.black, 6);
    d.line(400, 280, 400, 370, PAINT_PALETTE.black, 4);
    d.circle(385, 330, 4, PAINT_PALETTE.gold, PAINT_PALETTE.black, 2);
    d.circle(415, 330, 4, PAINT_PALETTE.gold, PAINT_PALETTE.black, 2);

    // Windows with crosses
    d.roundRect(245, 220, 30, 45, 15, PAINT_PALETTE.darkBlue, PAINT_PALETTE.black, 4);
    d.roundRect(525, 220, 30, 45, 15, PAINT_PALETTE.darkBlue, PAINT_PALETTE.black, 4);
    d.roundRect(385, 230, 30, 35, 15, PAINT_PALETTE.darkBlue, PAINT_PALETTE.black, 4);

    d.sparkles(400, 120, 4, 170);

    return { title: "Castle", category: "Architecture", primaryColor: wallColor, accentColor: roofColor };
  }

  // DRAGON / MONSTER / DINOSAUR (REPTILIAN)
  if (p.includes("dragon") || p.includes("dino") || p.includes("monster") || p.includes("godzilla") || p.includes("lizard") || p.includes("reptile")) {
    const skinColor = extractPromptColor(p, PAINT_PALETTE.green);
    const bellyColor = PAINT_PALETTE.yellow;

    // Tail
    d.polygon(
      [
        [250, 330],
        [130, 320],
        [100, 260],
        [125, 280],
        [210, 370],
      ],
      skinColor,
      PAINT_PALETTE.black,
      6
    );

    // Big Dragon Wings
    d.polygon(
      [
        [370, 220],
        [310, 90],
        [390, 130],
        [430, 70],
        [460, 140],
        [410, 240],
      ],
      PAINT_PALETTE.purple,
      PAINT_PALETTE.black,
      6
    );

    // Back legs & feet
    d.roundRect(280, 340, 60, 70, 20, skinColor, PAINT_PALETTE.black, 6);
    d.roundRect(260, 390, 70, 30, 12, skinColor, PAINT_PALETTE.black, 6);
    d.roundRect(420, 340, 60, 70, 20, skinColor, PAINT_PALETTE.black, 6);
    d.roundRect(410, 390, 70, 30, 12, skinColor, PAINT_PALETTE.black, 6);

    // Claws
    for (let c = 0; c < 3; c++) {
      d.polygon([[260 + c * 16, 410], [252 + c * 16, 422], [268 + c * 16, 422]], PAINT_PALETTE.white, PAINT_PALETTE.black, 3);
      d.polygon([[410 + c * 16, 410], [402 + c * 16, 422], [418 + c * 16, 422]], PAINT_PALETTE.white, PAINT_PALETTE.black, 3);
    }

    // Chubby Pear Body
    d.ellipse(360, 310, 95, 105, skinColor, PAINT_PALETTE.black, 6);

    // Yellow Scaly Belly
    d.ellipse(375, 325, 65, 75, bellyColor, PAINT_PALETTE.black, 5);
    d.line(330, 310, 420, 310, PAINT_PALETTE.orange, 3);
    d.line(335, 340, 415, 340, PAINT_PALETTE.orange, 3);
    d.line(345, 370, 405, 370, PAINT_PALETTE.orange, 3);

    // Dragon Head & Snout
    d.ellipse(470, 185, 65, 50, skinColor, PAINT_PALETTE.black, 6, 0.1);
    d.roundRect(480, 180, 65, 45, 16, skinColor, PAINT_PALETTE.black, 6);

    // Horns
    d.polygon([[440, 150], [420, 90], [460, 140]], PAINT_PALETTE.gold, PAINT_PALETTE.black, 5);
    d.polygon([[470, 145], [470, 85], [490, 140]], PAINT_PALETTE.gold, PAINT_PALETTE.black, 5);

    // Cute Face / Nostril
    d.circle(460, 175, 9, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    d.circle(457, 172, 3, PAINT_PALETTE.white, PAINT_PALETTE.white, 1);
    d.circle(525, 195, 5, PAINT_PALETTE.darkRed, PAINT_PALETTE.black, 2);

    // Fire breath!
    d.polygon(
      [
        [540, 210],
        [630, 170],
        [690, 200],
        [740, 160],
        [710, 230],
        [750, 260],
        [670, 250],
        [620, 280],
        [540, 225],
      ],
      PAINT_PALETTE.orange,
      PAINT_PALETTE.red,
      5
    );
    d.polygon([[550, 215], [630, 210], [670, 220], [600, 240]], PAINT_PALETTE.yellow, PAINT_PALETTE.orange, 3);

    d.groundLine(420, PAINT_PALETTE.green);

    return { title: "Dragon", category: "Fantasy", primaryColor: skinColor, accentColor: PAINT_PALETTE.orange };
  }

  // GIRAFFE / ZEBRA / HORSE / TALL MAMMAL
  if (p.includes("giraffe")) {
    const skinColor = PAINT_PALETTE.yellow;
    const spotColor = PAINT_PALETTE.brown;

    // Body
    d.ellipse(330, 340, 110, 70, skinColor, PAINT_PALETTE.black, 6);
    // Slender legs
    d.roundRect(250, 360, 22, 90, 6, skinColor, PAINT_PALETTE.black, 5);
    d.roundRect(290, 360, 22, 90, 6, skinColor, PAINT_PALETTE.black, 5);
    d.roundRect(370, 360, 22, 90, 6, skinColor, PAINT_PALETTE.black, 5);
    d.roundRect(410, 360, 22, 90, 6, skinColor, PAINT_PALETTE.black, 5);
    // Hooves
    d.roundRect(248, 435, 26, 18, 4, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 4);
    d.roundRect(288, 435, 26, 18, 4, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 4);
    d.roundRect(368, 435, 26, 18, 4, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 4);
    d.roundRect(408, 435, 26, 18, 4, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 4);

    // Super Long Neck
    d.polygon(
      [
        [380, 330],
        [440, 130],
        [490, 140],
        [430, 340],
      ],
      skinColor,
      PAINT_PALETTE.black,
      6
    );

    // Head & Snout
    d.ellipse(475, 120, 45, 30, skinColor, PAINT_PALETTE.black, 5, 0.2);
    d.ellipse(505, 128, 25, 20, PAINT_PALETTE.tan, PAINT_PALETTE.black, 4);
    // Ossicones (little horns)
    d.line(460, 100, 455, 75, PAINT_PALETTE.black, 5);
    d.circle(455, 75, 7, spotColor, PAINT_PALETTE.black, 3);
    d.line(480, 100, 480, 75, PAINT_PALETTE.black, 5);
    d.circle(480, 75, 7, spotColor, PAINT_PALETTE.black, 3);

    // Spots on neck & body
    d.ellipse(430, 180, 18, 12, spotColor, PAINT_PALETTE.black, 3);
    d.ellipse(445, 230, 20, 15, spotColor, PAINT_PALETTE.black, 3);
    d.ellipse(415, 280, 22, 16, spotColor, PAINT_PALETTE.black, 3);
    d.ellipse(320, 330, 25, 18, spotColor, PAINT_PALETTE.black, 3);
    d.ellipse(360, 360, 28, 20, spotColor, PAINT_PALETTE.black, 3);

    // Cute Face
    d.circle(468, 115, 6, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    d.circle(466, 113, 2, PAINT_PALETTE.white, PAINT_PALETTE.white, 1);
    d.circle(515, 126, 3, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 1);

    // Leaf branch it's happily eating
    d.line(520, 135, 590, 110, PAINT_PALETTE.brown, 4);
    d.ellipse(560, 110, 16, 9, PAINT_PALETTE.green, PAINT_PALETTE.black, 3, -0.4);
    d.ellipse(590, 105, 16, 9, PAINT_PALETTE.green, PAINT_PALETTE.black, 3, 0.3);

    d.groundLine(450, PAINT_PALETTE.green);

    return { title: "Giraffe", category: "Animal", primaryColor: skinColor, accentColor: spotColor };
  }

  // OCTOPUS / SQUID / SEA CREATURE
  if (p.includes("octopus") || p.includes("squid") || p.includes("kraken") || p.includes("jellyfish")) {
    const bodyColor = extractPromptColor(p, PAINT_PALETTE.pink);

    // Bubbles rising
    d.circle(220, 140, 16, PAINT_PALETTE.lightBlue, PAINT_PALETTE.blue, 3);
    d.circle(200, 90, 10, PAINT_PALETTE.lightBlue, PAINT_PALETTE.blue, 3);
    d.circle(580, 160, 22, PAINT_PALETTE.lightBlue, PAINT_PALETTE.blue, 3);
    d.circle(610, 100, 14, PAINT_PALETTE.lightBlue, PAINT_PALETTE.blue, 3);

    // 8 Curly Wavy Tentacles
    const tentacleXs = [240, 280, 330, 380, 420, 470, 520, 560];
    tentacleXs.forEach((tx, idx) => {
      const bend = (idx % 2 === 0 ? 1 : -1) * 35;
      d.polygon(
        [
          [tx - 18, 300],
          [tx + bend, 390],
          [tx + bend + 15, 420],
          [tx + bend - 5, 410],
          [tx + 18, 300],
        ],
        bodyColor,
        PAINT_PALETTE.black,
        5
      );
      // Suction cups
      d.circle(tx + bend * 0.7, 360, 7, PAINT_PALETTE.white, PAINT_PALETTE.black, 2.5);
      d.circle(tx + bend * 0.9, 390, 6, PAINT_PALETTE.white, PAINT_PALETTE.black, 2.5);
    });

    // Bulbous dome head
    d.circle(400, 240, 130, bodyColor, PAINT_PALETTE.black, 6);

    // Cute Sailor Hat or Bow
    d.roundRect(350, 105, 100, 25, 6, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.roundRect(375, 75, 50, 35, 4, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.line(350, 118, 450, 118, PAINT_PALETTE.blue, 6);

    // Kawaii face
    d.face(400, 250, 1.4, "happy");

    d.sparkles(400, 240, 4, 200);

    return { title: "Octopus", category: "Marine", primaryColor: bodyColor, accentColor: PAINT_PALETTE.lightBlue };
  }

  // COMPUTER / LAPTOP / GAMING / TECH
  if (p.includes("computer") || p.includes("pc") || p.includes("laptop") || p.includes("monitor") || p.includes("game") || p.includes("tech")) {
    const caseColor = extractPromptColor(p, PAINT_PALETTE.silver);
    const screenGlow = PAINT_PALETTE.lightBlue;

    // Table / Desk
    d.roundRect(140, 390, 520, 28, 4, PAINT_PALETTE.brown, PAINT_PALETTE.black, 6);
    d.roundRect(190, 418, 32, 70, 2, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 5);
    d.roundRect(580, 418, 32, 70, 2, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 5);

    // Monitor Bezel & Stand
    d.roundRect(350, 330, 100, 30, 4, caseColor, PAINT_PALETTE.black, 5);
    d.roundRect(380, 300, 40, 45, 2, caseColor, PAINT_PALETTE.black, 5);
    d.roundRect(230, 110, 340, 220, 12, caseColor, PAINT_PALETTE.black, 6);

    // Glowing Screen
    d.roundRect(250, 130, 300, 175, 6, screenGlow, PAINT_PALETTE.black, 5);

    // Happy Windows / MS Paint Canvas on Screen!
    d.roundRect(270, 150, 120, 90, 4, PAINT_PALETTE.white, PAINT_PALETTE.black, 3);
    d.circle(310, 190, 22, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 3);
    d.roundRect(410, 160, 110, 16, 2, PAINT_PALETTE.blue, PAINT_PALETTE.black, 2);
    d.roundRect(410, 185, 90, 12, 2, PAINT_PALETTE.green, PAINT_PALETTE.black, 2);
    d.roundRect(410, 205, 100, 12, 2, PAINT_PALETTE.orange, PAINT_PALETTE.black, 2);

    // Keyboard with Keys
    d.polygon(
      [
        [250, 370],
        [550, 370],
        [570, 400],
        [230, 400],
      ],
      caseColor,
      PAINT_PALETTE.black,
      5
    );
    for (let k = 260; k < 540; k += 35) {
      d.roundRect(k, 376, 26, 16, 3, PAINT_PALETTE.white, PAINT_PALETTE.black, 2.5);
    }

    // Mouse & Curly Wire
    d.ellipse(605, 385, 20, 14, caseColor, PAINT_PALETTE.black, 4);
    d.line(605, 370, 570, 350, PAINT_PALETTE.black, 3);

    d.sparkles(400, 220, 4, 210);

    return { title: "Computer", category: "Technology", primaryColor: caseColor, accentColor: screenGlow };
  }

  // BUTTERFLY / INSECT / BEE
  if (p.includes("butterfly") || p.includes("moth")) {
    const wingColor = extractPromptColor(p, PAINT_PALETTE.lightBlue);
    const patternColor = PAINT_PALETTE.purple;

    // Big Symmetrical Wings
    // Top Left Wing
    d.ellipse(300, 190, 95, 75, wingColor, PAINT_PALETTE.black, 6, -0.3);
    d.circle(300, 190, 28, patternColor, PAINT_PALETTE.black, 4);
    d.circle(300, 190, 12, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 3);

    // Top Right Wing
    d.ellipse(500, 190, 95, 75, wingColor, PAINT_PALETTE.black, 6, 0.3);
    d.circle(500, 190, 28, patternColor, PAINT_PALETTE.black, 4);
    d.circle(500, 190, 12, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 3);

    // Bottom Left Wing
    d.ellipse(325, 300, 75, 60, wingColor, PAINT_PALETTE.black, 6, 0.4);
    d.circle(330, 300, 20, PAINT_PALETTE.orange, PAINT_PALETTE.black, 3);

    // Bottom Right Wing
    d.ellipse(475, 300, 75, 60, wingColor, PAINT_PALETTE.black, 6, -0.4);
    d.circle(470, 300, 20, PAINT_PALETTE.orange, PAINT_PALETTE.black, 3);

    // Body & Head
    d.roundRect(385, 170, 30, 160, 15, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 6);
    d.circle(400, 160, 24, PAINT_PALETTE.brown, PAINT_PALETTE.black, 5);

    // Curly Antennae
    d.line(390, 140, 360, 80, PAINT_PALETTE.black, 4);
    d.circle(355, 80, 8, PAINT_PALETTE.gold, PAINT_PALETTE.black, 3);
    d.line(410, 140, 440, 80, PAINT_PALETTE.black, 4);
    d.circle(445, 80, 8, PAINT_PALETTE.gold, PAINT_PALETTE.black, 3);

    // Cute face
    d.face(400, 162, 0.6, "happy");

    d.sparkles(400, 240, 6, 180);

    return { title: "Butterfly", category: "Nature", primaryColor: wingColor, accentColor: patternColor };
  }

  // WATERMELON / FRUIT / BANANA
  if (p.includes("watermelon") || p.includes("melon")) {
    // Green Rind
    d.ellipse(400, 260, 220, 160, PAINT_PALETTE.green, PAINT_PALETTE.black, 6, 0);
    // White Rind Layer
    d.ellipse(400, 255, 195, 138, PAINT_PALETTE.white, PAINT_PALETTE.black, 4, 0);
    // Red Sweet Meat
    d.ellipse(400, 250, 175, 120, PAINT_PALETTE.red, PAINT_PALETTE.black, 5, 0);

    // Cut half mask (turns oval into a giant juicy wedge)
    ctx.fillStyle = PAINT_PALETTE.white;
    ctx.fillRect(150, 90, 500, 160);
    d.line(180, 250, 620, 250, PAINT_PALETTE.black, 6);

    // Black Teardrop Seeds
    const seedPositions = [
      [270, 285], [330, 315], [380, 280], [420, 320], [470, 290], [520, 310], [350, 350], [450, 350]
    ];
    seedPositions.forEach(([sx, sy]) => {
      d.ellipse(sx, sy, 8, 14, PAINT_PALETTE.black, PAINT_PALETTE.black, 2, 0.2);
    });

    // Big happy smile on watermelon
    d.face(400, 285, 1.2, "happy");
    d.sparkles(400, 270, 4, 190);

    return { title: "Watermelon", category: "Food", primaryColor: PAINT_PALETTE.red, accentColor: PAINT_PALETTE.green };
  }

  // BANANA
  if (p.includes("banana")) {
    const peelColor = PAINT_PALETTE.yellow;

    // Curved crescent peel
    d.polygon(
      [
        [260, 160],
        [310, 140],
        [460, 220],
        [540, 330],
        [500, 350],
        [410, 260],
        [280, 190],
      ],
      peelColor,
      PAINT_PALETTE.black,
      6
    );

    // Stalk tip
    d.roundRect(240, 145, 30, 20, 4, PAINT_PALETTE.darkGreen, PAINT_PALETTE.black, 4);
    d.circle(535, 345, 10, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 3);

    // Center seam line
    d.line(265, 160, 460, 255, PAINT_PALETTE.gold, 5);
    d.line(460, 255, 525, 335, PAINT_PALETTE.gold, 5);

    // Cute face
    d.face(420, 230, 0.9, "happy");
    d.sparkles(400, 240, 4, 160);

    return { title: "Banana", category: "Food", primaryColor: peelColor, accentColor: PAINT_PALETTE.gold };
  }

  // SWORD / WEAPON / SHIELD
  if (p.includes("sword") || p.includes("blade") || p.includes("katana") || p.includes("dagger")) {
    const bladeColor = extractPromptColor(p, PAINT_PALETTE.silver);

    // Shining Blade
    d.polygon(
      [
        [400, 70],
        [430, 110],
        [425, 330],
        [375, 330],
        [370, 110],
      ],
      bladeColor,
      PAINT_PALETTE.black,
      6
    );

    // Fuller / Center groove & highlight
    d.line(400, 95, 400, 310, PAINT_PALETTE.white, 4);

    // Crossguard
    d.roundRect(320, 330, 160, 26, 8, PAINT_PALETTE.gold, PAINT_PALETTE.black, 5);
    d.circle(400, 343, 14, PAINT_PALETTE.red, PAINT_PALETTE.black, 3); // Gem

    // Grip Handle
    d.roundRect(386, 356, 28, 75, 4, PAINT_PALETTE.brown, PAINT_PALETTE.black, 5);
    d.line(386, 375, 414, 375, PAINT_PALETTE.gold, 3);
    d.line(386, 395, 414, 395, PAINT_PALETTE.gold, 3);
    d.line(386, 415, 414, 415, PAINT_PALETTE.gold, 3);

    // Pommel (end knob)
    d.circle(400, 445, 18, PAINT_PALETTE.gold, PAINT_PALETTE.black, 4);

    // Magic Gleams & Stars
    d.sparkles(400, 200, 6, 170);

    return { title: "Sword", category: "Item", primaryColor: bladeColor, accentColor: PAINT_PALETTE.gold };
  }

  // CAMPFIRE / FIRE / FLAME
  if (p.includes("fire") || p.includes("campfire") || p.includes("flame")) {
    // Stone circle ring
    const stoneXs = [240, 290, 350, 420, 490, 540];
    stoneXs.forEach((sx) => {
      d.ellipse(sx, 410, 28, 16, PAINT_PALETTE.silver, PAINT_PALETTE.black, 4);
    });

    // Crossed wooden logs
    d.roundRect(240, 370, 320, 30, 10, PAINT_PALETTE.brown, PAINT_PALETTE.black, 6);
    d.roundRect(270, 360, 260, 30, 10, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 6);

    // Big Dancing Flame Tongues
    d.polygon(
      [
        [310, 370],
        [270, 270],
        [320, 240],
        [350, 150],
        [400, 90],
        [450, 160],
        [490, 240],
        [530, 280],
        [490, 370],
      ],
      PAINT_PALETTE.red,
      PAINT_PALETTE.black,
      6
    );

    // Inner Orange Heart
    d.polygon(
      [
        [340, 370],
        [310, 290],
        [360, 200],
        [400, 150],
        [440, 210],
        [480, 300],
        [460, 370],
      ],
      PAINT_PALETTE.orange,
      PAINT_PALETTE.red,
      4
    );

    // Core Yellow Glow
    d.polygon(
      [
        [365, 370],
        [350, 310],
        [400, 230],
        [440, 310],
        [430, 370],
      ],
      PAINT_PALETTE.yellow,
      PAINT_PALETTE.orange,
      3
    );

    // Floating Sparks
    d.circle(360, 90, 6, PAINT_PALETTE.yellow, PAINT_PALETTE.orange, 2);
    d.circle(440, 75, 8, PAINT_PALETTE.yellow, PAINT_PALETTE.orange, 2);
    d.circle(410, 45, 5, PAINT_PALETTE.yellow, PAINT_PALETTE.orange, 2);

    d.groundLine(430, PAINT_PALETTE.darkGreen);

    return { title: "Campfire", category: "Nature", primaryColor: PAINT_PALETTE.orange, accentColor: PAINT_PALETTE.yellow };
  }

  // ROCKET / SPACESHIP / ALIEN / UFO
  if (p.includes("rocket") || p.includes("space") || p.includes("alien") || p.includes("ufo")) {
    const shipColor = extractPromptColor(p, PAINT_PALETTE.white);

    // Space stars in background
    d.circle(180, 100, 4, PAINT_PALETTE.yellow, PAINT_PALETTE.yellow, 1);
    d.circle(620, 120, 5, PAINT_PALETTE.yellow, PAINT_PALETTE.yellow, 1);
    d.circle(220, 320, 4, PAINT_PALETTE.yellow, PAINT_PALETTE.yellow, 1);
    d.circle(600, 290, 4, PAINT_PALETTE.yellow, PAINT_PALETTE.yellow, 1);

    // Exhaust flames
    d.polygon([[370, 380], [400, 470], [430, 380]], PAINT_PALETTE.yellow, PAINT_PALETTE.orange, 4);
    d.polygon([[350, 380], [400, 490], [450, 380]], PAINT_PALETTE.red, PAINT_PALETTE.black, 4);

    // Booster fins
    d.polygon([[340, 300], [280, 390], [340, 370]], PAINT_PALETTE.red, PAINT_PALETTE.black, 5);
    d.polygon([[460, 300], [520, 390], [460, 370]], PAINT_PALETTE.red, PAINT_PALETTE.black, 5);

    // Fuselage Rocket Body
    d.polygon(
      [
        [400, 80],
        [460, 200],
        [460, 380],
        [340, 380],
        [340, 200],
      ],
      shipColor,
      PAINT_PALETTE.black,
      6
    );

    // Red Nose Cone
    d.polygon([[400, 80], [445, 170], [355, 170]], PAINT_PALETTE.red, PAINT_PALETTE.black, 5);

    // Porthole Glass with Cute Alien or Astronaut
    d.circle(400, 240, 42, PAINT_PALETTE.lightBlue, PAINT_PALETTE.black, 6);
    d.circle(400, 240, 32, PAINT_PALETTE.white, PAINT_PALETTE.black, 2);
    // Green alien inside waving
    d.circle(400, 240, 20, PAINT_PALETTE.lime, PAINT_PALETTE.black, 3);
    d.circle(393, 235, 4, PAINT_PALETTE.black, PAINT_PALETTE.black, 1);
    d.circle(407, 235, 4, PAINT_PALETTE.black, PAINT_PALETTE.black, 1);

    d.sparkles(400, 220, 4, 190);

    return { title: "Spaceship", category: "Sci-Fi", primaryColor: shipColor, accentColor: PAINT_PALETTE.red };
  }

  // CAT / KITTEN
  if (p.includes("cat") || p.includes("kitten") || p.includes("kitty")) {
    const catColor = extractPromptColor(p, PAINT_PALETTE.orange);
    // Ears
    d.polygon([[320, 160], [285, 90], [350, 130]], catColor, PAINT_PALETTE.black, 5);
    d.polygon([[322, 150], [298, 105], [342, 132]], PAINT_PALETTE.pink, PAINT_PALETTE.black, 3);
    d.polygon([[480, 160], [515, 90], [450, 130]], catColor, PAINT_PALETTE.black, 5);
    d.polygon([[478, 150], [502, 105], [458, 132]], PAINT_PALETTE.pink, PAINT_PALETTE.black, 3);
    // Body & Tail
    d.ellipse(400, 310, 110, 95, catColor, PAINT_PALETTE.black, 6);
    d.ellipse(400, 325, 70, 65, PAINT_PALETTE.white, PAINT_PALETTE.black, 4);
    // Tail
    d.polygon([[490, 320], [590, 270], [605, 230], [585, 225], [560, 260], [480, 350]], catColor, PAINT_PALETTE.black, 5);
    // Head
    d.ellipse(400, 195, 85, 75, catColor, PAINT_PALETTE.black, 6);
    // Collar & Bell
    d.ellipse(400, 260, 55, 12, PAINT_PALETTE.red, PAINT_PALETTE.black, 4);
    d.circle(400, 270, 10, PAINT_PALETTE.gold, PAINT_PALETTE.black, 3);
    // Whiskers
    d.line(330, 205, 240, 195, PAINT_PALETTE.black, 3.5);
    d.line(330, 218, 245, 225, PAINT_PALETTE.black, 3.5);
    d.line(470, 205, 560, 195, PAINT_PALETTE.black, 3.5);
    d.line(470, 218, 555, 225, PAINT_PALETTE.black, 3.5);
    // Face
    d.face(400, 195, 1, "happy");
    // Nose
    d.polygon([[393, 202], [407, 202], [400, 210]], PAINT_PALETTE.pink, PAINT_PALETTE.black, 2);
    d.groundLine(410, PAINT_PALETTE.green);
    return { title: "Cat", category: "Animal", primaryColor: catColor, accentColor: PAINT_PALETTE.pink };
  }

  // DOG / PUPPY
  if (p.includes("dog") || p.includes("puppy") || p.includes("hound")) {
    const dogColor = extractPromptColor(p, PAINT_PALETTE.brown);
    // Floppy Ears
    d.roundRect(280, 150, 45, 100, 20, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 5);
    d.roundRect(475, 150, 45, 100, 20, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 5);
    // Body & Tail
    d.ellipse(400, 320, 115, 95, dogColor, PAINT_PALETTE.black, 6);
    d.roundRect(500, 280, 70, 24, 12, dogColor, PAINT_PALETTE.black, 5); // wagging tail
    // Head & Snout
    d.circle(400, 190, 80, dogColor, PAINT_PALETTE.black, 6);
    d.ellipse(400, 225, 50, 35, PAINT_PALETTE.tan, PAINT_PALETTE.black, 4);
    // Nose & Tongue
    d.ellipse(400, 205, 16, 12, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    d.roundRect(390, 235, 22, 26, 10, PAINT_PALETTE.hotPink, PAINT_PALETTE.black, 3); // panting tongue
    // Collar & Tag
    d.roundRect(350, 255, 100, 16, 6, PAINT_PALETTE.blue, PAINT_PALETTE.black, 4);
    d.circle(400, 275, 12, PAINT_PALETTE.gold, PAINT_PALETTE.black, 3);
    d.face(400, 175, 1, "happy");
    d.groundLine(420, PAINT_PALETTE.green);
    return { title: "Dog", category: "Animal", primaryColor: dogColor, accentColor: PAINT_PALETTE.blue };
  }

  // CAR / TRUCK / VEHICLE
  if (p.includes("car") || p.includes("auto") || p.includes("truck") || p.includes("taxi")) {
    const carColor = extractPromptColor(p, PAINT_PALETTE.red);
    // Wheels
    d.circle(280, 370, 38, PAINT_PALETTE.black, PAINT_PALETTE.black, 6);
    d.circle(280, 370, 18, PAINT_PALETTE.silver, PAINT_PALETTE.black, 4);
    d.circle(520, 370, 38, PAINT_PALETTE.black, PAINT_PALETTE.black, 6);
    d.circle(520, 370, 18, PAINT_PALETTE.silver, PAINT_PALETTE.black, 4);
    // Lower Chassis
    d.roundRect(170, 280, 460, 95, 22, carColor, PAINT_PALETTE.black, 6);
    // Cabin & Windshield
    d.polygon([[250, 280], [310, 170], [480, 170], [530, 280]], carColor, PAINT_PALETTE.black, 6);
    d.polygon([[270, 270], [320, 185], [385, 185], [385, 270]], PAINT_PALETTE.lightBlue, PAINT_PALETTE.black, 4);
    d.polygon([[405, 270], [405, 185], [470, 185], [510, 270]], PAINT_PALETTE.lightBlue, PAINT_PALETTE.black, 4);
    // Headlights
    d.roundRect(610, 295, 22, 35, 8, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 4);
    d.roundRect(165, 305, 14, 25, 4, PAINT_PALETTE.darkRed, PAINT_PALETTE.black, 3);
    // Door handle & bumper
    d.roundRect(375, 300, 28, 8, 3, PAINT_PALETTE.silver, PAINT_PALETTE.black, 3);
    d.roundRect(150, 350, 40, 20, 4, PAINT_PALETTE.silver, PAINT_PALETTE.black, 4);
    d.roundRect(610, 350, 40, 20, 4, PAINT_PALETTE.silver, PAINT_PALETTE.black, 4);
    d.groundLine(410, PAINT_PALETTE.silver);
    return { title: "Car", category: "Vehicle", primaryColor: carColor, accentColor: PAINT_PALETTE.yellow };
  }

  // PIZZA / SLICE
  if (p.includes("pizza")) {
    // Triangular Slice
    d.polygon([[400, 90], [560, 390], [240, 390]], PAINT_PALETTE.yellow, PAINT_PALETTE.black, 6);
    // Crust
    d.roundRect(220, 375, 360, 45, 18, PAINT_PALETTE.brown, PAINT_PALETTE.black, 6);
    // Pepperoni slices
    d.circle(380, 190, 24, PAINT_PALETTE.red, PAINT_PALETTE.black, 4);
    d.circle(330, 270, 26, PAINT_PALETTE.red, PAINT_PALETTE.black, 4);
    d.circle(440, 280, 28, PAINT_PALETTE.red, PAINT_PALETTE.black, 4);
    d.circle(380, 340, 26, PAINT_PALETTE.red, PAINT_PALETTE.black, 4);
    // Melting Cheese Strings
    d.polygon([[370, 390], [385, 430], [400, 390]], PAINT_PALETTE.yellow, PAINT_PALETTE.black, 3);
    d.polygon([[430, 390], [445, 420], [460, 390]], PAINT_PALETTE.yellow, PAINT_PALETTE.black, 3);
    d.face(390, 250, 1, "happy");
    d.sparkles(400, 240, 4, 180);
    return { title: "Pizza", category: "Food", primaryColor: PAINT_PALETTE.yellow, accentColor: PAINT_PALETTE.red };
  }

  // BURGER / CHEESEBURGER
  if (p.includes("burger")) {
    // Bottom Bun
    d.roundRect(260, 350, 280, 50, 16, PAINT_PALETTE.brown, PAINT_PALETTE.black, 6);
    // Patty
    d.roundRect(240, 310, 320, 45, 12, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 6);
    // Melted Cheese
    d.polygon([[250, 305], [550, 305], [530, 335], [470, 310], [410, 345], [350, 310], [290, 340]], PAINT_PALETTE.yellow, PAINT_PALETTE.black, 4);
    // Lettuce & Tomato
    d.roundRect(245, 275, 310, 25, 8, PAINT_PALETTE.green, PAINT_PALETTE.black, 5);
    d.roundRect(270, 250, 260, 28, 8, PAINT_PALETTE.red, PAINT_PALETTE.black, 5);
    // Top Bun Dome
    d.ellipse(400, 230, 145, 85, PAINT_PALETTE.brown, PAINT_PALETTE.black, 6);
    // Sesame Seeds
    d.ellipse(340, 185, 5, 8, PAINT_PALETTE.white, PAINT_PALETTE.black, 2, 0.4);
    d.ellipse(400, 175, 5, 8, PAINT_PALETTE.white, PAINT_PALETTE.black, 2, -0.2);
    d.ellipse(460, 190, 5, 8, PAINT_PALETTE.white, PAINT_PALETTE.black, 2, 0.5);
    d.face(400, 230, 1, "happy");
    d.sparkles(400, 250, 4, 180);
    return { title: "Burger", category: "Food", primaryColor: PAINT_PALETTE.brown, accentColor: PAINT_PALETTE.yellow };
  }

  // CAKE / CUPCAKE / BIRTHDAY
  if (p.includes("cake") || p.includes("cupcake") || p.includes("birthday")) {
    const icingColor = extractPromptColor(p, PAINT_PALETTE.pink);
    // Plate
    d.ellipse(400, 420, 230, 35, PAINT_PALETTE.silver, PAINT_PALETTE.black, 5);
    // Bottom Tier
    d.roundRect(250, 280, 300, 120, 12, PAINT_PALETTE.tan, PAINT_PALETTE.black, 6);
    d.roundRect(240, 260, 320, 35, 12, icingColor, PAINT_PALETTE.black, 5);
    // Top Tier
    d.roundRect(290, 170, 220, 95, 10, PAINT_PALETTE.tan, PAINT_PALETTE.black, 6);
    d.roundRect(280, 155, 240, 30, 10, icingColor, PAINT_PALETTE.black, 5);
    // Birthday Candle & Flame
    d.roundRect(390, 105, 20, 55, 4, PAINT_PALETTE.blue, PAINT_PALETTE.black, 4);
    d.polygon([[400, 65], [415, 95], [385, 95]], PAINT_PALETTE.yellow, PAINT_PALETTE.orange, 3);
    d.circle(400, 85, 6, PAINT_PALETTE.red, PAINT_PALETTE.orange, 2);
    // Cherry
    d.circle(400, 155, 16, PAINT_PALETTE.darkRed, PAINT_PALETTE.black, 3);
    d.face(400, 330, 1.2, "happy");
    d.sparkles(400, 230, 5, 190);
    return { title: "Cake", category: "Food", primaryColor: icingColor, accentColor: PAINT_PALETTE.yellow };
  }

  // ICE CREAM / POPSICLE
  if (p.includes("ice cream") || p.includes("gelato") || p.includes("popsicle")) {
    const scoopColor = extractPromptColor(p, PAINT_PALETTE.pink);
    // Waffle Cone
    d.polygon([[400, 440], [480, 260], [320, 260]], PAINT_PALETTE.tan, PAINT_PALETTE.black, 6);
    d.line(340, 290, 460, 390, PAINT_PALETTE.brown, 3);
    d.line(380, 270, 440, 410, PAINT_PALETTE.brown, 3);
    d.line(440, 270, 380, 410, PAINT_PALETTE.brown, 3);
    // Lower Scoop
    d.circle(400, 240, 75, PAINT_PALETTE.cream, PAINT_PALETTE.black, 6);
    // Upper Scoop
    d.circle(400, 150, 70, scoopColor, PAINT_PALETTE.black, 6);
    // Cherry on top
    d.circle(400, 80, 18, PAINT_PALETTE.red, PAINT_PALETTE.black, 4);
    d.line(400, 70, 425, 40, PAINT_PALETTE.darkGreen, 3);
    // Sprinkles
    d.line(370, 130, 390, 135, PAINT_PALETTE.blue, 4);
    d.line(420, 120, 435, 135, PAINT_PALETTE.yellow, 4);
    d.line(400, 160, 415, 175, PAINT_PALETTE.green, 4);
    d.face(400, 240, 0.9, "happy");
    d.sparkles(400, 200, 4, 170);
    return { title: "Ice Cream", category: "Food", primaryColor: scoopColor, accentColor: PAINT_PALETTE.cream };
  }

  // FLOWER / MEADOW / ROSE / SUNFLOWER
  if (p.includes("flower") || p.includes("sunflower") || p.includes("rose") || p.includes("tulip") || p.includes("garden")) {
    const petalColor = extractPromptColor(p, PAINT_PALETTE.yellow);
    // Stem & Leaves
    d.line(400, 240, 400, 440, PAINT_PALETTE.green, 10);
    d.ellipse(340, 330, 45, 20, PAINT_PALETTE.green, PAINT_PALETTE.black, 4, -0.5);
    d.ellipse(460, 360, 45, 20, PAINT_PALETTE.green, PAINT_PALETTE.black, 4, 0.5);
    // Petals
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const px = 400 + Math.cos(angle) * 75;
      const py = 210 + Math.sin(angle) * 75;
      d.circle(px, py, 38, petalColor, PAINT_PALETTE.black, 5);
    }
    // Flower Center
    d.circle(400, 210, 50, PAINT_PALETTE.brown, PAINT_PALETTE.black, 6);
    d.face(400, 210, 0.9, "happy");
    d.groundLine(440, PAINT_PALETTE.green);
    return { title: "Flower", category: "Nature", primaryColor: petalColor, accentColor: PAINT_PALETTE.green };
  }

  // TREE / FOREST / WOODS
  if (p.includes("tree") || p.includes("forest") || p.includes("woods")) {
    const foliageColor = extractPromptColor(p, PAINT_PALETTE.green);
    // Trunk
    d.polygon([[370, 240], [430, 240], [460, 440], [340, 440]], PAINT_PALETTE.brown, PAINT_PALETTE.black, 6);
    // Foliage Clouds
    d.circle(320, 220, 85, foliageColor, PAINT_PALETTE.black, 6);
    d.circle(480, 220, 85, foliageColor, PAINT_PALETTE.black, 6);
    d.circle(400, 140, 95, foliageColor, PAINT_PALETTE.black, 6);
    d.circle(400, 210, 80, foliageColor, PAINT_PALETTE.black, 6);
    // Apples in tree
    d.circle(340, 180, 12, PAINT_PALETTE.red, PAINT_PALETTE.black, 3);
    d.circle(450, 170, 12, PAINT_PALETTE.red, PAINT_PALETTE.black, 3);
    d.circle(390, 230, 12, PAINT_PALETTE.red, PAINT_PALETTE.black, 3);
    d.groundLine(430, PAINT_PALETTE.green);
    return { title: "Tree", category: "Nature", primaryColor: foliageColor, accentColor: PAINT_PALETTE.brown };
  }

  // SUN / SUNNY
  if (p.includes("sun") || p.includes("sunny")) {
    // Sun Rays
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      d.line(
        400 + Math.cos(angle) * 135,
        240 + Math.sin(angle) * 135,
        400 + Math.cos(angle) * 195,
        240 + Math.sin(angle) * 195,
        PAINT_PALETTE.gold,
        8
      );
    }
    // Main Sun Body
    d.circle(400, 240, 125, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 6);
    // Cool Sunglasses or Smiley Face
    d.face(400, 240, 1.4, p.includes("cool") ? "cool" : "happy");
    return { title: "Sun", category: "Weather", primaryColor: PAINT_PALETTE.yellow, accentColor: PAINT_PALETTE.gold };
  }

  // RAINBOW
  if (p.includes("rainbow")) {
    const arcColors = [
      PAINT_PALETTE.red,
      PAINT_PALETTE.orange,
      PAINT_PALETTE.yellow,
      PAINT_PALETTE.green,
      PAINT_PALETTE.blue,
      PAINT_PALETTE.purple,
    ];
    arcColors.forEach((color, idx) => {
      d.ellipse(400, 360, 280 - idx * 22, 230 - idx * 22, color, PAINT_PALETTE.black, 5);
    });
    // Mask lower center
    ctx.fillStyle = PAINT_PALETTE.white;
    ctx.fillRect(100, 360, 600, 140);
    d.circle(400, 360, 140, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    // Clouds on left & right
    d.circle(200, 370, 45, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.circle(240, 350, 50, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.circle(280, 370, 45, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.circle(520, 370, 45, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.circle(560, 350, 50, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.circle(600, 370, 45, PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.sparkles(400, 180, 5, 210);
    return { title: "Rainbow", category: "Weather", primaryColor: PAINT_PALETTE.red, accentColor: PAINT_PALETTE.purple };
  }

  // GHOST / SPOOKY / HALLOWEEN
  if (p.includes("ghost") || p.includes("spooky") || p.includes("halloween")) {
    // Flowing ghost sheet body
    d.polygon(
      [
        [400, 110],
        [490, 180],
        [480, 360],
        [450, 340],
        [420, 370],
        [380, 340],
        [350, 370],
        [320, 340],
        [310, 360],
        [310, 180],
      ],
      PAINT_PALETTE.white,
      PAINT_PALETTE.black,
      6
    );
    // Spooky O-shaped Eyes & Mouth
    d.ellipse(370, 190, 14, 22, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    d.ellipse(430, 190, 14, 22, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    d.ellipse(400, 240, 18, 28, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    // Little floating candy bucket
    d.circle(510, 280, 25, PAINT_PALETTE.orange, PAINT_PALETTE.black, 4);
    d.line(510, 255, 480, 260, PAINT_PALETTE.black, 3);
    d.sparkles(400, 220, 4, 180);
    return { title: "Ghost", category: "Fantasy", primaryColor: PAINT_PALETTE.white, accentColor: PAINT_PALETTE.black };
  }

  // SNOWMAN / WINTER
  if (p.includes("snowman") || p.includes("snow") || p.includes("winter")) {
    // Bottom Snowball
    d.circle(400, 350, 95, PAINT_PALETTE.white, PAINT_PALETTE.black, 6);
    // Middle Snowball
    d.circle(400, 225, 70, PAINT_PALETTE.white, PAINT_PALETTE.black, 6);
    // Head Snowball
    d.circle(400, 130, 50, PAINT_PALETTE.white, PAINT_PALETTE.black, 6);
    // Top Hat
    d.roundRect(350, 75, 100, 18, 4, PAINT_PALETTE.black, PAINT_PALETTE.black, 4);
    d.roundRect(365, 30, 70, 50, 4, PAINT_PALETTE.black, PAINT_PALETTE.black, 4);
    d.roundRect(365, 65, 70, 10, 2, PAINT_PALETTE.red, PAINT_PALETTE.black, 2);
    // Carrot Nose
    d.polygon([[400, 130], [455, 138], [400, 145]], PAINT_PALETTE.orange, PAINT_PALETTE.black, 3);
    // Coal Buttons & Smile
    d.circle(400, 205, 6, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    d.circle(400, 230, 6, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    d.circle(400, 255, 6, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    // Branch arms
    d.line(335, 215, 255, 175, PAINT_PALETTE.brown, 5);
    d.line(280, 185, 275, 160, PAINT_PALETTE.brown, 4);
    d.line(465, 215, 545, 175, PAINT_PALETTE.brown, 5);
    d.face(400, 125, 0.7, "happy");
    d.groundLine(430, PAINT_PALETTE.white);
    return { title: "Snowman", category: "Winter", primaryColor: PAINT_PALETTE.white, accentColor: PAINT_PALETTE.red };
  }

  // FISH / SHARK / WHALE
  if (p.includes("fish") || p.includes("shark") || p.includes("whale") || p.includes("dolphin")) {
    const fishColor = extractPromptColor(p, PAINT_PALETTE.orange);
    // Tail fin
    d.polygon([[250, 250], [170, 170], [190, 250], [170, 330]], fishColor, PAINT_PALETTE.black, 6);
    // Main Body Oval
    d.ellipse(370, 250, 130, 85, fishColor, PAINT_PALETTE.black, 6);
    // Belly
    d.ellipse(370, 275, 110, 50, PAINT_PALETTE.white, PAINT_PALETTE.black, 4);
    // Dorsal & Pectoral Fins
    d.polygon([[350, 170], [390, 120], [420, 170]], fishColor, PAINT_PALETTE.black, 5);
    d.ellipse(370, 270, 35, 18, fishColor, PAINT_PALETTE.black, 4, 0.3);
    // Eye & Smile
    d.circle(445, 230, 14, PAINT_PALETTE.white, PAINT_PALETTE.black, 4);
    d.circle(448, 230, 6, PAINT_PALETTE.black, PAINT_PALETTE.black, 2);
    d.line(475, 255, 495, 260, PAINT_PALETTE.black, 4);
    // Water bubbles
    d.circle(520, 220, 12, PAINT_PALETTE.lightBlue, PAINT_PALETTE.blue, 3);
    d.circle(550, 180, 18, PAINT_PALETTE.lightBlue, PAINT_PALETTE.blue, 3);
    d.circle(570, 130, 10, PAINT_PALETTE.lightBlue, PAINT_PALETTE.blue, 3);
    return { title: "Fish", category: "Marine", primaryColor: fishColor, accentColor: PAINT_PALETTE.lightBlue };
  }

  // HEART / VALENTINE / LOVE
  if (p.includes("heart") || p.includes("love") || p.includes("valentine")) {
    const heartColor = extractPromptColor(p, PAINT_PALETTE.red);
    // Wings
    d.polygon([[310, 230], [180, 160], [160, 250], [210, 270], [300, 270]], PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    d.polygon([[490, 230], [620, 160], [640, 250], [590, 270], [500, 270]], PAINT_PALETTE.white, PAINT_PALETTE.black, 5);
    // Big Heart
    d.polygon(
      [
        [400, 380],
        [280, 260],
        [280, 160],
        [340, 130],
        [400, 180],
        [460, 130],
        [520, 160],
        [520, 260],
      ],
      heartColor,
      PAINT_PALETTE.black,
      6
    );
    // Golden Halo
    d.ellipse(400, 100, 65, 18, PAINT_PALETTE.gold, PAINT_PALETTE.black, 4);
    d.face(400, 240, 1.2, "happy");
    d.sparkles(400, 240, 4, 180);
    return { title: "Heart", category: "Symbol", primaryColor: heartColor, accentColor: PAINT_PALETTE.gold };
  }

  // SMILEY / EMOJI / PERSON
  if (p.includes("smile") || p.includes("smiley") || p.includes("emoji") || p.includes("face") || p.includes("person") || p.includes("kid")) {
    d.circle(400, 240, 130, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 6);
    d.face(400, 240, 1.6, p.includes("cool") ? "cool" : "happy");
    d.sparkles(400, 240, 4, 180);
    return { title: "Smiley", category: "Emoji", primaryColor: PAINT_PALETTE.yellow, accentColor: PAINT_PALETTE.black };
  }

  // =========================================================================
  // 2. UNIVERSAL COMPOSITIONAL SYNTHESIZER FOR ANY UNKNOWN PHRASE
  // =========================================================================
  // If the word is entirely custom or bizarre (e.g. "wobblebot", "chimera", "hoverboard", "quantum widget"):
  // The engine analyzes its morphology and synthesizes a fully fleshed-out, humorous,
  // tactile MS Paint character/invention with custom limbs, face, palette, and badge!
  const customColor = extractPromptColor(p, PAINT_PALETTE.orange);
  const secondaryColor = extractPromptColor(p.replace(/red|blue|green|orange|yellow|pink|purple/g, ""), PAINT_PALETTE.lightBlue);

  // Form factor derived deterministically from prompt hash
  const rngVal = d.rng();
  const isMechanical = p.includes("bot") || p.includes("mech") || p.includes("tron") || rngVal > 0.5;

  // Background Ground / Aura
  d.groundLine(410, PAINT_PALETTE.green);
  d.sparkles(400, 240, 6, 185);

  if (isMechanical) {
    // Custom Robot / Invention Apparatus
    // Legs / Treads
    d.roundRect(310, 360, 50, 60, 10, PAINT_PALETTE.silver, PAINT_PALETTE.black, 5);
    d.roundRect(440, 360, 50, 60, 10, PAINT_PALETTE.silver, PAINT_PALETTE.black, 5);
    d.roundRect(290, 405, 80, 25, 8, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 4);
    d.roundRect(430, 405, 80, 25, 8, PAINT_PALETTE.darkBrown, PAINT_PALETTE.black, 4);

    // Torso / Chassis
    d.roundRect(290, 210, 220, 160, 20, customColor, PAINT_PALETTE.black, 6);

    // Chest Panel Screen with Meter
    d.roundRect(330, 260, 140, 80, 8, secondaryColor, PAINT_PALETTE.black, 5);
    d.line(345, 300, 455, 300, PAINT_PALETTE.white, 3);
    d.circle(400, 300, 8, PAINT_PALETTE.red, PAINT_PALETTE.black, 2);

    // Head
    d.roundRect(325, 110, 150, 105, 18, customColor, PAINT_PALETTE.black, 6);
    // Antenna with glowing bulb
    d.line(400, 110, 400, 60, PAINT_PALETTE.black, 5);
    d.circle(400, 50, 16, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 4);

    // Expressive Digital Eyes & Smile
    d.roundRect(350, 135, 35, 30, 6, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 3);
    d.roundRect(415, 135, 35, 30, 6, PAINT_PALETTE.yellow, PAINT_PALETTE.black, 3);
    d.line(365, 185, 435, 185, PAINT_PALETTE.black, 5);

    // Arms waving
    d.roundRect(220, 240, 70, 26, 12, PAINT_PALETTE.silver, PAINT_PALETTE.black, 5);
    d.circle(220, 253, 16, PAINT_PALETTE.gold, PAINT_PALETTE.black, 4);
    d.roundRect(510, 210, 75, 26, 12, PAINT_PALETTE.silver, PAINT_PALETTE.black, 5);
    d.circle(585, 223, 16, PAINT_PALETTE.gold, PAINT_PALETTE.black, 4);
  } else {
    // Organic Whimsical Creature
    // Chubby legs
    d.roundRect(310, 350, 60, 70, 24, customColor, PAINT_PALETTE.black, 6);
    d.roundRect(430, 350, 60, 70, 24, customColor, PAINT_PALETTE.black, 6);

    // Main Soft Body
    d.ellipse(400, 270, 135, 120, customColor, PAINT_PALETTE.black, 6);

    // Tummy Oval
    d.ellipse(400, 285, 85, 80, secondaryColor, PAINT_PALETTE.black, 4);

    // Big Cute Ears or Horns
    d.polygon([[320, 180], [280, 90], [350, 160]], customColor, PAINT_PALETTE.black, 5);
    d.polygon([[480, 180], [520, 90], [450, 160]], customColor, PAINT_PALETTE.black, 5);

    // Cute Mascot Face
    d.face(400, 245, 1.4, "happy");

    // Little Cute Arms Holding a Star
    d.ellipse(300, 290, 28, 16, customColor, PAINT_PALETTE.black, 4, 0.4);
    d.ellipse(500, 290, 28, 16, customColor, PAINT_PALETTE.black, 4, -0.4);
    d.circle(515, 290, 14, PAINT_PALETTE.gold, PAINT_PALETTE.black, 3);
  }

  return {
    title: promptText.charAt(0).toUpperCase() + promptText.slice(1),
    category: isMechanical ? "Invention" : "Creature",
    primaryColor: customColor,
    accentColor: secondaryColor,
  };
}

// =========================================================================
// =========================================================================
// 3. REFERENCE IMAGE VECTOR TRACER & PRESET OVER-IMAGE PAINTER
// =========================================================================

export interface VectorRegion {
  color: string;
  polygon: [number, number][];
  area: number;
}

export interface VectorStroke {
  points: [number, number][];
  strokeWidth: number;
  color: string;
}

export interface TracedReferenceData {
  regions: VectorRegion[];
  strokes: VectorStroke[];
  draftLines: [number, number][][];
  guideEllipses: { cx: number; cy: number; rx: number; ry: number }[];
  sparkles: [number, number][];
  paths?: [number, number][][];
}

// Distance from point to line segment
function distanceToSegment(p: [number, number], p1: [number, number], p2: [number, number]): number {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - p1[0], p[1] - p1[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - p1[0]) * dx + (p[1] - p1[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - (p1[0] + t * dx), p[1] - (p1[1] + t * dy));
}

// Ramer-Douglas-Peucker algorithm to simplify pixel noise into smooth hand-drawn doodle strokes
export function ramerDouglasPeucker(points: [number, number][], epsilon: number): [number, number][] {
  if (points.length < 3) return points;
  let dmax = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = distanceToSegment(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }
  if (dmax > epsilon) {
    const left = ramerDouglasPeucker(points.slice(0, index + 1), epsilon);
    const right = ramerDouglasPeucker(points.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  }
  return [points[0], points[end]];
}

// Polygon area via shoelace formula
function polygonArea(points: [number, number][]): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area) / 2;
}

// Classic 16-color MS Paint Palette for quantization
const MS_PAINT_PALETTE_ENTRIES: { name: string; hex: string; rgb: [number, number, number] }[] = [
  { name: "black", hex: "#1A2628", rgb: [26, 38, 40] },
  { name: "white", hex: "#FFFFFF", rgb: [255, 255, 255] },
  { name: "gray", hex: "#808080", rgb: [128, 128, 128] },
  { name: "silver", hex: "#C0C0C0", rgb: [192, 192, 192] },
  { name: "darkRed", hex: "#880015", rgb: [136, 0, 21] },
  { name: "red", hex: "#ED1C24", rgb: [237, 28, 36] },
  { name: "orange", hex: "#FF7F27", rgb: [255, 127, 39] },
  { name: "yellow", hex: "#FFF200", rgb: [255, 242, 0] },
  { name: "gold", hex: "#FFC90E", rgb: [255, 201, 14] },
  { name: "green", hex: "#22B14C", rgb: [34, 177, 76] },
  { name: "darkGreen", hex: "#0E6B23", rgb: [14, 107, 35] },
  { name: "lime", hex: "#B5E61D", rgb: [181, 230, 29] },
  { name: "blue", hex: "#00A2E8", rgb: [0, 162, 232] },
  { name: "deepBlue", hex: "#3F48CC", rgb: [63, 72, 204] },
  { name: "lightBlue", hex: "#99D9EA", rgb: [153, 217, 234] },
  { name: "purple", hex: "#A349A4", rgb: [163, 73, 164] },
  { name: "pink", hex: "#FFAEC9", rgb: [255, 174, 201] },
  { name: "brown", hex: "#B97A57", rgb: [185, 122, 87] },
  { name: "darkBrown", hex: "#583015", rgb: [88, 48, 21] },
  { name: "cream", hex: "#FFF9BD", rgb: [255, 249, 189] },
  { name: "tan", hex: "#E5AA70", rgb: [229, 170, 112] },
];

function findNearestPaintColorIndex(r: number, g: number, b: number): number {
  let bestDist = Infinity;
  let bestIdx = 0;
  for (let i = 0; i < MS_PAINT_PALETTE_ENTRIES.length; i++) {
    const c = MS_PAINT_PALETTE_ENTRIES[i].rgb;
    const dr = r - c[0];
    const dg = g - c[1];
    const db = b - c[2];
    const dist = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Traces contours and color regions from a reference image
 * into genuine MS Paint hand-drawn vector shapes and strokes
 */
export function extractReferenceVectors(img: HTMLImageElement): TracedReferenceData {
  // Use a crisp analysis resolution
  const gridW = 240;
  const aspect = (img.height || 1) / (img.width || 1);
  const gridH = Math.max(30, Math.min(300, Math.round(gridW * aspect)));

  const off = document.createElement("canvas");
  off.width = gridW;
  off.height = gridH;
  const offCtx = off.getContext("2d", { willReadFrequently: true });
  if (!offCtx) {
    return { regions: [], strokes: [], draftLines: [], guideEllipses: [], sparkles: [], paths: [] };
  }

  offCtx.drawImage(img, 0, 0, gridW, gridH);
  const imgData = offCtx.getImageData(0, 0, gridW, gridH);
  const src = imgData.data;

  // 1. Identify Background & Foreground
  let borderR = 0, borderG = 0, borderB = 0, borderCount = 0;
  let whiteBorderCount = 0;

  for (let x = 0; x < gridW; x++) {
    const idxTop = (0 * gridW + x) * 4;
    const idxBot = ((gridH - 1) * gridW + x) * 4;
    for (const idx of [idxTop, idxBot]) {
      const r = src[idx], g = src[idx + 1], b = src[idx + 2], a = src[idx + 3];
      borderCount++;
      borderR += r; borderG += g; borderB += b;
      if (a < 50 || (r > 220 && g > 220 && b > 220)) whiteBorderCount++;
    }
  }
  for (let y = 1; y < gridH - 1; y++) {
    const idxL = (y * gridW + 0) * 4;
    const idxR = (y * gridW + (gridW - 1)) * 4;
    for (const idx of [idxL, idxR]) {
      const r = src[idx], g = src[idx + 1], b = src[idx + 2], a = src[idx + 3];
      borderCount++;
      borderR += r; borderG += g; borderB += b;
      if (a < 50 || (r > 220 && g > 220 && b > 220)) whiteBorderCount++;
    }
  }

  borderR = Math.round(borderR / Math.max(1, borderCount));
  borderG = Math.round(borderG / Math.max(1, borderCount));
  borderB = Math.round(borderB / Math.max(1, borderCount));
  const isWhiteBg = whiteBorderCount / borderCount > 0.45;

  // Flood fill background from borders
  const isBg = new Uint8Array(gridW * gridH);
  const queue: number[] = [];

  function isBackgroundPixel(idx: number): boolean {
    const a = src[idx + 3];
    if (a < 40) return true;
    const r = src[idx];
    const g = src[idx + 1];
    const b = src[idx + 2];
    if (isWhiteBg) {
      return r > 225 && g > 225 && b > 225;
    }
    const diff = Math.abs(r - borderR) + Math.abs(g - borderG) + Math.abs(b - borderB);
    return diff < 45 || (r > 235 && g > 235 && b > 235);
  }

  // Seed boundary pixels
  for (let x = 0; x < gridW; x++) {
    const topIdx = 0 * gridW + x;
    const botIdx = (gridH - 1) * gridW + x;
    if (isBackgroundPixel(topIdx * 4) && !isBg[topIdx]) { isBg[topIdx] = 1; queue.push(topIdx); }
    if (isBackgroundPixel(botIdx * 4) && !isBg[botIdx]) { isBg[botIdx] = 1; queue.push(botIdx); }
  }
  for (let y = 1; y < gridH - 1; y++) {
    const leftIdx = y * gridW + 0;
    const rightIdx = y * gridW + (gridW - 1);
    if (isBackgroundPixel(leftIdx * 4) && !isBg[leftIdx]) { isBg[leftIdx] = 1; queue.push(leftIdx); }
    if (isBackgroundPixel(rightIdx * 4) && !isBg[rightIdx]) { isBg[rightIdx] = 1; queue.push(rightIdx); }
  }

  // BFS flood fill
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % gridW;
    const cy = Math.floor(curr / gridW);

    const neighbors = [
      [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) {
        const nIdx = ny * gridW + nx;
        if (!isBg[nIdx] && isBackgroundPixel(nIdx * 4)) {
          isBg[nIdx] = 1;
          queue.push(nIdx);
        }
      }
    }
  }

  // 2. Compute Bounding Box of Foreground Subject
  let minX = gridW, maxX = 0, minY = gridH, maxY = 0;
  let fgPixels = 0;
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      if (!isBg[y * gridW + x]) {
        fgPixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Fallback if image had no clear subject
  if (fgPixels < 50 || minX >= maxX || minY >= maxY) {
    minX = 15; maxX = gridW - 15;
    minY = 15; maxY = gridH - 15;
  }

  const fgW = Math.max(10, maxX - minX + 1);
  const fgH = Math.max(10, maxY - minY + 1);

  // Fit within 660x410 box inside 800x500 canvas
  const maxDrawW = 660;
  const maxDrawH = 410;
  const scale = Math.min(maxDrawW / fgW, maxDrawH / fgH);
  const drawW = fgW * scale;
  const drawH = fgH * scale;
  const offsetX = Math.round((800 - drawW) / 2);
  const offsetY = Math.round((500 - drawH) / 2);

  const toCanvasX = (gx: number) => offsetX + ((gx - minX) / fgW) * drawW;
  const toCanvasY = (gy: number) => offsetY + ((gy - minY) / fgH) * drawH;

  // 3. Map Foreground Pixels to MS Paint Palette
  const colorGrid = new Int16Array(gridW * gridH).fill(-1);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * gridW + x;
      if (isBg[idx]) continue;
      const pIdx = idx * 4;
      const r = src[pIdx];
      const g = src[pIdx + 1];
      const b = src[pIdx + 2];
      colorGrid[idx] = findNearestPaintColorIndex(r, g, b);
    }
  }

  // 4. Region Segmentation & Boundary Extraction
  const visitedRegions = new Uint8Array(gridW * gridH);
  const regions: VectorRegion[] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * gridW + x;
      const colIdx = colorGrid[idx];
      if (colIdx < 0 || visitedRegions[idx]) continue;

      // BFS to find connected region
      const compPixels: [number, number][] = [];
      const cQueue = [idx];
      visitedRegions[idx] = 1;
      let cHead = 0;

      while (cHead < cQueue.length) {
        const cCurr = cQueue[cHead++];
        const cx = cCurr % gridW;
        const cy = Math.floor(cCurr / gridW);
        compPixels.push([cx, cy]);

        const adj = [
          [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
        ];
        for (const [nx, ny] of adj) {
          if (nx >= minX && nx <= maxX && ny >= minY && ny <= maxY) {
            const nIdx = ny * gridW + nx;
            if (!visitedRegions[nIdx] && colorGrid[nIdx] === colIdx) {
              visitedRegions[nIdx] = 1;
              cQueue.push(nIdx);
            }
          }
        }
      }

      // Filter tiny noise specks
      if (compPixels.length < 18) continue;

      // Extract perimeter points
      const perimeterPoints: [number, number][] = [];
      for (const [px, py] of compPixels) {
        let isBorder = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH || colorGrid[ny * gridW + nx] !== colIdx) {
              isBorder = true;
              break;
            }
          }
          if (isBorder) break;
        }
        if (isBorder) perimeterPoints.push([px, py]);
      }

      if (perimeterPoints.length >= 3) {
        // Sort perimeter points radially around component center to form a clean closed polygon
        let centerGX = 0, centerGY = 0;
        for (const [px, py] of perimeterPoints) {
          centerGX += px; centerGY += py;
        }
        centerGX /= perimeterPoints.length;
        centerGY /= perimeterPoints.length;

        perimeterPoints.sort((a, b) => {
          const angleA = Math.atan2(a[1] - centerGY, a[0] - centerGX);
          const angleB = Math.atan2(b[1] - centerGY, b[0] - centerGX);
          return angleA - angleB;
        });

        const canvasPoly: [number, number][] = perimeterPoints.map(([px, py]) => [
          toCanvasX(px),
          toCanvasY(py),
        ]);

        const smoothPoly = ramerDouglasPeucker(canvasPoly, 2.5);
        if (smoothPoly.length >= 3) {
          const area = polygonArea(smoothPoly);
          const hex = MS_PAINT_PALETTE_ENTRIES[colIdx].hex;
          regions.push({ color: hex, polygon: smoothPoly, area });
        }
      }
    }
  }

  // 5. Trace Continuous Outline & Edge Strokes
  const isEdge = new Uint8Array(gridW * gridH);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * gridW + x;
      const c = colorGrid[idx];
      if (c < 0) continue;
      // Edge if adjacent to background or different color
      const right = x < gridW - 1 ? colorGrid[idx + 1] : -1;
      const down = y < gridH - 1 ? colorGrid[idx + gridW] : -1;
      if (right !== c || down !== c) {
        isEdge[idx] = 1;
      }
    }
  }

  const visitedEdges = new Uint8Array(gridW * gridH);
  const strokes: VectorStroke[] = [];
  const draftLines: [number, number][][] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * gridW + x;
      if (isEdge[idx] && !visitedEdges[idx]) {
        const chain: [number, number][] = [];
        let cx = x, cy = y;
        let isSilhouette = false;

        while (cx >= 0 && cx < gridW && cy >= 0 && cy < gridH && isEdge[cy * gridW + cx] && !visitedEdges[cy * gridW + cx]) {
          visitedEdges[cy * gridW + cx] = 1;
          const cX = toCanvasX(cx);
          const cY = toCanvasY(cy);
          chain.push([cX, cY]);

          if (isBg[cy * gridW + cx] || (cx > 0 && isBg[cy * gridW + cx - 1]) || (cx < gridW - 1 && isBg[cy * gridW + cx + 1])) {
            isSilhouette = true;
          }

          // Step to next adjacent edge
          let nextX = -1, nextY = -1;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx, ny = cy + dy;
              if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) {
                const nIdx = ny * gridW + nx;
                if (isEdge[nIdx] && !visitedEdges[nIdx]) {
                  nextX = nx; nextY = ny;
                  break;
                }
              }
            }
            if (nextX !== -1) break;
          }
          cx = nextX; cy = nextY;
        }

        if (chain.length >= 3) {
          const smoothChain = ramerDouglasPeucker(chain, 2.0);
          if (smoothChain.length >= 2) {
            strokes.push({
              points: smoothChain,
              strokeWidth: isSilhouette ? 5.5 : 4.0,
              color: PAINT_PALETTE.black,
            });
            draftLines.push(smoothChain);
          }
        }
      }
    }
  }

  // 6. Guideline Ellipses & Sparkles for Draft Phase & MS Paint Polish
  const guideEllipses = [
    {
      cx: offsetX + drawW / 2,
      cy: offsetY + drawH / 2,
      rx: drawW * 0.44,
      ry: drawH * 0.44,
    },
  ];

  const sparkles: [number, number][] = [
    [offsetX - 25, offsetY + 30],
    [offsetX + drawW + 25, offsetY + 50],
    [offsetX + drawW * 0.85, offsetY - 20],
  ];

  return {
    regions,
    strokes,
    draftLines,
    guideEllipses,
    sparkles,
    paths: draftLines,
  };
}

/**
 * Draws over a reference image using the preset drawing program's style
 */
export function drawPresetOverImage(
  data: TracedReferenceData,
  ctx: CanvasRenderingContext2D,
  phase: DrawPhase = "full"
) {
  const { regions, strokes, draftLines, guideEllipses, sparkles } = data;

  // Background is pure clean paper white
  ctx.fillStyle = PAINT_PALETTE.white;
  ctx.fillRect(0, 0, 800, 500);

  // Phase 1: Draft - Faint blue pencil sketch lines traced over reference
  if (phase === "draft") {
    ctx.save();

    // 1. Light proportion guideline circles
    ctx.strokeStyle = "rgba(112, 146, 190, 0.45)";
    ctx.lineWidth = 2.0;
    for (const g of guideEllipses || []) {
      ctx.beginPath();
      ctx.ellipse(g.cx, g.cy, Math.max(10, g.rx), Math.max(10, g.ry), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Draft pencil contour lines
    ctx.strokeStyle = PAINT_PALETTE.draftBlue;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const poly of draftLines || []) {
      if (poly.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i][0], poly[i][1]);
      }
      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  // Phase 3 & 4: Pour flat vibrant color bucket fills (sorted by area descending)
  if (phase === "fill" || phase === "full") {
    ctx.save();
    const sortedRegions = [...(regions || [])].sort((a, b) => b.area - a.area);

    for (const reg of sortedRegions) {
      if (!reg.polygon || reg.polygon.length < 3) continue;
      ctx.fillStyle = reg.color;
      ctx.beginPath();
      ctx.moveTo(reg.polygon[0][0], reg.polygon[0][1]);
      for (let i = 1; i < reg.polygon.length; i++) {
        ctx.lineTo(reg.polygon[i][0], reg.polygon[i][1]);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Phase 2, 3, & 4: Ink bold black MS Paint outlines over the contours
  if (phase === "ink" || phase === "fill" || phase === "full") {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const s of strokes || []) {
      if (!s.points || s.points.length < 2) continue;
      ctx.strokeStyle = s.color || PAINT_PALETTE.black;
      ctx.lineWidth = s.strokeWidth || 5.5;

      ctx.beginPath();
      ctx.moveTo(s.points[0][0], s.points[0][1]);
      for (let i = 1; i < s.points.length; i++) {
        // Add tiny hand-drawn jitter for authentic MS Paint charm
        const jx = Math.sin(i * 2.1) * 0.7;
        const jy = Math.cos(i * 1.7) * 0.7;
        ctx.lineTo(s.points[i][0] + jx, s.points[i][1] + jy);
      }
      ctx.stroke();
    }

    // Cute MS Paint finishing touches on full phase
    if (phase === "full") {
      // Draw cute yellow stars
      for (const [sx, sy] of sparkles || []) {
        if (sx > 20 && sx < 780 && sy > 20 && sy < 480) {
          ctx.fillStyle = PAINT_PALETTE.yellow;
          ctx.strokeStyle = PAINT_PALETTE.black;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy - 8);
          ctx.lineTo(sx + 3, sy - 2);
          ctx.lineTo(sx + 8, sy);
          ctx.lineTo(sx + 3, sy + 2);
          ctx.lineTo(sx, sy + 8);
          ctx.lineTo(sx - 3, sy + 2);
          ctx.lineTo(sx - 8, sy);
          ctx.lineTo(sx - 3, sy - 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }
}
