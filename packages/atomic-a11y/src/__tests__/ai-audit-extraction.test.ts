import {describe, expect, it} from 'vitest';
import {extractComponentName, selectStories} from '../audit/ai-wcag-audit.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

interface StoryEntry {
  type: string;
  title?: string;
  name?: string;
  importPath?: string;
  [key: string]: unknown;
}

function makeConfig(overrides: Record<string, unknown> = {}): {
  surface: string;
  component: string | null;
  dryRun: boolean;
  resume: boolean;
  maxComponents: number;
  model: string;
  concurrency: number;
  logSteps: boolean;
  verbose: boolean;
  saveCaptures: boolean;
  storybookUrl: string;
  help: boolean;
} {
  return {
    surface: 'all',
    component: null,
    dryRun: false,
    resume: false,
    maxComponents: Infinity,
    model: 'gpt-4o',
    concurrency: 1,
    logSteps: false,
    verbose: false,
    saveCaptures: false,
    storybookUrl: 'http://localhost:4400',
    help: false,
    ...overrides,
  };
}

function makeEntry(opts: {
  surface: string;
  importPath: string;
  name?: string;
}): StoryEntry {
  return {
    type: 'story',
    title: `${opts.surface}/Example Pages`,
    name: opts.name ?? 'Default',
    importPath: opts.importPath,
  };
}

// ── extractComponentName — Page paths ───────────────────────────────────────

describe('extractComponentName (ai-wcag-audit)', () => {
  describe('page paths (storybook-pages)', () => {
    it('should return search-page for search/search.new.stories.tsx', () => {
      expect(
        extractComponentName('./storybook-pages/search/search.new.stories.tsx')
      ).toBe('search-page');
    });

    it('should return search-interaction-page for search/search-interaction.new.stories.tsx', () => {
      expect(
        extractComponentName(
          './storybook-pages/search/search-interaction.new.stories.tsx'
        )
      ).toBe('search-interaction-page');
    });

    it('should return search-page for commerce/search.new.stories.tsx', () => {
      expect(
        extractComponentName(
          './storybook-pages/commerce/search.new.stories.tsx'
        )
      ).toBe('search-page');
    });

    it('should return product-listing-page for commerce/product-listing.new.stories.tsx', () => {
      expect(
        extractComponentName(
          './storybook-pages/commerce/product-listing.new.stories.tsx'
        )
      ).toBe('product-listing-page');
    });

    it('should return recommendation-page for commerce/recommendation.new.stories.tsx', () => {
      expect(
        extractComponentName(
          './storybook-pages/commerce/recommendation.new.stories.tsx'
        )
      ).toBe('recommendation-page');
    });

    it('should return insight-page for insight/insight.new.stories.tsx', () => {
      expect(
        extractComponentName(
          './storybook-pages/insight/insight.new.stories.tsx'
        )
      ).toBe('insight-page');
    });

    it('should return ipx-page for ipx/ipx.new.stories.tsx', () => {
      expect(
        extractComponentName('./storybook-pages/ipx/ipx.new.stories.tsx')
      ).toBe('ipx-page');
    });

    it('should return recommendations-page for recommendations/recommendations.new.stories.tsx', () => {
      expect(
        extractComponentName(
          './storybook-pages/recommendations/recommendations.new.stories.tsx'
        )
      ).toBe('recommendations-page');
    });
  });

  // ── Component paths ─────────────────────────────────────────────────────

  describe('component paths', () => {
    it('should extract atomic-commerce-facet from a commerce facet component path', () => {
      expect(
        extractComponentName(
          './src/components/commerce/facets/atomic-commerce-facet/atomic-commerce-facet.new.stories.tsx'
        )
      ).toBe('atomic-commerce-facet');
    });

    it('should extract atomic-search-box from a search component path', () => {
      expect(
        extractComponentName(
          './src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx'
        )
      ).toBe('atomic-search-box');
    });

    it('should extract atomic-facet from a nested facets directory path', () => {
      expect(
        extractComponentName(
          './src/components/search/facets/atomic-facet/atomic-facet.new.stories.tsx'
        )
      ).toBe('atomic-facet');
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should return null for undefined importPath', () => {
      expect(extractComponentName(undefined)).toBeNull();
    });

    it('should return null for empty string importPath', () => {
      expect(extractComponentName('')).toBeNull();
    });

    it('should return null for an unrecognized path', () => {
      expect(extractComponentName('./some/random/path.ts')).toBeNull();
    });

    it('should return null for a page path without .new. in the filename', () => {
      expect(
        extractComponentName('./storybook-pages/search/search.stories.tsx')
      ).toBeNull();
    });
  });
});

// ── selectStories ───────────────────────────────────────────────────────────

describe('selectStories', () => {
  it('should include page stories (not filter them out)', () => {
    const entries: Record<string, StoryEntry> = {
      'search-example-pages--default': makeEntry({
        surface: 'Search',
        importPath: './storybook-pages/search/search.new.stories.tsx',
      }),
    };

    const result = selectStories(entries, makeConfig());

    expect(result.has('search/search-page')).toBe(true);
    expect(result.get('search/search-page')).toHaveLength(1);
  });

  it('should keep cross-surface entries with the same component name separate', () => {
    const entries: Record<string, StoryEntry> = {
      'search-example-pages--default': makeEntry({
        surface: 'Search',
        importPath: './storybook-pages/search/search.new.stories.tsx',
        name: 'Default',
      }),
      'commerce-example-pages--default': makeEntry({
        surface: 'Commerce',
        importPath: './storybook-pages/commerce/search.new.stories.tsx',
        name: 'Default',
      }),
    };

    const result = selectStories(entries, makeConfig());

    expect(result.has('search/search-page')).toBe(true);
    expect(result.has('commerce/search-page')).toBe(true);
    expect(result.size).toBeGreaterThanOrEqual(2);
  });

  it('should filter by component name when config.component is set', () => {
    const entries: Record<string, StoryEntry> = {
      'search-example-pages--default': makeEntry({
        surface: 'Search',
        importPath: './storybook-pages/search/search.new.stories.tsx',
      }),
      'commerce-example-pages--default': makeEntry({
        surface: 'Commerce',
        importPath: './storybook-pages/commerce/search.new.stories.tsx',
      }),
      'insight-example-pages--default': makeEntry({
        surface: 'Insight',
        importPath: './storybook-pages/insight/insight.new.stories.tsx',
      }),
      'search-atomic-search-box--default': {
        type: 'story',
        title: 'Search/Atomic Search Box',
        name: 'Default',
        importPath:
          './src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx',
      },
    };

    const result = selectStories(
      entries,
      makeConfig({component: 'search-page'})
    );

    // Both search/search-page and commerce/search-page match component name 'search-page'
    expect(result.has('search/search-page')).toBe(true);
    expect(result.has('commerce/search-page')).toBe(true);
    // insight-page and atomic-search-box should NOT be included
    expect(result.has('insight/insight-page')).toBe(false);
    expect(result.has('search/atomic-search-box')).toBe(false);
  });

  it('should filter by surface when config.surface is set', () => {
    const entries: Record<string, StoryEntry> = {
      'search-example-pages--default': makeEntry({
        surface: 'Search',
        importPath: './storybook-pages/search/search.new.stories.tsx',
      }),
      'commerce-example-pages--default': makeEntry({
        surface: 'Commerce',
        importPath:
          './storybook-pages/commerce/product-listing.new.stories.tsx',
      }),
    };

    const result = selectStories(entries, makeConfig({surface: 'commerce'}));

    expect(result.has('commerce/product-listing-page')).toBe(true);
    expect(result.has('search/search-page')).toBe(false);
  });
});
