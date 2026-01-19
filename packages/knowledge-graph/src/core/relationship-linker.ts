/**
 * Generic relationship linking utilities (Layer 1)
 *
 * Provides patterns for linking entities based on code analysis.
 * Handles multi-key lookup, deduplication, and relationship creation.
 */

import type {EntityCache} from './entity-cache.js';

export interface LinkingConfig<TRef = unknown> {
  sourceFiles: string[];
  cache: EntityCache;
  getSourceId: (filePath: string) => number | undefined;
  extractReferences: (filePath: string, ...args: unknown[]) => TRef[];
  generateTargetKeys: (reference: TRef) => string[];
  createRelationship: (
    sourceId: number,
    targetId: number,
    label: string
  ) => void;
  relationshipLabel: string;
}

/**
 * Link entities based on file analysis
 *
 * @param config - Configuration for linking entities
 * @returns Number of relationships created
 */
export function linkEntitiesByFileAnalysis<TRef = unknown>(
  config: LinkingConfig<TRef>
): number {
  const {
    sourceFiles,
    cache,
    getSourceId,
    extractReferences,
    generateTargetKeys,
    createRelationship,
    relationshipLabel,
  } = config;

  let linkCount = 0;

  for (const filePath of sourceFiles) {
    const sourceId = getSourceId(filePath);
    if (!sourceId) continue;

    const references = extractReferences(filePath);
    const seenTargets = new Set<number>();

    for (const reference of references) {
      const targetKeys = generateTargetKeys(reference);

      // Try keys from most specific to least specific
      let targetId: number | undefined;
      for (const key of targetKeys) {
        targetId = cache.get(key);
        if (targetId) break;
      }

      if (targetId && !seenTargets.has(targetId)) {
        createRelationship(sourceId, targetId, relationshipLabel);
        seenTargets.add(targetId);
        linkCount++;
      }
    }
  }

  return linkCount;
}
