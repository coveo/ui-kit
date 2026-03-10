import {describe, expect, it} from 'vitest';
import {
  extractCategory,
  extractComponentName,
  extractFramework,
  normalizePath,
} from '../reporter/storybook-extraction.js';

// ── extractComponentName ─────────────────────────────────────────────────────

describe('extractComponentName', () => {
  describe('Strategy 1: path contains /atomic-x/ in the middle', () => {
    it('should extract component name from a standard component directory path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('atomic-search-box');
    });

    it('should extract component name for a Stencil component in a nested path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/commerce/atomic-product-list/atomic-product-list.stories.tsx';
      expect(extractComponentName(path, '')).toBe('atomic-product-list');
    });

    it('should extract component name for atomic-breadbox in a directory', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-breadbox/atomic-breadbox.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('atomic-breadbox');
    });

    it('should return the lowercase component name even if path uses uppercase', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/search/ATOMIC-SEARCH-BOX/ATOMIC-SEARCH-BOX.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('atomic-search-box');
    });
  });

  describe('Strategy 2: path ends with atomic-x.new.stories.tsx', () => {
    it('should extract component name when file is in a non-atomic directory', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/stories/atomic-facet.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('atomic-facet');
    });

    it('should return null for a Stencil .stories.tsx without an atomic directory (Strategy 2 only matches .new.stories)', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/stories/atomic-result-list.stories.tsx';
      // Strategy 2 regex requires .new.stories.[jt]sx? — Stencil stories without .new don't match
      // Strategy 1 needs /atomic-x/ directory, Strategy 3 needs a storyId, Strategy 4 needs storybook-pages
      expect(extractComponentName(path, '')).toBeNull();
    });
  });

  describe('Strategy 3: storyId contains atomic-x', () => {
    it('should extract component name from storyId when path has no atomic directory', () => {
      const path = '/Users/dev/ui-kit/packages/atomic/src/unrelated/file.ts';
      const storyId = 'atomic-pager';
      expect(extractComponentName(path, storyId)).toBe('atomic-pager');
    });

    it('should extract component name from storyId with category prefix', () => {
      const path = '/Users/dev/ui-kit/packages/atomic/src/unrelated/file.ts';
      const storyId = 'search-atomic-sort-dropdown';
      expect(extractComponentName(path, storyId)).toBe('atomic-sort-dropdown');
    });

    it('should return lowercase component name from storyId', () => {
      const path = '/Users/dev/ui-kit/packages/atomic/src/unrelated/file.ts';
      const storyId = 'ATOMIC-SMART-SNIPPET';
      expect(extractComponentName(path, storyId)).toBe('atomic-smart-snippet');
    });
  });

  describe('Strategy 4 (NEW): storybook-pages path → stem-page', () => {
    it('should return search-page for storybook-pages/search/search.new.stories.tsx', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/search/search.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('search-page');
    });

    it('should return search-page for commerce search page', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/search.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('search-page');
    });

    it('should return recommendation-page for commerce recommendation page', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/recommendation.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('recommendation-page');
    });

    it('should return product-listing-page for commerce product-listing page', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/product-listing.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('product-listing-page');
    });

    it('should return insight-page for storybook-pages/insight/insight.new.stories.tsx', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/insight/insight.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('insight-page');
    });

    it('should return recommendations-page for storybook-pages/recommendations/recommendations.new.stories.tsx', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/recommendations/recommendations.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('recommendations-page');
    });

    it('should return ipx-page for storybook-pages/ipx/ipx.new.stories.tsx', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/ipx/ipx.new.stories.tsx';
      expect(extractComponentName(path, '')).toBe('ipx-page');
    });
  });

  describe('Null case', () => {
    it('should return null for a non-atomic, non-page path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/utils/some-utility.ts';
      expect(extractComponentName(path, '')).toBeNull();
    });

    it('should return null when storyId contains no atomic component', () => {
      const path = '/Users/dev/ui-kit/packages/atomic/src/some/generic/file.ts';
      expect(extractComponentName(path, 'commerce--homepage')).toBeNull();
    });

    it('should return null for empty path and empty storyId', () => {
      expect(extractComponentName('', '')).toBeNull();
    });
  });

  describe('Strategy priority', () => {
    it('should prefer Strategy 1 (atomic directory) over storyId match', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx';
      const storyId = 'atomic-facet--default'; // different component in storyId
      expect(extractComponentName(path, storyId)).toBe('atomic-search-box');
    });

    it('should prefer Strategy 2 (file ends with atomic-x) over storyId match', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/stories/atomic-facet.new.stories.tsx';
      const storyId = 'atomic-breadbox--default'; // different component in storyId
      expect(extractComponentName(path, storyId)).toBe('atomic-facet');
    });

    it('should prefer Strategy 3 (storyId) over Strategy 4 (page path) when storyId has atomic component', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/search/search.new.stories.tsx';
      const storyId = 'atomic-search-interface';
      // Strategy 3 runs before Strategy 4, so storyId match wins
      expect(extractComponentName(path, storyId)).toBe(
        'atomic-search-interface'
      );
    });
  });
});

// ── extractCategory ──────────────────────────────────────────────────────────

describe('extractCategory', () => {
  describe('Strategy 1: path contains components/(category)/', () => {
    it('should extract "search" from a search component path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('search');
    });

    it('should extract "commerce" from a commerce component path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/commerce/atomic-product-list/atomic-product-list.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('commerce');
    });

    it('should extract "insight" from an insight component path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/insight/atomic-insight-interface/atomic-insight-interface.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('insight');
    });

    it('should extract "ipx" from an ipx component path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/ipx/atomic-ipx-modal/atomic-ipx-modal.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('ipx');
    });

    it('should extract "common" from a common component path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/common/atomic-icon/atomic-icon.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('common');
    });

    it('should extract "recommendations" from a recommendations component path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/recommendations/atomic-recommendations/atomic-recommendations.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('recommendations');
    });

    it('should be case-insensitive for category in path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/components/SEARCH/atomic-search-box/atomic-search-box.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('search');
    });
  });

  describe('Strategy 2: storyId starts with (category)-', () => {
    it('should extract "search" when storyId starts with search-', () => {
      const path = '/Users/dev/ui-kit/packages/atomic/src/some/other/path.ts';
      expect(extractCategory(path, 'search-atomic-search-box--default')).toBe(
        'search'
      );
    });

    it('should extract "commerce" when storyId starts with commerce-', () => {
      const path = '/Users/dev/ui-kit/packages/atomic/src/some/other/path.ts';
      expect(
        extractCategory(path, 'commerce-atomic-product-list--default')
      ).toBe('commerce');
    });

    it('should extract "insight" when storyId starts with insight-', () => {
      const path = '/Users/dev/ui-kit/packages/atomic/src/some/other/path.ts';
      expect(
        extractCategory(path, 'insight-atomic-insight-interface--default')
      ).toBe('insight');
    });

    it('should extract "recommendations" when storyId starts with recommendations-', () => {
      const path = '/Users/dev/ui-kit/packages/atomic/src/some/other/path.ts';
      expect(
        extractCategory(path, 'recommendations-atomic-recommendations--default')
      ).toBe('recommendations');
    });
  });

  describe('Strategy 3 (NEW): path contains storybook-pages/(category)/', () => {
    it('should extract "search" from storybook-pages/search/ path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/search/search.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('search');
    });

    it('should extract "commerce" from storybook-pages/commerce/ path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/search.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('commerce');
    });

    it('should extract "commerce" from storybook-pages/commerce/recommendation page', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/recommendation.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('commerce');
    });

    it('should extract "commerce" from storybook-pages/commerce/product-listing page', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/product-listing.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('commerce');
    });

    it('should extract "insight" from storybook-pages/insight/ path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/insight/insight.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('insight');
    });

    it('should extract "recommendations" from storybook-pages/recommendations/ path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/recommendations/recommendations.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('recommendations');
    });

    it('should extract "ipx" from storybook-pages/ipx/ path', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/storybook-pages/ipx/ipx.new.stories.tsx';
      expect(extractCategory(path, '')).toBe('ipx');
    });
  });

  describe('Fallback: returns UNKNOWN_CATEGORY', () => {
    it('should return "unknown" for an unrecognized path and empty storyId', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/some/unrelated/file.ts';
      expect(extractCategory(path, '')).toBe('unknown');
    });

    it('should return "unknown" for empty path and empty storyId', () => {
      expect(extractCategory('', '')).toBe('unknown');
    });

    it('should return "unknown" when storyId does not start with a known category', () => {
      const path =
        '/Users/dev/ui-kit/packages/atomic/src/some/unrelated/file.ts';
      expect(extractCategory(path, 'some-other-prefix--default')).toBe(
        'unknown'
      );
    });
  });

  describe('All 7 page story paths — combined name and category', () => {
    const pageStories: Array<{
      path: string;
      name: string;
      category: string;
    }> = [
      {
        path: '/Users/dev/ui-kit/packages/atomic/storybook-pages/search/search.new.stories.tsx',
        name: 'search-page',
        category: 'search',
      },
      {
        path: '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/search.new.stories.tsx',
        name: 'search-page',
        category: 'commerce',
      },
      {
        path: '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/recommendation.new.stories.tsx',
        name: 'recommendation-page',
        category: 'commerce',
      },
      {
        path: '/Users/dev/ui-kit/packages/atomic/storybook-pages/commerce/product-listing.new.stories.tsx',
        name: 'product-listing-page',
        category: 'commerce',
      },
      {
        path: '/Users/dev/ui-kit/packages/atomic/storybook-pages/insight/insight.new.stories.tsx',
        name: 'insight-page',
        category: 'insight',
      },
      {
        path: '/Users/dev/ui-kit/packages/atomic/storybook-pages/recommendations/recommendations.new.stories.tsx',
        name: 'recommendations-page',
        category: 'recommendations',
      },
      {
        path: '/Users/dev/ui-kit/packages/atomic/storybook-pages/ipx/ipx.new.stories.tsx',
        name: 'ipx-page',
        category: 'ipx',
      },
    ];

    for (const {path, name, category} of pageStories) {
      it(`should extract name="${name}" and category="${category}" from ${path.split('/').slice(-2).join('/')}`, () => {
        expect(extractComponentName(path, '')).toBe(name);
        expect(extractCategory(path, '')).toBe(category);
      });
    }
  });
});

// ── extractFramework ─────────────────────────────────────────────────────────

describe('extractFramework', () => {
  it('should return "lit" for paths ending with .new.stories.tsx', () => {
    const path =
      '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx';
    expect(extractFramework(path)).toBe('lit');
  });

  it('should return "stencil" for paths ending with .stories.tsx (without .new)', () => {
    const path =
      '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box/atomic-search-box.stories.tsx';
    expect(extractFramework(path)).toBe('stencil');
  });

  it('should return "unknown" for paths not ending with a recognized stories extension', () => {
    const path =
      '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box/atomic-search-box.ts';
    expect(extractFramework(path)).toBe('unknown');
  });

  it('should return "unknown" for paths ending with .stories.ts (no tsx)', () => {
    const path =
      '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box/atomic-search-box.stories.ts';
    expect(extractFramework(path)).toBe('unknown');
  });

  it('should return "lit" for a page story path (.new.stories.tsx)', () => {
    const path =
      '/Users/dev/ui-kit/packages/atomic/storybook-pages/search/search.new.stories.tsx';
    expect(extractFramework(path)).toBe('lit');
  });

  it('should return "unknown" for an empty string', () => {
    expect(extractFramework('')).toBe('unknown');
  });
});

// ── normalizePath ────────────────────────────────────────────────────────────

describe('normalizePath', () => {
  it('should replace all backslashes with forward slashes', () => {
    const windowsPath =
      'C:\\Users\\dev\\ui-kit\\packages\\atomic\\src\\components\\search\\atomic-search-box.new.stories.tsx';
    const expected =
      'C:/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box.new.stories.tsx';
    expect(normalizePath(windowsPath)).toBe(expected);
  });

  it('should leave a Unix path unchanged', () => {
    const unixPath =
      '/Users/dev/ui-kit/packages/atomic/src/components/search/atomic-search-box.new.stories.tsx';
    expect(normalizePath(unixPath)).toBe(unixPath);
  });

  it('should handle a path with mixed slashes', () => {
    const mixedPath =
      'packages\\atomic/src\\components/search/atomic-search-box.new.stories.tsx';
    const expected =
      'packages/atomic/src/components/search/atomic-search-box.new.stories.tsx';
    expect(normalizePath(mixedPath)).toBe(expected);
  });

  it('should return an empty string unchanged', () => {
    expect(normalizePath('')).toBe('');
  });
});
