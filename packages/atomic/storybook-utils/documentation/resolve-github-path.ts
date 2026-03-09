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
