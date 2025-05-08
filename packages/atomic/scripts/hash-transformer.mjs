import {
  isExportAssignment,
  isExportDeclaration,
  isImportDeclaration,
  isStringLiteral,
  NodeFlags,
  resolveModuleName,
  sys,
  visitEachChild,
  visitNode,
} from 'typescript';
import computeHash from './compute-hash.mjs';

/**
 * Transformer factory
 */
export default function hashTransformer(program) {
  return (context) => (sourceFile) => {
    const {factory} = context;
    const fileName = sourceFile.fileName;

    function rewriteSpecifier(node, specifier) {
      const specifierPath = specifier.text;
      if (!specifierPath.startsWith('.') && !specifierPath.startsWith('@/')) {
        return null;
      }
      const resolved = resolveModuleName(
        specifierPath,
        fileName,
        program.getCompilerOptions(),
        sys
      ).resolvedModule;

      if (
        !resolved?.resolvedFileName ||
        resolved.resolvedFileName.includes('index')
      ) {
        return null;
      }

      const importedContent = sys.readFile(resolved.resolvedFileName) || '';
      const specifierHash = computeHash(importedContent);
      const newSpecifierPath =
        specifierPath.replace(/\.js$/, '') + `.${specifierHash}.js`;
      return factory.createStringLiteral(newSpecifierPath);
    }

    function visitor(node) {
      // import declarations
      if (isImportDeclaration(node) && isStringLiteral(node.moduleSpecifier)) {
        const newSpecifier = rewriteSpecifier(node, node.moduleSpecifier);
        if (newSpecifier) {
          return factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            newSpecifier,
            node.assertClause
          );
        }
      }
      // export declarations with module specifier
      if (
        isExportDeclaration(node) &&
        node.moduleSpecifier &&
        isStringLiteral(node.moduleSpecifier)
      ) {
        const newSpecifier = rewriteSpecifier(node, node.moduleSpecifier);
        if (newSpecifier) {
          return factory.updateExportDeclaration(
            node,
            node.modifiers,
            node.isTypeOnly,
            node.exportClause,
            newSpecifier,
            node.assertClause
          );
        }
      }
      return visitEachChild(node, visitor, context);
    }

    return visitNode(sourceFile, visitor);
  };
}
