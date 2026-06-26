/**
 * Canonical scaffolding templates.
 *
 * Each template maps a CLI-facing name to the npm package the sample is
 * published as. The CLI resolves that package's `latest` release from the
 * registry and extracts it to scaffold a project.
 */

// TODO: add ssr library #7854
export type Library = 'atomic' | 'headless';

export interface Template {
  /** CLI-facing template name passed to `--template`. */
  name: string;
  /** Library the template is built on, used for grouping in prompts. */
  library: Library;
  /** Human-readable description shown in interactive selection. */
  description: string;
  /** npm package the sample is published as. */
  packageName: string;
}

const templates: Template[] = [
  {
    name: 'atomic-search',
    library: 'atomic',
    description: 'Atomic search UI (vanilla + Vite)',
    packageName: '@coveo/sample-atomic-search',
  },
  {
    name: 'atomic-commerce',
    library: 'atomic',
    description: 'Atomic commerce UI (vanilla + Vite)',
    packageName: '@coveo/sample-atomic-commerce',
  },
  {
    name: 'atomic-search-react',
    library: 'atomic',
    description: 'Atomic search UI (React)',
    packageName: '@coveo/sample-atomic-search-react',
  },
  {
    name: 'atomic-commerce-react',
    library: 'atomic',
    description: 'Atomic commerce UI (React)',
    packageName: '@coveo/sample-atomic-commerce-react',
  },
  {
    name: 'headless-search',
    library: 'headless',
    description: 'Headless search UI (vanilla + Vite)',
    packageName: '@coveo/sample-headless-search',
  },
  {
    name: 'headless-commerce',
    library: 'headless',
    description: 'Headless commerce UI (vanilla + Vite)',
    packageName: '@coveo/sample-headless-commerce',
  },
  {
    name: 'headless-search-react',
    library: 'headless',
    description: 'Headless search UI (React)',
    packageName: '@coveo/sample-headless-search-react',
  },
  {
    name: 'headless-commerce-react',
    library: 'headless',
    description: 'Headless commerce UI (React)',
    packageName: '@coveo/sample-headless-commerce-react',
  },
];

export function getTemplate(name: string): Template | undefined {
  return templates.find((t) => t.name === name);
}

export function getTemplates(): Template[] {
  return templates;
}
