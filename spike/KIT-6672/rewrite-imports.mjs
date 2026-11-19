// Usage: node rewrite-imports.mjs <repo root>
// Rewrites, in place (still at their old paths), the imports of every headless file that moves to
// packages/headless-ssr, so that after `git mv` they point at the right place:
//  - moved -> moved: relative path between the NEW locations
//  - moved -> headless (prod files): split per symbol into '@coveo/headless' | '@coveo/headless/commerce'
//    | '@coveo/headless/ssr-internal'
//  - moved -> headless (test files, vi.mock, vi.importActual): '@coveo/headless-src/<path>.js' (test-only alias)
// Writes packages/headless/src/ssr-internal.index.ts and a JSON report.
import {createRequire} from 'node:module';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, relative, resolve, sep} from 'node:path';

const root = resolve(process.argv[2]);
const headless = resolve(root, 'packages/headless');
const src = resolve(headless, 'src');
const newSrc = resolve(root, 'packages/headless-ssr/src');
const require = createRequire(resolve(headless, 'package.json'));
const ts = require('typescript');

const ssrDir = resolve(src, 'ssr-next');
const moveMap = new Map(); // old abs -> new abs
const cfgPath = resolve(src, 'tsconfig.build.json');
const cfg = ts.parseJsonConfigFileContent(
  ts.readConfigFile(cfgPath, ts.sys.readFile).config,
  ts.sys,
  dirname(cfgPath)
);
for (const f of ts.sys.readDirectory(ssrDir, ['.ts']))
  moveMap.set(resolve(f), resolve(newSrc, relative(ssrDir, f)));
moveMap.set(resolve(src, 'ssr-next.index.ts'), resolve(newSrc, 'index.ts'));
moveMap.set(resolve(src, 'ssr-commerce-next.index.ts'), resolve(newSrc, 'commerce.index.ts'));
moveMap.set(
  resolve(src, 'test/mock-ssr-controller-definitions.ts'),
  resolve(newSrc, 'test/mock-ssr-controller-definitions.ts')
);
moveMap.set(
  resolve(src, 'test/mock-navigator-context.ts'),
  resolve(newSrc, 'test/mock-navigator-context.ts')
);

const publicEntries = [
  ['@coveo/headless', 'index.ts'],
  ['@coveo/headless/commerce', 'commerce.index.ts'],
];
const program = ts.createProgram(
  [...moveMap.keys(), ...publicEntries.map(([, f]) => resolve(src, f))],
  {...cfg.options, noEmit: true}
);
const checker = program.getTypeChecker();
const original = (s) => {
  while (s && s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
  return s;
};
const declOf = (s) => {
  const o = original(s);
  const d = o?.declarations?.[0];
  return d
    ? {
        file: resolve(d.getSourceFile().fileName),
        name: o.name,
        key: `${resolve(d.getSourceFile().fileName)}#${o.name}`,
        isValue: !!(o.flags & ts.SymbolFlags.Value),
      }
    : null;
};

const publicIndex = new Map(); // decl key -> [{entry, name}]
for (const [entry, file] of publicEntries) {
  const modSym = checker.getSymbolAtLocation(program.getSourceFile(resolve(src, file)));
  for (const e of checker.getExportsOfModule(modSym)) {
    const d = declOf(e);
    if (!d) continue;
    if (!publicIndex.has(d.key)) publicIndex.set(d.key, []);
    publicIndex.get(d.key).push({entry, name: e.name});
  }
}

const isTest = (f) => /\.test(-d)?\.ts$/.test(f) || f.includes(`${sep}test${sep}`);
const isCommerceFile = (f) => /commerce/.test(relative(src, f));
const resolveSpec = (spec, from) => {
  const r = ts.resolveModuleName(spec, from, cfg.options, ts.sys).resolvedModule;
  return r ? resolve(r.resolvedFileName) : null;
};
const toSpec = (fromNew, toNew) => {
  let p = relative(dirname(fromNew), toNew)
    .replace(/\.tsx?$/, '.js')
    .split(sep)
    .join('/');
  return p.startsWith('.') ? p : `./${p}`;
};
const srcAlias = (target) =>
  `@coveo/headless-src/${relative(src, target)
    .replace(/\.tsx?$/, '.js')
    .split(sep)
    .join('/')}`;

const internal = new Map(); // decl key -> {file, name, isValue, typeOnlyEverywhere, exportName}
const report = {files: 0, publicMain: new Set(), publicCommerce: new Set(), testAlias: new Set()};

function pickPublic(key, preferCommerce, wanted) {
  const opts = publicIndex.get(key);
  if (!opts) return null;
  const order = preferCommerce
    ? ['@coveo/headless/commerce', '@coveo/headless']
    : ['@coveo/headless', '@coveo/headless/commerce'];
  for (const entry of order) {
    const same =
      opts.find((o) => o.entry === entry && o.name === wanted) ??
      opts.find((o) => o.entry === entry);
    if (same) return same;
  }
  return null;
}

for (const [oldPath, newPath] of moveMap) {
  const sf = program.getSourceFile(oldPath);
  const text = sf.getFullText();
  const edits = []; // {start, end, text}
  const test = isTest(oldPath);
  const preferCommerce = isCommerceFile(oldPath);

  const visit = (node) => {
    // vi.mock('x') / vi.importActual('x') / vi.doMock / import('x')
    if (
      ts.isCallExpression(node) &&
      node.arguments.length &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      const callee = node.expression.getText(sf);
      if (
        /^vi\.(mock|doMock|unmock|importActual|importMock)$/.test(callee) ||
        node.expression.kind === ts.SyntaxKind.ImportKeyword
      ) {
        const lit = node.arguments[0];
        if (lit.text.startsWith('.')) {
          const target = resolveSpec(lit.text, oldPath);
          if (target) {
            const ns = moveMap.has(target)
              ? toSpec(newPath, moveMap.get(target))
              : srcAlias(target);
            edits.push({start: lit.getStart(sf), end: lit.getEnd(), text: `'${ns}'`});
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  for (const st of sf.statements) {
    if (
      (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) &&
      st.moduleSpecifier &&
      st.moduleSpecifier.text.startsWith('.')
    ) {
      const spec = st.moduleSpecifier.text;
      const target = resolveSpec(spec, oldPath);
      if (!target) throw new Error(`cannot resolve ${spec} from ${oldPath}`);
      if (moveMap.has(target)) {
        edits.push({
          start: st.moduleSpecifier.getStart(sf),
          end: st.moduleSpecifier.getEnd(),
          text: `'${toSpec(newPath, moveMap.get(target))}'`,
        });
        continue;
      }
      if (test) {
        report.testAlias.add(relative(src, target));
        edits.push({
          start: st.moduleSpecifier.getStart(sf),
          end: st.moduleSpecifier.getEnd(),
          text: `'${srcAlias(target)}'`,
        });
        continue;
      }
      // prod file importing a headless internal module: split per symbol
      const isExport = ts.isExportDeclaration(st);
      const declTypeOnly = isExport ? st.isTypeOnly : !!st.importClause?.isTypeOnly;
      const items = []; // {imported, local, typeOnly, decl}
      if (isExport) {
        if (!st.exportClause) {
          const modSym = checker.getSymbolAtLocation(st.moduleSpecifier);
          for (const e of checker.getExportsOfModule(modSym)) {
            const d = declOf(e);
            items.push({
              imported: e.name,
              local: e.name,
              typeOnly: declTypeOnly || !d?.isValue,
              decl: d,
            });
          }
          report.starExpanded = (report.starExpanded ?? 0) + 1;
        } else if (!ts.isNamedExports(st.exportClause))
          throw new Error(`export * as ns in ${oldPath}`);
        else
          for (const el of st.exportClause.elements) {
            const sym = checker.getExportSpecifierLocalTargetSymbol(el);
            items.push({
              imported: (el.propertyName ?? el.name).text,
              local: el.name.text,
              typeOnly: declTypeOnly || el.isTypeOnly,
              decl: declOf(sym),
            });
          }
      } else {
        const c = st.importClause;
        if (!c || c.name || (c.namedBindings && !ts.isNamedImports(c.namedBindings)))
          throw new Error(`unsupported import shape in ${oldPath}: ${st.getText(sf)}`);
        for (const el of c.namedBindings?.elements ?? []) {
          items.push({
            imported: (el.propertyName ?? el.name).text,
            local: el.name.text,
            typeOnly: declTypeOnly || el.isTypeOnly,
            decl: declOf(checker.getSymbolAtLocation(el.name)),
          });
        }
      }
      const groups = new Map(); // module -> [{name, local, typeOnly}]
      for (const it of items) {
        if (!it.decl) throw new Error(`no decl for ${it.imported} in ${oldPath}`);
        const pub = pickPublic(it.decl.key, preferCommerce, it.imported);
        let mod, name;
        if (pub) {
          mod = pub.entry;
          name = pub.name;
          (mod === '@coveo/headless' ? report.publicMain : report.publicCommerce).add(it.decl.key);
        } else {
          mod = '@coveo/headless/ssr-internal';
          if (!internal.has(it.decl.key))
            internal.set(it.decl.key, {...it.decl, typeOnlyEverywhere: true});
          if (!it.typeOnly) internal.get(it.decl.key).typeOnlyEverywhere = false;
          name = {deferred: it.decl.key};
        }
        if (!groups.has(mod)) groups.set(mod, []);
        groups.get(mod).push({name, local: it.local, typeOnly: it.typeOnly});
      }
      edits.push({
        start: st.getStart(sf),
        end: st.getEnd(),
        render: () => {
          const out = [];
          for (const [mod, els] of groups) {
            const allType = els.every((e) => e.typeOnly);
            const parts = els.map((e) => {
              const n =
                typeof e.name === 'string' ? e.name : internal.get(e.name.deferred).exportName;
              const spec = n === e.local ? n : `${n} as ${e.local}`;
              return !allType && e.typeOnly ? `type ${spec}` : spec;
            });
            out.push(
              `${isExport ? 'export' : 'import'} ${allType ? 'type ' : ''}{${parts.join(', ')}} from '${mod}';`
            );
          }
          return out.join('\n');
        },
      });
    }
  }
  visit(sf);
  edits.forEach((e) => (e.oldPath = oldPath));
  report.files++;
  moveMap.get(oldPath);
  (globalThis.__edits ??= []).push({oldPath, text, edits});
}

// Internal entry export names (alias on collision)
const byName = new Map();
for (const d of internal.values()) byName.set(d.name, [...(byName.get(d.name) ?? []), d]);
const prefixFor = (file) => {
  const r = relative(src, file);
  if (r.startsWith('controllers/commerce/product-listing')) return 'productListing';
  if (r.startsWith('controllers/commerce/search')) return 'commerceSearch';
  if (r.includes('commerce')) return 'commerce';
  return '';
};
for (const [name, ds] of byName) {
  for (const d of ds) {
    const p = ds.length > 1 ? prefixFor(d.file) : '';
    d.exportName = p ? p + name[0].toUpperCase() + name.slice(1) : name;
  }
}

for (const {oldPath, text, edits} of globalThis.__edits) {
  let out = text;
  for (const e of edits.sort((a, b) => b.start - a.start))
    out = out.slice(0, e.start) + (e.render ? e.render() : e.text) + out.slice(e.end);
  writeFileSync(oldPath, out);
}

// ssr-internal.index.ts
const byFile = new Map();
for (const d of internal.values()) byFile.set(d.file, [...(byFile.get(d.file) ?? []), d]);
const lines = [
  '/**',
  ' * Internal entry point for `@coveo/headless-ssr`. Not public API: no semver guarantee, may change in any release.',
  ' * Only pure functions, slice reducers, selectors, schemas and types belong here. Never add thunks, RTK Query',
  ' * APIs, classes checked with `instanceof`, or `Symbol()` keys: the CJS build bundles this entry separately.',
  ' * @internal',
  ' * @module SSR internals',
  ' */',
];
for (const [file, ds] of [...byFile].sort(([a], [b]) => a.localeCompare(b))) {
  const spec = `./${relative(src, file).replace(/\.ts$/, '.js').split(sep).join('/')}`;
  const fmt = (d) => (d.exportName === d.name ? d.name : `${d.name} as ${d.exportName}`);
  const types = ds
    .filter((d) => d.typeOnlyEverywhere || !d.isValue)
    .sort((a, b) => a.name.localeCompare(b.name));
  const values = ds
    .filter((d) => !(d.typeOnlyEverywhere || !d.isValue))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (values.length) lines.push(`export {${values.map(fmt).join(', ')}} from '${spec}';`);
  if (types.length) lines.push(`export type {${types.map(fmt).join(', ')}} from '${spec}';`);
}
writeFileSync(resolve(src, 'ssr-internal.index.ts'), lines.join('\n') + '\n');

const summary = {
  files: report.files,
  publicMainSymbols: report.publicMain.size,
  publicCommerceSymbols: report.publicCommerce.size,
  internalSymbols: internal.size,
  internalValues: [...internal.values()].filter((d) => d.isValue && !d.typeOnlyEverywhere).length,
  internalModules: byFile.size,
  testAliasModules: [...report.testAlias].sort(),
  moves: [...moveMap].map(([a, b]) => [relative(root, a), relative(root, b)]),
};
writeFileSync(resolve(process.argv[3] ?? '/dev/null'), JSON.stringify(summary, null, 1));
const {moves, testAliasModules, ...short} = summary;
console.log(
  JSON.stringify(
    {...short, testAliasModules: testAliasModules.length, moves: moves.length},
    null,
    1
  )
);
