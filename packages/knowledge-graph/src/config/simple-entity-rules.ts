/**
 * Layer 3: Configuration for simple metadata-based entities
 *
 * This module provides a factory pattern for entities that:
 * - Have one entity per file
 * - Extract metadata from frontmatter or content
 * - Use consistent multi-key caching pattern
 * - Are leaf nodes (no relationship linking)
 *
 * Entity types: Instructions, Skills, Agents, Prompts
 */

import fs from 'node:fs';
import path from 'node:path';

export interface Metadata {
  name: string;
  description?: string;
  applyTo?: string;
  [key: string]: unknown;
}

export interface EntityConfig {
  label: string;
  icon: string;
  glob: string;
  extension: string;
  cachePrefix: string;
  extractMetadata: (content: string, filePath: string) => Metadata;
}

/**
 * Extract frontmatter metadata from markdown content
 */
function extractFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = match[1];
  const metadata: Record<string, string> = {};

  // Extract key-value pairs
  const patterns: Record<string, RegExp> = {
    name: /name:\s*['"]?([^'"]+)['"]?/,
    description: /description:\s*['"]?([^'"]+)['"]?/,
    applyTo: /applyTo:\s*['"]?([^'"]+)['"]?/,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const valueMatch = frontmatter.match(pattern);
    if (valueMatch) {
      metadata[key] = valueMatch[1];
    }
  }

  return metadata;
}

/**
 * Extract description from markdown content (fallback if no frontmatter)
 */
function extractDescriptionFromContent(content: string): string {
  // Try to find description after first heading
  const match =
    content.match(/^#\s*[^\n]+\n\n([^\n]+)/) ||
    content.match(/##\s*Description\s*\n\n([^\n]+)/i);

  return match ? match[1] : '';
}

/**
 * Entity type configurations
 */
export const simpleEntityConfigs: Record<string, EntityConfig> = {
  Instruction: {
    label: 'Instruction',
    icon: '📋',
    glob: '.github/instructions/*.instructions.md',
    extension: '.instructions.md',
    cachePrefix: 'instruction',

    extractMetadata: (content: string, filePath: string): Metadata => {
      const frontmatter = extractFrontmatter(content);
      const name = path.basename(filePath, '.instructions.md');

      return {
        name,
        applyTo: frontmatter.applyTo || '**',
        description: frontmatter.description || '',
      };
    },
  },

  Skill: {
    label: 'Skill',
    icon: '🎯',
    glob: '.claude/skills/*/SKILL.md',
    extension: 'SKILL.md',
    cachePrefix: 'skill',

    extractMetadata: (content: string, filePath: string): Metadata => {
      const name = path.basename(path.dirname(filePath));
      const description = extractDescriptionFromContent(content);

      return {
        name,
        description,
      };
    },
  },

  Agent: {
    label: 'Agent',
    icon: '🤖',
    glob: '.github/agents/*.agent.md',
    extension: '.agent.md',
    cachePrefix: 'agent',

    extractMetadata: (content: string, filePath: string): Metadata => {
      const frontmatter = extractFrontmatter(content);
      const fallbackName = path.basename(filePath, '.agent.md');

      return {
        name: frontmatter.name || fallbackName,
        description: frontmatter.description || '',
      };
    },
  },

  Prompt: {
    label: 'Prompt',
    icon: '💬',
    glob: '.github/prompts/*.prompt.md',
    extension: '.prompt.md',
    cachePrefix: 'prompt',

    extractMetadata: (content: string, filePath: string): Metadata => {
      const name = path.basename(filePath, '.prompt.md');
      const description = extractDescriptionFromContent(content);

      return {
        name,
        description,
      };
    },
  },
};

/**
 * Create an extractor function for a simple entity type
 *
 * @param config - Entity configuration
 * @param PROJECT_ROOT - Project root path
 * @param nodeCache - Entity cache
 * @param createNode - Node creation function
 * @param _createRelationship - Relationship creation function (unused)
 * @returns Async extractor function
 */
export function createSimpleEntityExtractor(
  config: EntityConfig,
  PROJECT_ROOT: string,
  nodeCache: {set: (keys: string | string[], value: number) => void},
  createNode: (labels: string[], properties: Record<string, unknown>) => number,
  _createRelationship: (start: number, end: number, label: string) => void
): () => Promise<void> {
  return async () => {
    const {label, icon, glob: pattern, cachePrefix, extractMetadata} = config;

    // We need to import glob dynamically since it's passed as context in original
    const {glob} = await import('glob');
    const getRelativePath = (fullPath: string) =>
      path.relative(PROJECT_ROOT, fullPath).replace(/\\/g, '/');

    console.log(`${icon} Extracting ${label.toLowerCase()}s...`);

    const files = await glob(pattern, {cwd: PROJECT_ROOT});

    for (const filePath of files) {
      const fullPath = path.join(PROJECT_ROOT, filePath);
      const relativePath = getRelativePath(fullPath);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Extract metadata using entity-specific logic
      const metadata = extractMetadata(content, fullPath);

      // Create node
      const nodeId = createNode([label], {
        path: relativePath,
        ...metadata,
      });

      // Multi-key caching: path (primary), name, and name:path for disambiguation
      nodeCache.set(
        [
          `${cachePrefix}:${relativePath}`,
          `${cachePrefix}:${metadata.name}`,
          `${cachePrefix}:${metadata.name}:${relativePath}`,
        ],
        nodeId
      );
    }

    console.log(
      `  ✓ Found ${files.length} ${label.toLowerCase()}${files.length !== 1 ? 's' : ''}`
    );
  };
}
