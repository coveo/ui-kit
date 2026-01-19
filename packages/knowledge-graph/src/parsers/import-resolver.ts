/**
 * Import resolution utilities using ts-morph for TypeScript analysis.
 * Extracts imports, resolves aliases, and finds build function calls.
 */

import fs from 'node:fs';
import path from 'node:path';
import {Project, type SourceFile, SyntaxKind} from 'ts-morph';

export interface ImportResolution {
  importMap: Map<string, string>;
  importSources: Map<string, string>;
}

/**
 * Resolves imports from a TypeScript file, extracting aliases and sources.
 * @param filePath - Absolute path to the TypeScript file
 * @returns Import map (alias -> original name) and import sources (name -> package path)
 */
export function resolveImports(filePath: string): ImportResolution {
  const project = new Project({skipAddingFilesFromTsConfig: true});
  const sourceFile = project.addSourceFileAtPath(filePath);

  const importMap = new Map<string, string>(); // alias -> original name
  const importSources = new Map<string, string>(); // name -> package path

  for (const importDecl of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    const namedImports = importDecl.getNamedImports();
    for (const namedImport of namedImports) {
      const name = namedImport.getName();
      const alias = namedImport.getAliasNode()?.getText() || name;

      if (alias !== name) {
        importMap.set(alias, name); // Track: alias -> original
      }
      importSources.set(name, moduleSpecifier); // Track: original -> package
    }
  }

  return {importMap, importSources};
}

/**
 * Finds build function calls in a TypeScript component file.
 * @param filePath - Absolute path to the TypeScript file
 * @param importMap - Map of aliases to original names
 * @returns Array of build function names (resolved from aliases)
 */
export function findBuildFunctionCalls(
  filePath: string,
  importMap: Map<string, string>
): string[] {
  const project = new Project({skipAddingFilesFromTsConfig: true});
  const sourceFile = project.addSourceFileAtPath(filePath);

  const buildFunctions = new Set<string>();

  // Find all call expressions using ts-morph's typed methods
  for (const callExpr of sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  )) {
    const expr = callExpr.getExpression();

    if (expr.getKind() === SyntaxKind.Identifier) {
      const functionName = expr.getText();

      // Check if it starts with 'build'
      if (functionName.startsWith('build')) {
        // Resolve alias to original name
        const originalName = importMap.get(functionName) || functionName;
        buildFunctions.add(originalName);
      }
    }
  }

  return Array.from(buildFunctions);
}

/**
 * Extracts the component class name from a TypeScript file.
 * Handles both Lit components (extends LitElement) and Stencil components (@Component decorator).
 * @param filePath - Absolute path to the TypeScript file
 * @returns Component class name or null
 */
export function extractComponentName(filePath: string): string | null {
  const project = new Project({skipAddingFilesFromTsConfig: true});
  const sourceFile = project.addSourceFileAtPath(filePath);

  // Find classes that extend LitElement (or mixins containing LitElement)
  for (const classDecl of sourceFile.getClasses()) {
    const heritage = classDecl.getExtends();
    if (heritage) {
      const heritageText = heritage.getText();
      if (heritageText.includes('LitElement')) {
        return classDecl.getName() || null;
      }
    }

    // Check for Stencil @Component decorator
    const decorators = classDecl.getDecorators();
    for (const decorator of decorators) {
      if (decorator.getName() === 'Component') {
        return classDecl.getName() || null;
      }
    }
  }

  return null;
}

/**
 * Represents a file import with resolution information
 */
export interface FileImport {
  importedFrom: string; // Module specifier (e.g., '../utils/helpers', '@/decorators', 'lit')
  resolvedPath?: string; // Resolved absolute path (if local file)
  isExternal: boolean; // Whether it's an external npm package
  isInternal: boolean; // Whether it's an internal @coveo/ package
  packageName?: string; // Package name if external (e.g., 'lit', '@coveo/headless')
  line: number; // Line number in source
}

/**
 * Extract all import declarations with resolved file paths
 * Handles path aliases (@/*), internal packages (@coveo/*), and external packages
 * @param filePath - Absolute path to source file
 * @param projectRoot - Project root directory
 * @returns Array of import info with resolved paths
 */
export function extractFileImports(
  filePath: string,
  projectRoot: string
): FileImport[] {
  const project = new Project({skipAddingFilesFromTsConfig: true});
  let sourceFile: SourceFile;

  try {
    sourceFile = project.addSourceFileAtPath(filePath);
  } catch (_error) {
    // Skip files that can't be parsed
    return [];
  }

  const imports: FileImport[] = [];
  const sourceFileDir = path.dirname(filePath);

  // Load tsconfig to get path aliases
  const packageDir = findPackageDir(filePath, projectRoot);
  const pathAliases = packageDir ? loadPathAliases(packageDir) : {};

  for (const importDecl of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    const line = importDecl.getStartLineNumber();

    // Classify import type
    const isRelative =
      moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/');
    const isPathAlias =
      !isRelative &&
      (moduleSpecifier.startsWith('@/') ||
        Object.keys(pathAliases).some((alias) =>
          moduleSpecifier.startsWith(alias)
        ));
    const isInternal = moduleSpecifier.startsWith('@coveo/');
    const isExternal = !isRelative && !isPathAlias && !isInternal;

    let resolvedPath: string | undefined;
    let packageName: string | undefined;

    if (isExternal) {
      // External npm package - extract package name
      packageName = extractPackageName(moduleSpecifier);
    } else if (isInternal) {
      // Internal @coveo/ package - it's external to current package but internal to monorepo
      packageName = extractPackageName(moduleSpecifier);
    } else if (isPathAlias) {
      // Path alias - resolve using tsconfig paths
      resolvedPath = resolvePathAlias(
        moduleSpecifier,
        packageDir!,
        pathAliases
      );
    } else if (isRelative) {
      // Relative import - resolve from source file directory
      resolvedPath = resolveRelativeImport(moduleSpecifier, sourceFileDir);
    }

    imports.push({
      importedFrom: moduleSpecifier,
      resolvedPath,
      isExternal: isExternal || isInternal,
      isInternal,
      packageName,
      line,
    });
  }

  return imports;
}

/**
 * Find the package directory containing a file
 * @param filePath - Absolute file path
 * @param projectRoot - Project root directory
 * @returns Package directory path or null
 */
function findPackageDir(filePath: string, projectRoot: string): string | null {
  let dir = path.dirname(filePath);

  while (dir.startsWith(projectRoot)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

/**
 * Load path aliases from tsconfig.json
 * @param packageDir - Package directory
 * @returns Map of path aliases
 */
function loadPathAliases(packageDir: string): Record<string, string[]> {
  const tsconfigPath = path.join(packageDir, 'tsconfig.json');

  if (!fs.existsSync(tsconfigPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(tsconfigPath, 'utf-8');
    // Remove comments and parse
    const cleaned = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    const tsconfig = JSON.parse(cleaned);
    return tsconfig.compilerOptions?.paths || {};
  } catch (_error) {
    return {};
  }
}

/**
 * Resolve path alias to absolute path
 * @param moduleSpecifier - Import specifier with alias
 * @param packageDir - Package directory
 * @param pathAliases - Path aliases from tsconfig
 * @returns Resolved absolute path or undefined
 */
function resolvePathAlias(
  moduleSpecifier: string,
  packageDir: string,
  pathAliases: Record<string, string[]>
): string | undefined {
  // Find matching alias pattern
  for (const [aliasPattern, aliasPaths] of Object.entries(pathAliases)) {
    const pattern = aliasPattern.replace('*', '(.*)');
    const regex = new RegExp(`^${pattern}$`);
    const match = moduleSpecifier.match(regex);

    if (match) {
      const wildcardValue = match[1] || '';

      // Try each alias path
      for (const aliasPath of aliasPaths) {
        const resolvedPattern = aliasPath.replace('*', wildcardValue);
        const fullPath = path.join(packageDir, resolvedPattern);

        // Try with various extensions
        const resolved = tryResolveFile(fullPath);
        if (resolved) return resolved;
      }
    }
  }

  return undefined;
}

/**
 * Resolve relative import to absolute path
 * @param moduleSpecifier - Relative import specifier
 * @param sourceFileDir - Directory of the source file
 * @returns Resolved absolute path or undefined
 */
function resolveRelativeImport(
  moduleSpecifier: string,
  sourceFileDir: string
): string | undefined {
  const resolved = path.resolve(sourceFileDir, moduleSpecifier);
  return tryResolveFile(resolved);
}

/**
 * Try to resolve a file path with various extensions
 * @param basePath - Base path without extension
 * @returns Resolved path or undefined
 */
function tryResolveFile(basePath: string): string | undefined {
  // Try common extensions
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.d.ts'];

  for (const ext of extensions) {
    const testPath = basePath + ext;
    if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
      return testPath;
    }
  }

  // Try index files
  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    const indexPath = path.join(basePath, `index${ext}`);
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      return indexPath;
    }
  }

  return undefined;
}

/**
 * Extract package name from module specifier
 * @param moduleSpecifier - Import module specifier
 * @returns Package name
 */
function extractPackageName(moduleSpecifier: string): string {
  // Handle scoped packages (@org/package)
  if (moduleSpecifier.startsWith('@')) {
    const parts = moduleSpecifier.split('/');
    return parts.slice(0, 2).join('/');
  }

  // Handle regular packages (package/subpath)
  return moduleSpecifier.split('/')[0];
}
