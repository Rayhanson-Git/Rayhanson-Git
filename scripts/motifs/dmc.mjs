// Devil May Cry GMV: the edit itself.
// Left: a split frame, the same stride twice (live action | game), a matched cut.
// Right: the timeline. Live-action shots on their own track above the game
// footage; game clips in three patterns (one per game, in the order 3, 5, 4 and
// a short return to 5); the song below, with every cut in the song section
// sitting on a beat marker. Nothing here is taken from the games' artwork.
import { C, r2 } from '../lib.mjs';

const LEN = 230; // 3:50 in seconds
const X0 = 160, K = 1.1; // timeline origin, units per second
const tx = (t) => r2(X0 + t * K);
const LOOP = 14;
const SONG = 66, BEAT = 8; // the song section starts here; one marker every BEAT seconds
const beats = [];
for (let t = SONG; t <= LEN; t += BEAT) beats.push(t);
// matched cuts given in the case study: 0:17, 0:53, 3:27
const LIVE = [[17, 25], [45, 53], [194, 207]];
// game clips: [start, end, game]; cuts after SONG are all on beats
const GAME = [
  [0, 17, 3], [25, 45, 3], [53, 66, 3],
  [66, 82, 5], [82, 98, 5], [98, 106, 5], [106, 130, 5], [130, 146, 5],
  [146, 162, 4], [162, 186, 4], [186, 194, 4],
  [207, 230, 5],
];
for (const [a, b] of GAME) for (const t of [a, b]) if (t > SONG && t < 207 && !beats.includes(t)) throw new Error(`dmc: cut at ${t}s is off the beat`);
const REST = 207; // playhead rests on the 3:27 matched cut, the one in the frame

let seed = 5;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

const pct = (t) => r2((t / LEN) * 100);
const steps = (on, off) => {
  let k = `0%{opacity:${off}}`;
  for (const [a, b] of LIVE) k += `${pct(a - 3)}%{opacity:${off}}${pct(a + 1)}%,${pct(b - 1)}%{opacity:${on}}${pct(b + 3)}%{opacity:${off}}`;
  return k + `100%{opacity:${off}}`;
};
const css = `
.dmc-ph{animation:dmc-ph ${LOOP}s linear infinite}
@keyframes dmc-ph{0%{transform:translateX(${r2(-REST * K)}px);opacity:0}3%,97%{opacity:1}100%{transform:translateX(${r2((LEN - REST) * K)}px);opacity:0}}
.dmc-live{animation:dmc-live ${LOOP}s linear infinite}.dmc-game{animation:dmc-game ${LOOP}s linear infinite}
@keyframes dmc-live{${steps(1, 0.6)}}
@keyframes dmc-game{${steps(0.6, 1)}}
`;

// The low walking shot (the 3:27 matched cut): hips down, mid-stride, the body
// running off the top of the frame. (ox, oy) is the top-left of its half frame.
// Plain jointed lines: no costume, no props, nothing from the games' artwork.
const HIP = [31, 11], LEGS = [[[44, 41], [48, 71], [60, 77]], [[23, 43], [8, 68], [15, 80]]];
function legs(ox, oy, stroke) {
  const at = ([x, y]) => `${ox + x} ${oy + y}`;
  let bones = `M${r2(ox + HIP[0] + 2.5)} ${oy + 2}L${at(HIP)}`, joints = `M${at(HIP)}h0`;
  for (const [knee, ankle, toe] of LEGS) {
    bones += `M${at(HIP)}L${at(knee)}L${at(ankle)}L${at(toe)}`;
    joints += `M${at(knee)}h0M${at(ankle)}h0`;
  }
  return `<path d="${bones}" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${joints}" stroke="${stroke}" stroke-width="6.4" stroke-linecap="round"/>`;
}

function draw() {
  let s = '';
  // ---- split frame ----
  const fx = 10, fy = 20, fw = 132, fh = 92, mx = fx + fw / 2;
  s += `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="4" stroke="${C.ice}" stroke-width="1.5"/>`;
  // hip and ground guides run across both halves: the two frames are matched
  s += `<path d="M${fx - 12} ${fy + 11}H${fx + fw + 6}M${fx - 12} ${fy + 81.5}H${fx + fw + 6}" stroke="${C.haze}" stroke-width="1.2" stroke-dasharray="2 4"/>`;
  s += `<path d="M${mx} ${fy - 8}V${fy + fh + 8}" stroke="${C.ink}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
  s += `<g class="dmc-live">${legs(fx, fy, C.ink)}</g><g class="dmc-game">${legs(mx, fy, C.ice)}</g>`;

  // ---- timeline ----
  const V2 = 24, V2H = 16, V1 = 45, V1H = 24, MK = 77, AU = 104;
  s += `<path d="M150 ${V2 - 4}H420M150 ${V1 - 2.5}H420M150 ${V1 + V1H + 3}H420" stroke="${C.rule}" stroke-width="1.2"/>`;
  let ticks = '', mins = '';
  for (let t = 0; t <= LEN + 10; t += 10) { if (t % 60 === 0) mins += `M${tx(t)} 6v11`; else ticks += `M${tx(t)} 12v5`; }
  s += `<path d="${ticks}" stroke="${C.haze}" stroke-width="1.4"/><path d="${mins}" stroke="${C.ice}" stroke-width="1.6"/>`;
  // live-action shots, on the upper track
  for (const [a, b] of LIVE) s += `<rect x="${r2(tx(a) + 0.8)}" y="${V2}" width="${r2((b - a) * K - 1.6)}" height="${V2H}" rx="2.5" fill="${C.ink}" fill-opacity=".2" stroke="${C.ink}" stroke-width="1.5"/>`;
  // game footage, one pattern per game
  let hatch = '', bars = '';
  for (const [a, b, g] of GAME) {
    const x = r2(tx(a) + 0.8), w = r2((b - a) * K - 1.6);
    if (g === 3) {
      s += `<rect x="${x}" y="${V1}" width="${w}" height="${V1H}" rx="2.5" stroke="${C.ice}" stroke-width="1.5"/>`;
      for (let hx = x + 3; hx <= x + w - 7; hx += 3.6) hatch += `M${r2(hx)} ${V1 + V1H - 4}l4 -${V1H - 8}`;
    } else if (g === 5) {
      s += `<rect x="${x}" y="${V1}" width="${w}" height="${V1H}" rx="2.5" fill="${C.deep}" stroke="${C.ice}" stroke-width="1.5"/>`;
    } else {
      s += `<rect x="${x}" y="${V1}" width="${w}" height="${V1H}" rx="2.5" stroke="${C.ice}" stroke-width="1.5"/>`;
      bars += `M${r2(x + 3)} ${V1 + 3}L${r2(x + w - 3)} ${V1 + V1H - 3}M${r2(x + 3)} ${V1 + V1H - 3}L${r2(x + w - 3)} ${V1 + 3}`;
    }
  }
  s += `<path d="${hatch}" stroke="${C.haze}" stroke-width="1.3"/><path d="${bars}" stroke="${C.haze}" stroke-width="1.3"/>`;
  // beat markers
  const cuts = new Set(GAME.flat());
  s += `<path d="${beats.map((t) => (cuts.has(t) ? `M${tx(t)} ${V1 + V1H + 1.5}V${MK + 4}` : `M${tx(t)} ${MK - 2}v6`)).join('')}" stroke="${C.ice}" stroke-width="1.5"/>`;
  // the song: quiet under the opening, full from the first beat, a touch lower for the closing theme
  let wave = '';
  const step = (BEAT * K) / 2;
  for (let x = X0 + 2, i = 0; x < 422; x += step, i++) {
    const t = (x - X0) / K;
    const lvl = t < 56 ? 0.3 : t < SONG ? 0.3 + (0.7 * (t - 56)) / 10 : t < 184 ? 1 : 0.72;
    const onBeat = t >= SONG - 1 && Math.abs(((t - SONG) / BEAT) - Math.round((t - SONG) / BEAT)) < 0.1;
    const h = Math.max(1.5, 20 * lvl * (onBeat ? 1 : 0.35 + 0.35 * rnd()));
    wave += `M${r2(x)} ${r2(AU - h)}v${r2(h * 2)}`;
  }
  s += `<path d="${wave}" stroke="${C.ice}" stroke-width="1.5" stroke-linecap="round"/>`;
  // playhead
  s += `<g transform="translate(${tx(REST)} 0)"><g class="dmc-ph"><path d="M0 6V132" stroke="${C.accent}" stroke-width="1.8"/><path d="M-5 2h10v6l-5 5-5-5z" fill="${C.accent}"/></g></g>`;
  return s;
}

export default { css, draw };
