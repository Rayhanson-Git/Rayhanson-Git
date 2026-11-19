// LeaveBy: the plan worked backwards from the next commitment.
// workout | get ready | commute | buffer -> commitment, widths in proportion to
// the app's own example (30 / 60 / 15 minutes before a 10:00 start).
import { C, r2 } from '../lib.mjs';

const S = 2.6; // units per minute
const COMMIT = 384;
const ARRIVE = COMMIT - 15 * S; // target arrival
const LEAVE = ARRIVE - 60 * S; // leave by
const STOP = LEAVE - 30 * S; // stop workout
const Y = 78, H = 22, T = Y - H / 2, B = Y + H / 2; // bar centre line, height, top, bottom
const NOW = 62; // resting position of the now-marker

const css = `
.leaveby-back{stroke-dasharray:5 95;animation:leaveby-back 12s linear infinite}
.leaveby-b1{animation-name:leaveby-b1}.leaveby-b2{animation-name:leaveby-b2}.leaveby-b3{animation-name:leaveby-b3}.leaveby-b4{animation-name:leaveby-b4}
@keyframes leaveby-b4{0%,52%{stroke-dashoffset:100;opacity:0}54%{opacity:.8}74%{stroke-dashoffset:40;opacity:0}100%{stroke-dashoffset:40;opacity:0}}
@keyframes leaveby-b1{0%{stroke-dashoffset:100;opacity:0}2%{opacity:1}10%{stroke-dashoffset:5;opacity:1}12%,100%{stroke-dashoffset:5;opacity:0}}
@keyframes leaveby-b2{0%,10%{stroke-dashoffset:100;opacity:0}12%{opacity:1}36%{stroke-dashoffset:5;opacity:1}38%,100%{stroke-dashoffset:5;opacity:0}}
@keyframes leaveby-b3{0%,36%{stroke-dashoffset:100;opacity:0}38%{opacity:1}52%{stroke-dashoffset:5;opacity:1}54%,100%{stroke-dashoffset:5;opacity:0}}
.leaveby-ring{transform-box:fill-box;transform-origin:center;animation:leaveby-ring 12s ease-out infinite}
@keyframes leaveby-ring{0%,36%{transform:scale(.6);opacity:0}40%{transform:scale(.7);opacity:.9}62%,100%{transform:scale(1.7);opacity:0}}
.leaveby-ring2{animation-name:leaveby-ring2}
@keyframes leaveby-ring2{0%,52%{transform:scale(.6);opacity:0}56%{transform:scale(.7);opacity:.9}78%,100%{transform:scale(1.7);opacity:0}}
.leaveby-now{animation:leaveby-now 12s linear infinite}
@keyframes leaveby-now{0%{transform:translateX(-48px);opacity:0}6%{opacity:1}92%{opacity:1}100%{transform:translateX(42px);opacity:0}}
.leaveby-done{transform-box:fill-box;transform-origin:left;animation:leaveby-done 12s linear infinite}
@keyframes leaveby-done{0%{transform:scaleX(.35);opacity:0}6%{opacity:1}92%{opacity:1}100%{transform:scaleX(1.57);opacity:0}}
.leaveby-go{stroke-dasharray:2 14;animation:leaveby-go 3s linear infinite}
@keyframes leaveby-go{from{stroke-dashoffset:16}to{stroke-dashoffset:0}}
`;

// an arc that starts at the later time and lands on the earlier one
const arc = (from, to, ry) => `M${r2(from)} ${T - 9}A${r2((from - to) / 2)} ${ry} 0 0 0 ${r2(to)} ${T - 9}`;
const head = (x) => `M${r2(x - 3.5)} ${T - 15}L${r2(x)} ${T - 9}L${r2(x + 4.5)} ${T - 13.5}`;

function draw() {
  let s = '';
  // hour ruler: a tick every 15 minutes, longer on the hour
  let ticks = '', hours = '';
  for (let i = -1, x = COMMIT + 15 * S; x > -4; x -= 15 * S, i++) {
    if (i % 4 === 0) hours += `M${r2(x)} 108v11`; else ticks += `M${r2(x)} 108v5`;
  }
  s += `<path d="M0 108H420" stroke="${C.rule}" stroke-width="1.2"/><path d="${ticks}" stroke="${C.haze}" stroke-width="1.4"/><path d="${hours}" stroke="${C.ice}" stroke-width="1.6"/>`;
  // guides dropped from each deadline to the ruler
  s += `<path d="M${r2(STOP)} ${B}V108M${r2(ARRIVE)} ${B}V108M${COMMIT} ${B}V108" stroke="${C.haze}" stroke-width="1.2" stroke-dasharray="1.5 4"/>`;

  // the backwards arcs: buffer, commute, get ready
  // (the last arc is the training time that is left over, open towards the start of the session)
  const arcs = [[COMMIT, ARRIVE, 16], [ARRIVE, LEAVE, 46], [LEAVE, STOP, 32], [STOP, -72, 42]];
  s += `<path d="${arc(...arcs[3])}" stroke="${C.haze}" stroke-width="1.6" stroke-dasharray="2.5 4"/>`;
  s += `<path d="${arcs.slice(0, 3).map((a) => arc(...a)).join('')}" stroke="${C.ice}" stroke-width="1.6" stroke-dasharray="2.5 4"/>`;
  s += `<path d="${head(ARRIVE)}${head(STOP)}" stroke="${C.ice}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  arcs.forEach((a, i) => {
    s += `<path d="${arc(...a)}" pathLength="100" class="leaveby-back leaveby-b${i + 1}" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-dashoffset="${[60, 45, 30, 62][i]}"${i === 3 ? ' opacity=".7"' : ''}/>`;
  });

  // workout: open at the left, filled up to now
  s += `<rect x="-14" y="${T}" width="${r2(STOP + 10)}" height="${H}" rx="11" stroke="${C.ice}" stroke-width="1.6"/>`;
  s += `<rect x="-14" y="${T + 5}" width="${NOW + 14}" height="${H - 10}" fill="${C.ice}" opacity=".55" class="leaveby-done"/>`;
  s += `<g transform="translate(${NOW} 0)"><g class="leaveby-now"><path d="M0 ${T - 8}V${B + 8}" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/><circle cy="${T - 8}" r="3" fill="${C.ink}"/></g></g>`;
  // get ready: hatched
  let hatch = '';
  for (let x = STOP + 13; x < LEAVE - 12; x += 9) hatch += `M${r2(x)} ${B - 5.5}l8 -11`;
  s += `<rect x="${r2(STOP + 4)}" y="${T}" width="${r2(LEAVE - STOP - 8)}" height="${H}" rx="6" stroke="${C.ice}" stroke-width="1.6"/><path d="${hatch}" stroke="${C.haze}" stroke-width="1.5"/>`;
  // commute: dashed, with travel moving forward
  s += `<rect x="${r2(LEAVE + 4)}" y="${T}" width="${r2(ARRIVE - LEAVE - 8)}" height="${H}" rx="6" stroke="${C.ice}" stroke-width="1.6" stroke-dasharray="7 4.5"/>`;
  s += `<path d="M${r2(LEAVE + 12)} ${Y}H${r2(ARRIVE - 12)}" class="leaveby-go" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  // buffer: dotted
  s += `<rect x="${r2(ARRIVE + 4)}" y="${T}" width="${r2(COMMIT - ARRIVE - 19)}" height="${H}" rx="6" stroke="${C.ice}" stroke-width="1.7" stroke-dasharray="1 3.6" stroke-linecap="round"/>`;
  // the commitment itself, running on past the edge
  s += `<rect x="${COMMIT + 17}" y="${T}" width="60" height="${H}" rx="6" stroke="${C.ice}" stroke-width="1.6"/>`;
  s += `<circle cx="${COMMIT}" cy="${Y}" r="12.5" fill="${C.paper2}" stroke="${C.ice}" stroke-width="1.6"/><circle cx="${COMMIT}" cy="${Y}" r="5.5" fill="${C.ink}"/>`;
  s += `<circle cx="${r2(ARRIVE)}" cy="${Y}" r="3" fill="${C.ice}"/>`;

  // stop workout
  s += `<path d="M${r2(STOP)} ${T - 9}V${B + 5}" stroke="${C.ink}" stroke-width="1.5"/>` +
    `<circle cx="${r2(STOP)}" cy="${Y}" r="12" stroke="${C.ink}" stroke-width="1.3" class="leaveby-ring leaveby-ring2" opacity=".35"/>` +
    `<circle cx="${r2(STOP)}" cy="${Y}" r="6.5" fill="${C.paper2}" stroke="${C.ink}" stroke-width="2"/>`;
  // leave by: the one crimson mark
  s += `<path d="M${r2(LEAVE)} 12V118" stroke="${C.accent}" stroke-width="1.8"/><path d="M${r2(LEAVE)} 12h13l-4.5 5.5 4.5 5.5h-13z" fill="${C.accent}"/>` +
    `<circle cx="${r2(LEAVE)}" cy="${Y}" r="13" stroke="${C.accent2}" stroke-width="1.5" class="leaveby-ring" opacity=".4"/>` +
    `<circle cx="${r2(LEAVE)}" cy="${Y}" r="7" fill="${C.accent}"/>`;
  return s;
}

export default { css, draw };
