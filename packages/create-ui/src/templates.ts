/**
 * Canonical scaffolding templates.
 *
 * Each template maps a CLI-facing name to a sample directory in the
 * `coveo/ui-kit` monorepo. The `--template` name drops the framework token for
 * vanilla samples (e.g. `atomic-search` -> `samples/atomic/search-vite`); this
 * map holds the real folder path used for tarball extraction.
 *
 * `available` gates whether a template is shown/usable. Samples that are not yet
 * scaffold-ready (e.g. those still coupled to the monorepo) are flagged
 * `false` until their sample story lands.
 *
 * See `samples/CONTRIBUTING.md` for the naming convention.
 */

type Library = 'atomic' | 'headless';

export interface Template {
  /** CLI-facing template name passed to `--template`. */
  name: string;
  /** Library the template is built on, used for grouping in prompts. */
  library: Library;
  /** Human-readable description shown in interactive selection. */
  description: string;
  /** Sample directory in the monorepo, relative to the repo root. */
  path: string;
  /** Whether the template is scaffold-ready and selectable. */
  available: boolean;
}

export const templates: Template[] = [
  {
    name: 'atomic-search',
    library: 'atomic',
    description: 'Atomic search UI (vanilla + Vite)',
    path: 'samples/atomic/search-vite',
    available: false,
  },
  {
    name: 'atomic-commerce',
    library: 'atomic',
    description: 'Atomic commerce UI (vanilla + Vite)',
    path: 'samples/atomic/commerce-vite',
    available: false,
  },
  {
    name: 'atomic-search-react',
    library: 'atomic',
    description: 'Atomic search UI (React)',
    path: 'samples/atomic/search-react',
    available: false,
  },
  {
    name: 'atomic-commerce-react',
    library: 'atomic',
    description: 'Atomic commerce UI (React)',
    path: 'samples/atomic/commerce-react',
    available: false,
  },
  {
    name: 'headless-search',
    library: 'headless',
    description: 'Headless search UI (vanilla + Vite)',
    path: 'samples/headless/search-vite',
    available: false,
  },
  {
    name: 'headless-commerce',
    library: 'headless',
    description: 'Headless commerce UI (vanilla + Vite)',
    path: 'samples/headless/commerce-vite',
    available: false,
  },
  {
    name: 'headless-search-react',
    library: 'headless',
    description: 'Headless search UI (React)',
    path: 'samples/headless/search-react',
    available: true,
  },
  {
    name: 'headless-commerce-react',
    library: 'headless',
    description: 'Headless commerce UI (React)',
    path: 'samples/headless/commerce-react',
    available: true,
  },
];

export function getTemplate(name: string): Template | undefined {
  return templates.find((t) => t.name === name);
}

export function availableTemplates(): Template[] {
  return templates.filter((t) => t.available);
}
