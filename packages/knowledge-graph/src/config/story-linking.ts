/**
 * Story relationship linking configuration (Layer 3)
 *
 * Defines how to extract Storybook stories and link them to components (RENDERS) and engines (USES_ENGINE).
 */

import fs from 'node:fs';
import path from 'node:path';
import type {EntityCache} from '../core/entity-cache.js';

/**
 * Story file glob pattern
 */
export const storyGlob = 'packages/atomic/src/**/*.new.stories.tsx';

/**
 * Story export pattern for extracting individual stories
 */
const STORY_EXPORT_REGEX = /export\s+const\s+(\w+):\s*Story\s*=/g;

/**
 * Extract story names from a story file
 * @param content - File content
 * @returns Array of story names
 */
export function extractStoryNames(content: string): string[] {
  const storyNames: string[] = [];
  const matches = content.matchAll(STORY_EXPORT_REGEX);
  for (const match of matches) {
    storyNames.push(match[1]);
  }
  return storyNames;
}

/**
 * Map wrapper function names to component names
 */
const wrapperToComponent: Record<string, string> = {
  wrapInSearchInterface: 'atomic-search-interface',
  wrapInResultList: 'atomic-result-list',
  wrapInResultTemplate: 'atomic-result-template',
  wrapInCommerceInterface: 'atomic-commerce-interface',
};

/**
 * Map wrapper function names to engine names
 */
const wrapperToEngine: Record<string, string> = {
  wrapInSearchInterface: 'SearchEngine',
  wrapInCommerceInterface: 'CommerceEngine',
};

export interface ComponentReference {
  componentName: string;
}

export interface EngineReference {
  engineName: string;
}

/**
 * Story-component linking rules (RENDERS relationship)
 */
export const storyComponentLinking = {
  // Relationship type
  relationshipLabel: 'RENDERS',

  /**
   * Extract main component name from file path
   * @param filePath - Path to story file
   * @returns Component name
   */
  getMainComponentFromPath: (filePath: string): string | null => {
    const fileNameMatch = path
      .basename(filePath)
      .match(/^(.+)\.new\.stories\.tsx$/);
    return fileNameMatch ? fileNameMatch[1] : null;
  },

  /**
   * Extract story ID from file path
   * @param filePath - Full path to story file
   * @param storyName - Name of the story
   * @param cache - Entity cache
   * @returns Story ID
   */
  getSourceId: (
    filePath: string,
    storyName: string,
    cache: EntityCache
  ): number | undefined => {
    const relativePath = filePath.replace(/^.*\/ui-kit\//, '');
    return cache.get(`story:${relativePath}:${storyName}`);
  },

  /**
   * Extract component references from story file
   * @param filePath - Full path to story file
   * @param storyName - Name of the story
   * @returns Array of component references
   */
  extractReferences: (
    filePath: string,
    storyName: string
  ): ComponentReference[] => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const mainComponent =
      storyComponentLinking.getMainComponentFromPath(filePath);
    const usedComponents = new Set<string>();

    // 1. Add main component if it exists
    if (mainComponent) {
      usedComponents.add(mainComponent);
    }

    // 2. Check for wrapper decorators to infer components
    for (const [wrapperFn, componentName] of Object.entries(
      wrapperToComponent
    )) {
      if (content.includes(wrapperFn)) {
        usedComponents.add(componentName);
      }
    }

    // 3. Find this story's block
    const storyBlockRegex = new RegExp(
      `export\\s+const\\s+${storyName}:\\s*Story\\s*=\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`,
      's'
    );
    const storyBlockMatch = content.match(storyBlockRegex);
    const storyBlock = storyBlockMatch ? storyBlockMatch[1] : '';

    // 4. Parse render function for HTML tags: <atomic-*>
    const componentTagMatches = storyBlock.matchAll(/<(atomic-[\w-]+)/g);
    for (const tagMatch of componentTagMatches) {
      usedComponents.add(tagMatch[1]);
    }

    return Array.from(usedComponents).map((componentName) => ({componentName}));
  },

  /**
   * Generate cache keys for finding component
   * @param reference - Reference object from extractReferences
   * @returns Cache keys in order of specificity
   */
  generateTargetKeys: (reference: ComponentReference): string[] => {
    const {componentName} = reference;

    // Try different component name variations (exact, PascalCase)
    const pascalCase = componentName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    return [`component:${componentName}`, `component:${pascalCase}`];
  },
};

/**
 * Story-engine linking rules (USES_ENGINE relationship)
 */
export const storyEngineLinking = {
  // Relationship type
  relationshipLabel: 'USES_ENGINE',

  /**
   * Extract story ID from file path
   * @param filePath - Full path to story file
   * @param storyName - Name of the story
   * @param cache - Entity cache
   * @returns Story ID
   */
  getSourceId: (
    filePath: string,
    storyName: string,
    cache: EntityCache
  ): number | undefined => {
    const relativePath = filePath.replace(/^.*\/ui-kit\//, '');
    return cache.get(`story:${relativePath}:${storyName}`);
  },

  /**
   * Extract engine reference from story file (only one per story)
   * @param filePath - Full path to story file
   * @returns Array of engine references
   */
  extractReferences: (filePath: string): EngineReference[] => {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Find which wrapper function is used to determine engine
    for (const [wrapperFn, engineName] of Object.entries(wrapperToEngine)) {
      if (content.includes(wrapperFn)) {
        return [{engineName}];
      }
    }

    return [];
  },

  /**
   * Generate cache keys for finding engine
   * @param reference - Reference object from extractReferences
   * @returns Cache keys
   */
  generateTargetKeys: (reference: EngineReference): string[] => {
    const {engineName} = reference;
    return [`engine:${engineName}`];
  },
};
