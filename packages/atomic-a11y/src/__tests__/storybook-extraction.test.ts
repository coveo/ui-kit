import {describe, expect, it} from 'vitest';
import {
  extractCategory,
  extractComponentName,
  extractFramework,
  normalizePath,
} from '../reporter/storybook-extraction.js';
import {UNKNOWN_CATEGORY, UNKNOWN_FRAMEWORK} from '../shared/constants.js';

describe('storybook-extraction', () => {
  describe('normalizePath()', () => {
    it('converts backslashes to forward slashes', () => {
      expect(normalizePath('src\\components\\search')).toBe(
        'src/components/search'
      );
    });

    it('converts multiple backslashes', () => {
      expect(
        normalizePath('src\\components\\search\\atomic-search-box\\test.tsx')
      ).toBe('src/components/search/atomic-search-box/test.tsx');
    });

    it('leaves already normalized paths unchanged', () => {
      expect(normalizePath('src/components/search')).toBe(
        'src/components/search'
      );
    });

    it('handles mixed backslashes and forward slashes', () => {
      expect(normalizePath('src\\components/search\\atomic-search-box')).toBe(
        'src/components/search/atomic-search-box'
      );
    });

    it('handles empty string', () => {
      expect(normalizePath('')).toBe('');
    });
  });

  describe('extractComponentName()', () => {
    it('extracts component name from directory path with atomic-* pattern', () => {
      expect(
        extractComponentName(
          '/src/components/search/atomic-search-box/',
          'search-atomic-search-box--default'
        )
      ).toBe('atomic-search-box');
    });

    it('extracts component name from .new.stories.tsx filename', () => {
      expect(
        extractComponentName(
          'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx',
          'search-atomic-search-box--default'
        )
      ).toBe('atomic-search-box');
    });

    it('extracts component name from storyId when path does not contain atomic-*', () => {
      expect(
        extractComponentName(
          'src/stories/fallback.stories.tsx',
          'search-atomic-result-list'
        )
      ).toBe('atomic-result-list');
    });

    it('converts component name to lowercase', () => {
      expect(
        extractComponentName(
          '/src/components/search/ATOMIC-SEARCH-BOX/',
          'search-atomic-search-box--default'
        )
      ).toBe('atomic-search-box');
    });

    it('handles mixed case in storyId', () => {
      expect(
        extractComponentName(
          'src/stories/fallback.stories.tsx',
          'search-ATOMIC-Result-List'
        )
      ).toBe('atomic-result-list');
    });

    it('returns null when component name cannot be extracted', () => {
      expect(
        extractComponentName(
          'src/stories/misc.stories.tsx',
          'some-random-story--variant'
        )
      ).toBeNull();
    });

    it('prioritizes directory match over storyId match', () => {
      expect(
        extractComponentName(
          '/src/components/search/atomic-search-box/',
          'search-atomic-result-list'
        )
      ).toBe('atomic-search-box');
    });

    it('handles component names with numbers and hyphens', () => {
      expect(
        extractComponentName(
          '/src/components/search/atomic-search-box-2/',
          'search-atomic-search-box-2'
        )
      ).toBe('atomic-search-box-2');
    });
  });

  describe('extractCategory()', () => {
    it('extracts commerce category from path', () => {
      expect(
        extractCategory(
          'src/components/commerce/atomic-product/atomic-product.new.stories.tsx',
          'commerce-atomic-product--default'
        )
      ).toBe('commerce');
    });

    it('extracts search category from path', () => {
      expect(
        extractCategory(
          'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx',
          'search-atomic-search-box--default'
        )
      ).toBe('search');
    });

    it('extracts insight category from path', () => {
      expect(
        extractCategory(
          'src/components/insight/atomic-result/atomic-result.stories.tsx',
          'insight-atomic-result--default'
        )
      ).toBe('insight');
    });

    it('extracts ipx category from path', () => {
      expect(
        extractCategory(
          'src/components/ipx/atomic-layout/atomic-layout.new.stories.tsx',
          'ipx-atomic-layout--default'
        )
      ).toBe('ipx');
    });

    it('extracts common category from path', () => {
      expect(
        extractCategory(
          'src/components/common/atomic-button/atomic-button.stories.tsx',
          'common-atomic-button--default'
        )
      ).toBe('common');
    });

    it('extracts recommendations category from path', () => {
      expect(
        extractCategory(
          'src/components/recommendations/atomic-recommendation/atomic-recommendation.new.stories.tsx',
          'recommendations-atomic-recommendation--default'
        )
      ).toBe('recommendations');
    });

    it('extracts category from storyId when path does not contain category', () => {
      expect(
        extractCategory(
          'src/stories/misc.stories.tsx',
          'search-atomic-search-box--default'
        )
      ).toBe('search');
    });

    it('extracts category from storyId with commerce prefix', () => {
      expect(
        extractCategory(
          'src/stories/fallback.stories.tsx',
          'commerce-atomic-product--variant'
        )
      ).toBe('commerce');
    });

    it('returns unknown category when category cannot be extracted', () => {
      expect(
        extractCategory(
          'src/stories/misc.stories.tsx',
          'some-random-story--variant'
        )
      ).toBe(UNKNOWN_CATEGORY);
    });

    it('converts category to lowercase', () => {
      expect(
        extractCategory(
          'src/components/SEARCH/atomic-search-box/atomic-search-box.stories.tsx',
          'search-atomic-search-box--default'
        )
      ).toBe('search');
    });

    it('prioritizes path match over storyId match', () => {
      expect(
        extractCategory(
          'src/components/search/atomic-search-box/atomic-search-box.stories.tsx',
          'commerce-atomic-product--default'
        )
      ).toBe('search');
    });
  });

  describe('extractFramework()', () => {
    it('returns lit for .new.stories.tsx files', () => {
      expect(
        extractFramework(
          'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx'
        )
      ).toBe('lit');
    });

    it('returns unknown for .new.stories.ts (only .tsx supported)', () => {
      expect(
        extractFramework(
          'src/components/search/atomic-search-box/atomic-search-box.new.stories.ts'
        )
      ).toBe(UNKNOWN_FRAMEWORK);
    });

    it('returns stencil for .stories.tsx files', () => {
      expect(
        extractFramework(
          'src/components/search/atomic-search-box/atomic-search-box.stories.tsx'
        )
      ).toBe('stencil');
    });

    it('returns unknown for .stories.ts (only .tsx supported)', () => {
      expect(
        extractFramework(
          'src/components/search/atomic-search-box/atomic-search-box.stories.ts'
        )
      ).toBe(UNKNOWN_FRAMEWORK);
    });

    it('returns unknown for files without stories suffix', () => {
      expect(
        extractFramework('src/components/search/atomic-search-box/index.ts')
      ).toBe(UNKNOWN_FRAMEWORK);
    });

    it('returns unknown for non-stories files', () => {
      expect(
        extractFramework(
          'src/components/search/atomic-search-box/component.tsx'
        )
      ).toBe(UNKNOWN_FRAMEWORK);
    });

    it('returns lit for .new.stories.tsx (even if .stories.tsx would match)', () => {
      expect(
        extractFramework(
          'src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx'
        )
      ).toBe('lit');
    });
  });
});
