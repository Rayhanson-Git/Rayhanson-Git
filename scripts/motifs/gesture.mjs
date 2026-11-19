// Gesture Particles: a tracked hand (MediaPipe's 21 landmarks) reaches towards
// the particle cloud, caught half-way through a morph from the sphere to the
// trefoil knot. Both shapes use the app's own formulas (src/particles/templates.ts).
import { C } from '../lib.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
// small seeded generator, so every build draws the same cloud
const SEED = 20261;
let seed = SEED;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// The open hand from the project's gesture fixtures, and its 23 bones as chains.
const OPEN = [[0.5, 0.8], [0.42, 0.74], [0.36, 0.66], [0.31, 0.59], [0.27, 0.53], [0.44, 0.58], [0.42, 0.47], [0.41, 0.4], [0.4, 0.34],
  [0.5, 0.56], [0.5, 0.44], [0.5, 0.36], [0.5, 0.3], [0.56, 0.58], [0.58, 0.47], [0.59, 0.4], [0.6, 0.35], [0.61, 0.62], [0.65, 0.54], [0.68, 0.49], [0.7, 0.45]];
const CHAINS = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [0, 9, 10, 11, 12], [0, 13, 14, 15, 16], [0, 17, 18, 19, 20], [5, 9, 13, 17]];

const CX = 310, CY = 66, R = 60;   // centre of the cloud, radius of the sphere

// one dot of a path: a tiny segment with round caps (a zero-length one is not painted by every renderer)
const dot = ([x, y]) => `M${r1(x)} ${r1(y)}h.1`;
// many dots as one path: whole-unit positions, each a relative move from the last.
// The tiny segments alternate direction, so the pen is back on whole units after every pair.
const cloud = (pts) => {
  let px = 0, py = 0;
  return pts.map((p) => [Math.round(p.x), Math.round(p.y)]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([x, y], i) => {
    const d = (i ? `m${x - px}${y - py < 0 ? '' : ' '}${y - py}` : `M${x} ${y}`) + (i % 2 ? 'h-.1' : 'h.1');
    px = x; py = y;
    return d;
  }).join('');
};

function knot(n) {
  // the app's (2, 3) torus knot: a trefoil drawn as a tube of particles
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = ((i + rnd()) / n) * Math.PI * 2;
    const r = 1.6 + 0.7 * Math.cos(3 * t);
    const a = rnd() * Math.PI * 2, rr = 0.22 * Math.sqrt(rnd());
    const x = r * Math.cos(2 * t) + rr * Math.cos(a), y = 0.98 * Math.sin(3 * t) + rr * Math.sin(a), z = r * Math.sin(2 * t) + rr * Math.cos(a + 1.3);
    const k = 21.5;
    out.push({ x: CX + z * k, y: CY - x * k, d: y }); // seen from straight above, one lobe up
  }
  return out;
}
function sphere(n) {
  const out = [], ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
    out.push({ x: CX + Math.cos(th) * r * R, y: CY + y * R, d: Math.sin(th) * r });
  }
  return out;
}

const css = `
.gesture-k,.gesture-s,.gesture-t,.gesture-p{transform-box:fill-box;transform-origin:center}
.gesture-t{animation:gesture-t 12s linear infinite}
@keyframes gesture-t{from{transform:rotate(-70deg)}to{transform:rotate(50deg)}}
.gesture-k{animation:gesture-k 12s ease-in-out infinite backwards}
@keyframes gesture-k{0%,14%,90%,to{transform:scale(1.3);opacity:0}30%,74%{transform:none;opacity:1}}
.gesture-s{animation:gesture-s 12s ease-in-out infinite backwards}
.gesture-r{animation:gesture-r 12s ease-in-out infinite}
@keyframes gesture-r{0%,12%,92%,to{opacity:1}30%,74%{opacity:.5}}
@keyframes gesture-s{0%,12%,92%,to{transform:none;opacity:1}30%,74%{transform:scale(.8);opacity:.14}}
.gesture-f{animation:gesture-f 4s linear infinite}
@keyframes gesture-f{to{stroke-dashoffset:-24}}
.gesture-p{animation:gesture-p 4s ease-out infinite}
@keyframes gesture-p{from{transform:scale(.5);opacity:.8}to{transform:scale(1.5);opacity:0}}
`;

function draw() {
  seed = SEED;
  let s = '';
  const pivot = `<rect x="${CX - 90}" y="${CY - 90}" width="180" height="180"/>`;

  // ---- guide: the outline of the sphere the cloud is leaving
  s += `<circle cx="${CX}" cy="${CY}" r="${R}" stroke="${C.haze}" stroke-width="1.2" stroke-dasharray="2 6" opacity=".7"/>`;
  s += `<g stroke-linecap="round">`;

  // ---- particles still on the sphere's rim, and a few adrift
  const sp = sphere(300), rim = (p) => Math.hypot(p.x - CX, p.y - CY) > R * 0.74;
  const adrift = [];
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2, d = R * (1.05 + 1.5 * rnd() * rnd());
    adrift.push({ x: CX + Math.cos(a) * d * 1.25, y: CY + Math.sin(a) * d * 0.8 });
  }
  s += `<path d="${cloud(adrift.filter((p) => p.y > 3 && p.y < 129))}" stroke="${C.haze}" stroke-width="2.4" opacity=".7"/>`;
  s += `<path class="gesture-r" d="${cloud(sp.filter(rim))}" stroke="${C.ice}" stroke-width="2.4" opacity=".5"/>`;

  // ---- the full sphere: only a trace of it at rest, whole when the cloud morphs back
  for (let b = 0; b < 3; b++) {
    const mine = sp.filter((p) => !rim(p)).filter((_, i) => i % 3 === b);
    s += `<g class="gesture-s" style="animation-delay:${r1(b * 0.3)}s" opacity=".14">${pivot}` +
      `<path d="${cloud(mine.filter((p) => p.d < 0))}" stroke="${C.ice}" stroke-width="2.4"/>` +
      `<path d="${cloud(mine.filter((p) => p.d >= 0))}" stroke="${C.ink}" stroke-width="2.8"/></g>`;
  }

  // ---- the knot, turning slowly as it forms
  const kn = knot(520).sort((a, b) => a.d - b.d);
  s += `<g class="gesture-t">${pivot}`;
  for (let b = 0; b < 4; b++) {
    const mine = kn.filter((_, i) => i % 4 === b);
    const low = mine.filter((p) => p.d < -0.3), top = mine.filter((p) => p.d >= -0.3);
    const red = low.filter((_, i) => i % 12 === 5), ice = low.filter((_, i) => i % 12 !== 5);
    s += `<g class="gesture-k" style="animation-delay:${r1(b * 0.3)}s">${pivot}` +
      `<path d="${cloud(ice)}" stroke="${C.ice}" stroke-width="2.4"/>` +
      `<path d="${cloud(red)}" stroke="${C.accent2}" stroke-width="2.8"/>` +
      `<path d="${cloud(top)}" stroke="${C.ink}" stroke-width="2.6"/></g>`;
  }
  s += `</g></g>`;

  // ---- the hand, reaching in from the left
  const a = 1.2, k = 200, w = [25, 96];
  const P = OPEN.map(([x, y]) => {
    const dx = (x - 0.5) * k, dy = (y - 0.8) * k;
    return [w[0] + dx * Math.cos(a) - dy * Math.sin(a), w[1] + dx * Math.sin(a) + dy * Math.cos(a)];
  });
  s += `<path d="${CHAINS.map((c) => c.map((i, n) => `${n ? 'L' : 'M'}${r1(P[i][0])} ${r1(P[i][1])}`).join('')).join('')}" stroke="${C.ice}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" opacity=".6"/>`;
  s += `<path d="${P.filter((_, i) => i !== 4 && i !== 8).map(dot).join('')}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="${dot(P[4])}${dot(P[8])}" stroke="${C.accent2}" stroke-width="7" stroke-linecap="round"/>`;
  s += `<circle class="gesture-p" cx="${r1(P[8][0])}" cy="${r1(P[8][1])}" r="9" stroke="${C.accent2}" stroke-width="1.2" opacity=".5"/>`;
  // the tracker's frame around the hand
  const xs = P.map((q) => q[0]), ys = P.map((q) => q[1]);
  const x0 = Math.round(Math.min(...xs) - 14), x1 = Math.round(Math.max(...xs) + 14), y0 = Math.round(Math.min(...ys) - 14), y1 = Math.round(Math.max(...ys) + 14);
  s += `<path d="M${x0} ${y0 + 9}v-9h9M${x1 - 9} ${y0}h9v9M${x1} ${y1 - 9}v9h-9M${x0 + 9} ${y1}h-9v-9" stroke="${C.haze}" stroke-width="1.3"/>`;
  // the link from fingertips to cloud
  s += `<path class="gesture-f" d="M${r1(P[8][0] + 12)} ${r1(P[8][1] - 1)}C${r1(P[8][0] + 52)} ${r1(P[8][1] - 6)} ${CX - R - 60} ${CY - 8} ${CX - R - 8} ${CY - 4}" stroke="${C.accent2}" stroke-width="1.3" stroke-dasharray="3 5" stroke-linecap="round"/>`;
  return s;
}

export default { css, draw };
