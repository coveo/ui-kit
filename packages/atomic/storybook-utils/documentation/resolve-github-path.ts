/**
 * Extracts the path relative to the `packages/atomic/` root from a Storybook
 * import path.
 *
 * Handles the common shapes Storybook / bundlers emit:
 * - `./src/components/...`                  (relative from package root)
 * - `./.storybook/...`                       (relative from package root)
 * - `/Users/.../packages/atomic/src/...`    (absolute, with packages/atomic)
 * - `packages/atomic/src/...`               (repo-relative)
 *
 * Returns `null` when no recognisable pattern is found.
 */
function extractAtomicRelativePath(
  importPath: string | undefined
): string | null {
  if (!importPath) {
    return null;
  }

  const normalized = importPath.replace(/\\/g, '/');

  // Absolute or repo-relative path containing packages/atomic/
  const packagesMatch = normalized.match(/(?:.*\/)?packages\/atomic\/(.+)$/);
  if (packagesMatch) {
    return packagesMatch[1];
  }

  // Path relative to the atomic package root (starts with ./)
  const relativeMatch = normalized.match(/^\.\/(.+)$/);
  if (relativeMatch) {
    return relativeMatch[1];
  }

  return null;
}

const GITHUB_ATOMIC_BASE =
  'https://github.com/coveo/ui-kit/blob/main/packages/atomic/';

/**
 * Builds the GitHub URL for the **component source** (`.ts`) that corresponds
 * to a Storybook story import path.
 *
 * Use this in canvas/story view.
 *
 * @example
 * resolveGithubUrl('./src/components/search/atomic-pager/atomic-pager.new.stories.tsx')
 * // => 'https://github.com/coveo/ui-kit/blob/main/packages/atomic/src/components/search/atomic-pager/atomic-pager.ts'
 */
export function resolveGithubUrl(
  importPath: string | undefined
): string | null {
  const relative = extractAtomicRelativePath(importPath);
  if (!relative) {
    return null;
  }

  const filePath = relative
    .replace(/\.new\.stories\.tsx?$/i, '.ts')
    .replace(/\.stories\.tsx?$/i, '.ts');

  return `${GITHUB_ATOMIC_BASE}${filePath}`;
}

/**
 * Builds the GitHub URL for the **documentation source** (`.mdx`) that
 * corresponds to a Storybook import path.
 *
 * Use this in docs view. Story files are mapped to their sibling `.mdx`;
 * `.mdx` files and other file types are linked as-is.
 *
 * @example
 * resolveGithubDocsUrl('./src/components/search/atomic-pager/atomic-pager.new.stories.tsx')
 * // => 'https://github.com/coveo/ui-kit/blob/main/packages/atomic/src/components/search/atomic-pager/atomic-pager.mdx'
 *
 * @example
 * resolveGithubDocsUrl('./.storybook/Introduction.mdx')
 * // => 'https://github.com/coveo/ui-kit/blob/main/packages/atomic/.storybook/Introduction.mdx'
 */
export function resolveGithubDocsUrl(
  importPath: string | undefined
): string | null {
  const relative = extractAtomicRelativePath(importPath);
  if (!relative) {
    return null;
  }

  const filePath = /\.mdx$/i.test(relative)
    ? relative
    : relative
        .replace(/\.new\.stories\.tsx?$/i, '.mdx')
        .replace(/\.stories\.tsx?$/i, '.mdx');

  return `${GITHUB_ATOMIC_BASE}${filePath}`;
}
