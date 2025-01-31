import {readFileSync} from 'fs';
import {basename, dirname, join, resolve, relative} from 'path';
import {
  NodeFlags,
  isImportDeclaration,
  visitEachChild,
  visitNode,
  isStringLiteral,
} from 'typescript';

/**
 * //TODO Add a lot of jsdoc
 * TypeScript transformer that replaces import paths starting with `@/` with relative paths.
 */
export default function pathTransformer(context) {
  const {factory} = context;

  function visit(node, sourceFile) {
    if (isImportDeclaration(node) && isStringLiteral(node.moduleSpecifier)) {
      const importPath = node.moduleSpecifier.text;

      if (importPath.startsWith('@/')) {
        const relativePath = getRelativeImportPath(
          sourceFile.fileName,
          importPath
        );

        return factory.updateImportDeclaration(
          node,
          node.modifiers,
          node.importClause,
          factory.createStringLiteral(relativePath),
          node.assertClause
        );
      }
    }
    return visitEachChild(node, (child) => visit(child, sourceFile), context);
  }

  return (sourceFile) =>
    visitNode(sourceFile, (node) => visit(node, sourceFile));
}

function getRelativeImportPath(sourceFilePath, importPath) {
  const basePath = resolve(process.cwd());
  const absoluteImportPath = resolve(basePath, importPath.replace('@/', ''));
  const relativePath = relative(dirname(sourceFilePath), absoluteImportPath);
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}
