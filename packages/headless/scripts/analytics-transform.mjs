import {createRequire} from 'node:module';
import {join} from 'node:path/posix';
import {
  isImportDeclaration,
  isStringLiteral,
  visitEachChild,
  visitNode,
} from 'typescript';

const require = createRequire(import.meta.url);

function resolveEsm(moduleName) {
  const packageJsonPath = require.resolve(`${moduleName}/package.json`);
  const packageJson = require(packageJsonPath);
  return join(moduleName, packageJson.module || packageJson.main);
}

/**
 * Custom transformer to replace coveo.analytics imports with the resolved ESM path.
 */
export default function analyticsTransformer(context) {
  const {factory} = context;
  const resolvedAnalyticsPath = resolveEsm('coveo.analytics');

  function visit(node) {
    // Check if this node is an import declaration for 'coveo.analytics'
    if (
      isImportDeclaration(node) &&
      node.moduleSpecifier &&
      isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === 'coveo.analytics'
    ) {
      console.log(
        'Replacing coveo.analytics import with:',
        resolvedAnalyticsPath
      );
      return factory.updateImportDeclaration(
        node,
        node.modifiers,
        node.importClause,
        factory.createStringLiteral(resolvedAnalyticsPath),
        node.assertClause
      );
    }

    return visitEachChild(node, visit, context);
  }

  return (sourceFile) => visitNode(sourceFile, visit);
}
