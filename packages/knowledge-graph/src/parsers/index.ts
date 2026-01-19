/**
 * TypeScript extraction utilities
 *
 * Layer 2: TypeScript Extraction (language-specific)
 */

export type {DtsExport, FileType, ScanOptions} from './file-scanner.js';
export * from './file-scanner.js';
export type {ImportResolution} from './import-resolver.js';
export {
  extractComponentName,
  findBuildFunctionCalls,
  resolveImports,
} from './import-resolver.js';
