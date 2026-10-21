import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {ts} from '@custom-elements-manifest/analyzer';
import {cli} from '@custom-elements-manifest/analyzer/cli.js';

const packageRoot = fileURLToPath(new URL('../../../', import.meta.url));

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

export function findMember(declaration, name) {
  return declaration.members?.find((member) => member.name === name);
}

export function findAttribute(declaration, name) {
  return declaration.attributes?.find((attribute) => attribute.name === name);
}
