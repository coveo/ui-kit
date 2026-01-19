/**
 * Scalability configuration for knowledge graph generation
 *
 * Controls performance optimizations and selective processing
 */

/**
 * Global ignore patterns for file scanning
 * Excludes build artifacts, caches, and generated files
 */
export const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/dist-*/**',
  '**/cdn/**',
  '**/build/**',
  '**/.turbo/**',
  '**/coverage/**',
  '**/.next/**',
  '**/.cache/**',
];

/**
 * File patterns to exclude from import analysis
 * These files are scanned but their imports are not tracked
 */
export const SKIP_IMPORT_ANALYSIS = [
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.config.ts',
  '**/*.config.js',
  '**/*.config.mjs',
];

/**
 * Performance settings
 */
export const PERFORMANCE_CONFIG = {
  // Maximum files to process in parallel
  maxParallelFiles: 50,

  // Enable caching of import analysis results
  enableCaching: true,

  // Cache file location
  cacheFile: 'node_modules/.cache/knowledge-graph/imports-cache.json',

  // Only analyze changed files (requires git)
  incrementalMode: false,

  // Maximum import depth to track (prevents deep recursion)
  maxImportDepth: 20,
};

/**
 * Selective generation modes
 */
export type GenerationMode =
  | 'full' // Full graph regeneration
  | 'incremental' // Only changed files
  | 'files-only' // Skip relationship linking
  | 'imports-only'; // Only update import relationships

/**
 * Get ignore patterns for a specific operation
 */
export function getIgnorePatterns(includeTests: boolean = false): string[] {
  const patterns = [...IGNORE_PATTERNS];

  if (!includeTests) {
    patterns.push('**/*.spec.*', '**/*.test.*');
  }

  return patterns;
}

/**
 * Check if a file should skip import analysis
 */
export function shouldSkipImportAnalysis(filePath: string): boolean {
  return SKIP_IMPORT_ANALYSIS.some((pattern) => {
    const regex = new RegExp(
      pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
    );
    return regex.test(filePath);
  });
}
