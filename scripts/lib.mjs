// Shared drawing kit for the profile artwork.
// Every word is converted to outlines, so the SVGs look the same on every
// device and need no web fonts (GitHub serves README images without them).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const ASSETS = path.join(ROOT, 'assets');
// PREVIEW_DIR redirects output, so one card can be drawn without touching assets/
const OUT = process.env.PREVIEW_DIR ? path.resolve(process.env.PREVIEW_DIR) : ASSETS;

// Rayhanson palette, taken from tokens.css and brand/palette.json on rayhanson.tech.
export const C = {
  night: '#05080C',
  paper: '#0A0F14',
  paper2: '#091B1F',
  deep: '#0F3D3E',
  haze: '#2E6F73',
  ice: '#7FB3B8',
  ink: '#EADCC8',
  ink2: '#CEC2AF',
  ivory: '#F2EDE4',
  accent: '#DB2B33',
  accent2: '#ED4A49',
  crimson: '#A31C1B',
  rule: '#1C3236',
  // light-theme counterparts for the section headers
  lightInk: '#0A0F14',
  lightMuted: '#2E6F73',
  lightRule: '#C9D6D6',
};

const fontFile = (pkg, file) => require.resolve(`@fontsource/${pkg}/files/${file}`);
const load = (p) => opentype.parse(fs.readFileSync(p).buffer.slice(0));
export const F = {
  display: load(fontFile('space-grotesk', 'space-grotesk-latin-600-normal.woff')),
  displayMedium: load(fontFile('space-grotesk', 'space-grotesk-latin-500-normal.woff')),
  body: load(fontFile('inter', 'inter-latin-400-normal.woff')),
  bodyMedium: load(fontFile('inter', 'inter-latin-500-normal.woff')),
  mono: load(fontFile('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff')),
};

export const r2 = (n) => Math.round(n * 100) / 100;

export function measure(str, font, size, tracking = 0) {
  return font.getAdvanceWidth(str, size, { letterSpacing: tracking, kerning: true });
}

// Outlined text. anchor: start | middle | end. tracking is in em.
export function text(str, { font = F.body, size = 16, x = 0, y = 0, fill = C.ink, anchor = 'start', tracking = 0, opacity, extra = '' } = {}) {
  const w = measure(str, font, size, tracking);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const d = font.getPath(str, x0, y, size, { letterSpacing: tracking, kerning: true }).toPathData(2);
  const op = opacity != null ? ` opacity="${opacity}"` : '';
  return `<path d="${d}" fill="${fill}"${op}${extra}/>`;
}

export function wrap(str, font, size, maxWidth, tracking = 0) {
  const words = str.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (measure(test, font, size, tracking) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function paragraph(str, { font = F.body, size = 16, x = 0, y = 0, width = 300, lineHeight = 1.5, fill = C.ink2, maxLines = 99 } = {}) {
  const lines = wrap(str, font, size, width).slice(0, maxLines);
  return {
    svg: lines.map((l, i) => text(l, { font, size, x, y: y + i * size * lineHeight, fill })).join(''),
    height: lines.length * size * lineHeight,
    lines: lines.length,
  };
}

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function svg(w, h, body, { title = '', desc = '', defs = '', style = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d" fill="none">` +
    `<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>` +
    (style || defs ? `<defs>${style ? `<style>${style}</style>` : ''}${defs}</defs>` : '') +
    body + `</svg>\n`;
}

// Motion stays polite: everything stops for people who ask for less motion.
export const REDUCED = '@media (prefers-reduced-motion: reduce){*{animation:none!important}}';

export function write(rel, content) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  return p;
}

// ---------- brand marks (original artwork, placed without recolouring) ----------
const brandDir = path.join(ASSETS, 'brand');
function inner(file) {
  const s = fs.readFileSync(path.join(brandDir, file), 'utf8');
  const vb = s.match(/viewBox="([^"]+)"/)[1];
  const body = s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>[\s\S]*?<\/title>/, '');
  return { vb, body };
}
export function symbol({ x, y, width, opacity = 1 }) {
  const { vb, body } = inner('rayhanson-symbol-ivory.svg');
  const [, , w, h] = vb.split(/\s+/).map(Number);
  return `<svg x="${x}" y="${y}" width="${width}" height="${r2((width * h) / w)}" viewBox="${vb}" opacity="${opacity}">${body}</svg>`;
}
export function symbolHeight(width) {
  const { vb } = inner('rayhanson-symbol-ivory.svg');
  const [, , w, h] = vb.split(/\s+/).map(Number);
  return (width * h) / w;
}
export function wordmark({ x, y, width, opacity = 1 }) {
  const { vb, body } = inner('rayhanson-wordmark-ivory.svg');
  const [, , w, h] = vb.split(/\s+/).map(Number);
  return `<svg x="${x}" y="${y}" width="${width}" height="${r2((width * h) / w)}" viewBox="${vb}" opacity="${opacity}">${body}</svg>`;
}

// ---------- icons ----------
const si = require('simple-icons');
// A few marks simple-icons no longer ships; drawn here as plain lettermarks/glyphs.
export function icon(name, { x, y, size = 20, fill = C.ink }) {
  const s = size / 24;
  const g = (d) => `<path transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s * 1000) / 1000})" d="${d}" fill="${fill}"/>`;
  if (name.startsWith('si') && si[name]) return g(si[name].path);
  if (name === 'linkedin') {
    return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s * 1000) / 1000})"><rect x="1" y="1" width="22" height="22" rx="4" fill="${fill}"/>` +
      `<rect x="5" y="9.5" width="3" height="9" fill="${C.paper}"/><circle cx="6.5" cy="6.3" r="1.8" fill="${C.paper}"/>` +
      `<path d="M10.5 9.5h2.9v1.3c.5-.9 1.6-1.6 3.1-1.6 2.6 0 3.5 1.6 3.5 4.2v5.1h-3v-4.5c0-1.2-.3-2.1-1.5-2.1s-1.9.9-1.9 2.1v4.5h-3.1z" fill="${C.paper}"/></g>`;
  }
  if (name === 'mail') {
    return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s * 1000) / 1000})" fill="none" stroke="${fill}" stroke-width="2" stroke-linejoin="round"><rect x="2" y="4.5" width="20" height="15" rx="2.5"/><path d="M3 6l9 7 9-7"/></g>`;
  }
  if (name === 'globe') {
    return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s * 1000) / 1000})" fill="none" stroke="${fill}" stroke-width="1.8"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c3 3.2 3 15.8 0 19M12 2.5c-3 3.2-3 15.8 0 19"/></g>`;
  }
  if (name === 'graph') {
    return `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s * 1000) / 1000})" stroke="${fill}" stroke-width="1.6" fill="${fill}"><path d="M5 6l7 6 7-7M12 12l-6 7M12 12l7 6" fill="none"/><circle cx="5" cy="6" r="2.4"/><circle cx="19" cy="5" r="2.4"/><circle cx="12" cy="12" r="3"/><circle cx="6" cy="19" r="2.4"/><circle cx="19" cy="18" r="2.4"/></g>`;
  }
  // lettermark tile, e.g. Ps, Ai, C#
  const t = name.replace(/^lm:/, '');
  return `<g><rect x="${r2(x + 0.5)}" y="${r2(y + 0.5)}" width="${size - 1}" height="${size - 1}" rx="${r2(size * 0.22)}" stroke="${fill}" stroke-width="1.4"/>` +
    text(t, { font: F.display, size: size * (t.length > 2 ? 0.42 : 0.52), x: x + size / 2, y: y + size * 0.68, fill, anchor: 'middle' }) + `</g>`;
}
