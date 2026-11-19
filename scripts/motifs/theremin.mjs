// Virtual Theremin: the two tracked hands of the webcam instrument, drawn as
// MediaPipe's 21-landmark skeletons. The left hand pinches (volume), the right
// hand turns at the wrist (pitch) and taps thumb to finger (drums). Under them
// run the note ladder (16 notes of C major pentatonic, roots marked) and the
// one-bar, 16-step drum looper with its playhead.
import { C, F, text } from '../lib.mjs';

// The open hand the project's own tests and artwork use (MediaPipe order).
const OPEN = [[0.5, 0.8], [0.43, 0.75], [0.38, 0.7], [0.35, 0.65], [0.32, 0.6], [0.45, 0.6], [0.44, 0.52], [0.435, 0.47], [0.43, 0.42], [0.5, 0.59], [0.5, 0.5], [0.5, 0.44], [0.5, 0.39], [0.55, 0.6], [0.555, 0.52], [0.56, 0.47], [0.565, 0.43], [0.6, 0.62], [0.61, 0.56], [0.615, 0.52], [0.62, 0.48]];
// The 23 bones as chains: wrist to each fingertip, then across the knuckles.
const FINGERS = [[0, 5, 6, 7, 8], [0, 9, 10, 11, 12], [0, 13, 14, 15, 16], [0, 17, 18, 19, 20], [5, 9, 13, 17]];
const THUMB = [0, 1, 2, 3, 4];

const r1 = (n) => Math.round(n * 10) / 10;
const turn = ([x, y], [ox, oy], deg) => {
  const a = (deg * Math.PI) / 180, dx = x - ox, dy = y - oy;
  return [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)];
};
// landmarks (0..1) to panel units: wrist at w, k units per landmark unit
const place = (pts, w, k) => pts.map(([x, y]) => [w[0] + (x - pts[0][0]) * k, w[1] + (y - pts[0][1]) * k]);
const chain = (P, ids) => ids.map((i, n) => `${n ? 'L' : 'M'}${Math.round(P[i][0])} ${Math.round(P[i][1])}`).join('');
const dots = (P, ids) => ids.map((i) => `M${Math.round(P[i][0])} ${Math.round(P[i][1])}h.1`).join('');
// an unpainted square centred on a pivot, so "transform-origin:center" is that pivot
const pivot = (p, half) => `<rect x="${r1(p[0] - half)}" y="${r1(p[1] - half)}" width="${half * 2}" height="${half * 2}"/>`;

const K = 290;          // hand scale
const REST = -16;       // the left thumb rests part of the way to the index tip
const PINCH = 9;        // and swings this many degrees either side
const NOTE = 140 / 15;  // wrist degrees per note: 16 notes across the 140 degree turn
const TILT = 14;        // how far the right hand leans at rest
const STEP = 12;        // width of one note cell and of one sixteenth step
const REST_STEP = 4;    // where the playhead rests when motion is off

// Left hand (mirrored, so its thumb points inwards). The pinch gap is measured
// from the index tip to the thumb tip; the keyframes below need its length.
const LW = [58, 166];
const lOpen = place(OPEN.map(([x, y]) => [1 - x, y]), LW, K);
const LP = lOpen.map((p, i) => (i > 1 && i < 5 ? turn(p, lOpen[1], REST) : p));
const gap = (p) => Math.hypot(p[0] - LP[8][0], p[1] - LP[8][1]);
const widest = gap(turn(LP[4], LP[1], PINCH));
const gapEnd = [LP[8][0] + ((LP[4][0] - LP[8][0]) / gap(LP[4])) * widest, LP[8][1] + ((LP[4][1] - LP[8][1]) / gap(LP[4])) * widest];
const offset = (deg) => r1(100 * (1 - gap(turn(LP[4], LP[1], deg)) / widest));
// the gap line also swings about the index tip, so its end stays on the thumb tip
const bearing = (deg) => { const t = turn(LP[4], LP[1], deg); return (Math.atan2(t[1] - LP[8][1], t[0] - LP[8][0]) * 180) / Math.PI; };
const swing = (deg) => r1(bearing(deg) - bearing(0));

const css = `
.theremin-b{stroke:${C.ice};stroke-width:1.3;opacity:.55}
.theremin-j{stroke:${C.ink};stroke-width:4.6}
.theremin-w1{animation:theremin-w 5s linear infinite}
.theremin-w2{animation:theremin-w 9s linear infinite}
.theremin-w3{animation:theremin-w 7s linear infinite}
@keyframes theremin-w{to{transform:translateX(-96px)}}
.theremin-a,.theremin-t,.theremin-r,.theremin-s{transform-box:fill-box;transform-origin:center}
.theremin-a,.theremin-t,.theremin-g,.theremin-s{animation:theremin-a 7s ease-in-out infinite alternate}
@keyframes theremin-a{from{transform:scaleY(.65)}to{transform:scaleY(1.2)}}
.theremin-t{animation-name:theremin-t}
@keyframes theremin-t{from{transform:rotate(-${PINCH}deg)}to{transform:rotate(${PINCH}deg)}}
.theremin-g{animation-name:theremin-g}
@keyframes theremin-g{from{stroke-dashoffset:${offset(-PINCH)}}to{stroke-dashoffset:0}}
.theremin-s{animation-name:theremin-s}
@keyframes theremin-s{from{transform:rotate(${swing(-PINCH)}deg)}to{transform:rotate(${swing(PINCH)}deg)}}
.theremin-r{animation:theremin-r 12s ease-in-out infinite}
@keyframes theremin-r{0%,12%,46%,62%,96%,to{transform:none}21%,37%{transform:rotate(${r1(NOTE)}deg)}71%,87%{transform:rotate(-${r1(NOTE)}deg)}}
.theremin-n{animation:theremin-n 12s linear infinite}
@keyframes theremin-n{0%,16.5%,41.6%,66.5%,91.6%,to{transform:none}16.6%,41.5%{transform:translateX(${STEP}px)}66.6%,91.5%{transform:translateX(-${STEP}px)}}
.theremin-h{animation:theremin-h 6.4s steps(16) infinite}
@keyframes theremin-h{from{transform:translateX(-${REST_STEP * STEP}px)}to{transform:translateX(${(16 - REST_STEP) * STEP}px)}}
.theremin-p{animation:theremin-p 3.2s ease-out infinite}
@keyframes theremin-p{0%{opacity:1}30%,96%{opacity:.3}}
`;

function draw() {
  const bone = 'class="theremin-b"', joint = 'class="theremin-j"';
  let s = `<clipPath id="theremin-c"><rect x="8.7" y="1" width="202.6" height="338" rx="16"/></clipPath><g clip-path="url(#theremin-c)" stroke-linecap="round">`;

  // ---- the sound: three waves on a dashed axis, under the left hand and behind the right palm,
  // so the fingertips, drum rings and note ticks stay clear
  const WY = 203;
  // every wavelength divides 96, the distance one drift loop travels, so the loop is seamless
  const wave = (amp, half) => `M-4 0q${half / 2} ${-amp * 2} ${half} 0` + `t${half} 0`.repeat(Math.ceil(316 / half) - 1);
  s += `<path d="M8 ${WY}H212" stroke="${C.rule}" stroke-dasharray="2 5"/>`;
  s += `<g transform="translate(0 ${WY})"><g class="theremin-a">` +
    `<path class="theremin-w2" d="${wave(19, 24)}" stroke="${C.haze}" stroke-width="1.4"/>` +
    `<path class="theremin-w1" d="${wave(15, 48)}" stroke="${C.ice}" stroke-width="1.8"/>` +
    `<path class="theremin-w3" d="${wave(8, 16)}" stroke="${C.ink2}" stroke-width="1.2" opacity=".55"/>` +
    `</g></g>`;

  // ---- left hand: pinch = volume
  s += `<path d="${FINGERS.map((f) => chain(LP, f)).join('')}${chain(LP, [0, 1])}" ${bone}/>`;
  // the measured gap between index tip and thumb tip
  s += `<g class="theremin-s">${pivot(LP[8], 60)}<path class="theremin-g" d="${chain([LP[8], gapEnd], [0, 1])}" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${offset(0)}" stroke="${C.accent2}" stroke-width="1.4"/></g>`;
  s += `<path d="${dots(LP, [0, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])}" ${joint}/>`;
  s += `<g class="theremin-t">${pivot(LP[1], 70)}<path d="${chain(LP, [1, 2, 3, 4])}" ${bone}/><path d="${dots(LP, [2, 3, 4])}" ${joint}/></g>`;

  // ---- right hand: wrist turn = pitch, thumb to finger = drums
  const RW = [128, 238];
  const RP = place(OPEN, RW, K).map((p) => turn(p, RW, TILT));
  s += `<g class="theremin-r">${pivot(RW, 150)}<path d="${FINGERS.map((f) => chain(RP, f)).join('')}${chain(RP, THUMB)}" ${bone}/>` +
    `<path d="${dots(RP, RP.map((_, i) => i))}" ${joint}/>`;
  // the four drum fingers: index kick, middle snare, ring hi-hat, pinky clap
  // (the looper below plays them in this order: kick, hi-hat, snare, clap, two steps apart)
  s += `<g stroke="${C.ink}" stroke-width="1.4">` + [[8, 0], [16, 2], [12, 4], [20, 6]].map(([i, step]) =>
    `<circle class="theremin-p" style="animation-delay:-${r1(3.2 - step * 0.4)}s" cx="${Math.round(RP[i][0])}" cy="${Math.round(RP[i][1])}" r="6.5" opacity="${step === REST_STEP ? 1 : '.3'}"/>`).join('') + `</g>`;
  s += `</g>`;
  // the pitch scale the wrist sweeps: one tick per note, 9.3 degrees apart
  const on = (deg, r) => { const a = (deg * Math.PI) / 180; return `${r1(RW[0] + r * Math.sin(a))} ${r1(RW[1] - r * Math.cos(a))}`; };
  s += `<path d="M${on(TILT - NOTE * 1.5, 136)}A136 136 0 0 1 ${on(TILT + NOTE * 2.5, 136)}" stroke="${C.haze}" stroke-dasharray="2 4"/>`;
  s += `<path d="${[-1, 0, 1, 2].map((n) => `M${on(TILT + n * NOTE, 132)}L${on(TILT + n * NOTE, 140)}`).join('')}" stroke="${C.ice}" stroke-width="1.3"/>`;
  s += `</g>`;

  // ---- labels, each with its own hand
  s += text('VOLUME', { font: F.mono, size: 12, x: 16, y: 31, fill: C.ice, tracking: 0.12 });
  s += text('PITCH', { font: F.mono, size: 12, x: 204, y: 84, fill: C.ice, tracking: 0.12, anchor: 'end' });

  // ---- note ladder: 16 notes, roots at 1, 6, 11 and 16, one lit
  const X0 = 14, CELL = 9.5, LY = 262;
  const cells = (list, y) => list.map((i) => `M${X0 + i * STEP} ${y}h${CELL}`).join('');
  s += `<path d="M${X0} ${LY}h192" stroke="${C.deep}" stroke-width="12" stroke-dasharray="${CELL} ${STEP - CELL}"/>`;
  s += `<path d="${cells([0, 5, 10, 15], LY)}" stroke="${C.haze}" stroke-width="12"/>`;
  s += `<path class="theremin-n" d="${cells([11], LY)}" stroke="${C.ink}" stroke-width="12"/>`;

  // ---- drum looper: kick, snare, hi-hat, clap over one bar of 16 steps
  const GY = 287, ROW = 11;
  const hits = [[0, 8], [4, 12], [2, 10], [6, 14]];
  s += `<path d="${hits.map((_, r) => `M${X0 + CELL / 2} ${GY + r * ROW}h180.1`).join('')}" stroke="${C.haze}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray=".1 ${STEP - 0.1}"/>`;
  s += `<path d="${hits.map((row, r) => cells(row, GY + r * ROW)).join('')}" stroke="${C.ice}" stroke-width="7"/>`;
  s += `<rect class="theremin-h" x="${X0 + REST_STEP * STEP - 1.75}" y="${GY - 7}" width="${CELL + 3.5}" height="${ROW * 3 + 14}" rx="3" stroke="${C.accent2}" stroke-width="1.4"/>`;
  return s;
}

export default { css, draw };
