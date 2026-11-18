// Draws the GitHub activity and language cards from live data.
// Runs daily in .github/workflows/profile-stats.yml with the workflow's token,
// so the stats are self-hosted: no third-party stats service, nothing to break.
// Without a token it draws the same cards in a "waiting for first sync" state.
import { C, F, text, measure, svg, write, REDUCED, r2 } from './lib.mjs';

const USER = process.env.PROFILE_USER || 'Rayhanson-Git';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const QUERY = `query($login:String!){
  user(login:$login){
    repositories(ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC, first:100){
      totalCount
      nodes{ stargazerCount languages(first:12, orderBy:{field:SIZE, direction:DESC}){ edges{ size node{ name } } } }
    }
    contributionsCollection{
      totalCommitContributions
      totalPullRequestContributions
      restrictedContributionsCount
      contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount } } }
    }
  }
}`;

async function fetchData() {
  if (!TOKEN) return null;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-stats' },
    body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json.data.user;
}

function streaks(days) {
  let longest = 0, run = 0;
  for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i--; // today can still be empty
  for (; i >= 0 && days[i].contributionCount > 0; i--) current++;
  return { current, longest };
}

const fmt = (n) => (n == null ? '—' : n >= 10000 ? `${r2(n / 1000)}k` : n.toLocaleString('en-US'));
const frame = (W, H) => `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="24" fill="${C.paper}" stroke="${C.rule}"/>`;

function activity(u) {
  const W = 960, H = 372;
  const weeks = u ? u.contributionsCollection.contributionCalendar.weeks : Array.from({ length: 53 }, () => ({ contributionDays: Array.from({ length: 7 }, () => ({ contributionCount: 0 })) }));
  const days = weeks.flatMap((w) => w.contributionDays);
  const st = u ? streaks(days) : { current: null, longest: null };
  const stars = u ? u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0) : null;
  const cc = u?.contributionsCollection;
  const stats = [
    [fmt(cc ? cc.contributionCalendar.totalContributions : null), 'Contributions', 'last 12 months'],
    [st.current == null ? '—' : `${st.current}d`, 'Current streak', 'days in a row'],
    [st.longest == null ? '—' : `${st.longest}d`, 'Longest streak', 'last 12 months'],
    [fmt(cc ? cc.totalCommitContributions : null), 'Commits', 'last 12 months'],
    [fmt(cc ? cc.totalPullRequestContributions : null), 'Pull requests', 'last 12 months'],
    [fmt(u ? u.repositories.totalCount : null), 'Public repos', `${fmt(stars)} stars earned`],
  ];
  let s = frame(W, H);
  const colW = (W - 64) / stats.length;
  stats.forEach(([n, l, sub], i) => {
    const x = 36 + i * colW;
    if (i) s += `<path d="M${r2(x - 12)} 40V124" stroke="${C.rule}"/>`;
    s += text(l.toUpperCase(), { font: F.mono, size: 11.5, x, y: 52, fill: C.ice, tracking: 0.02 });
    s += text(n, { font: F.display, size: 42, x: x - 2, y: 98, fill: i === 1 ? C.accent2 : C.ink, tracking: -0.02 });
    s += text(sub, { font: F.body, size: 13.5, x, y: 121, fill: C.ink2, opacity: 0.75 });
  });

  // contribution grid
  const cell = 13, gap = 3, step = cell + gap;
  const gx = W - 36 - weeks.length * step + gap, gy = 186;
  const max = Math.max(1, ...days.map((d) => d.contributionCount));
  const ramp = ['#11202A', '#163F42', C.haze, C.ice, C.ink];
  const level = (c) => (c === 0 ? 0 : Math.min(4, 1 + Math.floor((c / max) * 3.999)));
  let lastMonth = '', grid = '';
  weeks.forEach((w, wi) => {
    const first = w.contributionDays[0];
    if (first?.date) {
      const m = new Date(first.date + 'T00:00:00Z').toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      if (m !== lastMonth && wi < weeks.length - 2) {
        s += text(m.toUpperCase(), { font: F.mono, size: 11, x: gx + wi * step, y: gy - 12, fill: C.ice, tracking: 0.1 });
        lastMonth = m;
      }
    }
    w.contributionDays.forEach((d, di) => {
      const dow = d.date ? new Date(d.date + 'T00:00:00Z').getUTCDay() : di;
      const lv = level(d.contributionCount);
      grid += `<rect x="${gx + wi * step}" y="${gy + dow * step}" width="${cell}" height="${cell}" rx="4" fill="${ramp[lv]}"/>`;
    });
  });
  s += `<g>${grid}</g>`;
  for (const [label, row] of [['MON', 1], ['WED', 3], ['FRI', 5]]) {
    s += text(label, { font: F.mono, size: 11, x: gx - 10, y: gy + row * step + 10.5, fill: C.ice, anchor: 'end', tracking: 0.1 });
  }
  const ly = gy + 7 * step + 22;
  const lx = W - 36 - 5 * step - 46;
  s += text('LESS', { font: F.mono, size: 11, x: lx - 10, y: ly + 11, fill: C.ice, anchor: 'end', tracking: 0.1 });
  ramp.forEach((c, i) => { s += `<rect x="${lx + i * step}" y="${ly}" width="${cell}" height="${cell}" rx="4" fill="${c}"/>`; });
  s += text('MORE', { font: F.mono, size: 11, x: lx + 5 * step + 6, y: ly + 11, fill: C.ice, tracking: 0.1 });
  const note = u
    ? `UPDATED ${new Date().toISOString().slice(0, 10)} · PUBLIC ACTIVITY`
    : 'WAITING FOR THE FIRST DAILY SYNC';
  s += text(note, { font: F.mono, size: 11, x: 36, y: ly + 11, fill: C.ice, tracking: 0.1 });

  write('stats/activity.svg', svg(W, H, s, {
    title: 'GitHub activity',
    desc: stats.map(([n, l]) => `${l}: ${n}`).join(', '),
    
  }));
}

function languages(u) {
  const W = 960, H = 230;
  const totals = {};
  for (const r of u ? u.repositories.nodes : []) for (const e of r.languages.edges) totals[e.node.name] = (totals[e.node.name] || 0) + e.size;
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  let list = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  if (list.length > 8) list = [...list.slice(0, 7), ['Other', list.slice(7).reduce((a, [, v]) => a + v, 0)]];
  const colors = [C.ink, C.ice, C.accent, C.haze, C.ink2, '#4E9196', C.crimson, '#3A5560'];
  let s = frame(W, H);
  s += text('LANGUAGES ACROSS MY PUBLIC REPOSITORIES', { font: F.mono, size: 12, x: 36, y: 50, fill: C.ice, tracking: 0.12 });
  const bx = 36, bw = W - 72, by = 72, bh = 18;
  s += `<clipPath id="bar"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="9"/></clipPath><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="9" fill="#11202A"/>`;
  let x = bx, bars = '';
  list.forEach(([, v], i) => {
    const w = (v / sum) * bw;
    bars += `<rect x="${r2(x)}" y="${by}" width="${r2(Math.max(w - 3, 1))}" height="${bh}" fill="${colors[i]}"/>`;
    x += w;
  });
  s += `<g clip-path="url(#bar)">${bars}</g>`;
  if (!list.length) s += text('Waiting for the first daily sync', { font: F.body, size: 14, x: 40, y: 140, fill: C.ink2 });
  const cols = 3, cw = bw / cols;
  list.forEach(([name, v], i) => {
    const cx = bx + (i % cols) * cw, cy = 132 + Math.floor(i / cols) * 36;
    s += `<rect x="${cx}" y="${cy - 11}" width="12" height="12" rx="3" fill="${colors[i]}"/>`;
    s += text(name, { font: F.bodyMedium, size: 16, x: cx + 22, y: cy, fill: C.ink });
    s += text(`${((v / sum) * 100).toFixed(1)}%`, { font: F.mono, size: 13, x: cx + 30 + measure(name, F.bodyMedium, 16), y: cy, fill: C.ice });
  });
  write('stats/languages.svg', svg(W, H, s, {
    title: 'Languages',
    desc: list.map(([n, v]) => `${n} ${((v / sum) * 100).toFixed(1)}%`).join(', ') || 'Waiting for the first sync',
  }));
}

let data = null;
try { data = await fetchData(); } catch (e) { console.error('Stats fetch failed, drawing the waiting state:', e.message); if (process.env.CI) process.exitCode = 1; }
activity(data);
languages(data);
console.log(data ? 'stats drawn from live data' : 'stats drawn in waiting state');
