#!/usr/bin/env node
import {existsSync, readFileSync} from 'fs';
import {dirname, extname, isAbsolute, relative, resolve} from 'path';
import ts from 'typescript';

export function ensureFileExists(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File ${filePath} does not exist.`);
  }
}

function getImports(sourceFile) {
  const imports = [];

  const visit = (node) => {
    if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.text;
      // TODO: should have the extension in the import path
      imports.push(importPath);
    }

    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);

  return imports;
}

/**
 * Function to extract all import statements from a TypeScript file.
 * @param filePath Path to the TypeScript file.
 * @returns A list of files that are imported by the input file.
 */
export function listImports(filePath, projectRoot) {
  ensureFileExists(filePath);
  const fileContent = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.ES2015,
    true // SetParentNodes - useful for AST transformations
  );
  const imports = getImports(sourceFile);

  const resolvedImports = imports.map((importPath) => {
    const absolutePath = isAbsolute(importPath)
      ? importPath
      : resolve(dirname(filePath), importPath);

    if (!extname(absolutePath)) {
      const extensions = ['.ts', '.tsx'];
      for (const ext of extensions) {
        const filePath = absolutePath.concat(ext);
        if (existsSync(filePath)) {
          return relative(projectRoot, filePath);
        }
        // TODO: handle the case where the file does not exist
      }
    }
    return relative(projectRoot, absolutePath);
  });

  return resolvedImports;
}
