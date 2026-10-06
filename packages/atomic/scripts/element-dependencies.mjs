import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import ts from 'typescript';

/**
 * Finds Atomic elements whose import graph does not register every `atomic-*` tag they render.
 *
 * When an element is imported on its own (rather than through the `./components` barrel or the
 * lazy loader), only the modules it transitively imports are evaluated. A tag rendered without
 * being imported somewhere in that graph never upgrades and stays an inert unknown element.
 *
 * Imports are read from the transpiled output, so imports that only bring in types (and are
 * therefore erased) do not count as registering anything.
 *
 * Rendered tags are collected from:
 * - `html` tagged templates;
 * - `createElement('atomic-…')` calls;
 * - other string or template literals that contain both the opening and the closing tag (e.g.,
 *   markup assigned to `innerHTML`). Literals with only an opening tag are usually messages that
 *   mention a component, so they are ignored.
 *
 * Tag names built dynamically (concatenation, `unsafeStatic`) are not detected.
 */

const RENDERED_TAG = /<(atomic-[a-z0-9-]+)(?=[\s>/])/g;

/**
 * @param {string} fileName
 * @param {string} code
 */
export function analyzeModule(fileName, code) {
  const source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true);
  /** @type {string[]} */
  const registers = [];
  /** @type {Set<string>} */
  const renders = new Set();

  /** @param {ts.Node} node */
  const visit = (node) => {
    if (
      ts.isDecorator(node) &&
      ts.isCallExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'customElement' &&
      node.expression.arguments[0] &&
      ts.isStringLiteral(node.expression.arguments[0])
    ) {
      registers.push(node.expression.arguments[0].text);
    } else if (
      ts.isTaggedTemplateExpression(node) &&
      ts.isIdentifier(node.tag) &&
      node.tag.text === 'html'
    ) {
      for (const match of templateText(node.template).matchAll(RENDERED_TAG)) {
        renders.add(match[1]);
      }
    } else if (
      (ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateExpression(node)) &&
      !ts.isTaggedTemplateExpression(node.parent)
    ) {
      const text = templateText(node);
      for (const match of text.matchAll(RENDERED_TAG)) {
        if (text.includes(`</${match[1]}>`)) {
          renders.add(match[1]);
        }
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'createElement' &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0]) &&
      node.arguments[0].text.startsWith('atomic-')
    ) {
      renders.add(node.arguments[0].text);
    }

    ts.forEachChild(node, visit);
  };
  visit(source);

  return {imports: valueImports(fileName, code), registers, renders};
}

/**
 * @param {ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression | ts.TemplateLiteral} node
 */
function templateText(node) {
  if (ts.isTemplateExpression(node)) {
    return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join('${}');
  }
  return node.text;
}

/**
 * @param {string} fileName
 * @param {string} code
 */
function valueImports(fileName, code) {
  const {outputText} = ts.transpileModule(code, {
    fileName,
    compilerOptions: {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true,
    },
  });
  const output = ts.createSourceFile(fileName, outputText, ts.ScriptTarget.Latest, true);
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
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(output);

  return specifiers;
}

/**
 * @param {Map<string, ReturnType<typeof analyzeModule>>} modules Analyzed modules, keyed by path.
 * @param {(from: string, specifier: string) => string | null} resolveImport Returns the path of an
 * analyzed module, or `null` for anything outside the analyzed set.
 */
export function findUnregisteredRenderedTags(modules, resolveImport) {
  const knownTags = new Set([...modules.values()].flatMap((module) => module.registers));
  /** @type {{element: string, tag: string, renderedBy: string}[]} */
  const gaps = [];

  for (const [path, module] of modules) {
    for (const element of module.registers) {
      const graph = importGraph(path, modules, resolveImport);
      const registered = new Set([...graph].flatMap((p) => modules.get(p).registers));
      for (const renderer of graph) {
        for (const tag of modules.get(renderer).renders) {
          if (knownTags.has(tag) && !registered.has(tag)) {
            gaps.push({element, tag, renderedBy: renderer});
          }
        }
      }
    }
  }

  return gaps;
}

/**
 * @param {string} entry
 * @param {Map<string, ReturnType<typeof analyzeModule>>} modules
 * @param {(from: string, specifier: string) => string | null} resolveImport
 */
function importGraph(entry, modules, resolveImport) {
  const visited = new Set([entry]);
  const pending = [entry];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const specifier of modules.get(current).imports) {
      const target = resolveImport(current, specifier);
      if (target && modules.has(target) && !visited.has(target)) {
        visited.add(target);
        pending.push(target);
      }
    }
  }
  return visited;
}

const IGNORED_FILE = /\.(spec|d|stories|new\.stories|e2e)\.ts$/;

/**
 * Analyzes every source module of the package and returns the dependency gaps, with paths
 * relative to the package root.
 *
 * @param {string} packageRoot
 */
export function findPackageDependencyGaps(packageRoot) {
  /** @type {Map<string, ReturnType<typeof analyzeModule>>} */
  const modules = new Map();
  for (const file of sourceFiles(join(packageRoot, 'src'))) {
    modules.set(file, analyzeModule(file, readFileSync(file, 'utf8')));
  }

  /**
   * @param {string} from
   * @param {string} specifier
   */
  const resolveImport = (from, specifier) => {
    let base;
    if (specifier.startsWith('@/')) {
      base = join(packageRoot, specifier.slice(2));
    } else if (specifier.startsWith('.')) {
      base = resolve(dirname(from), specifier);
    } else {
      return null;
    }
    base = base.replace(/\.js$/, '');
    return (
      [`${base}.ts`, join(base, 'index.ts')].find((candidate) => existsSync(candidate)) ?? null
    );
  };

  return findUnregisteredRenderedTags(modules, resolveImport).map((gap) => ({
    ...gap,
    renderedBy: relative(packageRoot, gap.renderedBy),
  }));
}

/** @param {string} directory */
function* sourceFiles(directory) {
  for (const entry of readdirSync(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'e2e') {
        yield* sourceFiles(path);
      }
    } else if (entry.name.endsWith('.ts') && !IGNORED_FILE.test(entry.name)) {
      yield path;
    }
  }
}
