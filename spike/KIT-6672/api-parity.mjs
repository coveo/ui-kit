import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const [baseRoot, newRoot] = process.argv.slice(2).map((p) => resolve(p));
const require = createRequire(resolve(newRoot, 'packages/headless/package.json'));
const ts = require('typescript');
function exportsOf(dir, spec) {
  const file = resolve(dir, '__probe.ts');
  const host = ts.createCompilerHost({});
  const orig = host.getSourceFile;
  const src = `export * from '${spec}';`;
  host.getSourceFile = (f, l) => (f === file ? ts.createSourceFile(f, src, l) : orig(f, l));
  const fe = host.fileExists;
  host.fileExists = (f) => f === file || fe(f);
  const p = ts.createProgram(
    [file],
    {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      skipLibCheck: true,
      noEmit: true,
    },
    host
  );
  const c = p.getTypeChecker();
  const sym = c.getSymbolAtLocation(p.getSourceFile(file));
  const m = new Map();
  for (const e of c.getExportsOfModule(sym)) {
    let o = e;
    while (o.flags & ts.SymbolFlags.Alias) o = c.getAliasedSymbol(o);
    m.set(e.name, o.flags & ts.SymbolFlags.Value ? 'value' : 'type');
  }
  return m;
}
const pairs = [
  [
    baseRoot,
    'packages/headless-react',
    '@coveo/headless/ssr-next',
    newRoot,
    'packages/headless-ssr/src',
    '@coveo/headless-ssr',
  ],
  [
    baseRoot,
    'packages/headless-react',
    '@coveo/headless/ssr-commerce-next',
    newRoot,
    'packages/headless-ssr/src',
    '@coveo/headless-ssr/commerce',
  ],
  [
    baseRoot,
    'packages/headless-react/src',
    '@coveo/headless-react/ssr-commerce-next',
    newRoot,
    'packages/headless-ssr/src',
    '@coveo/headless-ssr/react/commerce',
  ],
];
for (const [br, bd, bs, nr, nd, ns] of pairs) {
  const a = exportsOf(resolve(br, bd), bs),
    b = exportsOf(resolve(nr, nd), ns);
  const missing = [...a.keys()].filter((k) => !b.has(k));
  const added = [...b.keys()].filter((k) => !a.has(k));
  const kind = [...a.keys()].filter((k) => b.has(k) && a.get(k) !== b.get(k));
  console.log(
    `${bs} (${a.size}) -> ${ns} (${b.size}): missing=${JSON.stringify(missing)} added=${JSON.stringify(added)} kindChanged=${JSON.stringify(kind)}`
  );
}
