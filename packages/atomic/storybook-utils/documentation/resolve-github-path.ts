const GITHUB_BASE =
  'https://github.com/coveo/ui-kit/blob/main/packages/atomic/src/components/';

/**
 * Derives the relative component source path from a Storybook story's import path.
 *
 * Handles `.new.stories.tsx`, `.stories.tsx`, and `.mdx` files by mapping them
 * back to the component's `.ts` source file.
 *
 * @example
 * resolveGithubPath('./src/components/search/atomic-pager/atomic-pager.new.stories.tsx')
 * // => 'search/atomic-pager/atomic-pager.ts'
 */
export function resolveGithubPath(
  importPath: string | undefined
): string | null {
  if (!importPath) {
    return null;
  }

  const componentsIndex = importPath.indexOf('src/components/');
  if (componentsIndex === -1) {
    return null;
  }

  const relativePath = importPath.substring(
    componentsIndex + 'src/components/'.length
  );

  return relativePath
    .replace(/\.new\.stories\.tsx$/, '.ts')
    .replace(/\.stories\.tsx$/, '.ts')
    .replace(/\.mdx$/, '.ts');
}

/**
 * Derives the full GitHub URL for a component source file from a Storybook
 * story's import path.
 *
 * @example
 * resolveGithubUrl('./src/components/search/atomic-pager/atomic-pager.new.stories.tsx')
 * // => 'https://github.com/coveo/ui-kit/blob/main/packages/atomic/src/components/search/atomic-pager/atomic-pager.ts'
 */
export function resolveGithubUrl(
  importPath: string | undefined
): string | null {
  const path = resolveGithubPath(importPath);
  if (!path) {
    return null;
  }
  return `${GITHUB_BASE}${path}`;
}
