import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, relative, resolve, sep} from 'node:path';
import ts from 'typescript';

/**
 * Finds the imports of the npm build that do not name a file.
 *
 * `@coveo/atomic` is an ES module package (`"type": "module"`), so webpack and Rspack resolve its
 * imports the way Node.js does, without trying file extensions. A relative import, or the import
 * of a file in a package that has no `exports` map (such as `dayjs/plugin/utc.js`), must name the
 * file, extension included, or the build of every app that reaches it fails. The import of a
 * package, or of a subpath that the package's `exports` map declares, needs no extension.
 *
 * The CommonJS build follows the same rule: it comes from the same sources, and Node.js never
 * tries the `.cjs` extension of its files.
 */

const BUILDS = [
  {dir: 'dist/esm', extension: '.js'},
  {dir: 'dist/cjs', extension: '.cjs'},
];

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
 * Tells why a specifier does not name a file, or returns `undefined` when it resolves without
 * extension guessing.
 *
 * @param {string} specifier
 * @param {string} importer The path of the importing file.
 */
function unspecifiedImportProblem(specifier, importer) {
  let target;
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    target = resolve(dirname(importer), specifier);
  } else {
    const packageName = specifier
      .split('/')
      .slice(0, specifier.startsWith('@') ? 2 : 1)
      .join('/');
    const subpath = specifier.slice(packageName.length + 1);
    if (!subpath) {
      return undefined;
    }
    const packageJson = findPackageJson(packageName, dirname(importer));
    if (!packageJson) {
      return `'${specifier}' comes from ${packageName}, which is not installed`;
    }
    if (JSON.parse(readFileSync(packageJson, 'utf8')).exports) {
      return undefined;
    }
    target = join(dirname(packageJson), subpath);
  }

  if (isFile(target)) {
    return undefined;
  }
  const suffix = SUGGESTED_SUFFIXES.find((candidate) => isFile(`${target}${candidate}`));
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

  for (const {dir, extension} of BUILDS) {
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
        const problem = unspecifiedImportProblem(specifier, file);
        if (problem) {
          problems.push(`${displayPath}: ${problem}`);
        }
      }
    }
  }

  return problems;
}
