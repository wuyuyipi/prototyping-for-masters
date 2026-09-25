# Kinetic Lyric Waves (Typography Experiments)

An interactive typography experiment exploring kinetic wave typography, variable font dynamics, and audio playback driven by songs and lyrics from the embedded Spotify playlist ("Selected" by Yiping).

## Features

- **Multi-Animation Library (Random per line):** Each line of lyrics is assigned a random kinetic animation from a library of 7 expressive typographic interactions:
  - **`wave`**: Fluid sinusoidal undulating wave with tangent curve rotation.
  - **`jump`**: Playful spring bounce with squashing, stretching, and pop.
  - **`dissolve`**: Particle ghost evaporation with jitter scatter and directional blur.
  - **`float`**: Zero-gravity weightless drift with slow rhythmic rocking.
  - **`glitch`**: Digital chromatic jitter with stepped horizontal slicing and riso color offsets.
  - **`stretch`**: Accordion vertical expansion with variable font weight spikes up to 900.
  - **`twist`**: 3D Y-axis perspective rotation and card-like flip.
- **Line-Isolated Hover:** The animation triggers **only** on the line your cursor is hovering over; all other lines remain resting calmly.
- **Shuffle Animations:** A toolbar button allows re-rolling random animations across all lines anytime.
- **Variable Font & Typeface Switcher:** Toggle between `Host Grotesk` (with interactive font weight morphing from 400 to 900 on hover) and `Nyght Serif` (high-contrast editorial serif).
- **Click-to-Play Audio Engine:** Clicking anywhere on the text immediately triggers or pauses the song's audio playback.
- **Rhythmic Beat Animation:** When audio is playing, an ambient rhythmic wave flows through the typography alongside animated equalizer bars in the player.
- **Custom Wave Controls:** Interactive sliders for Wave Height (Amplitude), Frequency, and Speed.
- **Full Playlist Navigator:** Select any of the 16 songs from the embedded playlist (Given, syh, IDOLiSH7, Re:vale, TRIGGER, ŹOOĻ, ALKALOID, MELLOW DEAR US).

## Usage & Development

- **Route:** `/prototypes/typography-experiments`
- **Page Component:** `app/prototypes/typography-experiments/page.tsx`
- **Styles:** `app/prototypes/typography-experiments/styles.module.css`
- **Track & Lyric Data:** `app/prototypes/typography-experiments/lyricsData.ts`
