/**
 * File scanning utilities for TypeScript/JavaScript projects
 *
 * Layer 2: TypeScript Extraction (language-specific)
 */

import fs from 'node:fs';
import path from 'node:path';
import {glob} from 'glob';

export interface ScanOptions {
  cwd?: string;
  ignore?: string[];
}

export interface DtsExport {
  buildFunction: string;
  returnType: string;
}

export type FileType = 'test' | 'story' | 'config' | 'source';

/**
 * Scan files matching glob patterns
 * @param patterns - Glob pattern(s)
 * @param options - Glob options
 * @returns Array of file paths
 */
export async function scanFiles(
  patterns: string | string[],
  options: ScanOptions = {}
): Promise<string[]> {
  const {cwd, ignore} = options;

  if (Array.isArray(patterns)) {
    // Handle multiple patterns
    const allFiles = await Promise.all(
      patterns.map((pattern) => glob(pattern, {cwd, ignore}))
    );
    return allFiles.flat();
  }

  return glob(patterns, {cwd, ignore});
}

/**
 * Read file content
 * @param filePath - Absolute path to file
 * @returns File content
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Get file stats
 * @param filePath - Absolute path to file
 * @returns File stats from fs.statSync
 */
export function getFileStats(filePath: string): fs.Stats {
  return fs.statSync(filePath);
}

/**
 * Parse .d.ts file for exported build functions
 * @param content - File content
 * @returns Array of exported build functions with return types
 */
export function parseDtsExports(content: string): DtsExport[] {
  const exports: DtsExport[] = [];

  // Match: export declare function buildX(...): ReturnType
  const regex =
    /export\s+declare\s+function\s+(build\w+)\s*\([^)]*\)\s*:\s*(\w+)/g;

  for (const match of content.matchAll(regex)) {
    exports.push({
      buildFunction: match[1],
      returnType: match[2],
    });
  }

  return exports;
}

/**
 * Detect file type from name/path
 * @param fileName - File name
 * @returns File type: 'test', 'story', 'config', or 'source'
 */
export function detectFileType(fileName: string): FileType {
  if (fileName.includes('.spec.') || fileName.includes('.test.')) {
    return 'test';
  }
  if (fileName.includes('.stories.')) {
    return 'story';
  }
  if (
    fileName.includes('.config.') ||
    fileName.endsWith('rc.js') ||
    fileName.endsWith('rc.ts')
  ) {
    return 'config';
  }
  return 'source';
}

/**
 * Get relative path from base directory
 * @param basePath - Base directory path
 * @param targetPath - Target file path
 * @returns Relative path
 */
export function getRelativePath(basePath: string, targetPath: string): string {
  return path.relative(basePath, targetPath);
}
