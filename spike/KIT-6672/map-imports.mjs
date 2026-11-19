// Usage: node map-imports.mjs <headless package dir> <out.json>
// Lists every symbol that headless's -next SSR code imports from headless outside src/ssr-next,
// and whether that symbol (same declaration) is reachable from a public entry.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {relative, resolve, dirname} from 'node:path';

const pkgDir = resolve(process.argv[2]);
const out = process.argv[3];
const require = createRequire(resolve(pkgDir, 'package.json'));
const ts = require('typescript');

const src = resolve(pkgDir, 'src');
const ssrDir = resolve(src, 'ssr-next') + '/';
const ssrEntries = ['ssr-next.index.ts', 'ssr-commerce-next.index.ts'].map((f) => resolve(src, f));
const publicEntries = {
  '@coveo/headless': 'index.ts',
  '@coveo/headless/commerce': 'commerce.index.ts',
  '@coveo/headless/insight': 'insight.index.ts',
  '@coveo/headless/recommendation': 'recommendation.index.ts',
  '@coveo/headless/case-assist': 'case-assist.index.ts',
};

const cfgPath = resolve(src, 'tsconfig.build.json');
const cfg = ts.parseJsonConfigFileContent(
  ts.readConfigFile(cfgPath, ts.sys.readFile).config,
  ts.sys,
  dirname(cfgPath)
);
const ssrFiles = ts.sys.readDirectory(ssrDir, ['.ts']).map((f) => resolve(f));
const roots = [
  ...ssrEntries,
  ...ssrFiles,
  ...Object.values(publicEntries).map((f) => resolve(src, f)),
];
const program = ts.createProgram(roots, {...cfg.options, noEmit: true});
const checker = program.getTypeChecker();

const original = (sym) => {
  let s = sym;
  while (s && s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
  return s;
};
const declKey = (sym) => {
  const s = original(sym);
  const d = s?.declarations?.[0];
  if (!d) return `?${s?.name}`;
  return `${relative(src, d.getSourceFile().fileName)}#${s.name}`;
};

const publicIndex = new Map();
for (const [name, file] of Object.entries(publicEntries)) {
  const sf = program.getSourceFile(resolve(src, file));
  const modSym = checker.getSymbolAtLocation(sf);
  for (const e of checker.getExportsOfModule(modSym)) {
    const k = declKey(e);
    if (!publicIndex.has(k)) publicIndex.set(k, []);
    publicIndex.get(k).push(`${name}:${e.name}`);
  }
}

const isInSsr = (f) => f.startsWith(ssrDir) || ssrEntries.includes(f);
const isTest = (f) => /\.test(-d)?\.ts$/.test(f) || /\/test\//.test(f);
const rows = [];

function resolveModule(spec, fromFile) {
  const r = ts.resolveModuleName(spec, fromFile, cfg.options, ts.sys).resolvedModule;
  return r ? resolve(r.resolvedFileName) : null;
}

for (const file of [...ssrEntries, ...ssrFiles]) {
  const sf = program.getSourceFile(file);
  if (!sf) continue;
  for (const st of sf.statements) {
    if (!(ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) || !st.moduleSpecifier)
      continue;
    const spec = st.moduleSpecifier.text;
    const target = spec.startsWith('.') ? resolveModule(spec, file) : null;
    const external = !spec.startsWith('.');
    if (!external && (!target || isInSsr(target))) continue;
    const base = {
      from: relative(src, file),
      fromTest: isTest(file),
      fromEntry: ssrEntries.includes(file),
      module: external ? spec : relative(src, target).replace(/\.ts$/, ''),
      external,
      typeOnlyDecl: !!(st.importClause?.isTypeOnly || st.isTypeOnly),
    };
    const push = (name, node, typeOnly) => {
      let sym = node ? checker.getSymbolAtLocation(node) : null;
      const k = sym ? declKey(sym) : `?${name}`;
      const o = sym ? original(sym) : null;
      const isValue = o ? !!(o.flags & ts.SymbolFlags.Value) : null;
      rows.push({
        ...base,
        name,
        typeOnly: base.typeOnlyDecl || typeOnly,
        isValue,
        decl: k,
        public: publicIndex.get(k) ?? [],
      });
    };
    if (ts.isImportDeclaration(st)) {
      const c = st.importClause;
      if (!c) {
        rows.push({...base, name: '(side-effect)', public: []});
        continue;
      }
      if (c.name) push('default', c.name, false);
      const nb = c.namedBindings;
      if (nb && ts.isNamespaceImport(nb)) push('* as ' + nb.name.text, nb.name, false);
      if (nb && ts.isNamedImports(nb))
        for (const el of nb.elements)
          push((el.propertyName ?? el.name).text, el.name, el.isTypeOnly);
    } else {
      if (!st.exportClause) {
        const modSym = checker.getSymbolAtLocation(st.moduleSpecifier);
        for (const e of modSym ? checker.getExportsOfModule(modSym) : []) {
          const k = declKey(e);
          const o = original(e);
          rows.push({
            ...base,
            name: e.name,
            viaStar: true,
            typeOnly: base.typeOnlyDecl,
            isValue: !!(o.flags & ts.SymbolFlags.Value),
            decl: k,
            public: publicIndex.get(k) ?? [],
          });
        }
      } else if (ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) {
          const sym = checker.getExportSpecifierLocalTargetSymbol(el);
          const k = sym ? declKey(sym) : '?';
          const o = sym ? original(sym) : null;
          rows.push({
            ...base,
            name: (el.propertyName ?? el.name).text,
            typeOnly: base.typeOnlyDecl || el.isTypeOnly,
            isValue: o ? !!(o.flags & ts.SymbolFlags.Value) : null,
            decl: k,
            public: publicIndex.get(k) ?? [],
          });
        }
      }
    }
  }
}

writeFileSync(out, JSON.stringify(rows, null, 1));
const nonExternal = rows.filter((r) => !r.external);
const uniq = (arr) => [...new Set(arr)];
const sym = (r) => r.decl;
const prod = nonExternal.filter((r) => !r.fromTest);
const summary = {
  rows: rows.length,
  distinctSymbolsProd: uniq(prod.map(sym)).length,
  distinctSymbolsProdInternal: uniq(prod.filter((r) => !r.public.length).map(sym)).length,
  distinctInternalValuesProd: uniq(
    prod.filter((r) => !r.public.length && r.isValue && !r.typeOnly).map(sym)
  ).length,
  distinctSymbolsTestOnlyInternal: uniq(
    nonExternal.filter((r) => r.fromTest && !r.public.length).map(sym)
  ).filter((k) => !prod.some((p) => p.decl === k)).length,
  externals: uniq(rows.filter((r) => r.external).map((r) => r.module)),
};
console.log(JSON.stringify(summary, null, 1));
