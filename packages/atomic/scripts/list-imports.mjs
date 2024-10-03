#!/usr/bin/env node
import {existsSync, readFileSync} from 'fs';
import {join, relative, resolve} from 'path';
import ts from 'typescript';

export function ensureFileExists(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File ${filePath} does not exist.`);
  }
}

function getSourceFile(containingFile, fileContent) {
  return ts.createSourceFile(
    containingFile,
    fileContent,
    ts.ScriptTarget.ES2021,
    true // SetParentNodes - useful for AST transformations
  );
}

function getImports(sourceFile, containingFile, compilerOptions) {
  const imports = new Set();

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

  const resolveAndAddImport = (importPath) => {
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

  const visit = (node) => {
    if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.getText().slice(1, -1); // Remove quotes
      const resolvedFileName =
        resolveAndAddImport(importPath) ||
        resolveAndAddImport(join(importPath, 'index')); // Check if the import is from an index file

      if (resolvedFileName) {
        const fileContent = readFileSync(resolvedFileName, 'utf-8');
        const sourceFile = getSourceFile(resolvedFileName, fileContent);
        ts.forEachChild(sourceFile, visit);
      }
    }
  };

  ts.forEachChild(sourceFile, visit);

  return Array.from(imports);
}

/**
 * Function to extract all import statements from a TypeScript file.
 * @param containingFile Path to the TypeScript file.
 * @returns A list of files that are imported by the input file.
 */
export function listImports(containingFile, projectRoot) {
  ensureFileExists(containingFile);
  const fileContent = readFileSync(containingFile, 'utf-8');
  const sourceFile = getSourceFile(containingFile, fileContent);

  const compilerOptions = {
    target: ts.ScriptTarget.ES2021,
  };

  const imports = getImports(sourceFile, containingFile, compilerOptions);

  const resolvedImports = imports.map((importPath) => {
    const absolutePath = resolve(importPath);
    return relative(projectRoot, absolutePath);
  });

  return resolvedImports;
}
