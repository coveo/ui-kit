import {describe, expect, it} from 'vitest';
import {resolveGithubPath} from './resolve-github-path.js';

describe('resolve-github-path', () => {
  describe('#resolveGithubPath', () => {
    it('should return null for undefined input', () => {
      expect(resolveGithubPath(undefined)).toBeNull();
    });

    it('should return null for an empty string', () => {
      expect(resolveGithubPath('')).toBeNull();
    });

    it('should return null when path does not contain src/components/', () => {
      expect(resolveGithubPath('./src/utils/some-util.ts')).toBeNull();
    });

    it('should resolve a .new.stories.tsx path from a relative import', () => {
      expect(
        resolveGithubPath(
          './src/components/search/atomic-pager/atomic-pager.new.stories.tsx'
        )
      ).toBe('search/atomic-pager/atomic-pager.ts');
    });

    it('should resolve a .stories.tsx path from a relative import', () => {
      expect(
        resolveGithubPath(
          './src/components/commerce/atomic-product-link/atomic-product-link.stories.tsx'
        )
      ).toBe('commerce/atomic-product-link/atomic-product-link.ts');
    });

    it('should resolve a .stories.ts path (without the x)', () => {
      expect(
        resolveGithubPath(
          './src/components/search/atomic-sort/atomic-sort.stories.ts'
        )
      ).toBe('search/atomic-sort/atomic-sort.ts');
    });

    it('should resolve a .mdx path', () => {
      expect(
        resolveGithubPath(
          './src/components/search/atomic-did-you-mean/atomic-did-you-mean.mdx'
        )
      ).toBe('search/atomic-did-you-mean/atomic-did-you-mean.ts');
    });

    it('should resolve an absolute path containing packages/', () => {
      expect(
        resolveGithubPath(
          '/Users/dev/repo/packages/atomic/src/components/search/atomic-pager/atomic-pager.new.stories.tsx'
        )
      ).toBe('search/atomic-pager/atomic-pager.ts');
    });

    it('should resolve a path starting with packages/ without a leading slash', () => {
      expect(
        resolveGithubPath(
          'packages/atomic/src/components/common/tab-manager/tab-manager.stories.tsx'
        )
      ).toBe('common/tab-manager/tab-manager.ts');
    });

    it('should normalize Windows backslashes', () => {
      expect(
        resolveGithubPath(
          '.\\src\\components\\search\\atomic-pager\\atomic-pager.new.stories.tsx'
        )
      ).toBe('search/atomic-pager/atomic-pager.ts');
    });

    it('should pass through a plain .ts path unchanged', () => {
      expect(
        resolveGithubPath(
          './src/components/search/atomic-pager/atomic-pager.ts'
        )
      ).toBe('search/atomic-pager/atomic-pager.ts');
    });

    it('should be case-insensitive for the extension replacement', () => {
      expect(
        resolveGithubPath(
          './src/components/search/atomic-pager/atomic-pager.NEW.STORIES.TSX'
        )
      ).toBe('search/atomic-pager/atomic-pager.ts');
    });
  });
});
