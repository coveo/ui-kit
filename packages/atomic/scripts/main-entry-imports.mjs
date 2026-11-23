import {existsSync, readFileSync} from 'node:fs';
import {dirname, join, relative, resolve, sep} from 'node:path';
import ts from 'typescript';

/**
 * Finds how the npm main entry reaches the lazy loader in the build output.
 *
 * The lazy loader (`autoloader/` and the `lazy-index` files) names every component in an `import()`
 * call. esbuild, which the Angular CLI builds with, turns every `import()` target it scans into an
 * entry point before it removes unused code. If the main entry reaches the lazy loader, an app
 * that imports a single helper from `@coveo/atomic` therefore loads every component, even when it
 * never calls the loader. So the loader keeps its own entry, `@coveo/atomic/loader`, and the main
 * entry must not import it.
 *
 * Static imports, re-exports and `import()` calls with a literal specifier all count: esbuild
 * follows them all. Only relative imports are followed, so other packages are not analyzed.
 */

/** The `import` condition of the `.` export in `package.json`. */
const MAIN_ENTRY = 'dist/esm/index.js';

const LAZY_LOADER_FILE = /(^|\/)(autoloader\/.*|lazy-index\.js)$/;

/**
 * Lists the module specifiers that a built module imports: static imports, re-exports and
 * `import()` calls with a literal specifier.
 *
 * @param {string} fileName
 * @param {string} code
 */
export function importedSpecifiers(fileName, code) {
  const source = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.JS
  );
  /** @type {string[]} */
  const specifiers = [];

  /** @param {ts.Node} node */
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  return specifiers;
}

/**
 * Walks the import graph from an entry and returns, for each forbidden file it reaches, the
 * shortest chain of imports that leads to it. The imports of a forbidden file are not followed.
 *
 * @param {string} entry
 * @param {(file: string) => string[]} importsOf Returns the files that a file imports.
 * @param {(file: string) => boolean} isForbidden
 * @returns {string[][]} One chain per forbidden file, from the entry to that file.
 */
export function findImportChains(entry, importsOf, isForbidden) {
  /** @type {Map<string, string | null>} */
  const importers = new Map([[entry, null]]);
  const pending = [entry];
  /** @type {string[][]} */
  const chains = [];

  while (pending.length > 0) {
    const file = pending.shift();
    if (isForbidden(file)) {
      chains.push(chainTo(file, importers));
      continue;
    }
    for (const imported of importsOf(file)) {
      if (!importers.has(imported)) {
        importers.set(imported, file);
        pending.push(imported);
      }
    }
  }

  return chains;
}

/**
 * @param {string} file
 * @param {Map<string, string | null>} importers
 */
function chainTo(file, importers) {
  const chain = [];
  for (let current = file; current != null; current = importers.get(current)) {
    chain.unshift(current);
  }
  return chain;
}

/**
 * Returns the import chains from the npm main entry to the lazy loader, one string per chain, with
 * paths relative to the package root. An empty array means that the main entry does not reach it.
 *
 * @param {string} packageRoot
 */
export function findMainEntryLoaderImports(packageRoot) {
  const entry = join(packageRoot, MAIN_ENTRY);
  if (!existsSync(entry)) {
    throw new Error(
      `${MAIN_ENTRY} does not exist. Build the package first: pnpm turbo build --filter=@coveo/atomic`
    );
  }

  /** @param {string} file */
  const toPackagePath = (file) => relative(packageRoot, file).split(sep).join('/');

  /** @param {string} file */
  const importsOf = (file) =>
    importedSpecifiers(file, readFileSync(file, 'utf8'))
      .filter((specifier) => specifier.startsWith('.') && specifier.endsWith('.js'))
      .map((specifier) => resolve(dirname(file), specifier));

  return findImportChains(entry, importsOf, (file) =>
    LAZY_LOADER_FILE.test(toPackagePath(file))
  ).map((chain) => chain.map(toPackagePath).join(' → '));
}
