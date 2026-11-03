// PROTOTYPE — figures for the harness measurement of the chunk-partition prototype.
// usage: node report-measured.mjs <measure dir> <strategies dir> <out.html>
// Figures: measured time to ready for three builds, measured vs modelled gain per harness run, request waterfalls.
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [M, S, out] = process.argv.slice(2);
const jsonl = (f) =>
  readFileSync(f, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
const PAGES = [
  ['searchbox', 'Search box', 'adr/search-box'],
  ['search', 'Typical search', 'adr/typical-search'],
  ['rich', 'Rich search', 'adr/rich-search'],
  ['commerce', 'Commerce', 'adr/commerce'],
];
const stats = (rows, variant, page, profile = 'mobile') => {
  const xs = rows
    .filter(
      (r) => r.variant === variant && r.page === page && r.profile === profile && !r.errors.length
    )
    .map((r) => r.ready);
  return {med: median(xs), min: Math.min(...xs), max: Math.max(...xs), n: xs.length};
};
const model = (file) =>
  Object.fromEntries(JSON.parse(readFileSync(file, 'utf8')).rows.map((r) => [r.id, r]));
const ms = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v))} ms`;

// ---------- Figure: measured time to ready, three builds, one harness run
const run5 = jsonl(join(M, 'results-v4.jsonl'));
const builds = [
  {
    v: 'pre-adr-v3',
    name: 'Before the ADR',
    cls: 'pre',
    model: model(join(M, 'measure-adr-pre-adr-v3.json')),
  },
  {
    v: 'baseline-v3',
    name: 'ADR 0001, minChunks 10',
    cls: 'adr',
    model: model(join(M, 'measure-adr-baseline-v3.json')),
  },
  {
    v: 'solver-v3',
    name: 'Solver partition',
    cls: 'sol',
    model: model(join(M, 'measure-adr-solver-v3.json')),
  },
];
function readyChart(profile, lo, hi, step) {
  const left = 128,
    right = 236,
    width = 860,
    sub = 15,
    gap = 22,
    top = 8;
  const rowH = builds.length * sub + gap;
  const h = top + PAGES.length * rowH + 22;
  const x = (s) => left + ((s - lo) / (hi - lo)) * (width - left - right);
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${h}" role="img" aria-label="measured ${profile} time to ready, four pages, three builds">`;
  for (let t = lo; t <= hi + 1e-9; t += step) {
    svg += `<line class="grid" x1="${x(t)}" x2="${x(t)}" y1="${top}" y2="${h - 22}"/>`;
    svg += `<text class="tick" x="${x(t)}" y="${h - 6}" text-anchor="middle">${String(+t.toFixed(2))}</text>`;
  }
  svg += `<text class="tick" x="${x(hi) + 14}" y="${h - 6}" text-anchor="start">s</text>`;
  PAGES.forEach(([page, label, id], i) => {
    const y0 = top + i * rowH + gap / 2;
    const base = stats(run5, 'baseline-v3', page, profile);
    const baseCost = builds[1].model[id].cost_s;
    svg += `<text class="label strong" x="${left - 12}" y="${y0 + sub * 1.5 + 4}" text-anchor="end">${esc(label)}</text>`;
    const meds = [];
    builds.forEach((b, j) => {
      const s = stats(run5, b.v, page, profile);
      const y = y0 + j * sub + sub / 2;
      meds.push(s.med);
      svg += `<line class="range ${b.cls}" x1="${x(s.min / 1000)}" x2="${x(s.max / 1000)}" y1="${y}" y2="${y}"/>`;
      if (profile === 'mobile' && b.v !== 'baseline-v3') {
        const predicted = base.med + (b.model[id].cost_s - baseCost) * 1000;
        svg += `<circle class="check" cx="${x(predicted / 1000)}" cy="${y}" r="7"/>`;
      }
      svg += `<circle class="dot ${b.cls}" cx="${x(s.med / 1000)}" cy="${y}" r="5"/>`;
    });
    const gain = meds[2] - meds[1];
    const pred = (builds[2].model[id].cost_s - baseCost) * 1000;
    svg += `<text class="val" x="${width - right + 18}" y="${y0 + sub - 1}">${meds.map((m) => (m / 1000).toFixed(2)).join(' → ')} s</text>`;
    svg += `<text class="val strong" x="${width - right + 18}" y="${y0 + 2 * sub + 3}">solver ${ms(gain)}${profile === 'mobile' ? `, model ${ms(pred)}` : ''}</text>`;
  });
  return svg + `</svg>`;
}

// ---------- Figure: measured vs modelled gain of the solver over minChunks 10, per harness run
const runs = [
  {
    label: 'Run 1',
    note: 'externals grouped',
    rows: jsonl(join(M, 'results.jsonl')),
    base: 'baseline',
    sol: 'solver',
    mb: model(join(S, 'measure-adr-baseline.json')),
    msol: model(join(S, 'measure-adr-opt-all.json')),
  },
  {
    label: 'Run 2',
    note: 'externals apart, old map',
    rows: jsonl(join(M, 'results-v2.jsonl')),
    base: 'baseline-v2',
    sol: 'solver-v2',
    mb: model(join(M, 'measure-adr-baseline-v2.json')),
    msol: model(join(M, 'measure-adr-solver-v2.json')),
  },
  {
    label: 'Run 4',
    note: 'fresh map',
    rows: jsonl(join(M, 'results-v3b.jsonl')),
    base: 'baseline-v3',
    sol: 'solver-v3',
    mb: model(join(M, 'measure-adr-baseline-v3.json')),
    msol: model(join(M, 'measure-adr-solver-v3.json')),
  },
  {
    label: 'Run 5',
    note: 'fresh map, 3 builds',
    rows: run5,
    base: 'baseline-v3',
    sol: 'solver-v3',
    mb: model(join(M, 'measure-adr-baseline-v3.json')),
    msol: model(join(M, 'measure-adr-solver-v3.json')),
  },
];
function historyChart() {
  const left = 250,
    right = 190,
    width = 860,
    sub = 17,
    head = 20,
    gap = 14,
    top = 4,
    lo = -800,
    hi = 400;
  const rowH = head + runs.length * sub + gap;
  const h = top + PAGES.length * rowH + 22;
  const x = (v) => left + ((v - lo) / (hi - lo)) * (width - left - right);
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${h}" role="img" aria-label="measured and modelled gain of the solver over minChunks 10, per harness run">`;
  for (let t = lo; t <= hi; t += 200) {
    svg += `<line class="${t === 0 ? 'zero' : 'grid'}" x1="${x(t)}" x2="${x(t)}" y1="${top}" y2="${h - 22}"/>`;
    svg += `<text class="tick" x="${x(t)}" y="${h - 6}" text-anchor="middle">${t > 0 ? '+' : t < 0 ? '−' : ''}${Math.abs(t)}</text>`;
  }
  svg += `<text class="tick" x="${x(hi) + 16}" y="${h - 6}" text-anchor="start">ms</text>`;
  PAGES.forEach(([page, label, id], i) => {
    const y0 = top + i * rowH;
    svg += `<text class="label strong" x="8" y="${y0 + 14}">${esc(label)}</text>`;
    runs.forEach((r, j) => {
      const y = y0 + head + j * sub + sub / 2;
      const meas = stats(r.rows, r.sol, page).med - stats(r.rows, r.base, page).med;
      const pred = (r.msol[id].cost_s - r.mb[id].cost_s) * 1000;
      svg += `<text class="label" x="${left - 12}" y="${y + 4}" text-anchor="end">${esc(r.label)} · ${esc(r.note)}</text>`;
      svg += `<line class="link" x1="${x(Math.min(meas, pred))}" x2="${x(Math.max(meas, pred))}" y1="${y}" y2="${y}"/>`;
      svg += `<circle class="check" cx="${x(pred)}" cy="${y}" r="6"/>`;
      svg += `<circle class="dot ${meas > 0 ? 'worse' : 'sol'}" cx="${x(meas)}" cy="${y}" r="5"/>`;
      svg += `<text class="val" x="${width - right + 16}" y="${y + 4}">${ms(meas)} <tspan class="muted">model ${ms(pred)}</tspan></text>`;
    });
  });
  return svg + `</svg>`;
}

// ---------- Figure: request waterfalls of the typical search page
const waterfalls = existsSync(join(M, 'waterfalls.jsonl'))
  ? jsonl(join(M, 'waterfalls.jsonl'))
  : [];
const kind = (p) =>
  p.startsWith('/headless/') || p.startsWith('/bueno/')
    ? 'ext'
    : p.startsWith('/mock/')
      ? 'api'
      : 'atomic';
const extName = (p) => {
  if (p.startsWith('/bueno/')) return 'Bueno';
  const m = /\/headless\/[^/]+\/(?:(\w+)\/)?headless\.esm\.js/.exec(p);
  return m ? `Headless ${m[1] ?? 'search'}` : p;
};
function waterfallChart(w, title, maxS) {
  const left = 8,
    right = 16,
    width = 860,
    bar = 3,
    pad = 1,
    bigBar = 13,
    bigPad = 3,
    top = 30;
  const reqs = w.requests.filter(
    (r) => !r.path.endsWith('.html') && !r.path.endsWith('init-search.js')
  );
  const big = (r) => kind(r.path) === 'ext' && r.gz > 20000;
  const ys = [];
  let cursor = top;
  for (const r of reqs) {
    ys.push(cursor);
    cursor += big(r) ? bigBar + bigPad : bar + pad;
  }
  const h = cursor + 30;
  const x = (t) => left + (t / (maxS * 1000)) * (width - left - right);
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${h}" role="img" aria-label="${esc(title)}">`;
  svg += `<text class="label strong" x="${left}" y="14">${esc(title)}</text>`;
  for (let t = 0; t <= maxS; t += 0.5) {
    svg += `<line class="grid" x1="${x(t * 1000)}" x2="${x(t * 1000)}" y1="${top - 4}" y2="${h - 22}"/>`;
    svg += `<text class="tick" x="${x(t * 1000)}" y="${h - 6}" text-anchor="middle">${t}${t === maxS ? ' s' : ''}</text>`;
  }
  reqs.forEach((r, i) => {
    const y = ys[i];
    const k = kind(r.path);
    const isBig = big(r);
    const x0 = x(r.start),
      w0 = Math.max(1.5, x(r.end) - x(r.start));
    svg += `<rect class="req ${k}" x="${x0}" y="${y}" width="${w0}" height="${isBig ? bigBar : bar}" rx="${isBig ? 2 : 1}"/>`;
    if (isBig) {
      const text = `${extName(r.path)} · ${Math.round(r.gz / 1024)} KB`;
      const inside = w0 > text.length * 6.1 + 12;
      svg += inside
        ? `<text class="inbar" x="${x0 + 6}" y="${y + bigBar - 3}">${esc(text)}</text>`
        : `<text class="val halo" x="${x0 + w0 + 6}" y="${y + bigBar - 3}">${esc(text)}</text>`;
    }
  });
  for (const [t, name] of [
    [w.definedAt, 'defined'],
    [w.contentAt, 'ready'],
  ]) {
    svg += `<line class="event" x1="${x(t)}" x2="${x(t)}" y1="${top - 6}" y2="${h - 22}"/>`;
    svg += `<text class="val halo" x="${name === 'ready' ? x(t) + 4 : x(t) - 4}" y="${top - 10}" text-anchor="${name === 'ready' ? 'start' : 'end'}">${name} ${(t / 1000).toFixed(2)} s</text>`;
  }
  return svg + `</svg>`;
}
const wf = (variant) => waterfalls.find((w) => w.variant === variant && w.page === 'search');
const wfVariants = [
  ['adr-n10-oct31', 'minChunks 10, build of 31 October'],
  ['solver-grouped-oct31', 'Solver, externals grouped, build of 31 October'],
  ['adr-n10-nov3', 'minChunks 10, build of 3 November'],
  ['solver-nov3', 'Solver, externals apart, build of 3 November'],
].filter(([v]) => wf(v));
const wfMax =
  Math.ceil((Math.max(0, ...wfVariants.map(([v]) => wf(v).contentAt)) + 400) / 500) * 0.5;

const legendBuilds = `<div class="legend">${builds.map((b) => `<span class="l-${b.cls}">${esc(b.name)}</span>`).join('')}<span class="l-check">predicted by the cost model</span><span class="l-range">fastest to slowest of 7 loads</span></div>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Harness figures</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root { --bg:#f9f9f7; --surface:#fcfcfb; --ink:#0b0b0b; --ink-2:#52514e; --muted:#898781; --grid:#e1e0d9; --axis:#c3c2b7; --ring:rgba(11,11,11,.10);
  --pre:#86b6ef; --adr:#2a78d6; --sol:#104281; --worse:#d03b3b; --atomic:#2a78d6; --ext:#eb6834; --api:#1baf7a;
  --sans:"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif; --mono:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace; color-scheme: light; }
body { background: var(--bg); color: var(--ink); font: 16px/1.55 var(--sans); margin: 0; padding: 24px 16px; }
main { max-width: 880px; margin: 0 auto; } section { display: grid; gap: 24px; }
figure { margin: 0; background: var(--surface); border: 1px solid var(--ring); border-radius: 6px; padding: 16px; }
.legend { display: flex; gap: 18px; flex-wrap: wrap; font: 13px var(--mono); color: var(--ink-2); margin-bottom: 10px; }
.legend span::before { content: ""; display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
.legend .l-pre::before { background: var(--pre); } .legend .l-adr::before { background: var(--adr); } .legend .l-sol::before { background: var(--sol); }
.legend .l-worse::before { background: var(--worse); }
.legend .l-check::before { background: transparent; border: 1.5px dashed var(--ink-2); box-sizing: border-box; }
.legend .l-range::before { width: 18px; height: 2px; border-radius: 0; background: var(--ink-2); vertical-align: 3px; }
.legend .l-atomic::before, .legend .l-ext::before, .legend .l-api::before { width: 14px; height: 6px; border-radius: 1px; vertical-align: 1px; }
.legend .l-atomic::before { background: var(--atomic); } .legend .l-ext::before { background: var(--ext); } .legend .l-api::before { background: var(--api); }
.legend .l-event::before { width: 2px; height: 12px; border-radius: 0; background: var(--ink); vertical-align: -2px; }
.chart { width: 100%; height: auto; display: block; }
.chart .grid { stroke: var(--grid); stroke-width: 1; } .chart .zero { stroke: var(--axis); stroke-width: 1.5; }
.chart .tick, .chart .label, .chart .val { font: 11px var(--mono); fill: var(--ink-2); }
.chart .label.strong, .chart .val.strong { fill: var(--ink); font-weight: 500; font-size: 12px; }
.chart .muted { fill: var(--muted); }
.chart .link { stroke: var(--axis); stroke-width: 2; }
.chart .range { stroke-width: 2; stroke-linecap: round; } .chart .range.pre { stroke: var(--pre); } .chart .range.adr { stroke: var(--adr); } .chart .range.sol { stroke: var(--sol); }
.chart .dot { stroke: var(--surface); stroke-width: 2; } .chart .pre { fill: var(--pre); } .chart .adr { fill: var(--adr); } .chart .sol { fill: var(--sol); } .chart .worse { fill: var(--worse); }
.chart .check { fill: none; stroke: var(--ink-2); stroke-width: 1.5; stroke-dasharray: 3 2; }
.chart .req.atomic { fill: var(--atomic); } .chart .req.ext { fill: var(--ext); } .chart .req.api { fill: var(--api); }
.chart .event { stroke: var(--ink); stroke-width: 1.5; }
.chart .inbar { font: 500 10px var(--mono); fill: #ffffff; }
.chart .halo { paint-order: stroke; stroke: var(--surface); stroke-width: 4px; stroke-linejoin: round; }
.panel + .panel { margin-top: 18px; }
</style></head><body><main><section>
<figure id="ready-mobile">${legendBuilds}${readyChart('mobile', 2.0, 6.5, 0.5)}</figure>
<figure id="ready-desktop"><div class="legend">${builds.map((b) => `<span class="l-${b.cls}">${esc(b.name)}</span>`).join('')}<span class="l-range">fastest to slowest of 3 loads</span></div>${readyChart('desktop', 1.0, 2.5, 0.25)}</figure>
<figure id="gain-history"><div class="legend"><span class="l-sol">measured, solver faster</span><span class="l-worse">measured, solver slower</span><span class="l-check">predicted by the cost model</span></div>${historyChart()}</figure>
${wfVariants.length ? `<figure id="waterfalls"><div class="legend"><span class="l-atomic">Atomic file</span><span class="l-ext">Headless or Bueno bundle</span><span class="l-event">all tags defined, content rendered</span></div>${wfVariants.map(([v, t]) => `<div class="panel">${waterfallChart(wf(v), t, wfMax)}</div>`).join('')}</figure>` : ''}
</section></main></body></html>`;
writeFileSync(out, html);
console.log(`wrote ${out}: ${wfVariants.length} waterfalls`);
