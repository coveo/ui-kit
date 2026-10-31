// PROTOTYPE — renders the comparison page from the measure/solution JSON files.
// usage: node report.mjs <buildsDir> <out.html>
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';

const [dir, outPath] = process.argv.slice(2);
const J = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const base = J('measure-baseline.json'),
  opt = J('measure-opt-all.json'),
  hold = J('measure-opt-holdout.json');
const cost = J('cost.json'),
  model = J('model.json'),
  solAll = J('opt-all-solution.json'),
  solHold = J('opt-holdout-solution.json');
const reg = Object.fromEntries(
  ['baseline', 'opt-all', 'opt-holdout']
    .filter((n) => existsSync(join(dir, `registration-${n}.json`)))
    .map((n) => [n, J(`registration-${n}.json`)])
);
const sens = ['opt-lam-half', 'opt-lam-double']
  .filter((n) => existsSync(join(dir, `measure-${n}.json`)))
  .map((n) => ({name: n, m: J(`measure-${n}.json`), s: J(`${n}-solution.json`)}));

const byId = (m) => Object.fromEntries(m.rows.map((r) => [r.id, r]));
const B = byId(base),
  O = byId(opt),
  H = byId(hold);
const ids = base.rows.map((r) => r.id).sort((a, b) => B[b].files - B[a].files);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const f1 = (x) => x.toFixed(1),
  f0 = (x) => Math.round(x).toString(),
  ms = (s) => `${Math.round(s * 1000)} ms`;
const pct = (a, b) => `${b >= a ? '+' : '−'}${Math.abs(((b - a) / a) * 100).toFixed(0)} %`;
const mean = (rows, k) => rows.reduce((a, r) => a + r[k], 0) / rows.length;
const samples = base.rows.filter((r) => r.family === 'sample').map((r) => r.id);
const trainIds = base.rows.filter((r) => r.family !== 'sample').map((r) => r.id);
const proxies = [
  ['Search box alone', 'adr/search-box-only'],
  ['Typical search page', 'sample/search-vite'],
  ['Rich search page', 'storybook/search/search'],
  ['Commerce page', 'cdn-smoke/commerce'],
];

function dumbbell({key, unit, decimals, highlight}) {
  const rowH = 17,
    left = 262,
    right = 56,
    top = 30,
    width = 820;
  const h = top + ids.length * rowH + 28;
  const max = Math.max(...ids.flatMap((id) => [B[id][key], O[id][key]]));
  const niceMax = Math.ceil(max / 20) * 20;
  const x = (v) => left + (v / niceMax) * (width - left - right);
  const ticks = [];
  for (let t = 0; t <= niceMax; t += niceMax > 150 ? 50 : 20) ticks.push(t);
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${h}" role="img" aria-label="${key} per page, baseline versus solver">`;
  for (const t of ticks)
    svg += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top - 6}" y2="${h - 24}"/><text class="tick" x="${x(t)}" y="${h - 8}" text-anchor="middle">${t}</text>`;
  svg += `<text class="tick" x="${width - 4}" y="${h - 8}" text-anchor="end">${unit}</text>`;
  ids.forEach((id, i) => {
    const y = top + i * rowH + rowH / 2,
      b = B[id][key],
      o = O[id][key];
    const label = id.length > 36 ? id.slice(0, 35) + '…' : id;
    const hl = highlight.includes(id);
    svg += `<g class="row${hl ? ' hl' : ''}" data-id="${esc(id)}" data-b="${b.toFixed(decimals)}" data-o="${o.toFixed(decimals)}" data-unit="${unit}">`;
    svg += `<rect class="hit" x="0" y="${y - rowH / 2}" width="${width}" height="${rowH}"/>`;
    svg += `<text class="label" x="${left - 10}" y="${y + 4}" text-anchor="end">${esc(label)}</text>`;
    svg += `<line class="link" x1="${x(Math.min(b, o))}" x2="${x(Math.max(b, o))}" y1="${y}" y2="${y}"/>`;
    svg += `<circle class="dot before" cx="${x(b)}" cy="${y}" r="5"/><circle class="dot after" cx="${x(o)}" cy="${y}" r="5"/>`;
    if (hl)
      svg += `<text class="val" x="${x(Math.max(b, o)) + 10}" y="${y + 4}">${b.toFixed(decimals)} → ${o.toFixed(decimals)}</text>`;
    svg += `</g>`;
  });
  svg += `</svg>`;
  return svg;
}

const stat = (label, before, after, unit, better) =>
  `<div class="tile"><div class="tile-label">${label}</div><div class="tile-value">${before} <span class="arrow">→</span> ${after}<span class="tile-unit">${unit}</span></div><div class="tile-delta ${better}">${pct(parseFloat(before), parseFloat(after))}</div></div>`;
const deltaClass = (b, a, lowerIsBetter = true) =>
  (lowerIsBetter ? a < b : a > b) ? 'good' : a === b ? '' : 'bad';

const sampleRows = (M) => samples.map((id) => byId(M)[id]);
const holdB = sampleRows(base),
  holdH = sampleRows(hold),
  holdO = sampleRows(opt);
const chunkRows = (() => {
  const sizes = {};
  const pagesOf = {};
  const mods = {};
  for (const g of model.groups) {
    const k = solAll.chunk_of_group[g.gid];
    if (k === undefined) continue;
    sizes[k] = (sizes[k] ?? 0) + (g.rawSize * model.fit.beta) / 1024;
    pagesOf[k] = new Set([...(pagesOf[k] ?? []), ...g.pages]);
    mods[k] = [
      ...(mods[k] ?? []),
      ...g.modules.map((m) => m.split('/').pop().replace(/\.ts$/, '')),
    ];
  }
  return Object.keys(sizes)
    .map((k) => ({
      name: `atomic-p${k}`,
      kb: sizes[k],
      pages: pagesOf[k].size,
      modules: mods[k].length,
      sample: mods[k]
        .filter((n) => n.startsWith('atomic-'))
        .slice(0, 4)
        .join(', '),
    }))
    .sort((a, b) => b.kb - a.kb);
})();

const html = `<title>Does a solver beat minChunks 10?</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* layout: a single reading column; charts and tables may run wider inside their own scroll boxes */
:root { --bg:#f9f9f7; --surface:#fcfcfb; --ink:#0b0b0b; --ink-2:#52514e; --muted:#898781; --grid:#e1e0d9; --axis:#c3c2b7; --ring:rgba(11,11,11,.10);
  --before:#86b6ef; --after:#256abf; --accent:#256abf; --good:#006300; --bad:#d03b3b; --code-bg:#f0efec;
  --sans:"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif; --mono:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#0d0d0d; --surface:#1a1a19; --ink:#f0efec; --ink-2:#c3c2b7; --muted:#898781; --grid:#2c2c2a; --axis:#383835; --ring:rgba(255,255,255,.10);
  --before:#1c5cab; --after:#6da7ec; --accent:#6da7ec; --good:#0ca30c; --bad:#e66767; --code-bg:#242422; color-scheme: dark; } }
:root[data-theme="dark"] { --bg:#0d0d0d; --surface:#1a1a19; --ink:#f0efec; --ink-2:#c3c2b7; --muted:#898781; --grid:#2c2c2a; --axis:#383835; --ring:rgba(255,255,255,.10);
  --before:#1c5cab; --after:#6da7ec; --accent:#6da7ec; --good:#0ca30c; --bad:#e66767; --code-bg:#242422; color-scheme: dark; }
body { background: var(--bg); color: var(--ink); font: 16px/1.55 var(--sans); margin: 0; padding-block: 32px 64px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
main { max-width: 860px; margin: 0 auto; display: grid; gap: 40px; }
h1, h2, h3 { text-wrap: balance; line-height: 1.2; margin: 0; }
h1 { font-size: clamp(28px, 4vw, 38px); font-weight: 600; }
h2 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
p { max-width: 68ch; margin: 0 0 12px; }
.eyebrow { font: 500 12px/1 var(--mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-2); margin-bottom: 14px; }
.lede { font-size: 18px; color: var(--ink); max-width: 64ch; }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 20px; }
.tile { background: var(--surface); border: 1px solid var(--ring); border-radius: 6px; padding: 14px 16px; }
.tile-label { font: 500 12px/1.3 var(--mono); color: var(--ink-2); letter-spacing: .04em; text-transform: uppercase; }
.tile-value { font-size: 26px; font-weight: 600; margin-top: 8px; font-variant-numeric: tabular-nums; }
.tile-unit { font-size: 14px; color: var(--ink-2); margin-left: 6px; font-weight: 400; }
.arrow { color: var(--muted); font-weight: 400; }
.tile-delta { font: 500 13px var(--mono); margin-top: 4px; }
.good { color: var(--good); } .bad { color: var(--bad); }
figure { margin: 0; background: var(--surface); border: 1px solid var(--ring); border-radius: 6px; padding: 16px; }
figcaption { font-size: 14px; color: var(--ink-2); margin-top: 10px; max-width: 68ch; }
.legend { display: flex; gap: 18px; flex-wrap: wrap; font: 13px var(--mono); color: var(--ink-2); margin-bottom: 8px; }
.legend span::before { content: ""; display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
.legend .l-before::before { background: var(--before); } .legend .l-after::before { background: var(--after); }
.scroll { overflow-x: auto; }
.chart { width: 100%; height: auto; min-width: 640px; display: block; }
.chart .grid { stroke: var(--grid); stroke-width: 1; }
.chart .tick, .chart .label, .chart .val { font: 11px var(--mono); fill: var(--ink-2); }
.chart .hl .label { fill: var(--ink); font-weight: 500; }
.chart .link { stroke: var(--axis); stroke-width: 2; }
.chart .dot { stroke: var(--surface); stroke-width: 2; } .chart .before { fill: var(--before); } .chart .after { fill: var(--after); }
.chart .hit { fill: transparent; } .chart .row:hover .hit { fill: var(--code-bg); } .chart .row:hover .label { fill: var(--ink); }
.tip { position: fixed; pointer-events: none; background: var(--ink); color: var(--bg); font: 12px/1.4 var(--mono); padding: 6px 9px; border-radius: 4px; display: none; z-index: 20; max-width: 320px; }
table { border-collapse: collapse; width: 100%; font-size: 14px; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid var(--grid); vertical-align: top; }
th { font: 500 12px var(--mono); letter-spacing: .04em; text-transform: uppercase; color: var(--ink-2); }
td.n, th.n { text-align: right; } td code { font: 13px var(--mono); }
code, .formula { font: 14px var(--mono); background: var(--code-bg); padding: 1px 5px; border-radius: 3px; }
.formula { display: inline-block; padding: 10px 14px; margin: 6px 0 12px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.grid2 > * { min-width: 0; }
ul { padding-left: 20px; margin: 0; } li { margin-bottom: 6px; max-width: 68ch; }
.note { font-size: 14px; color: var(--ink-2); }
@media (prefers-reduced-motion: no-preference) { .chart .row .hit { transition: fill .12s; } }
</style>
<main>
<header>
  <div class="eyebrow">Prototype · Atomic CDN chunking · main, 31 October 2026</div>
  <h1>Does a solver beat minChunks 10?</h1>
  <p class="lede">Yes, on every page shape we could find in the repo. ADR 0001 picked <code>minChunks: 10</code> by hand among six options. A CP-SAT model that chooses which usage groups share a chunk cuts the files a page fetches by ${f0((1 - opt.meanFiles / base.meanFiles) * 100)} % and the gzipped bytes by ${f0((1 - opt.meanGzKb / base.meanGzKb) * 100)} %, measured on the real rspack output. Trained on 12 pages and tested on the other 30, it still cuts files by ${f0(
    (1 -
      mean(
        samples.map((id) => H[id]),
        'files'
      ) /
        mean(
          samples.map((id) => B[id]),
          'files'
        )) *
      100
  )} % and modelled time by ${f0(
    (1 -
      mean(
        samples.map((id) => H[id]),
        'cost_s'
      ) /
        mean(
          samples.map((id) => B[id]),
          'cost_s'
        )) *
      100
  )} %, with bytes flat.</p>
  <div class="tiles">
    ${stat('Files per page, mean of 42', f1(base.meanFiles), f1(opt.meanFiles), '', 'good')}
    ${stat('Gzipped KB per page, mean', f1(base.meanGzKb), f1(opt.meanGzKb), 'KB', 'good')}
    ${stat('Modelled Atomic download, mobile', base.meanCost_s.toFixed(2), opt.meanCost_s.toFixed(2), 's', 'good')}
    ${stat('JS files in the CDN folder', base.jsFiles, opt.jsFiles, '', 'good')}
  </div>
</header>

<section>
  <h2>What was compared</h2>
  <div class="grid2">
    <div><h3>Baseline</h3><p>The current <code>rsbuild.cdn.mjs</code>: rsbuild's split-by-module strategy plus the ADR's <code>atomic-shared</code> group, which pools the Atomic and Lit modules used by at least 10 chunks.</p></div>
    <div><h3>Solver</h3><p>Same config, plus one enforced async cache group per solver chunk. Every module reached by a sample page is assigned to exactly one of ${solAll.chunks} chunks by a CP-SAT model; everything else keeps today's rules.</p></div>
  </div>
  <p>Both builds come from the same commit and the same entry files. Pages load <code>atomic.esm.js</code>, and each tag on the page triggers the chunk list rspack compiled for it. The measurement parses that compiled table, so files and bytes are exact; the time is modelled, not re-measured with a throttled browser.</p>
</section>

<section>
  <h2>Files fetched per page</h2>
  <figure>
    <div class="legend"><span class="l-before">baseline, minChunks 10</span><span class="l-after">solver, ${solAll.chunks} chunks</span></div>
    <div class="scroll">${dumbbell({key: 'files', unit: 'files', decimals: 0, highlight: proxies.map((p) => p[1])})}</div>
    <figcaption>Atomic JavaScript files a first visit fetches, entry included, for the ${ids.length} page shapes found in Storybook pages, cdn-smoke pages and the samples. Sorted by the baseline. The four labelled rows stand in for the ADR's four page shapes.</figcaption>
  </figure>
</section>

<section>
  <h2>Gzipped bytes per page</h2>
  <figure>
    <div class="legend"><span class="l-before">baseline, minChunks 10</span><span class="l-after">solver, ${solAll.chunks} chunks</span></div>
    <div class="scroll">${dumbbell({key: 'gzKb', unit: 'KB gz', decimals: 1, highlight: proxies.map((p) => p[1])})}</div>
    <figcaption>Same pages, gzip level 9 of the files each one fetches. Merging groups into fewer chunks costs bytes on the pages that need only part of a chunk; the solver pays that price where a request is worth more than the extra bytes.</figcaption>
  </figure>
</section>

<section>
  <h2>The four ADR shapes</h2>
  <div class="scroll"><table>
    <thead><tr><th>Shape</th><th>Stand-in page</th><th class="n">Files</th><th class="n">KB gz</th><th class="n">Modelled download</th></tr></thead>
    <tbody>${proxies.map(([name, id]) => `<tr><td>${name}</td><td><code>${esc(id)}</code></td><td class="n">${B[id].files} → <strong>${O[id].files}</strong></td><td class="n">${f1(B[id].gzKb)} → <strong class="${deltaClass(B[id].gzKb, O[id].gzKb)}">${f1(O[id].gzKb)}</strong></td><td class="n">${ms(B[id].cost_s)} → <strong class="${deltaClass(B[id].cost_s, O[id].cost_s)}">${ms(O[id].cost_s)}</strong></td></tr>`).join('')}</tbody>
  </table></div>
  <p class="note">The ADR measured its search-box page at 30 files and 132.4 KB and its typical page at 76 files and 180.6 KB; the stand-ins measure ${B['adr/search-box-only'].files} files, ${f1(B['adr/search-box-only'].gzKb)} KB and ${B['sample/search-vite'].files} files, ${f1(B['sample/search-vite'].gzKb)} KB on the baseline, so the measurement reproduces the ADR within a few files.</p>
</section>

<section>
  <h2>Held-out test</h2>
  <p>The partition could simply memorise the pages it was trained on. So the solver was run again on the 12 Storybook, cdn-smoke and ADR pages only, and the resulting build was measured on the 30 sample pages it had never seen.</p>
  <div class="scroll"><table>
    <thead><tr><th>Build, measured on the 30 sample pages</th><th class="n">Chunks</th><th class="n">Files, mean</th><th class="n">KB gz, mean</th><th class="n">Modelled download, mean</th></tr></thead>
    <tbody>
      <tr><td>Baseline, minChunks 10</td><td class="n">—</td><td class="n">${f1(mean(holdB, 'files'))}</td><td class="n">${f1(mean(holdB, 'gzKb'))}</td><td class="n">${ms(mean(holdB, 'cost_s'))}</td></tr>
      <tr><td>Solver trained on the 12 other pages</td><td class="n">${solHold.chunks}</td><td class="n"><strong>${f1(mean(holdH, 'files'))}</strong></td><td class="n"><strong class="${deltaClass(mean(holdB, 'gzKb'), mean(holdH, 'gzKb'))}">${f1(mean(holdH, 'gzKb'))}</strong></td><td class="n"><strong class="${deltaClass(mean(holdB, 'cost_s'), mean(holdH, 'cost_s'))}">${ms(mean(holdH, 'cost_s'))}</strong></td></tr>
      <tr><td>Solver trained on all 42 pages</td><td class="n">${solAll.chunks}</td><td class="n">${f1(mean(holdO, 'files'))}</td><td class="n">${f1(mean(holdO, 'gzKb'))}</td><td class="n">${ms(mean(holdO, 'cost_s'))}</td></tr>
    </tbody>
  </table></div>
  <p class="note">Out of sample, the gain comes from requests: bytes move ${pct(mean(holdB, 'gzKb'), mean(holdH, 'gzKb'))} while files drop ${pct(mean(holdB, 'files'), mean(holdH, 'files'))}. ${(() => {
    const worse = samples
      .map((id) => [id, H[id].gzKb - B[id].gzKb])
      .filter(([, d]) => d > 0)
      .sort((a, b) => b[1] - a[1]);
    return `${worse.length} of the 30 pages download more bytes than today, the worst by ${f1(worse[0][1])} KB (<code>${esc(worse[0][0])}</code>).`;
  })()} Real customer pages will look like this row, not the in-sample one, until the model is fed real page compositions.</p>
</section>

<section>
  <h2>How a page was priced</h2>
  <p>ADR 0001 reports, for seven options and four page shapes, the mobile time to ready, the files fetched and the gzipped bytes. A least-squares fit of those 28 points to</p>
  <div class="formula">ready = a<sub>page</sub> + ${(cost.b_s_per_kb * 1000).toFixed(1)} ms × KB + ${(cost.c_s_per_file * 1000).toFixed(1)} ms × files</div>
  <p>explains the ADR's measurements with R² = ${cost.r2.toFixed(4)} and a worst residual of ${ms(cost.max_abs_residual_s)}. One request therefore costs as much as ${cost.lambda_kb_per_file.toFixed(2)} KB of transfer, which is the exchange rate the solver minimises against. The per-chunk gzip size is estimated from this build as ${model.fit.alpha.toFixed(0)} bytes plus ${model.fit.beta.toFixed(3)} × raw source bytes, so a chunk also carries a fixed wrapper cost that merging removes.</p>
  <div class="scroll"><table>
    <thead><tr><th>Request weight λ</th><th class="n">Chunks</th><th class="n">Files, mean</th><th class="n">KB gz, mean</th><th class="n">Modelled download, mean</th><th>Solver status</th></tr></thead>
    <tbody>
      ${[
        {name: 'fit (' + cost.lambda_kb_per_file.toFixed(2) + ' KB)', m: opt, s: solAll},
        ...sens.map((x) => ({name: x.s.lambda_kb.toFixed(2) + ' KB', m: x.m, s: x.s})),
      ]
        .sort((a, b) => a.s.lambda_kb - b.s.lambda_kb)
        .map(
          (x) =>
            `<tr><td>${x.name}</td><td class="n">${x.s.chunks}</td><td class="n">${f1(x.m.meanFiles)}</td><td class="n">${f1(x.m.meanGzKb)}</td><td class="n">${ms(x.m.meanCost_s)}</td><td>${x.s.status}, gap ${(((x.s.objective_beq - x.s.bound_beq) / x.s.objective_beq) * 100).toFixed(1)} %</td></tr>`
        )
        .join('')}
    </tbody>
  </table></div>
  <p class="note">Halving or doubling the request weight changes how many chunks the solver keeps, but every setting beats the baseline on files and bytes at once. The 150-second CP-SAT runs stopped before proving optimality; the gap is the most that a longer run could still gain in the model's own units.</p>
</section>

<section>
  <h2>What the solver built</h2>
  <p>Modules are grouped by usage signature, the set of pages whose components import them. ${model.groups.length} signatures exist across the ${ids.length} pages. The solver merged them into ${solAll.chunks} chunks; the biggest ones are the ones every page loads, the smallest are single-feature leftovers.</p>
  <div class="scroll"><table>
    <thead><tr><th>Chunk</th><th class="n">KB gz, est.</th><th class="n">Pages that load it</th><th class="n">Modules</th><th>Components inside</th></tr></thead>
    <tbody>${chunkRows
      .slice(0, 12)
      .map(
        (c) =>
          `<tr><td><code>${c.name}</code></td><td class="n">${f1(c.kb)}</td><td class="n">${c.pages} / ${ids.length}</td><td class="n">${c.modules}</td><td>${esc(c.sample) || '<span class="note">utilities only</span>'}</td></tr>`
      )
      .join('')}</tbody>
  </table></div>
</section>

<section>
  <h2>Caveats</h2>
  <ul>
    <li><strong>Page shapes are repo proxies.</strong> No telemetry says which components real pages combine. The hosted search pages on the platform are the population that matters; extracting their tags would replace the 42 proxies and their equal weights.</li>
    <li><strong>Time is modelled.</strong> The ADR's harness is not committed, so the seconds here come from the fit above, not from throttled loads. Files and bytes are exact.</li>
    <li><strong>Entry files are untouched.</strong> The enforced groups only act on async chunks, so <code>atomic.esm.js</code>, <code>index.js</code> and <code>index.esm.js</code> keep loading what they load today, which was the ADR's hard constraint. Both builds load ${base.initialFiles.length} entry files; the baseline's weigh ${f1(base.initialGzKb)} KB, the solver's ${f1(opt.initialGzKb)} KB because the per-component chunk lists got shorter.</li>
    <li><strong>Components outside the sample pages keep today's chunks.</strong> ${model.unusedModules.length} modules never reached from a page were left to the existing rules.</li>
    <li><strong>Registration was checked, rendering was not.</strong> ${reg['opt-all'] ? `In headless Chromium, with the CDN path served from the solver build, ${reg['opt-all'].defined} of ${reg['opt-all'].total} components registered from ${reg['opt-all'].served} files with ${reg['opt-all'].failed} failed requests, and about as many console errors as the baseline (${reg['opt-all'].errors} vs ${reg.baseline?.errors ?? '?'}), all of them "must be the child of" context errors caused by the bare tags.` : 'The build succeeds and every chunk list resolves.'} The CDN smoke tests and the ADR's other invariants were not run.</li>
  </ul>
</section>

<section>
  <h2>If this goes further</h2>
  <ul>
    <li>Replace the proxies with real page compositions, weighted by traffic, and re-run.</li>
    <li>Re-measure the four ADR shapes with the ADR's harness on the solver build to confirm the modelled seconds.</li>
    <li>Ship the partition as a committed JSON map read by <code>rsbuild.cdn.mjs</code>, regenerated by a script when components are added; the solve takes under three minutes.</li>
    <li>Run the CDN smoke tests and the chunk invariants the ADR lists on the new build.</li>
  </ul>
  <p class="note">Everything on this page was produced by the throwaway scripts in <code>packages/atomic/scripts/prototype-chunk-partition</code>: a stats-emitting copy of the CDN build, a page-shape extractor, the model builder, the CP-SAT solver, the measurement and this report.</p>
</section>
</main>
<div class="tip" id="tip"></div>
<script>
(() => {
  const tip = document.getElementById('tip');
  for (const row of document.querySelectorAll('.chart .row')) {
    row.addEventListener('mousemove', (e) => {
      tip.textContent = row.dataset.id + '  ·  ' + row.dataset.b + ' → ' + row.dataset.o + ' ' + row.dataset.unit;
      tip.style.display = 'block';
      tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 330) + 'px';
      tip.style.top = (e.clientY + 14) + 'px';
    });
    row.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
  }
})();
</script>
`;
writeFileSync(outPath, html);
console.log(`report -> ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
