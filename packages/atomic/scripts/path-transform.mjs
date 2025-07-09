import {dirname, posix, relative, resolve, sep} from 'node:path';
import {
  isImportDeclaration,
  isStringLiteral,
  visitEachChild,
  visitNode,
} from 'typescript';

// The import prefix as defined in the tsconfig under paths
const IMPORT_PREFIX = '@/';

/**
 * Transforms import paths in TypeScript source files.
 *
 * @param {import('typescript').TransformationContext} context - The transformation context provided by TypeScript.
 * @returns {import('typescript').Transformer<import('typescript').SourceFile>} A transformer function that processes a source file.
 */
export default function pathTransformer(context) {
  const {factory} = context;

  function visit(node, sourceFile) {
    if (isImportDeclaration(node) && isStringLiteral(node.moduleSpecifier)) {
      const importPath = node.moduleSpecifier.text;

      if (importPath.startsWith(IMPORT_PREFIX)) {
        const relativePath = getRelativeImportPath(
          sourceFile.fileName,
          importPath
        );

        return factory.updateImportDeclaration(
          node,
          node.modifiers,
          node.importClause,
          factory.createStringLiteral(relativePath)
        );
      }
    }
    return visitEachChild(node, (child) => visit(child, sourceFile), context);
  }

  return (sourceFile) =>
    visitNode(sourceFile, (node) => visit(node, sourceFile));
}

/**
 * Generates a relative import path from a source file path and an import path.
 *
 * @param {string} sourceFilePath - The file path of the source file.
 * @param {string} importPath - The import path to be transformed.
 * @returns {string} The relative import path.
 */
function getRelativeImportPath(sourceFilePath, importPath) {
  const basePath = resolve(process.cwd());
  const absoluteImportPath = resolve(
    basePath,
    importPath.replace(IMPORT_PREFIX, '')
  );
  const relativePath = relative(dirname(sourceFilePath), absoluteImportPath);
  const posixPath = posix.join(...relativePath.split(sep));
  return posixPath.startsWith('.') ? posixPath : `./${posixPath}`;
}
