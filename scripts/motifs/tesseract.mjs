// Tesseract MCP: the merged pull request.
// Three agents, each with its own mark, write notes into one shared vault.
// Every write lands in its own slot and is signed with its agent's mark; where
// two agents reach for the same slot, one wins and the other takes the next
// free one. On the right the branch joins the main line: merged.
import { C, r2 } from '../lib.mjs';

const AX = 38, AY = [26, 66, 106]; // agents
const VX = 200, VW = 104, ROW = 14, PITCH = 18, VY = 13; // vault
const ry = (i) => VY + i * PITCH + ROW / 2;
const OWNER = [0, 1, 0, 2, 1, 2]; // who signed each note
const MX = 384, BX = 348; // main line, branch

const css = `
.tesseract-f{stroke-dasharray:5 95;animation:tesseract-f 5s linear infinite}
@keyframes tesseract-f{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.tesseract-r{transform-box:fill-box;transform-origin:center;animation:tesseract-r 5s ease-out infinite}
@keyframes tesseract-r{0%{transform:scale(.6);opacity:0}7%{opacity:.9}45%,100%{transform:scale(1.5);opacity:0}}
`;

const mark = (k, x, y, r, a) => k === 0 ? `<circle cx="${x}" cy="${y}" r="${r}" ${a}/>`
  : k === 1 ? `<rect x="${r2(x - r * 0.9)}" y="${r2(y - r * 0.9)}" width="${r2(r * 1.8)}" height="${r2(r * 1.8)}" rx="1" ${a}/>`
  : `<path d="M${x} ${r2(y - r * 1.15)}L${r2(x + r * 1.15)} ${r2(y + r * 0.85)}H${r2(x - r * 1.15)}z" stroke-linejoin="round" ${a}/>`;

function draw() {
  let s = '';
  // write paths: agent -> slot. Row 2 is contested: agent 0 wins, agent 2 steps down to row 3.
  const paths = OWNER.map((k, i) => i === 3
    ? `M${AX + 16} ${AY[k]}L${VX - 40} ${ry(2)}V${ry(3)}H${VX - 6}`
    : `M${AX + 16} ${AY[k]}L${VX - 6} ${ry(i)}`);
  s += `<path d="${paths.join('')}" stroke="${C.haze}" stroke-width="1.3"/>`;
  s += `<path d="M${VX - 40} ${ry(2)}H${VX - 9}" stroke="${C.ice}" stroke-width="1.4" stroke-dasharray="3 3"/>`;
  paths.forEach((d, i) => { s += `<path d="${d}" pathLength="100" class="tesseract-f" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" stroke-dashoffset="${[40, 62, 25, 50, 48, 70][i]}" style="animation-delay:-${r2(i * 0.83)}s"/>`; });
  // agents
  AY.forEach((y, k) => {
    s += `<circle cx="${AX}" cy="${y}" r="16" stroke="${C.haze}" stroke-width="1.3" stroke-dasharray="2 4"/>` + mark(k, AX, y, 8, `fill="${C.paper2}" stroke="${C.ink}" stroke-width="2"`);
  });
  // vault and its slots
  s += `<rect x="${VX - 6}" y="${VY - 6}" width="${VW + 12}" height="${PITCH * 5 + ROW + 12}" rx="8" stroke="${C.ice}" stroke-width="1.5"/>`;
  let slots = '', names = '', ports = '';
  OWNER.forEach((k, i) => {
    slots += `M${VX + 3} ${VY + i * PITCH}h${VW - 6}a3 3 0 0 1 3 3v${ROW - 6}a3 3 0 0 1 -3 3h-${VW - 6}a3 3 0 0 1 -3 -3v-${ROW - 6}a3 3 0 0 1 3 -3z`;
    names += `M${VX + 26} ${ry(i)}h${[52, 34, 60, 60, 42, 28][i]}`;
    ports += `M${VX - 6} ${ry(i)}h0`;
    s += mark(k, VX + 12, ry(i), 4.6, `fill="${C.ink}"`);
  });
  s += `<path d="${slots}" stroke="${C.haze}" stroke-width="1.2"/><path d="${names}" stroke="${C.haze}" stroke-width="2.4" stroke-linecap="round"/><path d="${ports}" stroke="${C.ice}" stroke-width="5" stroke-linecap="round"/>`;
  // the pull request: a branch off main, carrying the change, merged back in
  const br = `M${MX} 116C${MX} 100 ${BX} 104 ${BX} 88V64C${BX} 48 ${MX} 52 ${MX} 36`;
  s += `<path d="M${VX + VW + 6} 76H${BX}" stroke="${C.haze}" stroke-width="1.3" stroke-dasharray="2 4"/>`;
  s += `<path d="M${MX} -4V136" stroke="${C.ice}" stroke-width="1.8"/><path d="${br}" stroke="${C.ice}" stroke-width="1.8"/>`;
  s += `<path d="${br}" pathLength="100" class="tesseract-f" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-dashoffset="22"/>`;
  s += `<circle cx="${MX}" cy="116" r="5" fill="${C.paper2}" stroke="${C.ink}" stroke-width="1.8"/><circle cx="${BX}" cy="76" r="5" fill="${C.paper2}" stroke="${C.ink}" stroke-width="1.8"/><circle cx="${MX}" cy="10" r="5" fill="${C.paper2}" stroke="${C.ink}" stroke-width="1.8"/>`;
  s += `<circle cx="${MX}" cy="36" r="12" stroke="${C.accent2}" stroke-width="1.4" class="tesseract-r" opacity=".4"/><circle cx="${MX}" cy="36" r="7" fill="${C.accent}"/>`;
  return s;
}

export default { css, draw };
