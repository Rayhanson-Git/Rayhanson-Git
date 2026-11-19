// Studio Apartment Evening: the multitrack session.
// Eleven self-recorded sounds, one clip each, laid along a 3:06 timeline in
// story order (work, arrival, interruptions, wind down). The arrangement is
// drawn from the written case study, not traced from the session screenshot.
import { C, r2 } from '../lib.mjs';

const LEN = 186; // 3:06 in seconds
const X0 = 46, S = 1.9; // timeline origin, units per second
const tx = (t) => r2(X0 + t * S);
const TOP = 27, TH = 21, GAP = 5;
const ty = (k) => TOP + k * (TH + GAP);
const REST = 94; // where the playhead sits when motion is off
const LOOP = 12;

// [track, start, end, kind]
const CLIPS = [
  [0, 0, 72, 'keyboard'], [0, 76, 124, 'mouse'],
  [1, 14, 26, 'door'], [1, 29, 41, 'keys'], [1, 44, 56, 'zipper'],
  [2, 60, 92, 'water'], [2, 98, 110, 'microwave'], [2, 128, 162, 'pages'], [2, 168, 182, 'playstation'],
  [3, 112, 130, 'footsteps'], [3, 148, 176, 'beanbag'],
];
if (CLIPS.length !== 11) throw new Error('studio: the piece has eleven sounds');

let seed = 11;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

// amplitude 0..1 for bar i of n (u = i / (n - 1)), a different character per sound
const shape = {
  keyboard: (u, i) => (i % 5 === 4 ? 0.14 : (u > 0.22 && u < 0.86 ? 0.5 : 1) * (0.5 + 0.5 * rnd())),
  mouse: (u, i) => (i % 3 === 0 ? 0.55 + 0.4 * rnd() : 0.14),
  door: (u, i, n) => (i === 0 ? 1 : i === n - 1 ? 0.75 : 0.2),
  keys: () => 0.35 + 0.6 * rnd(),
  zipper: (u) => 0.25 + 0.75 * u,
  water: (u) => (u < 0.7 ? 0.7 + 0.3 * rnd() : (1 - u) * 2.6 * (0.7 + 0.3 * rnd()) + 0.1),
  microwave: (u, i) => (i % 2 === 0 ? 0.8 : 0.1),
  pages: (u) => 0.2 + 0.7 * Math.abs(Math.sin(u * Math.PI * 3)),
  footsteps: (u, i) => (i % 2 === 0 ? 0.9 : 0.2),
  beanbag: (u) => 0.25 + 0.55 * Math.sin(u * Math.PI) * (0.7 + 0.3 * rnd()),
  playstation: (u) => Math.max(0.12, 1 - u * 1.1),
};

const pct = (t) => r2((t / LEN) * 100);
const css = `
.studio-ph{animation:studio-ph ${LOOP}s linear infinite}
@keyframes studio-ph{0%{transform:translateX(${r2(-REST * S)}px);opacity:0}3%,97%{opacity:1}100%{transform:translateX(${r2((LEN - REST) * S)}px);opacity:0}}
.studio-w{animation:${LOOP}s linear infinite}
${CLIPS.map(([, a, b], i) => `@keyframes studio-c${i}{0%,${pct(Math.max(a - 2, 0))}%{opacity:.7}${pct(a + 2)}%,${pct(b)}%{opacity:1}${pct(Math.min(b + 5, LEN))}%,100%{opacity:.7}}`).join('')}
`;

function draw() {
  let s = '';
  // lanes
  let lanes = '';
  for (let k = 0; k <= 4; k++) lanes += `M0 ${r2(ty(k) - GAP / 2)}H420`;
  s += `<path d="${lanes}M36 ${r2(ty(0) - GAP / 2)}V132" stroke="${C.rule}" stroke-width="1.2"/>`;
  // ruler: a tick every ten seconds, longer on the minute, closed at 3:06
  let ticks = '', mins = '';
  for (let t = 0; t <= LEN; t += 10) { if (t % 60 === 0) mins += `M${tx(t)} 8v12`; else ticks += `M${tx(t)} 15v5`; }
  s += `<path d="${ticks}" stroke="${C.haze}" stroke-width="1.4"/><path d="${mins}" stroke="${C.ice}" stroke-width="1.6"/>`;
  s += `<path d="M${tx(LEN)} 8V${ty(4) - GAP / 2}" stroke="${C.ink}" stroke-width="1.4" stroke-dasharray="2 3"/><path d="M${tx(LEN)} 8h7v6h-7z" fill="${C.ink}"/>`;
  // track heads: a gain knob each
  [-30, 20, -110, 70].forEach((a, k) => {
    const cy = ty(k) + TH / 2, r = (a * Math.PI) / 180;
    s += `<circle cx="18" cy="${cy}" r="6.5" stroke="${C.ice}" stroke-width="1.4"/><path d="M18 ${cy}L${r2(18 + 6.5 * Math.sin(r))} ${r2(cy - 6.5 * Math.cos(r))}" stroke="${C.ink}" stroke-width="1.5" stroke-linecap="round"/>`;
  });
  // clips
  CLIPS.forEach(([k, a, b, kind], i) => {
    const x = tx(a), w = r2((b - a) * S), y = ty(k), mid = y + TH / 2;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${TH}" rx="3" fill="${k % 2 ? C.haze : C.deep}" fill-opacity="${k % 2 ? '.3' : '.55'}" stroke="${C.ice}" stroke-width="1.4"/>`;
    const n = Math.max(2, Math.floor((w - 6) / 4) + 1), pad = (w - (n - 1) * 4) / 2;
    let d = '';
    for (let j = 0; j < n; j++) {
      const h = Math.max(1.2, shape[kind](n > 1 ? j / (n - 1) : 0, j, n) * (TH / 2 - 3));
      d += `M${r2(x + pad + j * 4)} ${r2(mid - h)}v${r2(h * 2)}`;
    }
    s += `<path d="${d}" stroke="${C.ink}" stroke-width="1.5" stroke-linecap="round" opacity=".85" class="studio-w" style="animation-name:studio-c${i}"/>`;
  });
  // playhead
  s += `<g transform="translate(${tx(REST)} 0)"><g class="studio-ph"><path d="M0 6V132" stroke="${C.accent}" stroke-width="1.8"/><path d="M-5 3h10v6l-5 5-5-5z" fill="${C.accent}"/></g></g>`;
  return s;
}

export default { css, draw };
