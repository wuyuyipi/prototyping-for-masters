# Doodle Creator (MS Paint Texture Studio)

A playful creative workspace inspired by classic Microsoft Paint, equipped with real-time procedural fine-art medium simulations.

## Setup & Usage

- **Route:** `/prototypes/doodle-creator`
- **Page Component:** [`app/prototypes/doodle-creator/page.tsx`](file:///Users/yipin/Desktop/SVA%20School%20Work/Fall%202026/Prototyping%20for%20Master/prototyping-for-masters/app/prototypes/doodle-creator/page.tsx)
- **Styles:** [`app/prototypes/doodle-creator/styles.module.css`](file:///Users/yipin/Desktop/SVA%20School%20Work/Fall%202026/Prototyping%20for%20Master/prototyping-for-masters/app/prototypes/doodle-creator/styles.module.css)

## Features

### 1. MS Paint Tools & Workspace
- **Pencil (P):** 1px - 2px crisp freehand sketching.
- **Paint Brush (B):** Smooth round stroke drawing with configurable thickness.
- **Airbrush / Spray Can (A):** Classic MS Paint stippling spray can.
- **Paint Bucket (F):** 4-way BFS flood fill algorithm that fills bounded areas.
- **Eraser (E):** Clean eraser tool.
- **Eyedropper / Color Picker (I):** Samples colors directly from the canvas.
- **Geometry Tools:** Straight Line (`L`), Rectangle (`R`), and Circle / Ellipse (`O`) with live rubber-band preview.
- **Shape Fill Mode:** Outline only, solid fill, or outline + fill.
- **Line Thickness:** 4 classic stroke sizes (2px, 5px, 10px, 20px).
- **Dual Color Palette:** Primary Color (Foreground / Left Click) and Secondary Color (Background / Right Click) with 28 classic MS Paint color swatches and a custom HTML5 color picker.
- **Status Bar:** Real-time mouse coordinate readout, canvas dimensions (800 × 500px), and active medium summary.
- **History:** Multi-level Undo (`Ctrl+Z` / `Cmd+Z`) and Redo (`Ctrl+Y` / `Cmd+Y`).
- **Export:** Save high-resolution PNG snapshots with active textures baked in.

### 2. Artistic Texture Mediums
Click any texture button at the top to transform your doodle in real time:

1. **🖍️ Crayon:**
   - Simulates waxy pigment clinging to the peaks of rough paper.
   - Low paper tooth valleys cause wax skipping, giving broken, waxy, vibrant marks.
2. **✏️ Color Pencil:**
   - Simulates fine graphite and colored pencil lead with 45° directional cross-hatching.
   - Shows visible paper sketch tooth through semi-translucent strokes.
3. **🎨 Pastel:**
   - Simulates soft chalk pastel bloom with gentle outward edge diffusion.
   - Powdery chalk dust texture with velvety matte finish.
4. **💧 Watercolor:**
   - Simulates translucent fluid wet-in-wet pigment pooling.
   - Darker "coffee-ring effect" perimeter rims and organic fluid bleeding on cold-press paper.
5. **🖌️ Oil Paint:**
   - Simulates 3D impasto paint with directional lighting, specular highlights on ridges, brush bristle grooves, and linen canvas weave.
6. **🧼 Original:**
   - Classic crisp, untextured MS Paint digital pixels.

### 3. Presets & Standalone Doodle Compiler Program
- **Component File:** [`app/prototypes/doodle-creator/doodleProgram.ts`](file:///Users/yipin/Desktop/SVA%20School%20Work/Fall%202026/Prototyping%20for%20Master/prototyping-for-masters/app/prototypes/doodle-creator/doodleProgram.ts)
- **🐱 Cute Cat:** Cartoon orange tabby with whiskers, collar, and little bell.
- **🌸 Flower Meadow:** Grassy rolling hills, smiling sun, tulip, daisy, and butterfly.
- **☕ Coffee & Donut:** Steaming cappuccino with latte art and a pink sprinkled donut.
- **✨ Standalone Procedural Doodle Program:** Type any prompt in the world (e.g. `skateboard`, `guitar`, `castle`, `dragon`, `giraffe`, `octopus`, `computer`, `butterfly`, `watermelon`, `sword`, `campfire`, `spaceship`, or any custom invention/creature). The standalone `doodleProgram.ts` engine:
  1. **Parses Semantics & Traits:** Extracts key entities, explicit colors, traits, and modifiers.
  2. **Multi-Phase Live In-Canvas Animation:** Progressively renders the drawing in 4 distinct steps:
     - *✏️ Draft Phase:* Faint blue pencil sketch contouring.
     - *🖋️ Inking Phase:* Bold 5–6px black MS Paint outlines.
     - *🪣 Fill Phase:* Vibrant Windows 95 comic flat color fills.
     - *🎨 Texture Pass:* Seamlessly applies the active medium (*Crayon*, *Color Pencil*, *Pastel*, *Watercolor*, *Oil Paint*).
  3. **Universal Component Synthesizer:** If an unknown or abstract phrase is entered, the engine dynamically hashes the prompt to synthesize a custom, expressive MS Paint creature or apparatus with anatomical limbs, faces, and retro comic badges—never failing or leaving an empty screen.
- **📷 Upload Custom Reference Photo:** Upload any personal photo or sketch from your device to quantize it into a comic MS Paint palette with active textures applied!
