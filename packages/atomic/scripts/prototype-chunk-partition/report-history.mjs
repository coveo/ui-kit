// PROTOTYPE — renders the three-build comparison: before the chunking work (split-by-module alone),
// after ADR 0001 (minChunks 10) and with the solver partition, from the measure JSON files.
// usage: node report-history.mjs <buildsDir> <out.html>
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [dir, outPath] = process.argv.slice(2);
const J = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const pre = J('measure-pre-adr.json'),
  adr = J('measure-baseline.json'),
  sol = J('measure-opt-all.json'),
  hold = J('measure-opt-holdout.json');
const cost = J('cost.json'),
  solAll = J('opt-all-solution.json'),
  solHold = J('opt-holdout-solution.json');
const reg = Object.fromEntries(
  ['pre-adr', 'baseline', 'opt-all'].map((n) => [n, J(`registration-${n}.json`)])
);

const byId = (m) => Object.fromEntries(m.rows.map((r) => [r.id, r]));
const P = byId(pre),
  A = byId(adr),
  S = byId(sol),
  H = byId(hold);
const ids = pre.rows.map((r) => r.id).sort((a, b) => P[b].files - P[a].files);
const samples = pre.rows.filter((r) => r.family === 'sample').map((r) => r.id);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const f1 = (x) => x.toFixed(1),
  f0 = (x) => Math.round(x).toString(),
  ms = (s) => `${Math.round(s * 1000)} ms`;
const mean = (M, list, k) => list.reduce((a, id) => a + M[id][k], 0) / list.length;
// [name, stand-in page, ADR option A (files, KB), ADR C10 (files, KB), ADR measured mobile ready (A, C10) in s]
const proxies = [
  ['Search box alone', 'adr/search-box-only', [65, 130.0], [30, 132.4], [2.91, 2.68]],
  ['Typical search page', 'sample/search-vite', [162, 209.4], [76, 180.6], [4.21, 3.66]],
  ['Rich search page', 'storybook/search/search', [225, 301.2], [134, 270.6], [5.27, 4.66]],
  ['Commerce page', 'cdn-smoke/commerce', [196, 244.2], [108, 214.7], [6.09, 5.54]],
];
const b = cost.b_s_per_kb,
  c = cost.c_s_per_file;
// predicted mobile time to ready: the ADR's measured minChunks-10 time, moved by what each build adds or removes on the stand-in
const ready = (id, tC10, X) =>
  tC10 + b * (X[id].gzKb - A[id].gzKb) + c * (X[id].files - A[id].files);

const metrics = [
  {
    key: 'cost_s',
    label: 'Modelled download, mobile',
    unit: 's',
    fmt: (x) => x.toFixed(2),
    pre: pre.meanCost_s,
    adr: adr.meanCost_s,
    sol: sol.meanCost_s,
  },
  {
    key: 'files',
    label: 'Files per page',
    unit: 'files',
    fmt: f1,
    pre: pre.meanFiles,
    adr: adr.meanFiles,
    sol: sol.meanFiles,
  },
  {
    key: 'gzKb',
    label: 'Gzipped KB per page',
    unit: 'KB',
    fmt: f1,
    pre: pre.meanGzKb,
    adr: adr.meanGzKb,
    sol: sol.meanGzKb,
  },
];

function dumbbell({key, unit, decimals, highlight, step: tickStep}) {
  const rowH = 17,
    left = 262,
    right = 110,
    top = 30,
    width = 860;
  const h = top + ids.length * rowH + 28;
  const max = Math.max(...ids.flatMap((id) => [P[id][key], A[id][key], S[id][key]]));
  const step = tickStep ?? (max > 150 ? 50 : 20),
    niceMax = Math.ceil(max / step) * step;
  const x = (v) => left + (v / niceMax) * (width - left - right);
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${h}" role="img" aria-label="${key} per page for the three builds">`;
  for (let t = 0; t <= niceMax + 1e-9; t += step)
    svg += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top - 6}" y2="${h - 24}"/><text class="tick" x="${x(t)}" y="${h - 8}" text-anchor="middle">${+t.toFixed(2)}</text>`;
  svg += `<text class="tick" x="${width - 4}" y="${h - 8}" text-anchor="end">${unit}</text>`;
  ids.forEach((id, i) => {
    const y = top + i * rowH + rowH / 2,
      p = P[id][key],
      a = A[id][key],
      s = S[id][key];
    const label = id.length > 36 ? id.slice(0, 35) + '…' : id;
    const hl = highlight.includes(id);
    svg += `<g class="row${hl ? ' hl' : ''}" data-id="${esc(id)}" data-v="${p.toFixed(decimals)} → ${a.toFixed(decimals)} → ${s.toFixed(decimals)} ${unit}">`;
    svg += `<rect class="hit" x="0" y="${y - rowH / 2}" width="${width}" height="${rowH}"/>`;
    svg += `<text class="label" x="${left - 10}" y="${y + 4}" text-anchor="end">${esc(label)}</text>`;
    svg += `<line class="link" x1="${x(Math.min(p, a, s))}" x2="${x(Math.max(p, a, s))}" y1="${y}" y2="${y}"/>`;
    svg += `<circle class="dot pre" cx="${x(p)}" cy="${y}" r="5"/><circle class="dot adr" cx="${x(a)}" cy="${y}" r="5"/><circle class="dot sol" cx="${x(s)}" cy="${y}" r="5"/>`;
    if (hl)
      svg += `<text class="val" x="${x(Math.max(p, a, s)) + 10}" y="${y + 4}">${p.toFixed(decimals)} → ${a.toFixed(decimals)} → ${s.toFixed(decimals)}</text>`;
    svg += `</g>`;
  });
  return svg + `</svg>`;
}

function shareBars() {
  const left = 230,
    right = 20,
    width = 860,
    rowH = 44,
    top = 8,
    h = top + metrics.length * rowH + 8;
  const barW = width - left - right;
  let svg = `<svg class="chart bars" viewBox="0 0 ${width} ${h}" role="img" aria-label="share of the total reduction taken by the ADR and by the solver">`;
  metrics.forEach((m, i) => {
    const y = top + i * rowH,
      total = m.pre - m.sol,
      adrPart = (m.pre - m.adr) / total,
      solPart = (m.adr - m.sol) / total;
    const w1 = barW * adrPart,
      w2 = barW * solPart;
    svg += `<text class="label strong" x="${left - 10}" y="${y + 18}" text-anchor="end">${m.label}</text>`;
    svg += `<text class="tick" x="${left - 10}" y="${y + 33}" text-anchor="end">${m.fmt(m.pre)} → ${m.fmt(m.adr)} → ${m.fmt(m.sol)} ${m.unit}</text>`;
    svg += `<rect class="seg adr" x="${left}" y="${y + 6}" width="${Math.max(0, w1 - 1)}" height="22" rx="3"/>`;
    svg += `<rect class="seg sol" x="${left + w1 + 1}" y="${y + 6}" width="${Math.max(0, w2 - 1)}" height="22" rx="3"/>`;
    svg += `<text class="inbar" x="${left + 8}" y="${y + 21}">ADR 0001 −${m.fmt(m.pre - m.adr)} (${f0(adrPart * 100)} %)</text>`;
    svg += `<text class="inbar" x="${left + w1 + 9}" y="${y + 21}">solver −${m.fmt(m.adr - m.sol)} (${f0(solPart * 100)} %)</text>`;
  });
  return svg + `</svg>`;
}

function readyChart() {
  const left = 170,
    right = 250,
    width = 860,
    rowH = 40,
    top = 10,
    h = top + proxies.length * rowH + 30,
    maxS = 7;
  const x = (v) => left + (v / maxS) * (width - left - right);
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${h}" role="img" aria-label="predicted mobile time to ready for the four ADR shapes and three builds">`;
  for (let t = 0; t <= maxS; t++)
    svg += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top}" y2="${h - 26}"/><text class="tick" x="${x(t)}" y="${h - 10}" text-anchor="middle">${t}</text>`;
  svg += `<text class="tick" x="${width - 4}" y="${h - 10}" text-anchor="end">s</text>`;
  proxies.forEach(([name, id, , , [tA, tC10]], i) => {
    const y = top + i * rowH + rowH / 2,
      tP = ready(id, tC10, P),
      tS = ready(id, tC10, S);
    svg += `<g class="row" data-id="${esc(name)}" data-v="before ${tP.toFixed(2)} s (ADR measured ${tA.toFixed(2)}) → ADR ${tC10.toFixed(2)} s → solver ${tS.toFixed(2)} s">`;
    svg += `<rect class="hit" x="0" y="${y - rowH / 2}" width="${width}" height="${rowH}"/>`;
    svg += `<text class="label strong" x="${left - 10}" y="${y + 4}" text-anchor="end">${esc(name)}</text>`;
    svg += `<line class="link" x1="${x(tS)}" x2="${x(tP)}" y1="${y}" y2="${y}"/>`;
    svg += `<circle class="check" cx="${x(tA)}" cy="${y}" r="7"/>`;
    svg += `<circle class="dot pre" cx="${x(tP)}" cy="${y}" r="5"/><circle class="dot adr" cx="${x(tC10)}" cy="${y}" r="5"/><circle class="dot sol" cx="${x(tS)}" cy="${y}" r="5"/>`;
    svg += `<text class="val" x="${x(tP) + 14}" y="${y + 4}">${tP.toFixed(2)} → ${tC10.toFixed(2)} → ${tS.toFixed(2)} s, −${Math.round((tC10 - tS) * 1000)} ms vs ADR</text>`;
    svg += `</g>`;
  });
  return svg + `</svg>`;
}

function splitBars() {
  const left = 190,
    right = 90,
    width = 860,
    rowH = 44,
    top = 8,
    h = top + 3 * rowH + 8;
  const rows = [
    ['Before, split-by-module', pre],
    ['ADR 0001, minChunks 10', adr],
    ['Solver, ' + solAll.chunks + ' chunks', sol],
  ];
  const max = Math.max(...rows.map(([, m]) => m.meanCost_s));
  const x = (v) => left + (v / max) * (width - left - right);
  let svg = `<svg class="chart bars" viewBox="0 0 ${width} ${h}" role="img" aria-label="modelled download time split between bytes and files">`;
  rows.forEach(([name, m], i) => {
    const y = top + i * rowH,
      tb = b * m.meanGzKb,
      tf = c * m.meanFiles;
    svg += `<text class="label strong" x="${left - 10}" y="${y + 21}" text-anchor="end">${esc(name)}</text>`;
    svg += `<rect class="seg bytes" x="${x(0)}" y="${y + 6}" width="${Math.max(0, x(tb) - x(0) - 1)}" height="22" rx="3"/>`;
    svg += `<rect class="seg files" x="${x(tb) + 1}" y="${y + 6}" width="${Math.max(0, x(tb + tf) - x(tb) - 1)}" height="22" rx="3"/>`;
    svg += `<text class="inbar" x="${x(0) + 8}" y="${y + 21}">bytes ${tb.toFixed(2)} s</text>`;
    if (tf > 0.12)
      svg += `<text class="inbar" x="${x(tb) + 9}" y="${y + 21}">files ${tf.toFixed(2)} s</text>`;
    svg += `<text class="val" x="${x(tb + tf) + 10}" y="${y + 21}">${(tb + tf).toFixed(2)} s${tf <= 0.12 ? `, files ${tf.toFixed(2)} s` : ''}</text>`;
  });
  return svg + `</svg>`;
}

const tile = (m) =>
  `<div class="tile"><div class="tile-label">${m.label}</div><div class="tile-value">${m.fmt(m.pre)} <span class="arrow">→</span> ${m.fmt(m.adr)} <span class="arrow">→</span> ${m.fmt(m.sol)}<span class="tile-unit">${m.unit}</span></div><div class="tile-delta good">−${f0((1 - m.sol / m.pre) * 100)} % in all, −${f0((1 - m.adr / m.pre) * 100)} % from the ADR</div></div>`;
const cell = (id, key, fmt) =>
  `${fmt(P[id][key])} → ${fmt(A[id][key])} → <strong>${fmt(S[id][key])}</strong>`;

const html = `<title>Three Atomic CDN chunkings</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* layout: one reading column; charts scroll inside their own box when narrow */
:root { --bg:#f9f9f7; --surface:#fcfcfb; --ink:#0b0b0b; --ink-2:#52514e; --muted:#898781; --grid:#e1e0d9; --axis:#c3c2b7; --ring:rgba(11,11,11,.10);
  --pre:#86b6ef; --adr:#2a78d6; --sol:#104281; --bytes:#2a78d6; --files:#eb6834; --inbar:#ffffff; --good:#006300; --bad:#d03b3b; --code-bg:#f0efec;
  --sans:"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif; --mono:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#0d0d0d; --surface:#1a1a19; --ink:#f0efec; --ink-2:#c3c2b7; --muted:#898781; --grid:#2c2c2a; --axis:#383835; --ring:rgba(255,255,255,.10);
  --pre:#184f95; --adr:#3987e5; --sol:#9ec5f4; --bytes:#3987e5; --files:#d95926; --inbar:#0b0b0b; --good:#0ca30c; --bad:#e66767; --code-bg:#242422; color-scheme: dark; } }
:root[data-theme="dark"] { --bg:#0d0d0d; --surface:#1a1a19; --ink:#f0efec; --ink-2:#c3c2b7; --muted:#898781; --grid:#2c2c2a; --axis:#383835; --ring:rgba(255,255,255,.10);
  --pre:#184f95; --adr:#3987e5; --sol:#9ec5f4; --bytes:#3987e5; --files:#d95926; --inbar:#0b0b0b; --good:#0ca30c; --bad:#e66767; --code-bg:#242422; color-scheme: dark; }
body { background: var(--bg); color: var(--ink); font: 16px/1.55 var(--sans); margin: 0; padding-block: 32px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
main { max-width: 880px; margin: 0 auto; display: grid; gap: 40px; }
h1, h2, h3 { text-wrap: balance; line-height: 1.2; margin: 0; }
h1 { font-size: clamp(28px, 4vw, 38px); font-weight: 600; }
h2 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
p { max-width: 68ch; margin: 0 0 12px; }
.eyebrow { font: 500 12px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); margin-bottom: 14px; }
.lede { font-size: 18px; max-width: 64ch; }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin-top: 20px; }
.tile { background: var(--surface); border: 1px solid var(--ring); border-radius: 6px; padding: 14px 16px; min-width: 0; }
.tile-label { font: 500 12px/1.3 var(--mono); color: var(--ink-2); letter-spacing: .04em; text-transform: uppercase; }
.tile-value { font-size: 22px; font-weight: 600; margin-top: 8px; font-variant-numeric: tabular-nums; }
.tile-unit { font-size: 14px; color: var(--ink-2); margin-left: 6px; font-weight: 400; }
.arrow { color: var(--muted); font-weight: 400; }
.tile-delta { font: 500 13px var(--mono); margin-top: 4px; }
.good { color: var(--good); } .bad { color: var(--bad); }
figure { margin: 0; background: var(--surface); border: 1px solid var(--ring); border-radius: 6px; padding: 16px; }
figcaption { font-size: 14px; color: var(--ink-2); margin-top: 10px; max-width: 68ch; }
.legend { display: flex; gap: 18px; flex-wrap: wrap; font: 13px var(--mono); color: var(--ink-2); margin-bottom: 8px; }
.legend span::before { content: ""; display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
.legend .l-pre::before { background: var(--pre); } .legend .l-adr::before { background: var(--adr); } .legend .l-sol::before { background: var(--sol); }
.scroll { overflow-x: auto; }
.chart { width: 100%; height: auto; min-width: 680px; display: block; }
.chart .grid { stroke: var(--grid); stroke-width: 1; }
.chart .tick, .chart .label, .chart .val { font: 11px var(--mono); fill: var(--ink-2); }
.chart .label.strong, .chart .hl .label { fill: var(--ink); font-weight: 500; font-size: 12px; }
.chart .link { stroke: var(--axis); stroke-width: 2; }
.chart .dot { stroke: var(--surface); stroke-width: 2; } .chart .pre { fill: var(--pre); } .chart .adr { fill: var(--adr); } .chart .sol { fill: var(--sol); }
.chart .seg.adr { fill: var(--adr); } .chart .seg.sol { fill: var(--sol); } .chart .inbar { font: 500 11px var(--mono); fill: var(--inbar); }
.chart .seg.bytes { fill: var(--bytes); } .chart .seg.files { fill: var(--files); }
.chart .check { fill: none; stroke: var(--ink-2); stroke-width: 1.5; stroke-dasharray: 3 2; }
.legend .l-bytes::before { background: var(--bytes); } .legend .l-files::before { background: var(--files); }
.legend .l-check::before { background: transparent; border: 1.5px dashed var(--ink-2); box-sizing: border-box; }
.refs { font-size: 14px; } .refs li { margin-bottom: 4px; }
.chart .hit { fill: transparent; } .chart .row:hover .hit { fill: var(--code-bg); } .chart .row:hover .label { fill: var(--ink); }
.tip { position: fixed; pointer-events: none; background: var(--ink); color: var(--bg); font: 12px/1.4 var(--mono); padding: 6px 9px; border-radius: 4px; display: none; z-index: 20; max-width: 360px; }
table { border-collapse: collapse; width: 100%; font-size: 14px; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid var(--grid); vertical-align: top; }
th { font: 500 12px var(--mono); letter-spacing: .04em; text-transform: uppercase; color: var(--ink-2); }
td.n, th.n { text-align: right; white-space: nowrap; } td code { font: 13px var(--mono); }
code, .formula { font: 14px var(--mono); background: var(--code-bg); padding: 1px 5px; border-radius: 3px; } .formula { white-space: nowrap; }
ul { padding-left: 20px; margin: 0; } li { margin-bottom: 6px; max-width: 68ch; }
.note { font-size: 14px; color: var(--ink-2); }
a { color: var(--adr); }
</style>
<main>
<header>
  <div class="eyebrow">Prototype · Atomic CDN chunking · same commit of main, 31 October 2026</div>
  <h1>Three Atomic CDN chunkings</h1>
  <p class="lede">The same 42 page shapes, measured on three builds of the same commit: split-by-module alone as it was before the chunking work, the <code>atomic-shared</code> group that ADR 0001 added with <code>minChunks: 10</code>, and the CP-SAT partition from the prototype. On Lighthouse's mobile profile the typical search page is predicted ready in ${ready('sample/search-vite', 3.66, P).toFixed(2)} s before, 3.66 s with the ADR and ${ready('sample/search-vite', 3.66, S).toFixed(2)} s with the solver.</p>
  <div class="tiles">${metrics.map(tile).join('')}</div>
</header>

<section>
  <h2>How fast the page loads</h2>
  <p>The number that matters is the time until a page's Atomic components are defined and its results are on screen, on a mid-range phone. ADR 0001 measured it with Lighthouse's mobile profile: 150 ms of latency, 1.6 Mbps down and a 4× slower CPU, which Lighthouse describes as the bottom quarter of 4G connections. Each option was loaded cold five to seven times and the median kept.</p>
  <p>This page cannot repeat those loads, because the harness is not committed. Instead the ADR's 28 measurements were fitted to <span class="formula">ready = a<sub>page</sub> + ${(b * 1000).toFixed(1)} ms × KB + ${(c * 1000).toFixed(1)} ms × files</span> (R² ${cost.r2.toFixed(4)}). The chart below anchors each ADR shape on its measured minChunks 10 time and moves it by the files and bytes the other two builds add or remove on the stand-in page. The dashed rings are the check: the same arithmetic predicts the pre-ADR build at ${proxies.map(([, id, , , [, tC10]]) => ready(id, tC10, P).toFixed(2)).join(', ')} s where the ADR measured ${proxies.map(([, , , , [tA]]) => tA.toFixed(2)).join(', ')} s.</p>
  <figure>
    <div class="legend"><span class="l-pre">before, predicted</span><span class="l-adr">ADR 0001, measured</span><span class="l-sol">solver, predicted</span><span class="l-check">ADR's measured time before, as a check</span></div>
    <div class="scroll">${readyChart()}</div>
    <figcaption>Predicted time to ready on Lighthouse's mobile profile for the ADR's four page shapes. The solver saves ${proxies.map(([name, id, , , [, tC10]]) => `${Math.round((tC10 - ready(id, tC10, S)) * 1000)} ms on the ${name.toLowerCase()}`).join(', ')}, on top of what the ADR saved.</figcaption>
  </figure>
  <p>The rest of this page uses only the Atomic part of that formula, ${(b * 1000).toFixed(1)} ms × KB + ${(c * 1000).toFixed(1)} ms × files, which is the part a chunking can change. A page's own intercept, its API calls and rendering, is the same for every build. Splitting the modelled time shows what each step removed:</p>
  <figure>
    <div class="legend"><span class="l-bytes">bytes, ${(b * 1000).toFixed(1)} ms per gzipped KB</span><span class="l-files">files, ${(c * 1000).toFixed(1)} ms per request</span></div>
    <div class="scroll">${splitBars()}</div>
    <figcaption>Mean modelled Atomic download time over the ${ids.length} pages. The ADR removed half of the request time; the solver removes nearly all of it and also trims bytes, because merged files compress better and the search-box page no longer carries code it never runs.</figcaption>
  </figure>
  <figure>
    <div class="legend"><span class="l-pre">before, split-by-module alone</span><span class="l-adr">ADR 0001, minChunks 10</span><span class="l-sol">solver, ${solAll.chunks} chunks</span></div>
    <div class="scroll">${dumbbell({key: 'cost_s', unit: 's', decimals: 2, highlight: proxies.map((p) => p[1]), step: 0.5})}</div>
    <figcaption>Modelled Atomic download time per page, the same ${ids.length} pages as the file and byte charts below, sorted by the pre-ADR build.</figcaption>
  </figure>
  <h3>Why requests and bytes both cost time</h3>
  <ul class="refs">
    <li><strong>Requests still cost on HTTP/2.</strong> Multiplexing removes head-of-line blocking at the HTTP layer, not the per-request work: each file is its own stream with headers, scheduling and a dependency step. Lighthouse's critical request chains audit names both levers, "the greater the length of the chains and the larger the download sizes, the more significant the impact on page load performance", and recommends to "minimize the number of critical resources" and to "optimize the number of critical bytes". <a href="https://developer.chrome.com/docs/lighthouse/performance/critical-request-chains">developer.chrome.com</a></li>
    <li><strong>The budget most sites spend on everything.</strong> The Web Almanac 2024 puts the median mobile page at 22 JavaScript requests and 558 KB of JavaScript, 44 % of it unused during load. A typical Atomic search page alone fetched ${P['sample/search-vite'].files} files before this work, ${A['sample/search-vite'].files} after the ADR and ${S['sample/search-vite'].files} with the solver. <a href="https://almanac.httparchive.org/en/2024/javascript">almanac.httparchive.org</a></li>
    <li><strong>Bytes cost CPU, not only transfer.</strong> web.dev's start-up guidance notes that parse and compile scale with decompressed bytes and run 2 to 5 times slower on average phones than on the fastest ones, which is why the byte term keeps mattering once the request term is gone. <a href="https://web.dev/articles/optimizing-content-efficiency-javascript-startup-optimization">web.dev</a></li>
    <li><strong>The profile.</strong> Lighthouse's defaults are 150 ms RTT, 1.6 Mbps down, 750 kbps up and a constant 4× CPU slowdown, "roughly the bottom 25% of 4G connections and top 25% of 3G connections". <a href="https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md">github.com/GoogleChrome/lighthouse</a></li>
  </ul>
  <p class="note">Limits of the model: it has no separate CPU term (the fit folds parse and compile into the per-KB cost), it ignores chain depth (every component's chunks load in parallel right after the entry, the same for all three builds), the four intercepts come from the ADR's own pages rather than the stand-ins, and desktop was not modelled. The ADR reports the same trends on desktop with smaller gaps.</p>
</section>

<section>
  <h2>Where the gain came from</h2>
  <figure>
    <div class="legend"><span class="l-adr">ADR 0001, minChunks 10</span><span class="l-sol">solver, ${solAll.chunks} chunks</span></div>
    <div class="scroll">${shareBars()}</div>
    <figcaption>Each bar is the whole reduction from the pre-ADR build to the solver build, split between what the ADR already captured and what the solver adds. Means over the ${ids.length} pages.</figcaption>
  </figure>
</section>

<section>
  <h2>Files fetched per page</h2>
  <figure>
    <div class="legend"><span class="l-pre">before, split-by-module alone</span><span class="l-adr">ADR 0001, minChunks 10</span><span class="l-sol">solver, ${solAll.chunks} chunks</span></div>
    <div class="scroll">${dumbbell({key: 'files', unit: 'files', decimals: 0, highlight: proxies.map((p) => p[1])})}</div>
    <figcaption>Atomic JavaScript files a first visit fetches, entry included, sorted by the pre-ADR build. The four labelled rows stand in for the ADR's four page shapes.</figcaption>
  </figure>
</section>

<section>
  <h2>Gzipped bytes per page</h2>
  <figure>
    <div class="legend"><span class="l-pre">before, split-by-module alone</span><span class="l-adr">ADR 0001, minChunks 10</span><span class="l-sol">solver, ${solAll.chunks} chunks</span></div>
    <div class="scroll">${dumbbell({key: 'gzKb', unit: 'KB gz', decimals: 1, highlight: proxies.map((p) => p[1])})}</div>
    <figcaption>Gzip level 9 of the files each page fetches. Hundreds of tiny files compress badly, which is why the pre-ADR build also downloads the most bytes.</figcaption>
  </figure>
</section>

<section>
  <h2>The four ADR shapes</h2>
  <div class="scroll"><table>
    <thead><tr><th>Shape</th><th>Stand-in page</th><th class="n">Files</th><th class="n">KB gz</th><th class="n">Modelled download</th><th class="n">ADR's own figures, A → C10</th></tr></thead>
    <tbody>${proxies.map(([name, id, a, c]) => `<tr><td>${name}</td><td><code>${esc(id)}</code></td><td class="n">${cell(id, 'files', f0)}</td><td class="n">${cell(id, 'gzKb', f1)}</td><td class="n">${cell(id, 'cost_s', ms)}</td><td class="n">${a[0]} → ${c[0]} files, ${f1(a[1])} → ${f1(c[1])} KB</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="note">Each cell reads before → ADR → solver. The last column quotes the ADR's measurements of option A and of C at N = 10 for its own pages; the stand-ins land within a few files of them, so the pre-ADR build here is the state the ADR started from.</p>
</section>

<section>
  <h2>On the 30 pages the solver never saw</h2>
  <div class="scroll"><table>
    <thead><tr><th>Build, measured on the 30 sample pages</th><th class="n">Files, mean</th><th class="n">KB gz, mean</th><th class="n">Modelled download, mean</th></tr></thead>
    <tbody>
      <tr><td>Before, split-by-module alone</td><td class="n">${f1(mean(P, samples, 'files'))}</td><td class="n">${f1(mean(P, samples, 'gzKb'))}</td><td class="n">${ms(mean(P, samples, 'cost_s'))}</td></tr>
      <tr><td>ADR 0001, minChunks 10</td><td class="n">${f1(mean(A, samples, 'files'))}</td><td class="n">${f1(mean(A, samples, 'gzKb'))}</td><td class="n">${ms(mean(A, samples, 'cost_s'))}</td></tr>
      <tr><td>Solver trained on the 12 other pages, ${solHold.chunks} chunks</td><td class="n"><strong>${f1(mean(H, samples, 'files'))}</strong></td><td class="n"><strong>${f1(mean(H, samples, 'gzKb'))}</strong></td><td class="n"><strong>${ms(mean(H, samples, 'cost_s'))}</strong></td></tr>
      <tr><td>Solver trained on all 42 pages, ${solAll.chunks} chunks</td><td class="n">${f1(mean(S, samples, 'files'))}</td><td class="n">${f1(mean(S, samples, 'gzKb'))}</td><td class="n">${ms(mean(S, samples, 'cost_s'))}</td></tr>
    </tbody>
  </table></div>
  <p class="note">The honest comparison for real customer pages is the third row: against the pre-ADR build it still removes ${f0((1 - mean(H, samples, 'files') / mean(P, samples, 'files')) * 100)} % of the files and ${f0((1 - mean(H, samples, 'gzKb') / mean(P, samples, 'gzKb')) * 100)} % of the bytes.</p>
</section>

<section>
  <h2>Method and caveats</h2>
  <ul>
    <li><strong>Pre-ADR build.</strong> The current <code>rsbuild.cdn.mjs</code> with the <code>shared</code> cache group removed and the one-chunk-per-dayjs-locale group kept, which is the ADR's option A. It emits ${pre.jsFiles} JavaScript files against ${adr.jsFiles} for the ADR build and ${sol.jsFiles} for the solver build.</li>
    <li><strong>Same commit, same measurement.</strong> All three builds come from the same checkout. Files and gzipped bytes are read from the compiled per-component chunk lists and the real files; the seconds come from the fit on the ADR's tables (${(cost.b_s_per_kb * 1000).toFixed(1)} ms per KB, ${(cost.c_s_per_file * 1000).toFixed(1)} ms per file), not from throttled loads.</li>
    <li><strong>Registration.</strong> In headless Chromium all 206 components register on each build: ${reg['pre-adr'].served}, ${reg.baseline.served} and ${reg['opt-all'].served} files served for the page that holds every tag, no failed request.</li>
    <li><strong>Page shapes are repo proxies</strong> with equal weights; the solver's in-sample row overstates what real pages would get, which is why the held-out row is shown.</li>
  </ul>
  <p class="note">The solver, its model and the per-page comparison with the ADR build are on the companion page <a href="https://claude.ai/artifact/3mTty5VsYW2FGaK3uP9yxy">Does a solver beat minChunks 10?</a>; the scripts live in <code>packages/atomic/scripts/prototype-chunk-partition</code> on the branch <code>prototype/atomic-cdn-chunk-partition</code>.</p>
</section>
</main>
<div class="tip" id="tip"></div>
<script>
(() => {
  const tip = document.getElementById('tip');
  for (const row of document.querySelectorAll('.chart .row')) {
    row.addEventListener('mousemove', (e) => {
      tip.textContent = row.dataset.id + '  ·  ' + row.dataset.v;
      tip.style.display = 'block';
      tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 370) + 'px';
      tip.style.top = (e.clientY + 14) + 'px';
    });
    row.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  }
})();
</script>
`;
writeFileSync(outPath, html);
console.log(`report -> ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
