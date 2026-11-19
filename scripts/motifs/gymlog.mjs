// GymLog: the prototype's set-logging flow as a strip of wireframe phones.
// choose an exercise -> focus on your set -> review your numbers -> set saved -> the work so far.
// Layout follows projects/gymlog/prototype.html: the four-step flow bar, kicker and two-line
// heading, cards, the weight and repetitions fields, the rest timer card, set rows, stacked buttons.
import { C, r2 } from '../lib.mjs';

const PW = 84, PH = 170, PITCH = 102, X0 = -54, TOP = 11;
const LOOP = 10;

const css = `
.gymlog-on{animation:gymlog-on ${LOOP}s linear infinite}
@keyframes gymlog-on{0%{opacity:0}3%,25%{opacity:1}29%,100%{opacity:0}}
.gymlog-lit{animation:gymlog-lit ${LOOP}s linear infinite}
@keyframes gymlog-lit{0%{opacity:.7}3%,25%{opacity:1}29%,100%{opacity:.7}}
.gymlog-lift{animation:gymlog-lift ${LOOP}s ease-in-out infinite}
@keyframes gymlog-lift{0%{transform:translateY(0)}4%,25%{transform:translateY(-4px)}30%,100%{transform:translateY(0)}}
.gymlog-wire{stroke-dasharray:3 37;animation:gymlog-wire 5s linear infinite}
@keyframes gymlog-wire{from{stroke-dashoffset:40}to{stroke-dashoffset:0}}
.gymlog-type{transform-box:fill-box;transform-origin:left;animation:gymlog-type ${LOOP}s linear infinite}
@keyframes gymlog-type{0%,19%{transform:scaleX(1);opacity:1}24%{transform:scaleX(1);opacity:0}25%{transform:scaleX(0);opacity:0}26%{transform:scaleX(0);opacity:1}34%,100%{transform:scaleX(1);opacity:1}}
.gymlog-tick{animation:gymlog-tick ${LOOP}s linear infinite}
@keyframes gymlog-tick{0%,44%{opacity:1}49%,53%{opacity:0}58%,100%{opacity:1}}
.gymlog-row{animation:gymlog-row ${LOOP}s linear infinite}
@keyframes gymlog-row{0%,69%{opacity:1}74%,78%{opacity:0}84%,100%{opacity:1}}
`;

// a horizontal bar with round ends
const bar = (x, y, w) => `M${r2(x)} ${r2(y)}h${r2(w)}`;
const stroke = (d, color, width, extra = '') => `<path d="${d}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${extra}/>`;
const box = (x, y, w, h, color, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3.5" stroke="${color}" stroke-width="1.4"${extra}/>`;

// what every flow screen shares: step bar, kicker, heading, sub line, two stacked buttons
function chrome(step, primary) {
  let s = '';
  if (step) {
    let on = '', off = '';
    for (let i = 0; i < 4; i++) { const d = bar(9 + i * 17.5, 15, 13); if (i < step) on += d; else off += d; }
    s += stroke(on, C.ink, 2.4) + (off ? stroke(off, C.haze, 2.4, ' opacity=".7"') : '');
  }
  const y = step ? 0 : -8;
  s += stroke(bar(9, 24 + y, 24), C.ice, 1.5);
  s += stroke(bar(10, 33 + y, 46) + bar(10, 41.5 + y, 32), C.ink, 4);
  s += stroke(bar(9, 50.5 + y, 52), C.haze, 1.5);
  if (!primary) s += box(8, 103, 68, 13, C.ice) + stroke(bar(30, 109.5, 24), C.ice, 1.6);
  return s;
}

const screens = [
  // 1 · choose an exercise: search field and exercise cards
  () => chrome(1) + box(8, 57, 68, 10, C.haze) + box(8, 71, 68, 26, C.haze) +
    stroke(bar(14, 77, 20), C.ice, 1.4) + stroke(bar(14.5, 85, 30), C.ink, 3) + stroke(bar(14, 92, 36), C.haze, 1.4),
  // 2 · focus on your set: the previous result as reference, then "ready when you are"
  () => chrome(2) + box(8, 57, 68, 21, C.ice) + stroke(bar(14, 62.5, 22), C.ice, 1.4) +
    stroke(bar(15, 70.5, 20) + bar(46, 70.5, 6), C.ink, 4) + stroke('M38 68l5 5m0-5l-5 5', C.ice, 1.4) +
    box(8, 81, 68, 17, C.haze) + stroke(bar(14, 86, 18), C.ice, 1.4) + stroke(bar(14.5, 92.5, 34), C.ink, 3),
  // 3 · review your numbers: weight and repetitions, nothing saved until you confirm
  () => chrome(3, true) + stroke(bar(9, 58, 16) + bar(45, 58, 22), C.ice, 1.4) +
    box(8, 62, 32, 22, C.ice) + box(44, 62, 32, 22, C.ice) +
    `<g class="gymlog-type">${stroke(bar(15, 73, 17), C.ink, 5)}</g><g class="gymlog-type" style="animation-delay:.3s">${stroke(bar(51, 73, 6), C.ink, 5)}</g>` +
    stroke(bar(9, 90, 40), C.haze, 1.4) + stroke(bar(9, 96.5, 18) + bar(52, 96.5, 23), C.ice, 1.5),
  // 4 · set saved: the "saved" chip over the optional rest timer
  () => chrome(4) + box(8, 57, 68, 41, C.haze) +
    `<rect x="24" y="61" width="36" height="8" rx="4" stroke="${C.ice}" stroke-width="1.3"/>` +
    `<g class="gymlog-tick">${stroke('M29 65l2 2 3.5-4', C.ink, 1.5, ' stroke-linejoin="round"')}</g>` + stroke(bar(38, 65, 17), C.ice, 1.4) +
    // 1:00 drawn as blocks, never as glyphs
    `<path d="M26 74h5v12h-5zM40 74h8v12h-8zM51 74h8v12h-8z" fill="${C.ink}"/><path d="M34 77h2.6v2.6H34zM34 81.5h2.6v2.6H34z" fill="${C.ink}"/>` +
    stroke(bar(31, 91.5, 22), C.haze, 1.4),
  // the work so far: totals, then every set with its edit link
  () => chrome(0) + stroke(bar(10, 53, 6) + bar(33, 53, 11) + bar(55, 53, 17), C.ink, 4.5) +
    stroke(bar(9, 60, 9) + bar(32, 60, 9) + bar(54, 60, 14), C.haze, 1.4) +
    box(8, 66, 68, 33, C.haze) + stroke(bar(14, 72, 24), C.ice, 1.4) +
    stroke(bar(14, 80.5, 10), C.haze, 1.5) + stroke(bar(33, 80.5, 20), C.ink, 3) + stroke(bar(62, 80.5, 8), C.ice, 1.5) +
    `<g class="gymlog-row">` + stroke(bar(14, 91, 10), C.haze, 1.5) + stroke(bar(33, 91, 20), C.ink, 3) + stroke(bar(62, 91, 8), C.ice, 1.5) + `</g>`,
];

function draw() {
  const wireY = TOP + 109.5;
  // the phone shell, drawn once
  let s = `<defs><g id="gymlog-phone"><rect width="${PW}" height="${PH}" rx="13" fill="${C.paper}" stroke="${C.haze}" stroke-width="1.5"/>` +
    `<path d="M35 6h14" stroke="${C.haze}" stroke-width="2.6" stroke-linecap="round"/></g></defs>`;
  // the flow wire behind the phones, pulses moving on to the next screen
  s += `<path d="M-10 ${wireY}H430" stroke="${C.haze}" stroke-width="1.3"/>` +
    `<path d="M-10 ${wireY}H430" class="gymlog-wire" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  screens.forEach((screen, i) => {
    const x = X0 + i * PITCH;
    // the highlight walks through the four phones that are in frame; the one cut by the left edge stays quiet
    const live = i > 0, rest = i === 2;
    const cls = (name) => (live ? ` class="gymlog-${name}" style="animation-delay:${r2((i - 1) * (LOOP / 4) - LOOP)}s"` : '');
    // the one crimson mark: "Confirm and save set", kept out of the dimmed group so it never greys
    const confirm = i === 2 ? `<rect x="8" y="103" width="68" height="13" rx="4" fill="${C.accent}"/>` + stroke(bar(30, 109.5, 24), C.ink, 1.8) : '';
    s += `<g transform="translate(${x} ${TOP})"><g${cls('lift')}${rest ? ' transform="translate(0 -4)"' : ''}><use href="#gymlog-phone"/>` +
      `<g${cls('lit')} opacity="${rest ? 1 : 0.7}">${screen()}</g>${confirm}` +
      (live ? `<rect width="${PW}" height="${PH}" rx="13" stroke="${C.ink}" stroke-width="1.8"${cls('on')} opacity="${rest ? 1 : 0}"/>` : '') + `</g>` +
      `<circle cx="0" cy="109.5" r="2.6" fill="${C.ice}"/></g>`;
  });
  return s;
}

export default { css, draw };
