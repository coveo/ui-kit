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
    const typeOnlyExports = new Set();

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
            // These are type-only exports
            typeOnlyExports.add(node.name.text);
          }
        }
      }

      // Named export declarations: export { name1, name2 } or export type { Type1, Type2 }
      if (
        isExportDeclaration(node) &&
        node.exportClause &&
        node.exportClause.kind === SyntaxKind.NamedExports
      ) {
        node.exportClause.elements.forEach((element) => {
          if (node.isTypeOnly || element.isTypeOnly) {
            // This is a type-only export
            typeOnlyExports.add(element.name.text);
          } else {
            exports.add(element.name.text);
          }
        });
      }

      // Export assignment: export = something (skip these)
      if (isExportAssignment(node)) {
        // These are default exports or module.exports style, skip
      }

      forEachChild(node, visit);
    }

    visit(sourceFile);

    // Return both runtime exports and type-only exports
    return {
      runtimeExports: Array.from(exports).sort(),
      typeOnlyExports: Array.from(typeOnlyExports).sort(),
    };
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

      const {runtimeExports, typeOnlyExports} =
        extractExportsFromAST(targetSourceFile);

      // Cache the result
      const result = {
        runtimeExports,
        typeOnlyExports,
      };
      exportCache.set(resolvedPath, result);

      return result;
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
      const exportsData = getNamedExportsFromModule(
        moduleSpecifier,
        sourceFile
      );

      if (exportsData) {
        const {runtimeExports, typeOnlyExports} = exportsData;
        const hasRuntimeExports = runtimeExports.length > 0;

        // Only process if we have runtime exports (drop type-only exports entirely)
        if (hasRuntimeExports) {
          const exportSpecifiers = [];

          // Create only runtime export specifiers (no type-only exports in JS)
          runtimeExports.forEach((name) => {
            exportSpecifiers.push(
              factory.createExportSpecifier(
                false, // isTypeOnly
                undefined, // propertyName (for aliases)
                factory.createIdentifier(name) // name
              )
            );
          });

          console.log(
            `Transforming wildcard export from "${moduleSpecifier}": ${runtimeExports.length} runtime exports (${typeOnlyExports.length} type-only exports dropped)`
          );

          // Create the export clause with only runtime exports
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
        } else if (typeOnlyExports.length > 0) {
          // If we only have type-only exports, remove the entire export statement
          console.log(
            `Removing wildcard export from "${moduleSpecifier}": only type-only exports (${typeOnlyExports.length} dropped)`
          );
          return undefined; // This removes the node
        }
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
