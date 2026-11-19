# Card illustrations

One file per card: `<slug>.mjs`, default-exporting `{ css, draw() }`.

- `draw()` returns SVG markup (a string, no outer `<svg>`).
  - Small cards: a 420 x 132 band across the top of the card (coordinates 0..420, 0..132). It is clipped to the band.
  - Featured cards: a 220 x 340 panel; the visible window is x 6..214, y 0..340.
- `css` is a string of CSS for the animations. Prefix every class with the slug (`.neon-spin`) so nothing collides.
  `@media (prefers-reduced-motion: reduce){*{animation:none!important}}` is appended by the build, so the
  resting state (no animation) must look finished.
- Import the kit from `../lib.mjs`: `C` (palette), `F` (fonts), `text()` (outlined text), `measure()`, `r2()`.
