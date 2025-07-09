import {readFileSync} from 'fs';
import {resolve} from 'path';
import {
  isIdentifier,
  isNonNullExpression,
  isPropertyAccessExpression,
  visitEachChild,
  visitNode,
} from 'typescript';
// Read the version from package.json
import {fileURLToPath} from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const packageJsonPath = resolve(__dirname, '../package.json');
const {version} = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

/**
 * Custom transformer to replace process.env.VERSION with the actual version from package.json.
 */
export default function versionTransformer(context) {
  const {factory} = context;

  function visit(node) {
    if (
      isPropertyAccessExpression(node) &&
      isIdentifier(node.expression) &&
      node.expression.escapedText === 'process' &&
      node.name.escapedText === 'env'
    ) {
      const parent = node.parent;
      if (
        isPropertyAccessExpression(parent) &&
        parent.name.escapedText === 'VERSION'
      ) {
        console.log('Replacing process.env.VERSION with:', version);
        return factory.createStringLiteral(version);
      } else if (
        isNonNullExpression(parent) &&
        isPropertyAccessExpression(parent.expression) &&
        parent.expression.name.escapedText === 'VERSION'
      ) {
        console.log('Replacing process.env.VERSION! with:', version);
        return factory.createStringLiteral(version);
      }
    }
    return visitEachChild(node, visit, context);
  }

  return (sourceFile) => visitNode(sourceFile, visit);
}
