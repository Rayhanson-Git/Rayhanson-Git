// JimBro: the Workout view as an instrument readout.
// The starter routine "Full body" (lib/jimbro/routines.ts: Back squat, Bench press, Seated cable row,
// 3 sets of 8, 90 s rest) with sets being recorded, the set-rest timer, and the time window worked
// backwards from the next commitment: workout | get ready | commute | buffer, with "Stop" and "Leave by".
import { C, F, text as outlined, r2 } from '../lib.mjs';

// The kit outlines text with absolute coordinates at two decimals. Rewriting the same outline as
// relative moves at one decimal (0.07 px on GitHub) roughly halves its size.
function slim(d) {
  const f = (n) => { const v = Math.round(n * 10) / 10; return (v === 0 ? '0' : String(v)).replace(/^(-?)0\./, '$1.'); };
  const q = (n) => Math.round(n * 10) / 10;
  let out = '', px = 0, py = 0, sx = 0, sy = 0;
  const join = (c, nums) => c + nums.map(f).reduce((a, n) => a + (a && !n.startsWith('-') ? ' ' : '') + n, '');
  for (const [, c, rest] of d.matchAll(/([MLQCZ])([^MLQCZ]*)/g)) {
    if (c === 'Z') { out += 'z'; px = sx; py = sy; continue; }
    const a = rest.trim().split(/[\s,]+/).map(Number).map(q);
    const x = a[a.length - 2], y = a[a.length - 1];
    if (c === 'M') { out += join('M', [x, y]); sx = x; sy = y; }
    else if (c === 'L') {
      if (x === px && y === py) continue;
      out += y === py ? join('h', [x - px]) : x === px ? join('v', [y - py]) : join('l', [x - px, y - py]);
    } else out += join(c.toLowerCase(), a.map((v, i) => v - (i % 2 ? py : px)));
    px = x; py = y;
  }
  return out;
}
const text = (str, o) => outlined(str, o).replace(/ d="([^"]*)"/, (m, d) => ` d="${slim(d)}"`);

const LOOP = 12;
// time window: 50 min of training left, then 30 get ready, 40 commute, 10 buffer
const X0 = 20, X1 = 194, S = (X1 - X0) / 130;
const STOP = X0 + 50 * S, LEAVE = STOP + 30 * S, ARRIVE = LEAVE + 40 * S;
const TY = 254, TH = 14; // track centre and height
const NOW = 52;

const css = `
.jimbro-set{animation:jimbro-s1 ${LOOP}s linear infinite}
.jimbro-s2{animation-name:jimbro-s2}.jimbro-s3{animation-name:jimbro-s3}
@keyframes jimbro-s1{0%,7%{opacity:0}10%,95%{opacity:1}100%{opacity:0}}
@keyframes jimbro-s2{0%,37%{opacity:0}40%,95%{opacity:1}100%{opacity:0}}
@keyframes jimbro-s3{0%,67%{opacity:0}70%,95%{opacity:1}100%{opacity:0}}
.jimbro-rest{animation:jimbro-rest ${LOOP}s linear infinite}
@keyframes jimbro-rest{0%,8%{stroke-dashoffset:100}10%{stroke-dashoffset:0}37%{stroke-dashoffset:100}40%{stroke-dashoffset:0}67%{stroke-dashoffset:100}70%{stroke-dashoffset:0}97%,100%{stroke-dashoffset:100}}
.jimbro-now{animation:jimbro-now ${LOOP}s linear infinite}
@keyframes jimbro-now{0%{transform:translateX(-24px);opacity:0}5%{opacity:1}94%{opacity:1}100%{transform:translateX(20px);opacity:0}}
.jimbro-done{transform-box:fill-box;transform-origin:left;animation:jimbro-done ${LOOP}s linear infinite}
@keyframes jimbro-done{0%{transform:scaleX(.25);opacity:0}5%{opacity:.55}94%{opacity:.55}100%{transform:scaleX(1.62);opacity:0}}
.jimbro-go{stroke-dasharray:1.5 9;animation:jimbro-go 3s linear infinite}
@keyframes jimbro-go{from{stroke-dashoffset:10.5}to{stroke-dashoffset:0}}
.jimbro-ping{transform-box:fill-box;transform-origin:center;animation:jimbro-ping 4s ease-out infinite}
@keyframes jimbro-ping{0%{transform:scale(.55);opacity:.9}70%,100%{transform:scale(1.5);opacity:0}}
.jimbro-drop{stroke-dasharray:3 21;animation:jimbro-drop 4s linear infinite}
@keyframes jimbro-drop{from{stroke-dashoffset:24}to{stroke-dashoffset:0}}
`;

function draw() {
  let s = '';
  // header: the app's own eyebrow and the routine name
  s += text('YOUR ACTIVE WORKOUT', { font: F.mono, size: 10, x: 16, y: 27, fill: C.ice, tracking: 0.12 });
  s += text('Full body', { font: F.display, size: 20, x: 15, y: 49, fill: C.ink });
  s += `<circle cx="197" cy="23.5" r="7" stroke="${C.ice}" stroke-width="1.3" class="jimbro-ping" opacity=".4"/><circle cx="197" cy="23.5" r="3" fill="${C.ice}"/>`;

  // routine rows: three sets each, recorded one at a time
  const check = (x, y) => `<path d="M${x - 2.8} ${y + 0.2}l2 2 3.6-4.4" stroke="${C.paper2}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<defs><g id="jimbro-plan">${text('3 × 8', { font: F.mono, size: 10.5, x: 26, y: 26, fill: C.ice, tracking: 0.04 })}</g></defs>`;
  ['Back squat', 'Bench press', 'Seated cable row'].forEach((name, i) => {
    const y = 59 + i * 37, cy = y + 16;
    s += `<rect x="14" y="${y}" width="192" height="32" rx="9" fill="${C.paper}" stroke="${i === 1 ? C.ice : C.rule}" stroke-width="${i === 1 ? 1.4 : 1.2}"/>`;
    s += text(name, { font: F.displayMedium, size: 13.5, x: 26, y: y + 14.5, fill: i === 2 ? C.ink2 : C.ink }) + `<use href="#jimbro-plan" y="${y}"/>`;
    [157, 174, 191].forEach((cx, k) => {
      if (i === 0) s += `<circle cx="${cx}" cy="${cy}" r="6.4" fill="${C.ice}"/>` + check(cx, cy);
      else {
        s += `<circle cx="${cx}" cy="${cy}" r="5.7" stroke="${C.haze}" stroke-width="1.4"/>`;
        if (i === 1) s += `<g class="jimbro-set jimbro-s${k + 1}" opacity="${k < 2 ? 1 : 0}"><circle cx="${cx}" cy="${cy}" r="6.4" fill="${C.ink}"/>${check(cx, cy)}</g>`;
      }
    });
  });

  // set rest: a dial that drains after each recorded set
  const rx = 34, ry = 190;
  let dial = '';
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, c = Math.cos(a), n = Math.sin(a);
    dial += `M${r2(rx + 15.2 * c)} ${r2(ry + 15.2 * n)}L${r2(rx + (k % 3 ? 17 : 18.4) * c)} ${r2(ry + (k % 3 ? 17 : 18.4) * n)}`;
  }
  s += `<path d="${dial}" stroke="${C.haze}" stroke-width="1.2"/>` +
    `<circle cx="${rx}" cy="${ry}" r="11" stroke="${C.rule}" stroke-width="3"/>` +
    `<circle cx="${rx}" cy="${ry}" r="11" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="38" transform="rotate(-90 ${rx} ${ry})" class="jimbro-rest" stroke="${C.ice}" stroke-width="3"/>` +
    `<circle cx="${rx}" cy="${ry}" r="2.2" fill="${C.ink}"/>`;
  s += text('SET REST', { font: F.mono, size: 10, x: 62, y: ry + 3.6, fill: C.ice, tracking: 0.12 });
  s += `<path d="M124 ${ry}H166" stroke="${C.haze}" stroke-width="1.3" stroke-dasharray="1 4.5" stroke-linecap="round"/>`;
  s += text('90s', { font: F.display, size: 17, x: 204, y: ry + 6, fill: C.ink, anchor: 'end' });

  // time window: workout | get ready | commute | buffer -> commitment
  const T = TY - TH / 2, B = TY + TH / 2;
  s += `<path d="M14 215H206" stroke="${C.rule}" stroke-width="1.2" stroke-dasharray="2 5"/>`;
  s += text('STOP 7:10', { font: F.mono, size: 10, x: STOP, y: 235, fill: C.ice, tracking: 0.08, anchor: 'middle' });
  // ruler: a tick every ten minutes, longer on the hour (7:00 and 8:00)
  let ticks = '', hours = '';
  for (let m = 0; m <= 130; m += 10) { const x = r2(X0 + m * S); if (m === 40 || m === 100) hours += `M${x} 268v7`; else ticks += `M${x} 268v3.5`; }
  s += `<path d="${ticks}" stroke="${C.haze}" stroke-width="1.2"/><path d="${hours}" stroke="${C.ice}" stroke-width="1.4"/>`;
  s += `<rect x="${X0 - 4}" y="${T}" width="${r2(STOP - X0 + 1.5)}" height="${TH}" rx="7" stroke="${C.ice}" stroke-width="1.4"/>`;
  s += `<rect x="${X0 - 1}" y="${T + 3.5}" width="${NOW - X0 + 1}" height="${TH - 7}" fill="${C.ice}" opacity=".55" class="jimbro-done"/>`;
  s += `<g transform="translate(${NOW} 0)"><g class="jimbro-now"><path d="M0 ${T - 4}V${B + 4}" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/></g></g>`;
  let hatch = '';
  for (let x = STOP + 8; x < LEAVE - 9; x += 6.5) hatch += `M${r2(x)} ${B - 3.5}l5-7`;
  s += `<rect x="${r2(STOP + 2.5)}" y="${T}" width="${r2(LEAVE - STOP - 5)}" height="${TH}" rx="4.5" stroke="${C.ice}" stroke-width="1.4"/><path d="${hatch}" stroke="${C.haze}" stroke-width="1.3"/>`;
  s += `<rect x="${r2(LEAVE + 2.5)}" y="${T}" width="${r2(ARRIVE - LEAVE - 5)}" height="${TH}" rx="4.5" stroke="${C.ice}" stroke-width="1.4" stroke-dasharray="5.5 3.5"/>` +
    `<path d="M${r2(LEAVE + 9)} ${TY}H${r2(ARRIVE - 7)}" class="jimbro-go" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  s += `<rect x="${r2(ARRIVE + 2.5)}" y="${T}" width="${r2(X1 - ARRIVE - 11.5)}" height="${TH}" rx="4" stroke="${C.ice}" stroke-width="1.5" stroke-dasharray="1 3.2" stroke-linecap="round"/>`;
  s += `<circle cx="${X1}" cy="${TY}" r="8.5" fill="${C.paper2}" stroke="${C.ice}" stroke-width="1.4"/><circle cx="${X1}" cy="${TY}" r="3.7" fill="${C.ink}"/>`;
  // stop workout
  s += `<path d="M${r2(STOP)} ${T - 4}V${B + 4}" stroke="${C.ink}" stroke-width="1.4"/><circle cx="${r2(STOP)}" cy="${TY}" r="4.7" fill="${C.paper2}" stroke="${C.ink}" stroke-width="1.7"/>`;
  // leave by: the one crimson mark, dropping into the readout below
  s += `<path d="M${r2(LEAVE)} ${T - 13}V289" stroke="${C.accent}" stroke-width="1.5"/><path d="M${r2(LEAVE)} ${T - 13}h9l-3.2 3.5 3.2 3.5h-9z" fill="${C.accent}"/>` +
    `<path d="M${r2(LEAVE)} ${TY}V289" class="jimbro-drop" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round" stroke-dashoffset="9"/>` +
    `<circle cx="${r2(LEAVE)}" cy="${TY}" r="10" stroke="${C.accent2}" stroke-width="1.3" class="jimbro-ping" opacity=".4"/>` +
    `<circle cx="${r2(LEAVE)}" cy="${TY}" r="5.4" fill="${C.accent}"/>`;
  s += `<rect x="14" y="289" width="192" height="32" rx="16" fill="${C.paper}" stroke="${C.accent}" stroke-width="1.5"/>` +
    text('Leave by 7:40', { font: F.displayMedium, size: 15, x: 110, y: 310.3, fill: C.ink, anchor: 'middle' });
  return s;
}

export default { css, draw };
