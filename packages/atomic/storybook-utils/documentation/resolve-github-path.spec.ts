import {describe, expect, it} from 'vitest';
import {resolveGithubDocsUrl, resolveGithubUrl} from './resolve-github-path';

describe('resolveGithubUrl', () => {
  const EXPECTED_BASE =
    'https://github.com/coveo/ui-kit/tree/main/packages/atomic/';

  it('should convert .new.stories.tsx to .ts', () => {
    const result = resolveGithubUrl(
      './src/components/search/atomic-pager/atomic-pager.new.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/search/atomic-pager/atomic-pager.ts`
    );
  });

  it('should convert .stories.tsx to .ts', () => {
    const result = resolveGithubUrl(
      './src/components/search/facets/atomic-facet/atomic-facet.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/search/facets/atomic-facet/atomic-facet.ts`
    );
  });

  it('should handle absolute paths with packages/atomic/', () => {
    const result = resolveGithubUrl(
      '/Users/dev/ui-kit/packages/atomic/src/components/common/atomic-icon/atomic-icon.new.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/common/atomic-icon/atomic-icon.ts`
    );
  });

  it('should handle repo-relative paths', () => {
    const result = resolveGithubUrl(
      'packages/atomic/src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/search/atomic-search-box/atomic-search-box.ts`
    );
  });

  it('should handle .storybook files', () => {
    const result = resolveGithubUrl('./.storybook/Introduction.stories.tsx');
    expect(result).toBe(`${EXPECTED_BASE}.storybook/Introduction.ts`);
  });

  it('should handle Windows-style paths', () => {
    const result = resolveGithubUrl(
      'C:\\Users\\dev\\ui-kit\\packages\\atomic\\src\\components\\search\\atomic-pager\\atomic-pager.new.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/search/atomic-pager/atomic-pager.ts`
    );
  });

  it('should return null for undefined input', () => {
    const result = resolveGithubUrl(undefined);
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = resolveGithubUrl('');
    expect(result).toBeNull();
  });

  it('should return null for unrecognized path patterns', () => {
    const result = resolveGithubUrl('some/random/path.tsx');
    expect(result).toBeNull();
  });
});

describe('resolveGithubDocsUrl', () => {
  const EXPECTED_BASE =
    'https://github.com/coveo/ui-kit/blob/main/packages/atomic/';

  it('should convert .new.stories.tsx to .mdx', () => {
    const result = resolveGithubDocsUrl(
      './src/components/search/atomic-pager/atomic-pager.new.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/search/atomic-pager/atomic-pager.mdx`
    );
  });

  it('should convert .stories.tsx to .mdx', () => {
    const result = resolveGithubDocsUrl(
      './src/components/search/facets/atomic-facet/atomic-facet.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/search/facets/atomic-facet/atomic-facet.mdx`
    );
  });

  it('should preserve .mdx files as-is', () => {
    const result = resolveGithubDocsUrl('./.storybook/Introduction.mdx');
    expect(result).toBe(`${EXPECTED_BASE}.storybook/Introduction.mdx`);
  });

  it('should handle absolute paths', () => {
    const result = resolveGithubDocsUrl(
      '/Users/dev/ui-kit/packages/atomic/src/components/common/atomic-icon/atomic-icon.new.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/common/atomic-icon/atomic-icon.mdx`
    );
  });

  it('should handle repo-relative paths', () => {
    const result = resolveGithubDocsUrl(
      'packages/atomic/src/components/search/atomic-search-box/atomic-search-box.new.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/search/atomic-search-box/atomic-search-box.mdx`
    );
  });

  it('should preserve existing .mdx in story filenames', () => {
    const result = resolveGithubDocsUrl(
      './storybook-pages/guides/custom-styling.mdx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}storybook-pages/guides/custom-styling.mdx`
    );
  });

  it('should handle Windows-style paths', () => {
    const result = resolveGithubDocsUrl(
      'C:\\Users\\dev\\ui-kit\\packages\\atomic\\src\\components\\search\\atomic-pager\\atomic-pager.new.stories.tsx'
    );
    expect(result).toBe(
      `${EXPECTED_BASE}src/components/search/atomic-pager/atomic-pager.mdx`
    );
  });

  it('should return null for undefined input', () => {
    const result = resolveGithubDocsUrl(undefined);
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = resolveGithubDocsUrl('');
    expect(result).toBeNull();
  });

  it('should return null for unrecognized path patterns', () => {
    const result = resolveGithubDocsUrl('some/random/path.tsx');
    expect(result).toBeNull();
  });
});
