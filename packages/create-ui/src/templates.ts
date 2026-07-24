/**
 * Canonical scaffolding templates.
 *
 * Each template maps a CLI-facing name to the npm package the sample is
 * published as. The CLI resolves that package's `latest` release from the
 * registry and extracts it to scaffold a project.
 */

export type Library = 'atomic' | 'headless' | 'headless-ssr';

export interface LibraryInfo {
  /** Human-readable name, e.g. "Atomic". */
  label: string;
  /** One-line description shown as a dim hint next to the library. */
  hint: string;
}

export const LIBRARIES: Record<Library, LibraryInfo> = {
  atomic: {
    label: 'Atomic',
    hint: 'Pre-built, customizable web components',
  },
  headless: {
    label: 'Headless',
    hint: 'Framework-agnostic state, you build the UI',
  },
  'headless-ssr': {
    label: 'Headless SSR',
    hint: 'Headless with server-side rendering',
  },
};

export const LIBRARY_ORDER: readonly Library[] = ['atomic', 'headless', 'headless-ssr'];

export interface Template {
  /** CLI-facing template name passed to `--template`. */
  name: string;
  /** Library the template is built on; determines its group. */
  library: Library;
  /**
   * Use case and framework, shown beneath the library group header in the
   * interactive prompt, e.g. "Search (Vite)". The library is
   * intentionally omitted here because the group header already states it.
   */
  label: string;
  /** npm package the sample is published as. */
  packageName: string;
}

const templates: Template[] = [
  {
    name: 'atomic-search',
    library: 'atomic',
    label: 'Search (Vite, @coveo/atomic)',
    packageName: '@coveo/ui-kit-sample-atomic-search-vite',
  },
  {
    name: 'atomic-commerce',
    library: 'atomic',
    label: 'Commerce (Vite, @coveo/atomic)',
    packageName: '@coveo/ui-kit-sample-atomic-commerce-vite',
  },
  {
    name: 'atomic-search-react',
    library: 'atomic',
    label: 'Search (React, @coveo/atomic-react)',
    packageName: '@coveo/ui-kit-sample-atomic-search-react',
  },
  {
    name: 'atomic-commerce-react',
    library: 'atomic',
    label: 'Commerce (React, @coveo/atomic-react)',
    packageName: '@coveo/ui-kit-sample-atomic-commerce-react',
  },
  {
    name: 'headless-search',
    library: 'headless',
    label: 'Search (Vite, @coveo/headless)',
    packageName: '@coveo/ui-kit-sample-headless-search-vite',
  },
  {
    name: 'headless-commerce',
    library: 'headless',
    label: 'Commerce (Vite, @coveo/headless)',
    packageName: '@coveo/ui-kit-sample-headless-commerce-vite',
  },
  {
    name: 'headless-search-react',
    library: 'headless',
    label: 'Search (React, @coveo/headless)',
    packageName: '@coveo/ui-kit-sample-headless-search-react',
  },
  {
    name: 'headless-commerce-react',
    library: 'headless',
    label: 'Commerce (React, @coveo/headless)',
    packageName: '@coveo/ui-kit-sample-headless-commerce-react',
  },
  {
    name: 'headless-ssr-commerce-nextjs',
    library: 'headless-ssr',
    label: 'Commerce SSR (Next.js App Router, @coveo/headless-react)',
    packageName: '@coveo/ui-kit-sample-headless-ssr-commerce-nextjs',
  },
  {
    name: 'headless-ssr-commerce-express',
    library: 'headless-ssr',
    label: 'Commerce SSR (Express, @coveo/headless/ssr)',
    packageName: '@coveo/ui-kit-sample-headless-ssr-commerce-express',
  },
];

export function describeTemplate(template: Template): string {
  return `${LIBRARIES[template.library].label} ${template.label}`;
}

export function getTemplate(name: string): Template | undefined {
  return templates.find((t) => t.name === name);
}

export function getTemplates(): Template[] {
  return templates;
}
