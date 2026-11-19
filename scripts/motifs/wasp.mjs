// Wasp Dodge+: the playfield. A wasp weaves between drifting circles along the
// dashed line; it carries a shield bubble (and the ring that the HUD shows next
// to the lives while the shield is up) and flies through a Heart power-up, which
// gives back the fourth life. Four life markers sit top left, as in the game.
import { C, r2 } from '../lib.mjs';

const T = 12; // seconds for one pass across the band
const SHIELD = 20; // shield bubble radius (the bubble hugs the wasp)
const X0 = -24, X1 = 444; // the flight line runs off both edges
const fy = (x) => 67 + 25 * Math.cos((2 * Math.PI * (x - 60)) / 280);

// the flight line by arc length
const table = [];
{
  let len = 0;
  for (let x = X0; x <= X1; x += 0.5) {
    if (x > X0) len += Math.hypot(0.5, fy(x) - fy(x - 0.5));
    table.push([x, fy(x), len]);
  }
}
const TOTAL = table[table.length - 1][2];
// the same line as smooth cubic segments
const dfy = (x) => (fy(x + 0.01) - fy(x - 0.01)) / 0.02;
let LINE = `M${X0} ${r2(fy(X0))}`;
for (let x = X0, h = (X1 - X0) / 13; x < X1 - 1; x += h) {
  LINE += `C${r2(x + h / 3)} ${r2(fy(x) + (dfy(x) * h) / 3)} ${r2(x + (2 * h) / 3)} ${r2(fy(x + h) - (dfy(x + h) * h) / 3)} ${r2(x + h)} ${r2(fy(x + h))}`;
}
const fracAtX = (x) => table.find((p) => p[0] >= x)[2] / TOTAL;
const poseAt = (f) => {
  const p = table.find((q) => q[2] >= f * TOTAL) || table[table.length - 1];
  const slope = (fy(p[0] + 0.5) - fy(p[0] - 0.5));
  return [p[0], p[1], (Math.atan2(slope, 1) * 180) / Math.PI];
};

// three slow drifts, and the circles: x, y, radius, drift, seconds
// (none sits beside the lives, so the HUD row reads on its own)
const DRIFT = [[5, 3], [-6, 2], [4, -3]];
const RINGS = [
  [64, 49, 13, 0, 6], [204, 102, 20, 1, 7], [338, 32, 18, 0, 6.5],
  [262, 15, 10, 1, 5], [276, 121, 11, 2, 5.5], [412, 112, 15, 1, 7],
  [8, 126, 12, 2, 6.5], [398, 13, 8, 1, 5], [146, 120, 8, 2, 6],
  [236, 122, 10, 0, 6], [368, 10, 9, 2, 5.5],
];
// nothing may come closer to the flight line than the shield bubble
for (const [x, y, r, k3] of RINGS) {
  const [dx, dy] = DRIFT[k3];
  for (const [px, py] of table) {
    for (const k of [0, 1]) {
      const dist = Math.hypot(px - x - k * dx, py - y - k * dy);
      if (dist < r + SHIELD + 2) throw new Error(`wasp: circle at ${x},${y} is ${dist.toFixed(1)} from the flight line`);
    }
  }
}

const HEART_X = 268, FH = fracAtX(HEART_X) * 100;
const REST = fracAtX(126);
const N = 22;
let fly = '';
for (let i = 0; i <= N; i++) {
  const [x, y, a] = poseAt(i / N);
  fly += `${r2((i / N) * 100)}%{transform:translate(${r2(x)}px,${r2(y)}px) rotate(${r2(a)}deg)}`;
}

const css = `
.wasp-fly{transform-origin:0 0;animation:wasp-fly ${T}s linear infinite}
@keyframes wasp-fly{${fly}}
.wasp-trail{animation:wasp-trail ${T}s linear infinite}
@keyframes wasp-trail{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.wasp-heart{animation:wasp-heart ${T}s linear infinite}
@keyframes wasp-heart{0%{opacity:0}6%,${r2(FH - 1.5)}%{opacity:1}${r2(FH + 1.5)}%,100%{opacity:0}}
.wasp-life{animation:wasp-life ${T}s linear infinite}
@keyframes wasp-life{0%,${r2(FH)}%{opacity:.28}${r2(FH + 3)}%,93%{opacity:1}100%{opacity:.28}}
.wasp-bob{animation:wasp-bob 3s ease-in-out infinite alternate}
@keyframes wasp-bob{from{transform:translateY(-2.5px)}to{transform:translateY(2.5px)}}
.wasp-bubble{animation:wasp-bubble 3s ease-in-out infinite alternate}
@keyframes wasp-bubble{from{opacity:.55}to{opacity:1}}
${DRIFT.map(([x, y], i) => `.wasp-d${i}{animation:wasp-d${i} 6s ease-in-out infinite alternate}@keyframes wasp-d${i}{to{transform:translate(${x}px,${y}px)}}`).join('\n')}
`;

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function draw() {
  let s = '';
  // the wasp, seen from above, nose along +x: wings, legs, abdomen with bands, thorax, head, antennae
  const wasp =
    `<g id="wasp-w"><path d="M4 -3C0 -9 -8 -13.5 -11.5 -11.5C-13 -8.5 -6 -3.5 2 -1.5ZM4 3C0 9 -8 13.5 -11.5 11.5C-13 8.5 -6 3.5 2 1.5Z" fill="${C.ice}" fill-opacity=".22" stroke="${C.ice}" stroke-width="1.1" stroke-linejoin="round"/>` +
    `<path d="M5.5 -3l3 -4.5M2.5 -3.5l-.5 -4.5M5.5 3l3 4.5M2.5 3.5l-.5 4.5M10.5 -2c2 -3.5 4.5 -4.5 6.5 -4M10.5 2c2 3.5 4.5 4.5 6.5 4" stroke="${C.ink2}" stroke-width="1.1" stroke-linecap="round"/>` +
    `<g id="wasp-b" fill="${C.ink}"><path d="M-15.5 0C-12.5 -5 -5 -6 -1.5 -3.4V3.4C-5 6 -12.5 5 -15.5 0Z"/><ellipse cx="2.6" rx="4.3" ry="3.7"/><circle cx="9.4" r="3"/></g>` +
    `<path d="M-4.6 -4.6V4.6M-8.2 -4.4V4.4M-11.6 -3V3" stroke="${C.paper2}" stroke-width="1.5"/></g>` +
    // a plain marker for the lives: body and wings only
    `<g id="wasp-l"><path d="M4 -3C0 -9 -8 -13.5 -11.5 -11.5C-13 -8.5 -6 -3.5 2 -1.5ZM4 3C0 9 -8 13.5 -11.5 11.5C-13 8.5 -6 3.5 2 1.5Z" fill="${C.ice}" fill-opacity=".6"/><use href="#wasp-b"/></g>`;
  s += `<defs>${wasp}<path id="wasp-line" d="${LINE}" pathLength="100"/></defs>`;

  // sparkles
  const rnd = rng(7);
  let dots = '';
  for (let i = 0; i < 16; i++) dots += `<circle cx="${r2(rnd() * 420)}" cy="${r2(rnd() * 132)}" r="${r2(0.7 + rnd() * 0.6)}"/>`;
  s += `<g fill="${C.haze}" opacity=".7">${dots}</g>`;

  // the flight line
  s += `<use href="#wasp-line" stroke="${C.haze}" stroke-width="1.3" stroke-dasharray=".4 1.2" opacity=".8"/>`;

  // drifting circles
  let rings = '';
  RINGS.forEach(([x, y, r, k3, sec], i) => {
    rings += `<circle cx="${x}" cy="${y}" r="${r}" class="wasp-d${k3}" style="animation-duration:${sec}s;animation-delay:-${r2(i * 0.9)}s"/>`;
  });
  s += `<g stroke="${C.ice}" stroke-width="1.5">${rings}</g>`;

  // Heart power-up, on the line
  s += `<g transform="translate(${HEART_X} ${r2(fy(HEART_X))})"><g class="wasp-heart"><g class="wasp-bob">` +
    `<circle r="14" stroke="${C.accent2}" stroke-width="1.2" opacity=".45"/><circle r="9.5" stroke="${C.accent2}" stroke-width="1.5"/>` +
    `<path d="M0 5.4C-9 -1.4 -4.6 -8.4 0 -3C4.6 -8.4 9 -1.4 0 5.4Z" fill="${C.accent2}"/></g></g></g>`;

  // the stretch just flown, then the wasp in its shield bubble
  const lag = 12.5;
  s += `<use href="#wasp-line" class="wasp-trail" stroke="${C.ice}" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="1 1.5 1.8 1.5 2.6 91.6" stroke-dashoffset="${r2(lag - REST * 100)}" style="animation-delay:${r2((lag / 100) * T - T)}s"/>`;
  const [rx, ry, ra] = poseAt(REST);
  s += `<g class="wasp-fly" transform="translate(${r2(rx)} ${r2(ry)}) rotate(${r2(ra)})"><circle r="${SHIELD}" stroke="${C.ice}" stroke-width="1.5" class="wasp-bubble"/><use href="#wasp-w" transform="scale(1.12)"/></g>`;

  // HUD: four lives (one lost), and the shield ring
  for (let i = 0; i < 4; i++) {
    s += `<use href="#wasp-l" transform="translate(${20 + i * 20} 19) rotate(-75) scale(.6)"${i === 3 ? ' opacity=".28" class="wasp-life"' : ''}/>`;
  }
  s += `<circle cx="102" cy="19" r="6.2" stroke="${C.ice}" stroke-width="1.4"/>`;
  return s;
}

export default { css, draw };
