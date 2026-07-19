# Daakshii — Cinematic Proposal Website

## How to run
Open `index.html` in any modern browser (or serve the folder with any static
server — no build step, no dependencies). Everything is plain HTML/CSS/JS.

## Add your music
Copy your chosen (non-copyrighted, or properly licensed) audio file into:

```
assets/music/music.mp3
```

The player looks for exactly that filename. Until it's added, the play
button will show a small toast letting you know the file is missing —
nothing else on the page depends on it.

## Files
- `index.html` — page structure
- `style.css` — theme, glassmorphism, layout, all animations
- `script.js` — night sky, particles, cursor trail, timer, typewriter,
  YES/NO button behavior, fireworks, envelopes, audio
- `assets/music/` — put `music.mp3` here
- `assets/fonts/` — optional: the page uses Google Fonts (Italiana, Cormorant
  Garamond, Jost) by default; if you'd rather self-host, drop the font files
  here and update the `@font-face`/`<link>` in `index.html` and `style.css`

## Personalize further
- Relationship start date lives in `script.js` → `START_DATE`
- The three love letters live directly in `index.html` inside `.envelope`
- The main proposal message lives in `script.js` → `PROPOSAL_MESSAGE`
