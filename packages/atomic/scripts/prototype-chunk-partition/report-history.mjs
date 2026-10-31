// PROTOTYPE — renders the three-build page: before ADR 0001 (split-by-module alone), after the
// ADR (minChunks 10) and with the solver partition, from the measure JSON files.
// usage: node report-history.mjs <buildsDir> <out.html> [firstPageUrl]
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [dir, outPath, firstPage = ''] = process.argv.slice(2);
const J = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const builds = [
  {key: 'pre', name: 'before the ADR', short: 'split-by-module', m: J('measure-pre-adr.json')},
  {key: 'adr', name: 'ADR 0001', short: 'minChunks 10', m: J('measure-baseline.json')},
  {key: 'sol', name: 'solver', short: 'CP-SAT partition', m: J('measure-opt-all.json')},
];
const sol = J('opt-all-solution.json');
const reg = Object.fromEntries(
  [
    ['pre', 'pre-adr'],
    ['adr', 'baseline'],
    ['sol', 'opt-all'],
  ]
    .filter(([, n]) => existsSync(join(dir, `registration-${n}.json`)))
    .map(([k, n]) => [k, J(`registration-${n}.json`)])
);
const rows = Object.fromEntries(
  builds.map((b) => [b.key, Object.fromEntries(b.m.rows.map((r) => [r.id, r]))])
);
const ids = builds[0].m.rows.map((r) => r.id).sort((a, b) => rows.pre[b].files - rows.pre[a].files);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const f1 = (x) => x.toFixed(1),
  f0 = (x) => Math.round(x).toString(),
  ms = (s) => `${Math.round(s * 1000)} ms`;
const proxies = [
  ['Search box alone', 'adr/search-box-only'],
  ['Typical search page', 'sample/search-vite'],
  ['Rich search page', 'storybook/search/search'],
  ['Commerce page', 'cdn-smoke/commerce'],
];
const metrics = [
  {key: 'meanFiles', label: 'Files per page', unit: '', fmt: f1},
  {key: 'meanGzKb', label: 'Gzipped KB per page', unit: 'KB', fmt: f1},
  {key: 'meanCost_s', label: 'Modelled download, mobile', unit: 's', fmt: (x) => x.toFixed(2)},
  {key: 'jsFiles', label: 'JS files in the CDN folder', unit: '', fmt: f0},
];
const v = (b, k) => builds.find((x) => x.key === b).m[k];

function dumbbell({key, unit, decimals, highlight}) {
  const rowH = 17,
    left = 262,
    right = 110,
    top = 30,
    width = 860;
  const h = top + ids.length * rowH + 28;
  const max = Math.max(...ids.flatMap((id) => builds.map((b) => rows[b.key][id][key])));
  const niceMax = Math.ceil(max / 50) * 50;
  const x = (val) => left + (val / niceMax) * (width - left - right);
  const step = niceMax > 200 ? 50 : 25;
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${h}" role="img" aria-label="${key} per page for the three builds">`;
  for (let t = 0; t <= niceMax; t += step)
    svg += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top - 6}" y2="${h - 24}"/><text class="tick" x="${x(t)}" y="${h - 8}" text-anchor="middle">${t}</text>`;
  svg += `<text class="tick" x="${width - 4}" y="${h - 8}" text-anchor="end">${unit}</text>`;
  ids.forEach((id, i) => {
    const y = top + i * rowH + rowH / 2;
    const vals = builds.map((b) => rows[b.key][id][key]);
    const label = id.length > 36 ? id.slice(0, 35) + '…' : id;
    const hl = highlight.includes(id);
    svg += `<g class="row${hl ? ' hl' : ''}" data-id="${esc(id)}" data-vals="${vals.map((n) => n.toFixed(decimals)).join(' → ')}" data-unit="${unit}">`;
    svg += `<rect class="hit" x="0" y="${y - rowH / 2}" width="${width}" height="${rowH}"/>`;
    svg += `<text class="label" x="${left - 10}" y="${y + 4}" text-anchor="end">${esc(label)}</text>`;
    svg += `<line class="link" x1="${x(Math.min(...vals))}" x2="${x(Math.max(...vals))}" y1="${y}" y2="${y}"/>`;
    vals.forEach((val, j) => {
      svg += `<circle class="dot d${j}" cx="${x(val)}" cy="${y}" r="5"/>`;
    });
    if (hl)
      svg += `<text class="val" x="${x(Math.max(...vals)) + 10}" y="${y + 4}">${vals.map((n) => n.toFixed(decimals)).join(' → ')}</text>`;
    svg += `</g>`;
  });
  return svg + `</svg>`;
}

function shareBars() {
  const width = 860,
    left = 230,
    right = 20,
    rowH = 46,
    top = 10;
  const items = metrics.slice(0, 3).map((mt) => {
    const pre = v('pre', mt.key),
      adr = v('adr', mt.key),
      s = v('sol', mt.key);
    const total = pre - s;
    return {
      label: mt.label,
      adr: (pre - adr) / total,
      sol: (adr - s) / total,
      text: `${mt.fmt(pre)} → ${mt.fmt(adr)} → ${mt.fmt(s)}${mt.unit ? ' ' + mt.unit : ''}`,
    };
  });
  const h = top + items.length * rowH + 10,
    span = width - left - right;
  let svg = `<svg class="chart share" viewBox="0 0 ${width} ${h}" role="img" aria-label="Share of the total improvement captured by the ADR and added by the solver">`;
  items.forEach((it, i) => {
    const y = top + i * rowH,
      barH = 18;
    const wA = span * it.adr,
      wS = span * it.sol;
    svg += `<text class="label" x="${left - 12}" y="${y + 14}" text-anchor="end">${esc(it.label)}</text>`;
    svg += `<rect class="seg d1" x="${left}" y="${y}" width="${Math.max(wA - 2, 0)}" height="${barH}" rx="3"/>`;
    svg += `<rect class="seg d2" x="${left + wA}" y="${y}" width="${Math.max(wS - 2, 0)}" height="${barH}" rx="3"/>`;
    svg += `<text class="inbar" x="${left + wA / 2}" y="${y + 13}" text-anchor="middle">ADR ${f0(it.adr * 100)} %</text>`;
    svg += `<text class="inbar" x="${left + wA + wS / 2}" y="${y + 13}" text-anchor="middle">solver +${f0(it.sol * 100)} %</text>`;
    svg += `<text class="tick" x="${left}" y="${y + barH + 14}">${esc(it.text)}</text>`;
  });
  return svg + `</svg>`;
}

const tile = (mt) =>
  `<div class="tile"><div class="tile-label">${mt.label}</div><div class="tile-value">${builds.map((b) => mt.fmt(b.m[mt.key])).join('<span class="arrow"> → </span>')}<span class="tile-unit">${mt.unit}</span></div><div class="tile-delta good">−${f0((1 - v('sol', mt.key) / v('pre', mt.key)) * 100)} % overall, −${f0((1 - v('adr', mt.key) / v('pre', mt.key)) * 100)} % from the ADR alone</div></div>`;

const html = `<title>Three Atomic CDN chunkings</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* layout: one reading column; charts and tables scroll inside their own boxes when narrow */
:root { --bg:#f9f9f7; --surface:#fcfcfb; --ink:#0b0b0b; --ink-2:#52514e; --muted:#898781; --grid:#e1e0d9; --axis:#c3c2b7; --ring:rgba(11,11,11,.10);
  --s0:#86b6ef; --s1:#2a78d6; --s2:#104281; --accent:#256abf; --good:#006300; --bad:#d03b3b; --code-bg:#f0efec; --inbar:#ffffff;
  --sans:"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif; --mono:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#0d0d0d; --surface:#1a1a19; --ink:#f0efec; --ink-2:#c3c2b7; --muted:#898781; --grid:#2c2c2a; --axis:#383835; --ring:rgba(255,255,255,.10);
  --s0:#184f95; --s1:#3987e5; --s2:#9ec5f4; --accent:#6da7ec; --good:#0ca30c; --bad:#e66767; --code-bg:#242422; --inbar:#0b0b0b; color-scheme: dark; } }
:root[data-theme="dark"] { --bg:#0d0d0d; --surface:#1a1a19; --ink:#f0efec; --ink-2:#c3c2b7; --muted:#898781; --grid:#2c2c2a; --axis:#383835; --ring:rgba(255,255,255,.10);
  --s0:#184f95; --s1:#3987e5; --s2:#9ec5f4; --accent:#6da7ec; --good:#0ca30c; --bad:#e66767; --code-bg:#242422; --inbar:#0b0b0b; color-scheme: dark; }
body { background: var(--bg); color: var(--ink); font: 16px/1.55 var(--sans); margin: 0; padding-block: 32px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
main { max-width: 880px; margin: 0 auto; display: grid; gap: 40px; }
h1, h2, h3 { text-wrap: balance; line-height: 1.2; margin: 0; }
h1 { font-size: clamp(28px, 4vw, 38px); font-weight: 600; }
h2 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
p { max-width: 68ch; margin: 0 0 12px; }
.eyebrow { font: 500 12px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); margin-bottom: 14px; }
.lede { font-size: 18px; max-width: 64ch; }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 20px; }
.tile { background: var(--surface); border: 1px solid var(--ring); border-radius: 6px; padding: 14px 16px; min-width: 0; }
.tile-label { font: 500 12px/1.3 var(--mono); color: var(--ink-2); letter-spacing: .04em; text-transform: uppercase; }
.tile-value { font-size: 22px; font-weight: 600; margin-top: 8px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.tile-unit { font-size: 14px; color: var(--ink-2); margin-left: 6px; font-weight: 400; }
.arrow { color: var(--muted); font-weight: 400; }
.tile-delta { font: 500 13px var(--mono); margin-top: 4px; }
.good { color: var(--good); } .bad { color: var(--bad); }
figure { margin: 0; background: var(--surface); border: 1px solid var(--ring); border-radius: 6px; padding: 16px; }
figcaption { font-size: 14px; color: var(--ink-2); margin-top: 10px; max-width: 68ch; }
.legend { display: flex; gap: 18px; flex-wrap: wrap; font: 13px var(--mono); color: var(--ink-2); margin-bottom: 8px; }
.legend span::before { content: ""; display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
.legend .l0::before { background: var(--s0); } .legend .l1::before { background: var(--s1); } .legend .l2::before { background: var(--s2); }
.scroll { overflow-x: auto; }
.chart { width: 100%; height: auto; min-width: 680px; display: block; }
.chart.share { min-width: 600px; }
.chart .grid { stroke: var(--grid); stroke-width: 1; }
.chart .tick, .chart .label, .chart .val { font: 11px var(--mono); fill: var(--ink-2); }
.chart .hl .label { fill: var(--ink); font-weight: 500; }
.chart .link { stroke: var(--axis); stroke-width: 2; }
.chart .dot { stroke: var(--surface); stroke-width: 2; }
.chart .d0 { fill: var(--s0); } .chart .d1 { fill: var(--s1); } .chart .d2 { fill: var(--s2); }
.chart .seg { stroke: none; }
.chart .inbar { font: 500 11px var(--mono); fill: var(--inbar); }
.chart .hit { fill: transparent; } .chart .row:hover .hit { fill: var(--code-bg); } .chart .row:hover .label { fill: var(--ink); }
.tip { position: fixed; pointer-events: none; background: var(--ink); color: var(--bg); font: 12px/1.4 var(--mono); padding: 6px 9px; border-radius: 4px; display: none; z-index: 20; max-width: 340px; }
table { border-collapse: collapse; width: 100%; font-size: 14px; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid var(--grid); vertical-align: top; }
th { font: 500 12px var(--mono); letter-spacing: .04em; text-transform: uppercase; color: var(--ink-2); }
td.n, th.n { text-align: right; white-space: nowrap; } td code { font: 13px var(--mono); }
code { font: 14px var(--mono); background: var(--code-bg); padding: 1px 5px; border-radius: 3px; }
ul { padding-left: 20px; margin: 0; } li { margin-bottom: 6px; max-width: 68ch; }
.note { font-size: 14px; color: var(--ink-2); }
a { color: var(--accent); }
@media (prefers-reduced-motion: no-preference) { .chart .row .hit { transition: fill .12s; } }
</style>
<main>
<header>
  <div class="eyebrow">Prototype · Atomic CDN chunking · main, 31 October 2026</div>
  <h1>Three Atomic CDN chunkings</h1>
  <p class="lede">The same commit built three ways and measured on the same 42 page shapes: rsbuild's split-by-module alone, as the CDN shipped before the chunking work; the <code>atomic-shared</code> group of ADR 0001, as it ships today; and the CP-SAT partition from the prototype. The ADR took the typical page about half way on files; the solver takes most of the rest, and it is the step that also cuts bytes, where the ADR had added some on small pages.</p>
  <div class="tiles">${metrics.map(tile).join('')}</div>
  <div class="legend" style="margin-top:14px"><span class="l0">before the ADR</span><span class="l1">ADR 0001, minChunks 10</span><span class="l2">solver, ${sol.chunks} chunks</span></div>
</header>

<section>
  <h2>Where the gain came from</h2>
  <figure>
    <div class="legend"><span class="l1">captured by ADR 0001</span><span class="l2">added by the solver</span></div>
    <div class="scroll">${shareBars()}</div>
    <figcaption>Each bar is the whole improvement from the pre-ADR build to the solver build, split between the two steps. Values are means over the 42 pages.</figcaption>
  </figure>
</section>

<section>
  <h2>Files fetched per page</h2>
  <figure>
    <div class="legend"><span class="l0">before the ADR</span><span class="l1">ADR 0001</span><span class="l2">solver</span></div>
    <div class="scroll">${dumbbell({key: 'files', unit: 'files', decimals: 0, highlight: proxies.map((p) => p[1])})}</div>
    <figcaption>Atomic JavaScript files a first visit fetches, entry included, sorted by the pre-ADR build. The four labelled rows stand in for the ADR's four page shapes.</figcaption>
  </figure>
</section>

<section>
  <h2>Gzipped bytes per page</h2>
  <figure>
    <div class="legend"><span class="l0">before the ADR</span><span class="l1">ADR 0001</span><span class="l2">solver</span></div>
    <div class="scroll">${dumbbell({key: 'gzKb', unit: 'KB gz', decimals: 1, highlight: proxies.map((p) => p[1])})}</div>
    <figcaption>Gzip level 9 of the files each page fetches. The ADR traded bytes for requests on small pages, which is why its dot sits to the right of the pre-ADR one on the search-box row; the solver's dot is left of both on every row but ${ids.filter((id) => rows.sol[id].gzKb > Math.min(rows.pre[id].gzKb, rows.adr[id].gzKb)).length}.</figcaption>
  </figure>
</section>

<section>
  <h2>The four ADR shapes</h2>
  <div class="scroll"><table>
    <thead><tr><th>Shape</th><th>Stand-in page</th><th class="n">Files</th><th class="n">KB gz</th><th class="n">Modelled download</th></tr></thead>
    <tbody>${proxies.map(([name, id]) => `<tr><td>${name}</td><td><code>${esc(id)}</code></td><td class="n">${builds.map((b) => rows[b.key][id].files).join(' → ')}</td><td class="n">${builds.map((b) => f1(rows[b.key][id].gzKb)).join(' → ')}</td><td class="n">${builds.map((b) => ms(rows[b.key][id].cost_s)).join(' → ')}</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="note">For comparison, the ADR measured option A against C at N = 10 as 65 → 30 files on its search-box page and 162 → 76 files, 209.4 → 180.6 KB on its typical page. The stand-ins measure ${rows.pre['adr/search-box-only'].files} → ${rows.adr['adr/search-box-only'].files} and ${rows.pre['sample/search-vite'].files} → ${rows.adr['sample/search-vite'].files} files, ${f1(rows.pre['sample/search-vite'].gzKb)} → ${f1(rows.adr['sample/search-vite'].gzKb)} KB on today's main.</p>
</section>

<section>
  <h2>The whole CDN folder</h2>
  <div class="scroll"><table>
    <thead><tr><th>Build</th><th class="n">JS files</th><th class="n">Total KB gz</th><th class="n">Entry files</th><th class="n">Entry KB gz</th><th class="n">Components registering</th></tr></thead>
    <tbody>${builds.map((b) => `<tr><td>${b.name}, ${b.short}</td><td class="n">${b.m.jsFiles}</td><td class="n">${f1(b.m.totalJsGzKb)}</td><td class="n">${b.m.initialFiles.length}</td><td class="n">${f1(b.m.initialGzKb)}</td><td class="n">${reg[b.key] ? `${reg[b.key].defined} / ${reg[b.key].total}, ${reg[b.key].failed} failed requests` : 'not checked'}</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="note">143 of the JS files in every build are dayjs locales, one per language, loaded only when a page sets that language. The entry files shrink from build to build because each component's list of chunks to load gets shorter.</p>
</section>

<section>
  <h2>Notes</h2>
  <ul>
    <li><strong>"Before the ADR" is today's code with the shared group removed.</strong> It keeps the one-chunk-per-dayjs-locale rule that landed separately, exactly like the ADR's option A, but it is built from today's main, so component counts differ from the ADR's measurements of 15 October.</li>
    <li><strong>The solver numbers are in-sample.</strong> The partition was fitted on these 42 pages. Trained on 12 of them and tested on the other 30, files still drop by 77 % with bytes flat; ${firstPage ? `see <a href="${firstPage}">the first results page</a>` : 'see the first results page'} for the held-out test, the cost model and the caveats.</li>
    <li><strong>Time is modelled.</strong> Seconds come from the fit of the ADR's measurements, 5.0 ms per KB and 4.6 ms per file; files and bytes are exact.</li>
  </ul>
</section>
</main>
<div class="tip" id="tip"></div>
<script>
(() => {
  const tip = document.getElementById('tip');
  for (const row of document.querySelectorAll('.chart .row')) {
    row.addEventListener('mousemove', (e) => {
      tip.textContent = row.dataset.id + '  ·  ' + row.dataset.vals + ' ' + row.dataset.unit;
      tip.style.display = 'block';
      tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 350) + 'px';
      tip.style.top = (e.clientY + 14) + 'px';
    });
    row.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  }
})();
</script>
`;
writeFileSync(outPath, html);
console.log(`report -> ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
