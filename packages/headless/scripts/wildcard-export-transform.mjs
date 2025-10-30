import {existsSync, readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {
  createSourceFile,
  forEachChild,
  isClassDeclaration,
  isEnumDeclaration,
  isExportAssignment,
  isExportDeclaration,
  isFunctionDeclaration,
  isInterfaceDeclaration,
  isStringLiteral,
  isTypeAliasDeclaration,
  isVariableStatement,
  ScriptTarget,
  SyntaxKind,
  visitEachChild,
  visitNode,
} from 'typescript';

/**
 * Custom transformer to replace `export * from 'module'` with `export { name1, name2, ... } from 'module'`.
 * This helps with tree-shaking and explicit exports.
 */
export default function wildcardExportTransformer(context) {
  const {factory} = context;
  const exportCache = new Map(); // Cache to avoid re-parsing the same files

  function hasExportModifier(node) {
    return node.modifiers?.some(
      (modifier) => modifier.kind === SyntaxKind.ExportKeyword
    );
  }

  function resolveModulePath(moduleSpecifier, sourceFile) {
    const currentDir = dirname(sourceFile.fileName);
    let resolvedPath;

    // Handle relative imports
    if (moduleSpecifier.startsWith('./') || moduleSpecifier.startsWith('../')) {
      // Convert .js imports to .ts since the transformer sees the import as .js but the source files are .ts
      const baseSpecifier = moduleSpecifier.replace(/\.js$/, '');
      const basePath = resolve(currentDir, baseSpecifier);

      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx'];
      for (const ext of extensions) {
        const fullPath = basePath + ext;
        if (existsSync(fullPath)) {
          resolvedPath = fullPath;
          break;
        }
      }

      // Try with index file
      if (!resolvedPath) {
        for (const ext of extensions) {
          const indexPath = join(basePath, `index${ext}`);
          if (existsSync(indexPath)) {
            resolvedPath = indexPath;
            break;
          }
        }
      }
    }

    return resolvedPath;
  }

  function extractExportsFromAST(sourceFile) {
    const exports = new Set();

    function visit(node) {
      // Direct exports: export function, export class, export const, etc.
      if (hasExportModifier(node)) {
        if (isFunctionDeclaration(node) || isClassDeclaration(node)) {
          if (node.name) {
            exports.add(node.name.text);
          }
        } else if (isVariableStatement(node)) {
          node.declarationList.declarations.forEach((decl) => {
            if (decl.name && decl.name.kind === SyntaxKind.Identifier) {
              exports.add(decl.name.text);
            }
          });
        } else if (
          isInterfaceDeclaration(node) ||
          isTypeAliasDeclaration(node) ||
          isEnumDeclaration(node)
        ) {
          if (node.name) {
            exports.add(node.name.text);
          }
        }
      }

      // Named export declarations: export { name1, name2 }
      if (
        isExportDeclaration(node) &&
        node.exportClause &&
        node.exportClause.kind === SyntaxKind.NamedExports
      ) {
        node.exportClause.elements.forEach((element) => {
          exports.add(element.name.text);
        });
      }

      // Export assignment: export = something (skip these)
      if (isExportAssignment(node)) {
        // These are default exports or module.exports style, skip
      }

      forEachChild(node, visit);
    }

    visit(sourceFile);
    return Array.from(exports).sort();
  }

  function getNamedExportsFromModule(moduleSpecifier, sourceFile) {
    const resolvedPath = resolveModulePath(moduleSpecifier, sourceFile);

    if (!resolvedPath) {
      console.warn(`Could not resolve module path for "${moduleSpecifier}"`);
      return null;
    }

    // Check cache first
    if (exportCache.has(resolvedPath)) {
      return exportCache.get(resolvedPath);
    }

    try {
      const sourceText = readFileSync(resolvedPath, 'utf8');
      const targetSourceFile = createSourceFile(
        resolvedPath,
        sourceText,
        ScriptTarget.Latest,
        true
      );

      const exports = extractExportsFromAST(targetSourceFile);

      // Cache the result
      exportCache.set(resolvedPath, exports);

      return exports.length > 0 ? exports : null;
    } catch (error) {
      console.warn(`Could not parse file "${resolvedPath}":`, error.message);
      return null;
    }
  }

  function visit(node, sourceFile) {
    // Check if this node is an export declaration with wildcard export (export * from 'module')
    if (
      isExportDeclaration(node) &&
      node.moduleSpecifier &&
      isStringLiteral(node.moduleSpecifier) &&
      !node.exportClause && // No export clause means it's a wildcard export
      !node.isTypeOnly // Skip type-only exports
    ) {
      const moduleSpecifier = node.moduleSpecifier.text;
      const namedExports = getNamedExportsFromModule(
        moduleSpecifier,
        sourceFile
      );

      if (namedExports && namedExports.length > 0) {
        console.log(
          `Transforming wildcard export from "${moduleSpecifier}" to ${namedExports.length} named exports:`,
          namedExports.slice(0, 5),
          namedExports.length > 5
            ? `... and ${namedExports.length - 5} more`
            : ''
        );

        // Create named export specifiers
        const exportSpecifiers = namedExports.map((name) =>
          factory.createExportSpecifier(
            false, // isTypeOnly
            undefined, // propertyName (for aliases)
            factory.createIdentifier(name) // name
          )
        );

        // Create the export clause with named exports
        const exportClause = factory.createNamedExports(exportSpecifiers);

        // Create the new export declaration
        return factory.updateExportDeclaration(
          node,
          node.modifiers,
          false, // isTypeOnly
          exportClause,
          node.moduleSpecifier,
          node.assertClause
        );
      } else {
        console.log(
          `No named exports found for wildcard export from "${moduleSpecifier}", keeping as-is`
        );
      }
    }

    return visitEachChild(node, (child) => visit(child, sourceFile), context);
  }

  return (sourceFile) =>
    visitNode(sourceFile, (node) => visit(node, sourceFile));
}
