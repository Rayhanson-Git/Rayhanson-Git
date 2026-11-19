// Builds the static artwork for the profile README: hero, section headers,
// buttons, project cards, toolkit and footer. Run: npm run build
import fs from 'node:fs';
import { hero } from './hero.mjs';
import { C, F, text, paragraph, wrap, measure, svg, write, symbol, symbolHeight, wordmark, icon, REDUCED, r2, ROOT } from './lib.mjs';

// A card's illustration lives in scripts/motifs/<slug>.mjs as { css, draw() }.
async function loadMotif(slug) {
  const file = `${ROOT}/scripts/motifs/${slug}.mjs`;
  return fs.existsSync(file) ? (await import(file)).default : null;
}

const fadeStyle = `
.rise{animation:rise 1s cubic-bezier(.16,1,.3,1) both}
@keyframes rise{from{transform:translateY(10px)}to{transform:none}}
.flow{stroke-dasharray:3 97;animation:flow 5s linear infinite}
@keyframes flow{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 3.6s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(.7);opacity:.15}50%{transform:scale(1.25);opacity:.55}}
.blink{animation:blink 1.2s steps(2,start) infinite}@keyframes blink{to{visibility:hidden}}
${REDUCED}`;

// mono call to action with a drawn arrow (the mono subset has no arrow glyph)
const cta = (label, x, y, size, fill) => {
  const t = label.replace(/\s*→\s*$/, '');
  const w = measure(t, F.mono, size, 0.14);
  const ax = x + w + 8, ay = y - size * 0.36;
  return text(t, { font: F.mono, size, x, y, fill, tracking: 0.14 }) +
    `<path d="M${r2(ax)} ${r2(ay)}h${r2(size * 1.1)}m-${r2(size * 0.42)} -${r2(size * 0.4)}l${r2(size * 0.42)} ${r2(size * 0.4)}-${r2(size * 0.42)} ${r2(size * 0.4)}" stroke="${fill}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
};
const para = (str, o) => {
  // narrow the measure a little when that rescues a one-word last line without adding a line
  let width = o.width;
  const lines = (w) => wrap(str, o.font, o.size, w);
  const n = lines(width).length;
  while (n > 1 && width > 120 && !lines(width).at(-1).includes(' ') && lines(width - 6).length === n) width -= 6;
  const r = paragraph(str, { ...o, width, maxLines: 99 });
  if (r.lines > o.maxLines) throw new Error(`Text too long for ${o.maxLines} lines: ${str}`);
  return r.svg;
};
const cardFrame = (w, h, extra = '') =>
  `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="24" fill="${C.paper}" stroke="${C.rule}"/>${extra}`;

// ============================== SECTION HEADERS ==============================
function header(slug, num, label, title, theme) {
  const W = 1280, H = 112;
  const ink = theme === 'dark' ? C.ink : C.lightInk;
  const muted = theme === 'dark' ? C.ice : C.lightMuted;
  const rule = theme === 'dark' ? C.rule : C.lightRule;
  const titleW = measure(title, F.display, 44, -0.01);
  const lineStart = Math.max(titleW, 260) + 40;
  const body =
    text(num, { font: F.mono, size: 17, x: 0, y: 32, fill: theme === 'dark' ? C.accent2 : C.accent, tracking: 0.1 }) +
    text(label.toUpperCase(), { font: F.mono, size: 17, x: 42, y: 32, fill: muted, tracking: 0.16 }) +
    text(title, { font: F.display, size: 44, x: 0, y: 90, fill: ink, tracking: -0.01 }) +
    `<path d="M${lineStart} 76H${W - 14}" stroke="${rule}" stroke-width="2"/>` +
    `<path d="M${lineStart} 76H${W - 14}" stroke="${muted}" stroke-width="2" pathLength="100" class="flow" style="animation-duration:7s"/>` +
    `<circle cx="${W - 8}" cy="76" r="6" fill="${C.accent}"/>`;
  write(`headers/${slug}-${theme}.svg`, svg(W, H, body, { title: `${title}`, desc: label, style: fadeStyle }));
}

// ============================== BUTTONS ==============================
function linkButton(slug, label, ico, { w = 212 } = {}) {
  const H = 56;
  const body = `<rect x=".75" y=".75" width="${w - 1.5}" height="${H - 1.5}" rx="28" fill="${C.paper}" stroke="${C.haze}" stroke-width="1.5"/>` +
    (ico === 'symbol'
      ? symbol({ x: 22, y: 28 - symbolHeight(30) / 2, width: 30 })
      : icon(ico, { x: 24, y: 17, size: 22, fill: C.ink })) +
    text(label, { font: F.displayMedium, size: 17, x: 62, y: 34, fill: C.ink }) +
    `<path d="M${w - 34} 22l6 6-6 6" stroke="${C.ice}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  write(`buttons/${slug}.svg`, svg(w, H, body, { title: label, desc: `${label} button` }));
}

function supportButtons() {
  const W = 400, H = 88;
  // Buy Me a Coffee: warm cream, the classic call to action
  const cup = `<g transform="translate(30 22)"><circle cx="22" cy="22" r="22" fill="${C.paper}"/>${icon('siBuymeacoffee', { x: 11, y: 10, size: 22, fill: '#FFDD00' })}</g>`;
  write('buttons/coffee.svg', svg(W, H,
    `<rect width="${W}" height="${H}" rx="22" fill="${C.ink}"/>` + cup +
    text('Buy me a coffee', { font: F.display, size: 24, x: 92, y: 46, fill: C.paper, tracking: -0.01 }) +
    text('BUYMEACOFFEE.COM/RAYHANSON', { font: F.mono, size: 13, x: 92, y: 69, fill: C.deep, tracking: 0.06 }) +
    `<path d="M${W - 42} 36l8 8-8 8" stroke="${C.accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    { title: 'Buy me a coffee', desc: 'Support Harvey on Buy Me a Coffee' }));
  const pp = `<g transform="translate(30 22)"><circle cx="22" cy="22" r="22" fill="${C.deep}"/>${icon('siPaypal', { x: 11, y: 11, size: 22, fill: C.ink })}</g>`;
  write('buttons/paypal.svg', svg(W, H,
    `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="22" fill="${C.paper}" stroke="${C.haze}" stroke-width="1.5"/>` + pp +
    text('Tip with PayPal', { font: F.display, size: 24, x: 92, y: 46, fill: C.ink, tracking: -0.01 }) +
    text('PAYPAL.ME/ALEXRAYHANSON', { font: F.mono, size: 13, x: 92, y: 69, fill: C.ice, tracking: 0.06 }) +
    `<path d="M${W - 42} 36l8 8-8 8" stroke="${C.ice}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    { title: 'Tip with PayPal', desc: 'Support Harvey on PayPal' }));
}

// ============================== FEATURED CARDS ==============================
const motifs = {
  enigma() {
    const n = [[60, 70], [150, 50], [110, 130], [40, 170], [170, 150], [90, 230], [175, 245], [40, 270], [130, 300]];
    const e = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [1, 4], [3, 5], [2, 5], [4, 6], [5, 6], [5, 7], [5, 8], [6, 8], [3, 7]];
    let s = e.map(([a, b], i) => `<path d="M${n[a][0]} ${n[a][1]}L${n[b][0]} ${n[b][1]}" stroke="${C.haze}" stroke-width="1.3"/>` +
      `<path d="M${n[a][0]} ${n[a][1]}L${n[b][0]} ${n[b][1]}" pathLength="100" class="flow" stroke="${C.ice}" stroke-width="2" style="animation-duration:4s;animation-delay:-${i * 0.6}s"/>`).join('');
    s += n.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 2 || i === 5 ? 9 : 6}" fill="${i === 5 ? C.accent : C.ink}"/>` +
      (i === 2 || i === 5 ? `<circle cx="${x}" cy="${y}" r="18" stroke="${C.ice}" class="pulse" style="animation-delay:-${i}s"/>` : '')).join('');
    s += text('vault/agents', { font: F.mono, size: 10, x: 14, y: 330, fill: C.ice, tracking: 0.04 });
    return s;
  },
  stanza() {
    const words = [['the', 'song'], ['you’re', 'playing,'], ['word', 'by'], ['word']];
    let s = `<rect x="14" y="18" width="192" height="26" rx="8" fill="${C.paper}"/>` +
      `<circle cx="30" cy="31" r="4" fill="${C.accent}"/>` + text('NOW PLAYING', { font: F.mono, size: 9.5, x: 42, y: 35, fill: C.ice, tracking: 0.1 });
    for (let b = 0; b < 6; b++) s += `<rect x="${150 + b * 8}" y="24" width="4" height="14" rx="2" fill="${C.ice}" class="eq" style="animation-delay:-${(b * 0.17).toFixed(2)}s"/>`;
    let k = 0, y = 104;
    for (const line of words) {
      let x = 16;
      for (const w of line) {
        s += `<g class="word" style="animation-delay:${(k * 0.55).toFixed(2)}s">${text(w, { font: F.display, size: 26, x, y, fill: C.ink })}</g>`;
        x += measure(w, F.display, 26) + 9;
        k++;
      }
      y += 48;
    }
    s += `<rect x="16" y="${y - 22}" width="188" height="4" rx="2" fill="${C.deep}"/><rect x="16" y="${y - 22}" width="188" height="4" rx="2" fill="${C.accent}" class="prog"/>`;
    return s;
  },
  jimbro() {
    const rows = [['Bench press', '3 x 8'], ['Incline DB', '3 x 10'], ['Cable fly', '3 x 12'], ['Dips', '3 x 8']];
    let s = text('TODAY · PUSH', { font: F.mono, size: 10, x: 16, y: 34, fill: C.ice, tracking: 0.12 });
    rows.forEach(([a, b], i) => {
      const y = 56 + i * 52;
      s += `<rect x="12" y="${y}" width="196" height="42" rx="10" fill="${C.paper}" stroke="${C.rule}"/>` +
        text(a, { font: F.bodyMedium, size: 13, x: 24, y: y + 19, fill: C.ink }) +
        text(b, { font: F.mono, size: 10, x: 24, y: y + 33, fill: C.ice }) +
        `<circle cx="186" cy="${y + 21}" r="10" stroke="${C.haze}" stroke-width="1.6"/>` +
        `<g class="check" style="animation-delay:${(0.6 + i * 0.9).toFixed(1)}s"><circle cx="186" cy="${y + 21}" r="10" fill="${C.accent}"/><path d="M181 ${y + 21}l3.5 3.5 6-7" stroke="${C.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    });
    s += `<rect x="12" y="270" width="196" height="40" rx="20" fill="${C.deep}"/>` +
      text('Leave by 7:40', { font: F.displayMedium, size: 15, x: 110, y: 295, fill: C.ink, anchor: 'middle' });
    return s;
  },
  theremin() {
    let s = '';
    const wave = (amp, freq, phase) => {
      let d = '';
      for (let x = -4; x <= 236; x += 4) d += `${x > -4 ? 'L' : 'M'}${x} ${r2(170 + amp * Math.sin((x / 220) * Math.PI * 2 * freq + phase))}`;
      return d;
    };
    s += `<clipPath id="tw"><rect x="8.7" width="202.6" height="340"/></clipPath><g clip-path="url(#tw)"><g class="drift"><path d="${wave(46, 2, 0)}" stroke="${C.ice}" stroke-width="2.2"/><path d="${wave(28, 3, 1)}" stroke="${C.haze}" stroke-width="1.6"/><path d="${wave(16, 5, 2)}" stroke="${C.accent}" stroke-width="1.4" opacity=".8"/></g></g>`;
    // two hand markers
    for (const [x, y, d] of [[52, 88, 0], [168, 252, 1.2]]) {
      s += `<g class="bob" style="animation-delay:-${d}s"><circle cx="${x}" cy="${y}" r="20" stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="${x}" cy="${y}" r="5" fill="${C.ink}"/></g>`;
    }
    s += text('VOLUME', { font: F.mono, size: 10, x: 14, y: 40, fill: C.ice, tracking: 0.12 }) +
      text('PITCH', { font: F.mono, size: 10, x: 206, y: 318, fill: C.ice, tracking: 0.12, anchor: 'end' });
    return s;
  },
};
const motifStyle = `
.word{animation:word 5.5s ease-in-out infinite backwards}
@keyframes word{0%{opacity:.22}8%,70%{opacity:1}85%,100%{opacity:.22}}
.eq{transform-box:fill-box;transform-origin:bottom;animation:eq .9s ease-in-out infinite alternate}
@keyframes eq{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
.prog{transform-box:fill-box;transform-origin:left;animation:prog 5.5s linear infinite}
@keyframes prog{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.check{animation:check 6s ease-out infinite backwards}
@keyframes check{0%,4%{opacity:0}8%,88%{opacity:1}100%{opacity:0}}
.drift{animation:drift 6s ease-in-out infinite alternate}@keyframes drift{to{transform:translateX(-14px)}}
.bob{animation:bob 4s ease-in-out infinite alternate}@keyframes bob{to{transform:translateY(-16px)}}
${fadeStyle}`;

async function featured(slug, p) {
  const W = 640, H = 360;
  const tx = 32, tw = 372;
  const custom = await loadMotif(slug);
  let s = cardFrame(W, H);
  s += `<rect x="428" y="20" width="192" height="320" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
  s += `<svg x="426" y="20" width="196" height="320" viewBox="6 0 208 340" overflow="hidden">${custom ? custom.draw() : motifs[slug]()}</svg>`;
  s += text(p.kicker, { font: F.mono, size: 14, x: tx, y: 54, fill: C.ice, tracking: 0.04 });
  s += text(p.title, { font: F.display, size: 42, x: tx - 2, y: 106, fill: C.ink, tracking: -0.015 });
  s += para(p.desc, { font: F.body, size: 19, x: tx, y: 146, width: tw, lineHeight: 1.42, fill: C.ink2, maxLines: 3 });
  let sx = tx;
  for (const [n, l] of p.stats) {
    s += text(n, { font: F.display, size: 36, x: sx, y: 270, fill: C.ink, tracking: -0.01 });
    s += text(l.toUpperCase(), { font: F.mono, size: 12.5, x: sx, y: 292, fill: C.ice, tracking: 0.02 });
    if (Math.max(measure(n, F.display, 36), measure(l.toUpperCase(), F.mono, 12.5, 0.02)) > 114) throw new Error(`Stat too wide: ${n} ${l}`);
    sx += 124;
  }
  s += `<path d="M${tx} 312H${tw + tx}" stroke="${C.rule}"/>`;
  s += cta(p.cta, tx, 338, 14, C.accent2);
  write(`cards/${slug}.svg`, svg(W, H, s, { title: `${p.title} — ${p.desc}`, desc: p.kicker, style: custom ? `${custom.css || ''}${REDUCED}` : motifStyle }));
}

// ============================== SMALL CARDS ==============================
const miniMotifs = {
  particles() {
    let s = '';
    for (let i = 0; i < 70; i++) {
      const a = i * 2.39996, rr = 6 * Math.sqrt(i) * 1.45;
      s += `<circle cx="${r2(70 + rr * Math.cos(a))}" cy="${r2(70 + rr * Math.sin(a))}" r="${(1 + (i % 4) * 0.5).toFixed(1)}" fill="${i % 9 === 0 ? C.accent2 : C.ice}" opacity="${(0.25 + (i % 5) * 0.12).toFixed(2)}"/>`;
    }
    return `<g class="spin">${s}</g>`;
  },
  neon() {
    return `<circle cx="70" cy="70" r="46" stroke="${C.haze}" stroke-dasharray="2 6"/><circle cx="70" cy="70" r="26" stroke="${C.accent}" opacity=".7"/>` +
      `<g class="spin" style="animation-duration:6s"><circle cx="116" cy="70" r="7" fill="${C.ink}"/><circle cx="104" cy="96" r="3" fill="${C.ice}" opacity=".6"/><circle cx="88" cy="110" r="2" fill="${C.ice}" opacity=".35"/></g>`;
  },
  orbits() {
    return [24, 40, 56].map((r, i) => `<circle cx="70" cy="70" r="${r}" stroke="${C.deep}" stroke-width="1.3"/>` +
      `<g class="spin" style="animation-duration:${6 + i * 4}s;animation-direction:${i % 2 ? 'reverse' : 'normal'}"><circle cx="${70 + r}" cy="70" r="${5 - i}" fill="${i === 1 ? C.accent2 : C.ice}"/></g>`).join('') +
      `<circle cx="70" cy="70" r="4" fill="${C.ink}"/>`;
  },
  wasp() {
    return `<circle cx="50" cy="60" r="30" stroke="${C.haze}" stroke-width="1.4"/><circle cx="104" cy="96" r="22" stroke="${C.haze}" stroke-width="1.4"/><circle cx="110" cy="34" r="14" stroke="${C.accent}" opacity=".7"/>` +
      `<g class="bob"><ellipse cx="78" cy="58" rx="9" ry="6" fill="${C.ink}"/><path d="M73 55h10M73 60h10" stroke="${C.paper}" stroke-width="2"/><ellipse cx="75" cy="49" rx="5" ry="3.4" fill="${C.ice}" opacity=".7"/></g>`;
  },
  gymlog() {
    return [0, 1, 2].map((i) => `<rect x="18" y="${26 + i * 32}" width="104" height="24" rx="6" stroke="${C.haze}"/>` +
      `<rect x="28" y="${35 + i * 32}" width="${40 + i * 10}" height="6" rx="3" fill="${C.ice}" opacity=".6"/>` +
      `<circle cx="108" cy="${38 + i * 32}" r="6" fill="${i < 2 ? C.accent : 'none'}" stroke="${C.accent}"/>`).join('');
  },
  leaveby() {
    return `<circle cx="70" cy="70" r="46" stroke="${C.haze}" stroke-width="1.4"/>` +
      Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M${r2(70 + 40 * Math.cos(a))} ${r2(70 + 40 * Math.sin(a))}L${r2(70 + 44 * Math.cos(a))} ${r2(70 + 44 * Math.sin(a))}" stroke="${C.ice}"/>`; }).join('') +
      `<path d="M70 70V40" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/><g class="spin" style="animation-duration:12s"><path d="M70 70H104" stroke="${C.accent}" stroke-width="2" stroke-linecap="round"/></g><circle cx="70" cy="70" r="4" fill="${C.ink}"/>`;
  },
  audio() {
    let s = '';
    for (let i = 0; i < 22; i++) {
      const h = 10 + Math.abs(Math.sin(i * 1.7) * 46) + (i % 3) * 6;
      s += `<rect x="${10 + i * 5.6}" y="${r2(70 - h / 2)}" width="3" height="${r2(h)}" rx="1.5" fill="${i % 7 === 3 ? C.accent2 : C.ice}" class="eq" style="transform-origin:center;animation-delay:-${(i * 0.13).toFixed(2)}s"/>`;
    }
    return s;
  },
  film() {
    let s = `<rect x="12" y="34" width="116" height="72" rx="6" stroke="${C.haze}" stroke-width="1.4"/>`;
    for (let i = 0; i < 7; i++) s += `<rect x="${18 + i * 16}" y="40" width="8" height="6" rx="1.5" fill="${C.haze}"/><rect x="${18 + i * 16}" y="94" width="8" height="6" rx="1.5" fill="${C.haze}"/>`;
    s += `<path d="M64 56v28l22-14z" fill="${C.accent}"/>`;
    return s;
  },
  merge() {
    return `<path d="M42 30v80M42 52c0 30 56 20 56 46" stroke="${C.ice}" stroke-width="2.2"/>` +
      `<circle cx="42" cy="30" r="8" fill="${C.paper2}" stroke="${C.ink}" stroke-width="2"/><circle cx="42" cy="110" r="8" fill="${C.paper2}" stroke="${C.ink}" stroke-width="2"/><circle cx="98" cy="102" r="8" fill="${C.accent}"/>`;
  },
};
const miniStyle = `.spin{transform-box:view-box;transform-origin:70px 70px;animation:spin 18s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.bob{animation:bob 3s ease-in-out infinite alternate}@keyframes bob{to{transform:translate(-8px,6px)}}
.eq{transform-box:fill-box;animation:eq 1.1s ease-in-out infinite alternate}@keyframes eq{from{transform:scaleY(.35)}to{transform:scaleY(1)}}
${REDUCED}`;

async function mini(slug, p) {
  const W = 420, H = 320, BAND = 132;
  const custom = await loadMotif(slug);
  let s = cardFrame(W, H);
  // illustration band across the top of the card
  s += `<clipPath id="band"><path d="M.5 24.5a24 24 0 0 1 24-24h371a24 24 0 0 1 24 24V${BAND}H.5z"/></clipPath>`;
  s += `<g clip-path="url(#band)"><rect width="${W}" height="${BAND}" fill="${C.paper2}"/>` +
    (custom
      ? `<svg width="${W}" height="${BAND}" viewBox="0 0 ${W} ${BAND}" overflow="hidden">${custom.draw()}</svg>`
      : `<svg x="${W - 150}" y="11" width="110" height="110" viewBox="0 0 140 140">${miniMotifs[p.motif]()}</svg>`) + `</g>`;
  s += `<path d="M.5 ${BAND}H${W - .5}" stroke="${C.rule}"/><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" stroke="${C.rule}"/>`;
  s += text(p.kicker, { font: F.mono, size: 14, x: 26, y: 166, fill: C.ice, tracking: 0.02 });
  if (measure(p.title, F.display, 29) > 372) throw new Error(`Title too long: ${p.title}`);
  s += text(p.title, { font: F.display, size: 29, x: 25, y: 206, fill: C.ink });
  s += para(p.desc, { font: F.body, size: 19, x: 26, y: 238, width: 372, lineHeight: 1.35, fill: C.ink2, maxLines: 2 });
  s += cta(p.cta, 26, 298, 14, C.accent2);
  write(`cards/${slug}.svg`, svg(W, H, s, { title: `${p.title} — ${p.desc}`, desc: p.kicker, style: custom ? `${custom.css || ''}${REDUCED}` : miniStyle }));
}

// ============================== TOOLKIT ==============================
function toolkit(W = 1048, file = 'toolkit.svg') {
  const rows = [
    ['AI systems', [['siModelcontextprotocol', 'MCP servers'], ['graph', 'Hybrid search · RAG'], ['lm:KG', 'Knowledge graphs'], ['lm:Em', 'Embeddings'], ['lm:Ev', 'Eval sets'], ['siObsidian', 'Obsidian']]],
    ['Languages', [['siRust', 'Rust'], ['siSwift', 'Swift'], ['siTypescript', 'TypeScript'], ['siPython', 'Python'], ['siCplusplus', 'C++'], ['siJavascript', 'JavaScript'], ['lm:C#', 'C#'], ['siLua', 'Lua']]],
    ['Built with', [['siApple', 'SwiftUI · AppKit'], ['siReact', 'React'], ['siNextdotjs', 'Next.js'], ['siTailwindcss', 'Tailwind'], ['siThreedotjs', 'Three.js'], ['siP5dotjs', 'p5.js'], ['lm:T', 'Tone.js'], ['siMediapipe', 'MediaPipe'], ['siOpengl', 'GLSL shaders'], ['siSqlite', 'SQLite']]],
    ['Design & media', [['lm:Ps', 'Photoshop'], ['lm:Ai', 'Illustrator'], ['lm:Ae', 'After Effects'], ['lm:Lr', 'Lightroom'], ['lm:Au', 'Audition'], ['siDavinciresolve', 'DaVinci Resolve'], ['siObsstudio', 'OBS Studio']]],
    ['Ship & tinker', [['siVercel', 'Vercel'], ['siCloudflare', 'Cloudflare'], ['siGithubactions', 'GitHub Actions'], ['siVite', 'Vite'], ['siVitest', 'Vitest'], ['siRaspberrypi', 'Raspberry Pi'], ['siHomeassistant', 'Home Assistant'], ['siUnity', 'Unity'], ['siUnrealengine', 'Unreal Engine']]],
  ];
  const X0 = 28, maxX = W - 28, CH = 40, GAP = 8;
  let y = 30, s = '';
  for (const [label, items] of rows) {
    s += text(label.toUpperCase(), { font: F.mono, size: 13, x: 30, y: y + 14, fill: C.ice, tracking: 0.12 });
    y += 28;
    // one line if it fits, otherwise two balanced lines (no lonely orphan chip)
    const widths = items.map(([, name]) => 12 + 18 + 9 + measure(name, F.bodyMedium, 15) + 14);
    const total = widths.reduce((a, w) => a + w + GAP, -GAP);
    let breakAt = items.length;
    if (X0 + total > maxX) {
      let acc = 0, best = 1, bestDiff = Infinity;
      widths.forEach((w, i) => { acc += w + GAP; const d = Math.abs(acc - (total + GAP) / 2); if (d < bestDiff) { bestDiff = d; best = i + 1; } });
      breakAt = best;
      // on a narrow artboard two lines may not be enough: fall back to plain wrapping
      const run = (from, to) => widths.slice(from, to).reduce((sum, w) => sum + w + GAP, -GAP);
      if (X0 + Math.max(run(0, best), run(best)) > maxX) breakAt = -1;
    }
    let x = X0;
    for (const [idx, [ic, name]] of items.entries()) {
      const w = widths[idx];
      if (idx === breakAt || (breakAt === -1 && x > X0 && x + w > maxX)) { x = X0; y += CH + GAP; }
      s += `<rect x="${r2(x) + .5}" y="${y + .5}" width="${r2(w)}" height="${CH}" rx="12" fill="${C.paper2}" stroke="${C.rule}"/>` +
        icon(ic, { x: x + 12, y: y + 11, size: 18, fill: C.ink }) +
        text(name, { font: F.bodyMedium, size: 15, x: x + 39, y: y + 25.5, fill: C.ink });
      x += w + GAP;
    }
    y += CH + 30;
    s += `<path d="M28 ${y - 15}H${W - 28}" stroke="${C.rule}" stroke-dasharray="2 6"/>`;
  }
  const H = y - 4;
  write(file, svg(W, H, cardFrame(W, H) + s, {
    title: 'Toolkit',
    desc: rows.map(([l, it]) => `${l}: ${it.map((i) => i[1]).join(', ')}`).join('. '),
  }));
}

// ============================== QUOTE / FOOTER ==============================
const QUOTE = 'I don’t ship what I don’t understand. I design the architecture, get my hands dirty in the code, and take systems apart until I know exactly why they work. Every call is mine, and nothing goes out until it meets my standard.';
function principle(W = 1280, file = 'principle.svg') {
  const narrow = W < 1000;
  const quote = paragraph(QUOTE, { font: F.displayMedium, size: 29, x: 60, y: 108, width: W - (narrow ? 96 : 130), lineHeight: 1.35, fill: C.ink });
  const H = Math.round(119 + quote.height);
  let s = cardFrame(W, H, `<rect x="28" y="36" width="6" height="${H - 72}" rx="3" fill="${C.accent}"/>`);
  s += text('HOW I WORK', { font: F.mono, size: 15, x: 60, y: 58, fill: C.ice, tracking: 0.16 });
  s += quote.svg;
  write(file, svg(W, H, s, { title: 'How I work', desc: QUOTE }));
}

function footer() {
  const W = 1280, H = 280;
  const defs = `<radialGradient id="g" cx="640" cy="280" r="520" gradientUnits="userSpaceOnUse"><stop stop-color="${C.haze}" stop-opacity=".35"/><stop offset="1" stop-color="${C.haze}" stop-opacity="0"/></radialGradient><clipPath id="c"><rect width="${W}" height="${H}" rx="28"/></clipPath>`;
  let wave = '';
  for (let k = 0; k < 4; k++) {
    let d = '';
    for (let x = -40; x <= W + 40; x += 20) d += `${x === -40 ? 'M' : 'L'}${x} ${r2(214 + Math.sin(x / (120 + k * 30) + k) * (10 + k * 5))}`;
    wave += `<path d="${d}" stroke="${k === 1 ? C.accent : C.haze}" stroke-width="${k === 1 ? 1.6 : 1.2}" opacity="${k === 1 ? 0.7 : 0.6}" class="drift" style="animation-delay:-${k}s"/>`;
  }
  const ww = 300;
  const s = `<g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="${C.paper}"/><rect width="${W}" height="${H}" fill="url(#g)"/>${wave}` +
    wordmark({ x: 640 - ww / 2, y: 30, width: ww }) +
    text('Thoughtful design, everyday impact', { font: F.display, size: 38, x: 640, y: 168, fill: C.ink, anchor: 'middle', tracking: -0.01 }) +
    text('© 2026 HARVEY RAYHANSON · RAYHANSON.TECH', { font: F.mono, size: 15, x: 640, y: 254, fill: C.ice, anchor: 'middle', tracking: 0.14 }) +
    `</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="28" stroke="${C.rule}"/>`;
  write('footer.svg', svg(W, H, s, {
    title: 'Rayhanson — Thoughtful design, everyday impact', desc: '© 2026 Harvey Rayhanson, rayhanson.tech', defs,
    style: `.drift{animation:drift 9s ease-in-out infinite alternate}@keyframes drift{to{transform:translateX(-40px)}}${REDUCED}`,
  }));
}

// ============================== RUN ==============================
const ONLY = process.env.ONLY;
const all = !ONLY;
if (all) hero();
for (const t of all ? ['dark', 'light'] : []) {
  header('about', '01', 'About', 'Hi, I’m Harvey', t);
  header('work', '02', 'Selected work', 'Things I’ve designed and built', t);
  header('more', '03', 'Apps, creative code & media', 'More work', t);
  header('toolkit', '04', 'Toolkit', 'What I build with', t);
  header('activity', '05', 'On GitHub', 'Activity, updated daily', t);
  header('support', '06', 'Support', 'Fuel the next build', t);
}
if (all) {
linkButton('portfolio', 'Portfolio', 'symbol');
linkButton('linkedin', 'LinkedIn', 'linkedin');
linkButton('email', 'Email', 'mail');
linkButton('youtube', 'YouTube', 'siYoutube');
linkButton('instagram', 'Instagram', 'siInstagram');
linkButton('x', 'X', 'siX');
linkButton('twitch', 'Twitch', 'siTwitch');
linkButton('pinterest', 'Pinterest', 'siPinterest');
supportButtons();
// invisible gutter between cards in a row (see README.md)
write('spacer.svg', '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"/>\n');
}

if (all || ONLY === 'enigma') await featured('enigma', {
  kicker: 'AI SYSTEMS · RUST · 2026', title: 'Enigma MCP',
  desc: 'A Rust memory server I engineered so AI agents share one searchable brain.',
  stats: [['25', 'MCP tools'], ['512', 'tests'], ['3', 'OSes']], cta: 'CASE STUDY  →',
});
if (all || ONLY === 'stanza') await featured('stanza', {
  kicker: 'MACOS APP · SWIFT · 2026', title: 'Stanza',
  desc: 'The song you’re playing in Spotify or Apple Music, drawn word by word over your Mac.',
  stats: [['23', 'lyric styles'], ['2', 'players'], ['Free', 'MIT']], cta: 'CASE STUDY  →',
});
if (all || ONLY === 'jimbro') await featured('jimbro', {
  kicker: 'PRODUCT DESIGN · NEXT.JS · 2026', title: 'JimBro',
  desc: 'A local-first gym companion: plan around your day, log every set, review your progress.',
  stats: [['49', 'tests'], ['Live', 'web app'], ['2-in-1', 'LeaveBy+GymLog']], cta: 'CASE STUDY  →',
});
if (all || ONLY === 'theremin') await featured('theremin', {
  kicker: 'GESTURE & SOUND · REACT · 2026', title: 'Virtual Theremin',
  desc: 'Play vocals, bass, and finger-tap drums with your hands. Loop a bar, pick a key, record your take.',
  stats: [['2', 'hands'], ['4', 'drum sounds'], ['0', 'cameras needed']], cta: 'PLAY IT LIVE  →',
});

const minis = [
  ['gesture', { motif: 'particles', kicker: 'COMPUTER VISION · THREE.JS', title: 'Gesture Particles', desc: 'Up to 100k GPU particles in 12 morphing shapes. Hands or mouse.', cta: 'TRY IT  →' }],
  ['neon', { motif: 'neon', kicker: 'CREATIVE CODE · P5.JS', title: 'Neon Orbit Arcade', desc: 'Your cursor becomes an orb. Portals pull or push, in three modes.', cta: 'TRY IT  →' }],
  ['orbit', { motif: 'orbits', kicker: 'GENERATIVE · P5.JS', title: 'Orbit Playground', desc: 'Each click adds an orbit. Four shapes, four palettes, a kaleidoscope.', cta: 'TRY IT  →' }],
  ['wasp', { motif: 'wasp', kicker: 'BROWSER GAME · P5.JS', title: 'Wasp Dodge+', desc: 'Four lives, levels, and power-ups. Survive one more second.', cta: 'PLAY  →' }],
  ['gymlog', { motif: 'gymlog', kicker: 'UX DESIGN · PROTOTYPE', title: 'GymLog', desc: 'A workout log that’s quick and easy to correct.', cta: 'CASE STUDY  →' }],
  ['leaveby', { motif: 'leaveby', kicker: 'WEB APP · NEXT.JS', title: 'LeaveBy', desc: 'Work out, get ready, and leave on time.', cta: 'TRY IT  →' }],
  ['studio', { motif: 'audio', kicker: 'SOUND DESIGN · AUDITION', title: 'Studio Apartment Evening', desc: 'A 3:06 audio story from eleven sounds I recorded.', cta: 'LISTEN  →' }],
  ['dmc', { motif: 'film', kicker: 'VIDEO EDIT · DAVINCI RESOLVE', title: 'Devil May Cry GMV', desc: '3:50 across DMC 3, 4 and 5, cut against live action.', cta: 'WATCH  →' }],
  ['tesseract', { motif: 'merge', kicker: 'OPEN SOURCE · PYTHON', title: 'Tesseract MCP', desc: 'Merged PR to an agent memory server: atomic writes, per-agent identity.', cta: 'SEE THE PR  →' }],
];
for (const [slug, p] of minis) if (all || ONLY === slug) await mini(slug, p);

if (all) {
  toolkit();
  toolkit(560, 'toolkit-narrow.svg');
  principle();
  principle(640, 'principle-narrow.svg');
  footer();
}
console.log(all ? 'artwork built' : `${ONLY} built`);
