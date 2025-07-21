#!/usr/bin/env node
import {existsSync, readFileSync} from 'node:fs';
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
