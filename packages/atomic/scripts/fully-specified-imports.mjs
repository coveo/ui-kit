import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve, sep} from 'node:path';
import ts from 'typescript';

/**
 * Finds the imports of the npm build that do not name a file.
 *
 * `@coveo/atomic` is an ES module package (`"type": "module"`), so webpack and Rspack resolve the
 * imports of its ES module build the way Node.js does, without trying file extensions. Otherwise
 * the build of every app that reaches the import fails:
 * - A relative import, or the import of a file in a package without an `exports` map (such as
 *   `dayjs/plugin/utc.js`), must name the file, extension included.
 * - The import of a subpath of a package with an `exports` map (such as `lit/decorators.js`) must
 *   match one of its keys, and the target must be a file.
 *
 * In the CommonJS build, only relative imports are checked: Node.js never tries `.cjs`, the
 * extension of its files, and its package imports follow CommonJS resolution.
 */

const BUILDS = [
  {dir: 'dist/esm', extension: '.js', checksPackages: true},
  {dir: 'dist/cjs', extension: '.cjs', checksPackages: false},
];

/** The export conditions of an import in a browser build. */
const CONDITIONS = ['import', 'module', 'browser', 'default'];

const SUGGESTED_SUFFIXES = ['.js', '.mjs', '.cjs', '.json', '/index.js'];

/**
 * Lists the module specifiers of a built module: static imports, re-exports, and `import()` and
 * `require()` calls with a literal specifier.
 *
 * @param {string} fileName
 * @param {string} code
 */
export function moduleSpecifiers(fileName, code) {
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
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
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

/** @param {string} path */
const isFile = (path) => existsSync(path) && statSync(path).isFile();

/** @param {string} specifier */
const isRelative = (specifier) => specifier.startsWith('.') || specifier.startsWith('/');

/** @param {string} specifier For example `@scope/package/sub/path.js`. */
function splitPackageSpecifier(specifier) {
  const packageName = specifier
    .split('/')
    .slice(0, specifier.startsWith('@') ? 2 : 1)
    .join('/');
  return {packageName, subpath: specifier.slice(packageName.length + 1)};
}

/**
 * Looks a package up from a directory the way Node.js does.
 *
 * @param {string} packageName
 * @param {string} fromDir
 * @returns {string | undefined} The path of the package's `package.json`.
 */
function findPackageJson(packageName, fromDir) {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    const packageJson = join(dir, 'node_modules', packageName, 'package.json');
    if (existsSync(packageJson)) {
      return packageJson;
    }
    if (dirname(dir) === dir) {
      return undefined;
    }
  }
}

/**
 * Resolves a package subpath through the package's `exports` map, as Node.js does: an exact key
 * first, then the `*` pattern with the longest prefix, with `CONDITIONS`.
 *
 * @param {unknown} exportsField
 * @param {string} subpath For example `./decorators.js`.
 * @returns {string | undefined} The target, or `undefined` when the subpath is not exported.
 */
function resolveExport(exportsField, subpath) {
  const isSubpathMap =
    typeof exportsField === 'object' &&
    exportsField !== null &&
    !Array.isArray(exportsField) &&
    Object.keys(exportsField).every((key) => key.startsWith('.'));
  /** @type {Record<string, unknown>} */
  const subpaths = isSubpathMap ? exportsField : {'.': exportsField};
  if (Object.hasOwn(subpaths, subpath)) {
    return resolveExportTarget(subpaths[subpath], '');
  }

  const pattern = Object.keys(subpaths)
    .filter((key) => {
      const [prefix, suffix, ...rest] = key.split('*');
      return (
        suffix !== undefined &&
        rest.length === 0 &&
        subpath.length >= key.length &&
        subpath.startsWith(prefix) &&
        subpath.endsWith(suffix)
      );
    })
    .sort((a, b) => b.indexOf('*') - a.indexOf('*') || b.length - a.length)[0];
  if (!pattern) {
    return undefined;
  }
  const [prefix, suffix] = pattern.split('*');
  return resolveExportTarget(
    subpaths[pattern],
    subpath.slice(prefix.length, subpath.length - suffix.length)
  );
}

/**
 * @param {unknown} target A value of an `exports` map: a path, conditions, or fallbacks.
 * @param {string} match What the `*` of the key matched.
 * @returns {string | undefined}
 */
function resolveExportTarget(target, match) {
  if (typeof target === 'string') {
    return target.replaceAll('*', match);
  }
  if (Array.isArray(target)) {
    return target.map((fallback) => resolveExportTarget(fallback, match)).find(Boolean);
  }
  if (typeof target === 'object' && target !== null) {
    for (const [condition, value] of Object.entries(target)) {
      if (CONDITIONS.includes(condition)) {
        const resolved = resolveExportTarget(value, match);
        if (resolved !== undefined) {
          return resolved;
        }
      }
    }
  }
  return undefined;
}

/**
 * Returns the file that a specifier names, resolved without trying file extensions, or
 * `undefined` when it names no file.
 *
 * @param {string} specifier
 * @param {string} importer The path of the importing file.
 */
function namedFile(specifier, importer) {
  if (isRelative(specifier)) {
    const file = resolve(dirname(importer), specifier);
    return isFile(file) ? file : undefined;
  }
  const {packageName, subpath} = splitPackageSpecifier(specifier);
  const packageJson = findPackageJson(packageName, dirname(importer));
  if (!packageJson) {
    return undefined;
  }
  const exportsField = JSON.parse(readFileSync(packageJson, 'utf8')).exports;
  const key = subpath ? `./${subpath}` : '.';
  const target = exportsField === undefined ? key : resolveExport(exportsField, key);
  const file = target && join(dirname(packageJson), target);
  return file && isFile(file) ? file : undefined;
}

/**
 * Tells why a specifier does not name a file, or returns `undefined` when it does.
 *
 * @param {string} specifier
 * @param {string} importer The path of the importing file.
 * @param {boolean} checksPackages Whether package imports are checked too.
 */
function unspecifiedImportProblem(specifier, importer, checksPackages) {
  if (!isRelative(specifier)) {
    const {packageName, subpath} = splitPackageSpecifier(specifier);
    if (!checksPackages || !subpath) {
      return undefined;
    }
    if (!findPackageJson(packageName, dirname(importer))) {
      return `'${specifier}' comes from ${packageName}, which is not installed`;
    }
  }

  if (namedFile(specifier, importer)) {
    return undefined;
  }
  const suffix = SUGGESTED_SUFFIXES.find((candidate) =>
    namedFile(`${specifier}${candidate}`, importer)
  );
  return suffix
    ? `'${specifier}' should be '${specifier}${suffix}'`
    : `'${specifier}' names no file`;
}

/**
 * Lists the imports of the npm build that do not name a file, one string per import, with paths
 * relative to the package root. An empty array means that every import names its file.
 *
 * @param {string} packageRoot
 */
export function findUnspecifiedImports(packageRoot) {
  /** @type {string[]} */
  const problems = [];

  for (const {dir, extension, checksPackages} of BUILDS) {
    const buildDir = join(packageRoot, dir);
    if (!existsSync(buildDir)) {
      throw new Error(
        `${dir} does not exist. Build the package first: pnpm turbo build:lit --filter=@coveo/atomic`
      );
    }

    const files = readdirSync(buildDir, {recursive: true})
      .filter((name) => name.endsWith(extension))
      .map((name) => join(buildDir, name))
      .sort();
    for (const file of files) {
      const displayPath = relative(packageRoot, file).split(sep).join('/');
      for (const specifier of moduleSpecifiers(file, readFileSync(file, 'utf8'))) {
        const problem = unspecifiedImportProblem(specifier, file, checksPackages);
        if (problem) {
          problems.push(`${displayPath}: ${problem}`);
        }
      }
    }
  }

  return problems;
}
