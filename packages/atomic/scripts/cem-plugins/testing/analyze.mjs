import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {create, ts} from '@custom-elements-manifest/analyzer';
import {cli} from '@custom-elements-manifest/analyzer/cli.js';
import {litPlugin} from '@custom-elements-manifest/analyzer/src/features/framework-plugins/lit/lit.js';

const packageRoot = fileURLToPath(new URL('../../../', import.meta.url));

/**
 * Runs the analyzer over in-memory sources, with the same Lit support the CLI adds for `litelement: true`.
 * Modules are analyzed in insertion order.
 *
 * @param {Record<string, string>} sources Module path to TypeScript source
 * @param {object[]} plugins Plugins to run after the built-in ones
 */
export function analyze(sources, plugins) {
  const modules = Object.entries(sources).map(([path, source]) =>
    ts.createSourceFile(path, source, ts.ScriptTarget.ES2015, true)
  );
  return create({modules, plugins: [...litPlugin(), ...plugins]});
}

/**
 * Builds the manifest of Atomic the way `pnpm run build:cem` does, through the analyzer's CLI and
 * `custom-elements-manifest.config.mjs`, without writing it.
 */
export function analyzeAtomic() {
  return cli({argv: ['analyze', '--quiet'], cwd: packageRoot, noWrite: true});
}

/**
 * Lists the fields of an Atomic source file that carry the given decorator, so that specs can
 * check the manifest against the sources rather than against a list of known names.
 *
 * @param {string} path Module path, as in the manifest
 * @param {string} decoratorName
 * @returns {{className: string, fieldName: string, firstArgument: import('typescript').Expression}[]}
 */
export function findDecoratedFields(path, decoratorName) {
  const sourceFile = ts.createSourceFile(
    path,
    readFileSync(`${packageRoot}${path}`, 'utf8'),
    ts.ScriptTarget.ES2015,
    true
  );
  const fields = [];
  const visit = (node) => {
    if (ts.isPropertyDeclaration(node)) {
      for (const {expression} of ts.getDecorators(node) ?? []) {
        if (ts.isCallExpression(expression) && expression.expression.getText() === decoratorName) {
          fields.push({
            className: node.parent.name?.text,
            fieldName: node.name.getText(),
            firstArgument: expression.arguments[0],
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return fields;
}

export function findElement(manifest, tagName) {
  return manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .find((declaration) => declaration.tagName === tagName);
}

export function findModule(manifest, path) {
  return manifest.modules.find((module) => module.path === path);
}

export function findMember(declaration, name) {
  return declaration.members?.find((member) => member.name === name);
}

export function findAttribute(declaration, name) {
  return declaration.attributes?.find((attribute) => attribute.name === name);
}

/**
 * Source of a module declaring one Lit custom element.
 *
 * @param {string} tagName
 * @param {string} className
 * @param {string} body Class body, e.g. decorated fields
 */
export function litElement(tagName, className, body) {
  return `
import {LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('${tagName}')
export class ${className} extends LitElement {
${body}
}
`;
}
