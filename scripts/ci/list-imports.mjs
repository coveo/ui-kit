#!/usr/bin/env node
import {existsSync, lstatSync, readFileSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';
import ts from 'typescript';

export function ensureFileExists(filePath) {
  if (!existsSync(filePath)) {
    return false;
  }
  return true;
}

function getSourceFile(containingFile, fileContent) {
  return ts.createSourceFile(
    containingFile,
    fileContent,
    ts.ScriptTarget.ES2021,
    true // SetParentNodes - useful for AST transformations
  );
}

function getImports(sourceFile, filePath, compilerOptions) {
  const imports = new Set();
  const alreadyResolved = new Set();

  const moduleResolutionHost = {
    fileExists: (filePath) => existsSync(filePath),
    readFile: (filePath) => {
      try {
        return readFileSync(filePath, 'utf8');
      } catch {
        return undefined;
      }
    },
  };

  const resolveAndAddImport = (containingFile, importPath) => {
    const {resolvedModule} = ts.resolveModuleName(
      importPath,
      containingFile,
      compilerOptions,
      moduleResolutionHost
    );

    if (!resolvedModule) {
      return null;
    }

    imports.add(resolvedModule.resolvedFileName);
    return resolvedModule.resolvedFileName;
  };

  const visit = (node, currentFile) => {
    if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes

      if (
        !alreadyResolved.has(importPath) &&
        importPath.startsWith('@coveo/headless')
      ) {
        alreadyResolved.add(importPath);
        imports.add(importPath);
        return;
      }

      const resolvedFileName =
        resolveAndAddImport(currentFile, importPath) ||
        resolveAndAddImport(currentFile, join(importPath, 'index')); // Check if the import is from an index file

      if (resolvedFileName && !alreadyResolved.has(resolvedFileName)) {
        alreadyResolved.add(resolvedFileName);
        const fileContent = readFileSync(resolvedFileName, 'utf-8');
        const sourceFile = getSourceFile(resolvedFileName, fileContent);
        ts.forEachChild(sourceFile, (childNode) =>
          visit(childNode, resolvedFileName)
        );
      }
    }
  };

  ts.forEachChild(sourceFile, (node) => visit(node, filePath));

  return Array.from(imports);
}

/**
 * Function to extract all import statements from a TypeScript file.
 * @param filePath Path to the TypeScript file.
 * @returns A list of files that are imported by the input file.
 */
export function listImports(projectRoot, filePath) {
  ensureFileExists(filePath);
  const fileContent = readFileSync(filePath, 'utf-8');
  const sourceFile = getSourceFile(filePath, fileContent);

  const compilerOptions = {
    target: ts.ScriptTarget.ES2021,
  };

  const imports = getImports(sourceFile, filePath, compilerOptions);

  const resolvedImports = imports.map((importPath) => {
    const absolutePath = resolve(importPath);
    return relative(projectRoot, absolutePath);
  });

  return resolvedImports;
}

function listDependencies(projectRoot, filePath) {
  const dependencies = new Set();
  const alreadyResolved = new Set();
  const compilerOptions = {
    target: ts.ScriptTarget.ES2021,
  };

  const moduleResolutionHost = {
    fileExists: (filePath) => existsSync(filePath),
    readFile: (filePath) => {
      try {
        return readFileSync(filePath, 'utf8');
      } catch {
        return undefined;
      }
    },
  };

  const addResolved = (containingFile, exportPath) => {
    const {resolvedModule} = ts.resolveModuleName(
      exportPath,
      containingFile,
      compilerOptions,
      moduleResolutionHost
    );

    if (!resolvedModule) {
      return null;
    }

    dependencies.add(resolvedModule.resolvedFileName);
    return resolvedModule.resolvedFileName;
  };

  const processResolvedFile = (resolvedFileName) => {
    if (resolvedFileName && !alreadyResolved.has(resolvedFileName)) {
      try {
        alreadyResolved.add(resolvedFileName);
        if (!lstatSync(resolvedFileName).isFile()) {
          return;
        }
        const fileContent = readFileSync(resolvedFileName, 'utf-8');
        const sourceFile = getSourceFile(resolvedFileName, fileContent);
        ts.forEachChild(sourceFile, (childNode) =>
          visit(childNode, resolvedFileName)
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const visit = (node, currentFile) => {
    if (!node.moduleSpecifier || node.importClause?.isTypeOnly) {
      return;
    }

    if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes
      const resolvedFileName = addResolved(currentFile, importPath);
      processResolvedFile(resolvedFileName);
    } else if (ts.isExportDeclaration(node)) {
      const exportPath = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes
      const resolvedFileName = addResolved(currentFile, exportPath);
      processResolvedFile(resolvedFileName);
    }
  };

  ts.forEachChild(projectRoot, (node) => visit(node, filePath));
  return Array.from(dependencies);
}

/**
 * Function to extract all export statements from a TypeScript file that re-export from other modules.
 * @param projectRoot Root directory of the project.
 * @param filePath Path to the TypeScript file.
 * @returns A list of files that are re-exported by the input file.
 */
export function listExports(projectRoot, filePath) {
  ensureFileExists(filePath);
  const fileContent = readFileSync(filePath, 'utf-8');
  const sourceFile = getSourceFile(filePath, fileContent);

  const compilerOptions = {
    target: ts.ScriptTarget.ES2021,
  };

  const exports = listDependencies(sourceFile, filePath, compilerOptions);

  const resolvedExports = exports.map((exportPath) => {
    const absolutePath = resolve(exportPath);
    return relative(projectRoot, absolutePath);
  });

  return resolvedExports;
}

/**
 * Function to deeply extract all export dependencies from a TypeScript file.
 * This follows the chain of re-exports to find all ultimate dependencies.
 * @param projectRoot Root directory of the project.
 * @param indexFilePath Path to the TypeScript index file.
 * @returns A list of all files that are transitively exported by the input file.
 */
export function listExportsFromIndex(projectRoot, indexFilePath) {
  ensureFileExists(indexFilePath);
  const fileContent = readFileSync(indexFilePath, 'utf-8');
  const sourceFile = getSourceFile(indexFilePath, fileContent);

  const exports = listDependencies(sourceFile, indexFilePath);

  const resolvedExports = exports.map((exportPath) => {
    const absolutePath = resolve(exportPath);
    return relative(projectRoot, absolutePath);
  });

  return resolvedExports;
}
