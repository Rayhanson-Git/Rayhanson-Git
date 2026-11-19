// The hero banner: name and title on the left; on the right a system map of the
// projects around the logo, drawn like an instrument readout (thin lines, rings,
// tick marks, light travelling along the links).
import { C, F, text, paragraph, measure, svg, write, symbol, symbolHeight, REDUCED, r2 } from './lib.mjs';

const W = 1280, H = 500;
const CX = 960, CY = 250;
// kind picks the node's glyph, and matches the three chips on the left
const NODES = [
  ['Enigma MCP', 800, 108, 'end', 'ai'],
  ['Stanza', 1068, 88, 'start', 'product'],
  ['JimBro', 1172, 214, 'start', 'product'],
  ['LeaveBy', 1150, 380, 'start', 'product'],
  ['GymLog', 972, 438, 'middle', 'product'],
  ['Virtual Theremin', 806, 398, 'end', 'creative'],
  ['Gesture Particles', 796, 232, 'end', 'creative'],
  ['Neon Orbit Arcade', 920, 64, 'end', 'creative'],
];
const MINOR = [[860, 180], [1080, 170], [1100, 300], [880, 330], [1010, 352], [1150, 130], [1220, 320], [760, 190], [1236, 96], [700, 320], [1060, 452]];

const polar = (r, deg) => [r2(CX + r * Math.cos((deg * Math.PI) / 180)), r2(CY + r * Math.sin((deg * Math.PI) / 180))];
const arc = (r, a0, a1) => { const [x0, y0] = polar(r, a0), [x1, y1] = polar(r, a1); return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`; };
const curve = (x1, y1, x2, y2, bend) => {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
  return `M${x1} ${y1}Q${r2(mx - dy * bend)} ${r2(my + dx * bend)} ${x2} ${y2}`;
};

// node glyphs: diamond = AI systems, square = product, circle = creative code and sound
function glyph(kind, x, y, s, fill = C.ink) {
  if (kind === 'ai') return `<path d="M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z" fill="${fill}"/>`;
  if (kind === 'product') return `<rect x="${r2(x - s * 0.8)}" y="${r2(y - s * 0.8)}" width="${r2(s * 1.6)}" height="${r2(s * 1.6)}" rx="${r2(s * 0.3)}" fill="${fill}"/>`;
  return `<circle cx="${x}" cy="${y}" r="${r2(s * 0.85)}" fill="${fill}"/>`;
}
function halo(kind, x, y, s, extra = '') {
  if (kind === 'ai') return `<path d="M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z" stroke="${C.ice}" ${extra}/>`;
  if (kind === 'product') return `<rect x="${x - s * 0.8}" y="${y - s * 0.8}" width="${s * 1.6}" height="${s * 1.6}" rx="${r2(s * 0.3)}" stroke="${C.ice}" ${extra}/>`;
  return `<circle cx="${x}" cy="${y}" r="${r2(s * 0.85)}" stroke="${C.ice}" ${extra}/>`;
}

export function hero() {
  let links = '', pulses = '', marks = '', labels = '';

  // ---- instrument rings around the logo ----
  let dial = `<circle cx="${CX}" cy="${CY}" r="96" stroke="${C.haze}" stroke-dasharray="2 7" class="h-turn"/>`;
  let ticks = '';
  for (let a = 0; a < 360; a += 6) {
    const long = a % 30 === 0, [x0, y0] = polar(116, a), [x1, y1] = polar(long ? 127 : 121, a);
    ticks += `M${x0} ${y0}L${x1} ${y1}`;
  }
  dial += `<path d="${ticks}" stroke="${C.haze}" stroke-width="1.1" opacity=".8"/>`;
  dial += `<path d="${arc(142, -78, -12)}${arc(142, 102, 168)}" stroke="${C.ice}" stroke-width="1.4" opacity=".7" class="h-turn2"/>`;
  dial += `<path d="${arc(206, 196, 250)}${arc(206, 18, 64)}${arc(264, -40, 8)}${arc(264, 150, 190)}" stroke="${C.deep}" stroke-width="1.2"/>`;
  dial += `<circle cx="${CX}" cy="${CY}" r="206" stroke="${C.deep}" stroke-width="1" stroke-dasharray="1 9" opacity=".8"/>`;
  // radar sweep
  dial += `<g class="h-sweep"><path d="M${CX} ${CY}L${polar(264, -18).join(' ')}A264 264 0 0 1 ${polar(264, 0).join(' ')}Z" fill="url(#h-sweep)"/><path d="M${CX} ${CY}L${polar(264, 0).join(' ')}" stroke="${C.ice}" stroke-width="1" opacity=".45"/></g>`;
  // crosshair through the hub, with ruler ticks
  let cross = `M${CX - 330} ${CY}H${CX - 150}M${CX + 150} ${CY}H${W}M${CX} 0V${CY - 150}M${CX} ${CY + 150}V${H}`;
  for (let x = CX - 320; x <= W; x += 20) if (Math.abs(x - CX) > 150) cross += `M${x} ${CY - 3}v6`;
  for (let y = 10; y < H; y += 20) if (Math.abs(y - CY) > 150) cross += `M${CX - 3} ${y}h6`;
  dial += `<path d="${cross}" stroke="${C.deep}" stroke-width="1" opacity=".9"/>`;

  // ---- links: hub to each project, with light travelling along them ----
  NODES.forEach(([label, x, y, anchor, kind], i) => {
    const d = curve(CX, CY, x, y, i % 2 ? 0.18 : -0.18);
    links += `<path d="${d}" stroke="${C.haze}" stroke-width="1.4" opacity=".6"/>`;
    pulses += `<path d="${d}" pathLength="100" class="h-flow" stroke="${i % 3 === 0 ? C.accent2 : C.ice}" style="animation-delay:-${(i * 0.7).toFixed(1)}s"/>`;
    marks += halo(kind, x, y, 16, `class="h-pulse" style="animation-delay:-${(i * 0.45).toFixed(2)}s"`);
    marks += halo(kind, x, y, 11, 'opacity=".55"') + glyph(kind, x, y, 6);
    const lx = anchor === 'end' ? x - 22 : anchor === 'start' ? x + 22 : x;
    const ly = anchor === 'middle' ? y + 38 : y + 5;
    labels += text(label.toUpperCase(), { font: F.mono, size: 15, x: lx, y: ly, fill: C.ice, anchor, tracking: 0.06 });
  });
  // the outer mesh: neighbours and unnamed junctions
  const ring = NODES.map(([, x, y]) => [x, y]).concat(MINOR.slice(0, 8));
  ring.forEach(([x, y], i) => {
    const [nx, ny] = ring[(i + 3) % ring.length];
    links += `<path d="${curve(x, y, nx, ny, 0.12)}" stroke="${C.deep}" stroke-width="1"/>`;
  });
  MINOR.forEach(([x, y], i) => {
    if (i < 8) links += `<path d="${curve(CX, CY, x, y, i % 2 ? -0.1 : 0.1)}" stroke="${C.deep}" stroke-width="1.2"/>`;
    // junctions are small crosses or dots, like marks on a chart
    marks += i % 3 === 0
      ? `<path d="M${x - 4} ${y}h8M${x} ${y - 4}v8" stroke="${C.ice}" stroke-width="1.2" opacity=".8"/>`
      : `<circle cx="${x}" cy="${y}" r="2.6" fill="${C.ice}" opacity=".7"/>`;
  });

  const sw = 86, sh = symbolHeight(sw);
  const center = `<circle cx="${CX}" cy="${CY}" r="70" fill="${C.paper2}" stroke="${C.haze}"/>` +
    `<circle cx="${CX}" cy="${CY}" r="78" stroke="${C.ice}" stroke-width="1" opacity=".5"/>` +
    `<circle cx="${CX}" cy="${CY}" r="88" stroke="${C.ice}" class="h-pulse" style="animation-duration:5s"/>` +
    symbol({ x: CX - sw / 2, y: CY - sh / 2 - 2, width: sw });

  // corner brackets, as on a viewfinder
  const b = 14, bx0 = 672, bx1 = W - 26, by0 = 26, by1 = H - 26;
  const brackets = `<path d="M${bx0} ${by0 + b}V${by0}h${b}M${bx1 - b} ${by0}h${b}v${b}M${bx1} ${by1 - b}v${b}h-${b}M${bx0 + b} ${by1}h-${b}v-${b}" stroke="${C.haze}" stroke-width="1.2" opacity=".8"/>`;

  // ---------- left column ----------
  const X = 64;
  const nameW = measure('Rayhanson', F.display, 96, -0.02);
  const left =
    `<g class="h-rise" style="animation-delay:.05s"><circle cx="${X + 5}" cy="84" r="5" fill="${C.accent}"/>` +
    text('RAYHANSON.TECH', { font: F.mono, size: 15, x: X + 20, y: 90, fill: C.ice, tracking: 0.16 }) + `</g>` +
    `<g class="h-rise" style="animation-delay:.15s">` +
    text('Harvey', { font: F.display, size: 96, x: X - 4, y: 186, fill: C.ink, tracking: -0.02 }) +
    text('Rayhanson', { font: F.display, size: 96, x: X - 4, y: 280, fill: C.ink, tracking: -0.02 }) +
    `<rect x="${r2(X + nameW + 4)}" y="244" width="16" height="36" fill="${C.accent}" class="h-blink"/></g>` +
    `<g class="h-rise" style="animation-delay:.3s">` +
    text('MEDIA ARTIST · GRAPHIC DESIGNER · AI ENGINEER', { font: F.mono, size: 16, x: X, y: 330, fill: C.ice, tracking: 0.06 }) + `</g>` +
    `<g class="h-rise" style="animation-delay:.45s">` +
    paragraph('I like understanding how things work, then imagining what else they could do.', { font: F.body, size: 22, x: X, y: 376, width: 560, lineHeight: 1.4, fill: C.ink2 }).svg + `</g>`;
  // the chips double as the map's legend
  let chips = '', cx = X;
  for (const [c, kind] of [['AI systems', 'ai'], ['Product design', 'product'], ['Creative code & sound', 'creative']]) {
    const w = measure(c, F.bodyMedium, 16) + 54;
    chips += `<rect x="${cx + 0.5}" y="428.5" width="${r2(w)}" height="38" rx="19" stroke="${C.haze}" fill="${C.paper2}"/>` +
      glyph(kind, cx + 22, 447.5, 5.5, C.accent2) +
      text(c, { font: F.bodyMedium, size: 16, x: cx + 37, y: 453, fill: C.ink });
    cx += w + 10;
  }

  const defs = `
<radialGradient id="h-glow" cx="${CX}" cy="${CY}" r="420" gradientUnits="userSpaceOnUse"><stop stop-color="${C.haze}" stop-opacity=".4"/><stop offset="1" stop-color="${C.haze}" stop-opacity="0"/></radialGradient>
<radialGradient id="h-ember" cx="1220" cy="500" r="360" gradientUnits="userSpaceOnUse"><stop stop-color="${C.accent}" stop-opacity=".16"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
<radialGradient id="h-sweep" cx="${CX}" cy="${CY}" r="264" gradientUnits="userSpaceOnUse"><stop stop-color="${C.ice}" stop-opacity=".2"/><stop offset="1" stop-color="${C.ice}" stop-opacity="0"/></radialGradient>
<pattern id="h-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="${C.ice}" opacity=".12"/></pattern>
<linearGradient id="h-fade" x1="0" x2="1"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity="1"/></linearGradient>
<mask id="h-mask"><rect width="${W}" height="${H}" fill="url(#h-fade)"/></mask>
<clipPath id="h-clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>`;

  const style = `
.h-rise{animation:h-rise 1s cubic-bezier(.16,1,.3,1) both}@keyframes h-rise{from{transform:translateY(10px)}to{transform:none}}
.h-blink{animation:h-blink 1.2s steps(2,start) infinite}@keyframes h-blink{to{visibility:hidden}}
.h-flow{stroke-width:2.4;stroke-linecap:round;stroke-dasharray:3 97;animation:h-flow 5s linear infinite}@keyframes h-flow{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.h-pulse{transform-box:fill-box;transform-origin:center;animation:h-pulse 3.6s ease-in-out infinite}
@keyframes h-pulse{0%,100%{transform:scale(.75);opacity:.15}50%{transform:scale(1.2);opacity:.55}}
.h-turn,.h-turn2,.h-sweep{transform-box:view-box;transform-origin:${CX}px ${CY}px}
.h-turn{animation:h-spin 60s linear infinite}.h-turn2{animation:h-spin 44s linear infinite reverse}.h-sweep{animation:h-spin 14s linear infinite}
@keyframes h-spin{to{transform:rotate(360deg)}}
${REDUCED}`;

  const body = `<g clip-path="url(#h-clip)"><rect width="${W}" height="${H}" fill="${C.paper}"/>` +
    `<rect width="${W}" height="${H}" fill="url(#h-dots)" mask="url(#h-mask)"/>` +
    `<rect width="${W}" height="${H}" fill="url(#h-glow)"/><rect width="${W}" height="${H}" fill="url(#h-ember)"/>` +
    `<g mask="url(#h-mask)">${dial}${brackets}</g>` + links + pulses + marks + labels + center +
    left + `<g class="h-rise" style="animation-delay:.6s">${chips}</g>` +
    `</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="28" stroke="${C.rule}"/>`;

  write('hero.svg', svg(W, H, body, {
    title: 'Harvey Rayhanson — Media Artist, Graphic Designer, and AI Engineer',
    desc: `A system map with the Rayhanson logo at the centre and the projects around it: ${NODES.map((n) => n[0]).join(', ')}. Diamonds mark AI systems, squares product design, circles creative code and sound.`,
    defs, style,
  }));
}
