/**
 * Knowledge Graph - Main Entry Point
 *
 * Export core modules and TypeScript utilities for programmatic use.
 * Binary entry points (generate-graph, import-to-memgraph, mcp-server)
 * are in src/bin/ and accessed via package.json scripts.
 */

// L3: Domain configuration (optional - most users won't need these)
export type {
  ActionData,
  ComponentData,
  ControllerProperties,
  PackageType,
  ReducerData,
  TestEntityData,
} from './config/index.js';
export type {
  CacheKey,
  CacheKeys,
  GraphStats,
  NodeData,
  NodeId,
  RelationshipData,
} from './core/index.js';
// L1: Core primitives
export {EntityCache, GraphBuilder} from './core/index.js';
export type {
  DtsExport,
  FileType,
  ImportResolution,
  ScanOptions,
} from './parsers/index.js';
// L2: TypeScript utilities
export {
  detectFileType,
  extractComponentName,
  findBuildFunctionCalls,
  getFileStats,
  getRelativePath,
  parseDtsExports,
  readFile,
  resolveImports,
  scanFiles,
} from './parsers/index.js';
