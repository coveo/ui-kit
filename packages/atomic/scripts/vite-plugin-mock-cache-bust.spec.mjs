/**
 * Tests for the mock cache bust plugin.
 */

import {describe, expect, it} from 'vitest';
import {mockCacheBustPlugin} from './vite-plugin-mock-cache-bust.mjs';

describe('vite-plugin-mock-cache-bust', () => {
  describe('plugin structure', () => {
    it('should return two plugin instances', () => {
      const plugins = mockCacheBustPlugin();
      expect(plugins).toHaveLength(2);
    });

    it('should have pre-phase plugin with correct name and enforce', () => {
      const [prePhase] = mockCacheBustPlugin();
      expect(prePhase.name).toBe('mock-cache-bust:pre');
      expect(prePhase.enforce).toBe('pre');
      expect(typeof prePhase.transform).toBe('function');
    });

    it('should have post-phase plugin with correct name and enforce', () => {
      const [, postPhase] = mockCacheBustPlugin();
      expect(postPhase.name).toBe('mock-cache-bust:post');
      expect(postPhase.enforce).toBe('post');
      expect(typeof postPhase.transform).toBe('function');
    });
  });

  describe('pre-phase plugin', () => {
    it('should skip non-spec files', () => {
      const [prePhase] = mockCacheBustPlugin();
      const result = prePhase.transform('some code', '/path/to/file.ts');
      expect(result).toBeNull();
    });

    it('should process spec files', () => {
      const [prePhase] = mockCacheBustPlugin();
      const code = `
        import {vi} from 'vitest';
        vi.mock('@coveo/headless');
      `;
      const result = prePhase.transform(code, '/path/to/file.spec.ts');
      // Pre-phase doesn't transform, just collects info
      expect(result).toBeNull();
    });
  });

  describe('post-phase plugin', () => {
    it('should skip non-spec files', () => {
      const [, postPhase] = mockCacheBustPlugin();
      const result = postPhase.transform('some code', '/path/to/file.ts');
      expect(result).toBeNull();
    });

    it('should not transform files without mocks', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code = `
        import {describe, it} from 'vitest';
        import {someFunction} from './utils';
      `;
      const id = '/path/to/file.spec.ts';

      // Pre-phase scan (no mocks found)
      prePhase.transform(code, id);

      // Post-phase should not transform
      const result = postPhase.transform(code, id);
      expect(result).toBeNull();
    });

    it('should transform imports for mocked modules', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code = `
        import {vi} from 'vitest';
        import {buildController} from '@coveo/headless';
        
        vi.mock('@coveo/headless', {spy: true});
      `;
      const id = '/path/to/test.spec.ts';

      // Pre-phase scan
      prePhase.transform(code, id);

      // Post-phase transform
      const result = postPhase.transform(code, id);
      expect(result).not.toBeNull();
      expect(result.code).toContain('@coveo/headless?mock=');
      expect(result.code).not.toContain('vitest?mock='); // vitest should not be modified
    });

    it('should handle vi.mocked() calls', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code = `
        import {vi} from 'vitest';
        import * as domUtils from './dom-utils';
        
        vi.mock('./dom-utils', {spy: true});
        
        it('test', () => {
          vi.mocked(domUtils.closest).mockReturnValue(null);
        });
      `;
      const id = '/path/to/test.spec.ts';

      // Pre-phase scan
      prePhase.transform(code, id);

      // Post-phase transform
      const result = postPhase.transform(code, id);
      expect(result).not.toBeNull();
      expect(result.code).toContain('./dom-utils?mock=');
    });

    it('should handle multiple mocked modules', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code = `
        import {vi} from 'vitest';
        import {buildController} from '@coveo/headless';
        import {someUtil} from './utils';
        
        vi.mock('@coveo/headless', {spy: true});
        vi.mock('./utils', {spy: true});
      `;
      const id = '/path/to/test.spec.ts';

      // Pre-phase scan
      prePhase.transform(code, id);

      // Post-phase transform
      const result = postPhase.transform(code, id);
      expect(result).not.toBeNull();
      expect(result.code).toContain('@coveo/headless?mock=');
      expect(result.code).toContain('./utils?mock=');
    });

    it('should use consistent unique ID for same file', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code1 = `
        import {vi} from 'vitest';
        import {foo} from './foo';
        vi.mock('./foo');
      `;
      const code2 = `
        import {vi} from 'vitest';
        import {bar} from './bar';
        vi.mock('./bar');
      `;
      const id = '/path/to/test.spec.ts';

      // First transform
      prePhase.transform(code1, id);
      const result1 = postPhase.transform(code1, id);

      // Extract the mock ID from first result
      const mockId1 = result1.code.match(/\?mock=([a-f0-9]+)/)?.[1];

      // Second transform of the same file (simulating hot reload)
      prePhase.transform(code2, id);
      const result2 = postPhase.transform(code2, id);

      // Extract the mock ID from second result
      const mockId2 = result2.code.match(/\?mock=([a-f0-9]+)/)?.[1];

      // Should have the same ID
      expect(mockId1).toBe(mockId2);
    });

    it('should use different unique IDs for different files', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code = `
        import {vi} from 'vitest';
        import {foo} from './foo';
        vi.mock('./foo');
      `;
      const id1 = '/path/to/test1.spec.ts';
      const id2 = '/path/to/test2.spec.ts';

      // Transform first file
      prePhase.transform(code, id1);
      const result1 = postPhase.transform(code, id1);
      const mockId1 = result1.code.match(/\?mock=([a-f0-9]+)/)?.[1];

      // Transform second file
      prePhase.transform(code, id2);
      const result2 = postPhase.transform(code, id2);
      const mockId2 = result2.code.match(/\?mock=([a-f0-9]+)/)?.[1];

      // Should have different IDs
      expect(mockId1).not.toBe(mockId2);
    });

    it('should handle modules with existing query parameters', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code = `
        import {vi} from 'vitest';
        import styles from './styles.css?inline';
        vi.mock('./styles.css?inline');
      `;
      const id = '/path/to/test.spec.ts';

      // Pre-phase scan
      prePhase.transform(code, id);

      // Post-phase transform
      const result = postPhase.transform(code, id);
      expect(result).not.toBeNull();
      expect(result.code).toContain('./styles.css?inline&mock=');
    });

    it('should handle type imports', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code = `
        import {vi} from 'vitest';
        import type {Controller} from '@coveo/headless';
        import {buildController} from '@coveo/headless';
        
        vi.mock('@coveo/headless', {spy: true});
      `;
      const id = '/path/to/test.spec.ts';

      // Pre-phase scan
      prePhase.transform(code, id);

      // Post-phase transform
      const result = postPhase.transform(code, id);
      expect(result).not.toBeNull();
      expect(result.code).toContain('@coveo/headless?mock=');
      // Both type and regular imports should be transformed
      expect((result.code.match(/@coveo\/headless\?mock=/g) || []).length).toBe(
        2
      );
    });
  });

  describe('integration', () => {
    it('should handle complex real-world test file', () => {
      const [prePhase, postPhase] = mockCacheBustPlugin();
      const code = `
import {
  buildProductListing,
  buildSearch,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-no-products', () => {
  it('should render', () => {
    vi.mocked(buildProductListing).mockReturnValue({});
  });
});
      `;
      const id = '/path/to/atomic-commerce-no-products.spec.ts';

      // Pre-phase scan
      prePhase.transform(code, id);

      // Post-phase transform
      const result = postPhase.transform(code, id);
      expect(result).not.toBeNull();
      expect(result.code).toContain('@coveo/headless/commerce?mock=');
      // Other imports should not be modified
      expect(result.code).toContain("from 'lit'");
      expect(result.code).toContain("from 'vitest'");
    });
  });
});
