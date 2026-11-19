// Neon Orbit Arcade: the cursor is an orb that leaves a trail of particles.
// Clicks open portals: a pull portal (two solid rings) swirls particles in,
// a push portal (dashed inner ring, empty eye) throws them out.
// Ring proportions follow the sketch: the inner ring is 0.6 of the outer one.
import { C, r2 } from '../lib.mjs';

const CX = 210, CY = 66;
const A = 178, B = 56; // the orb's sweep across the band
const R = 43, RI = r2(R * 0.6); // portal rings
const PULL = [CX - 119, CY], PUSH = [CX + 119, CY];
const T = 14; // seconds for one sweep
const REST = 65.5; // where the orb sits when motion is off (0..100 along the sweep)

const css = `
.neon-go{animation:neon-go ${T}s linear infinite}
@keyframes neon-go{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.neon-in{animation:neon-go 7s linear infinite}
.neon-out{animation:neon-go 6s linear infinite}
.neon-fade{animation:neon-fade 6s linear infinite}
@keyframes neon-fade{0%{opacity:0}10%,52%{opacity:1}80%,100%{opacity:0}}
.neon-ring{transform-box:fill-box;transform-origin:center;animation:neon-ring 7s ease-out infinite}
@keyframes neon-ring{0%{transform:scale(.6);opacity:0}8%{opacity:.7}60%,100%{transform:scale(1.3);opacity:0}}
`;

// small seeded scatter for the stars
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function draw() {
  let s = '';
  // the sweep: a figure of eight that loops once around each portal
  let d = '';
  const N = 72;
  for (let i = 0; i < N; i++) {
    const u = (i / N) * Math.PI * 2;
    d += `${i ? 'L' : 'M'}${r2(CX + A * Math.sin(u))} ${r2(CY + B * Math.sin(2 * u))}`;
  }
  // one arm of the inward swirl, and one outward throw (drawn around 0,0)
  let arm = '';
  for (let i = 0; i <= 26; i++) {
    const th = (i / 26) * 5.4, rr = R * Math.exp(-0.42 * th);
    arm += `${i ? 'L' : 'M'}${r2(rr * Math.cos(th))} ${r2(rr * Math.sin(th))}`;
  }
  // a thrown particle leaves along a line turned 0.5 rad from straight out (PUSH_SWIRL in the sketch)
  const SW = 0.5, X0 = RI + 2, ray = `M${X0} 0L${r2(X0 + 54 * Math.cos(SW))} ${r2(54 * Math.sin(SW))}`;
  const at = (rad) => { // the point of that line at a given distance from the centre
    let t = 0;
    while (Math.hypot(X0 + t * Math.cos(SW), t * Math.sin(SW)) < rad) t += 0.05;
    return [X0 + t * Math.cos(SW), t * Math.sin(SW)];
  };
  s += `<defs><path id="neon-p" d="${d}Z" pathLength="100"/><path id="neon-arm" d="${arm}" pathLength="100"/><path id="neon-ray" d="${ray}" pathLength="100"/></defs>`;

  // stars
  const rnd = rng(11);
  let stars = '';
  for (let i = 0; i < 16; i++) stars += `<circle cx="${r2(rnd() * 420)}" cy="${r2(rnd() * 132)}" r="${r2(0.8 + rnd() * 0.7)}"/>`;
  s += `<g fill="${C.haze}" opacity=".8">${stars}</g>`;

  // faint guide of the sweep
  s += `<use href="#neon-p" stroke="${C.deep}" stroke-width="1.2" stroke-dasharray=".25 .75"/>`;

  // pull portal
  s += `<g transform="translate(${PULL[0]} ${PULL[1]})">`;
  for (let k = 0; k < 4; k++) {
    s += `<g transform="rotate(${k * 90})"><use href="#neon-arm" stroke="${C.haze}" stroke-width="1.2"/>` +
      `<use href="#neon-arm" class="neon-in" stroke="${C.ice}" stroke-width="3" stroke-linecap="round" stroke-dasharray=".01 33.323" stroke-dashoffset="${7 + k * 8}" style="animation-delay:-${r2(k * 0.55)}s"/></g>`;
  }
  s += `<circle r="${R}" stroke="${C.ice}" stroke-width="1.8"/><circle r="${RI}" stroke="${C.ink2}" stroke-width="1.3" opacity=".75"/>` +
    `<circle r="${R + 7}" stroke="${C.ice}" stroke-width="1.2" class="neon-ring" opacity=".3"/></g>`;

  // push portal
  s += `<g transform="translate(${PUSH[0]} ${PUSH[1]})">`;
  const [t0, t1] = [at(R + 6), at(R + 17)];
  let ticks = '';
  for (let k = 0; k < 9; k++) {
    const a = ((k * 40 + 8) * Math.PI) / 180, c = Math.cos(a), n = Math.sin(a);
    ticks += `M${r2(t0[0] * c - t0[1] * n)} ${r2(t0[0] * n + t0[1] * c)}L${r2(t1[0] * c - t1[1] * n)} ${r2(t1[0] * n + t1[1] * c)}`;
    const rest = -(14 + ((k * 31) % 52)), dl = ((k * 4) % 9) * 0.667;
    s += `<g transform="rotate(${k * 40 + 8})" stroke="${C.ice}" class="neon-fade" style="animation-delay:-${r2(dl)}s">` +
      `<use href="#neon-ray" class="neon-out" stroke-width="1.3" stroke-dasharray="14 86" stroke-dashoffset="${rest}" opacity=".6" style="animation-delay:-${r2(dl)}s"/>` +
      `<use href="#neon-ray" class="neon-out" stroke-width="3" stroke-linecap="round" stroke-dasharray=".01 99.99" stroke-dashoffset="${rest - 14}" style="animation-delay:-${r2(dl + 0.84)}s"/></g>`;
  }
  s += `<path d="${ticks}" stroke="${C.haze}" stroke-width="1.3" stroke-linecap="round"/>`;
  // the dashed inner ring is the card's one crimson mark (the app draws this portal in amber)
  s += `<circle r="${R}" stroke="${C.ice}" stroke-width="1.8"/><circle r="${RI}" stroke="${C.accent2}" stroke-width="1.6" stroke-dasharray="4 5"/>` +
    `<circle r="${R + 7}" stroke="${C.ice}" stroke-width="1.2" class="neon-ring" opacity=".3" style="animation-delay:-3.5s"/></g>`;

  // the orb and its trail. Each layer is a set of round dots on the sweep;
  // lag is how far behind the orb the layer's first dot sits (0..100).
  const layer = (lag, dots, width, stroke, opacity, tf = '') => {
    // dots: gaps (in path units) between consecutive dots, rearmost first
    let pat = '', used = 0;
    for (const g of dots) { pat += `.01 ${r2(g - 0.01)} `; used += g; }
    pat += `.01 ${r2(100 - used - 0.01)}`;
    return `<use href="#neon-p"${tf} class="neon-go" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${pat}" stroke-dashoffset="${r2(lag - REST)}" opacity="${opacity}" style="animation-delay:${r2((lag / 100) * T - T)}s"/>`;
  };
  const about = (sx, sy) => ` transform="translate(${CX} ${CY}) scale(${sx} ${sy}) translate(${-CX} ${-CY})"`;
  s += `<use href="#neon-p" class="neon-go" stroke="${C.ice}" stroke-width="1.4" stroke-dasharray="8 92" stroke-dashoffset="${r2(8.5 - REST)}" opacity=".4" style="animation-delay:${r2((8.5 / 100) * T - T)}s"/>`;
  s += layer(19, [2.3, 2.6, 2.2, 2.4], 2.4, C.haze, 1, about(1.06, 1.16));
  s += layer(17.5, [2.4, 2.1, 2.6, 2], 2.4, C.haze, 1, about(0.95, 0.85));
  s += layer(13.4, [1.9, 1.7, 1.6, 1.5], 3, C.ice, 0.75);
  s += layer(9.6, [1.6, 1.5, 1.7], 2.8, C.ice, 0.8, about(1.03, 1.08));
  s += layer(8.4, [1.4, 1.6, 1.3], 2.4, C.ice, 0.8, about(0.975, 0.93));
  s += layer(6.4, [1.4, 1.2, 1.1], 3.8, C.ice, 0.95);
  s += layer(2.9, [1, 0.9], 4.8, C.ice, 1);
  s += layer(0, [], 21, C.ice, 0.22);
  s += layer(0, [], 10, C.ink, 1);
  return s;
}

export default { css, draw };
