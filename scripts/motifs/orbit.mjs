// Orbit Playground: every click adds an orbiter around the point you clicked.
// Left to right, the four orbit shapes of the sketch: Circle (with links between
// near orbiters), Ellipse turned six times about a centre (the kaleidoscope),
// Flower (r * cos(3a), three petals) and Spiral (the radius breathes 10% to 100%).
import { C } from '../lib.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
const rad = (deg) => (deg * Math.PI) / 180;

// a smooth closed curve through sampled points: quadratic segments between the midpoints
function smooth(pts) {
  const n = pts.length, mid = (i) => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
  let d = `M${mid(0).map(r1).join(' ')}`;
  for (let i = 1; i <= n; i++) d += `Q${r1(pts[i % n][0])} ${r1(pts[i % n][1])} ${mid(i).map(r1).join(' ')}`;
  return d + 'Z';
}

const css = `
.orbit-go{animation:orbit-go 12s linear infinite}
@keyframes orbit-go{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.orbit-spin{transform-origin:0 0;animation:orbit-spin 14s linear infinite}
@keyframes orbit-spin{to{transform:rotate(360deg)}}
`;

// a dot (and a thin tail behind it) riding a path whose pathLength is 100 per lap
// at: resting place 0..100, T: seconds per lap. The same place is carried in the
// animation delay, so two riders on one path keep their distance while they move.
function rider(href, at, T, { w = 6.4, stroke = C.ink, tail = 13, tf = '' } = {}) {
  const use = (extra) => `<use href="#${href}"${tf} class="orbit-go" ${extra}/>`;
  return use(`stroke="${C.ice}" stroke-width="2" stroke-dasharray="${tail} ${100 - tail}" stroke-dashoffset="${r1(tail - at)}" opacity=".7" style="animation-duration:${T}s;animation-delay:-${r1((((at - tail + 100) % 100) / 100) * T)}s"`) +
    use(`stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray=".1 99.9" stroke-dashoffset="${r1(-at)}" style="animation-duration:${T}s;animation-delay:-${r1((at / 100) * T)}s"`);
}

function draw() {
  let s = '', defs = '';
  const guide = `stroke="${C.haze}" stroke-width="1.2"`;

  // ---- Flower: r = R cos(3a)
  const F = [289, 76], FR = 47;
  let pts = [];
  for (let i = 0; i < 42; i++) {
    const a = (i / 42) * Math.PI, rr = FR * Math.cos(3 * a);
    pts.push([rr * Math.cos(a - Math.PI / 2), rr * Math.sin(a - Math.PI / 2)]);
  }
  defs += `<path id="orbit-f" d="${smooth(pts)}" pathLength="100"/>`;

  // ---- Spiral: r = R (0.55 + 0.45 cos(a / 3)), closing after three turns
  const S = [387, 60], SR = 52;
  pts = [];
  for (let i = 0; i < 54; i++) {
    const a = (i / 54) * Math.PI * 6, rr = SR * (0.55 + 0.45 * Math.cos(a / 3));
    pts.push([rr * Math.cos(a + 2.2), rr * Math.sin(a + 2.2)]);
  }
  defs += `<path id="orbit-s" d="${smooth(pts)}" pathLength="100"/>`;

  // ---- Kaleidoscope: one tilted ellipse, turned six times about K
  const K = [182, 62], KD = 31, KA = 27, KB = 11.5, TILT = 62;
  let d = '';
  for (let k = 0; k < 6; k++) {
    const p = rad(k * 60 - 90), t = rad(k * 60 - 90 + TILT);
    const cx = KD * Math.cos(p), cy = KD * Math.sin(p), ux = KA * Math.cos(t), uy = KA * Math.sin(t);
    const arc = `A${KA} ${KB} ${k * 60 - 90 + TILT} 1 1 `;
    d += `M${r1(cx + ux)} ${r1(cy + uy)}${arc}${r1(cx - ux)} ${r1(cy - uy)}${arc}${r1(cx + ux)} ${r1(cy + uy)}Z`;
  }
  defs += `<path id="orbit-k" d="${d}" pathLength="600"/>`;
  s += `<defs>${defs}</defs>`;

  // ---- Circle: orbiters on their own radii around one centre
  const O = [62, 68];
  s += `<g transform="translate(${O[0]} ${O[1]})">` +
    `<g ${guide}><circle r="19"/><circle r="32"/><circle r="45"/><circle r="56" stroke-dasharray="1.5 5"/></g>`;
  // three orbiters that travel together, so the links between them hold
  const trio = [[19, 150], [32, 196], [45, 172]].map(([r, a]) => [r1(r * Math.cos(rad(a))), r1(r * Math.sin(rad(a))), r, a]);
  let grp = `<path d="M${trio[0][0]} ${trio[0][1]}L${trio[1][0]} ${trio[1][1]}L${trio[2][0]} ${trio[2][1]}Z" stroke="${C.ice}" stroke-width="1.2" opacity=".6"/>`;
  for (const [x, y, r, a] of trio) {
    const b = rad(a - 34);
    grp += `<path d="M${r1(r * Math.cos(b))} ${r1(r * Math.sin(b))}A${r} ${r} 0 0 1 ${x} ${y}" stroke="${C.ice}" stroke-width="1.6" opacity=".55"/><circle cx="${x}" cy="${y}" r="3.4" fill="${C.ink}"/>`;
  }
  s += `<g class="orbit-spin">${grp}</g>`;
  // the newest orbiter, on the widest ring
  s += `<g class="orbit-spin" style="animation-duration:9s"><path d="M${r1(56 * Math.cos(rad(-62)))} ${r1(56 * Math.sin(rad(-62)))}A56 56 0 0 1 ${r1(56 * Math.cos(rad(-34)))} ${r1(56 * Math.sin(rad(-34)))}" stroke="${C.accent2}" stroke-width="1.6" opacity=".6"/>` +
    `<circle cx="${r1(56 * Math.cos(rad(-34)))}" cy="${r1(56 * Math.sin(rad(-34)))}" r="3.6" fill="${C.accent2}"/></g>`;
  s += `<circle r="2.2" fill="${C.ice}"/></g>`;

  // ---- Kaleidoscope
  let spokes = '';
  for (let k = 0; k < 6; k++) spokes += `M${r1(7 * Math.cos(rad(k * 60 - 60)))} ${r1(7 * Math.sin(rad(k * 60 - 60)))}L${r1(66 * Math.cos(rad(k * 60 - 60)))} ${r1(66 * Math.sin(rad(k * 60 - 60)))}`;
  s += `<g transform="translate(${K[0]} ${K[1]})"><path d="${spokes}" stroke="${C.deep}" stroke-width="1.2" stroke-dasharray="2 4"/>` +
    `<use href="#orbit-k" ${guide}/>` + rider('orbit-k', 80, 10, { w: 6 }) +
    `<circle r="4.5" stroke="${C.ice}" stroke-width="1.2"/><circle r="1.6" fill="${C.ice}"/></g>`;

  // ---- Flower
  s += `<g transform="translate(${F[0]} ${F[1]})"><use href="#orbit-f" ${guide}/>` + rider('orbit-f', 9, 12, { tail: 9 }) + rider('orbit-f', 59, 12, { tail: 9, w: 5 }) +
    `<circle r="2.2" fill="${C.ice}"/></g>`;

  // ---- Spiral
  s += `<g transform="translate(${S[0]} ${S[1]})"><use href="#orbit-s" ${guide}/>` + rider('orbit-s', 42, 14, { tail: 7 }) + rider('orbit-s', 90, 14, { tail: 7, w: 5 }) +
    `<circle r="2.2" fill="${C.ice}"/></g>`;
  return s;
}

export default { css, draw };
