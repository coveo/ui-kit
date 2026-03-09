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

  // Normalize Windows backslashes and ensure we can find `src/components/`
  const normalized = importPath.replace(/\\/g, '/');

  // Match common path shapes emitted by Storybook / bundlers, e.g.:
  // - ./src/components/...
  // - /Users/.../repo/packages/atomic/src/components/...
  // - packages/atomic/src/components/...
  const m = normalized.match(
    /(?:.*?)(?:packages\/[^/]+\/)?src\/components\/(.+)$/
  );
  if (!m) {
    return null;
  }

  const relativePath = m[1];

  return relativePath
    .replace(/\.new\.stories\.tsx?$/i, '.ts')
    .replace(/\.stories\.tsx?$/i, '.ts')
    .replace(/\.mdx$/i, '.ts');
}
