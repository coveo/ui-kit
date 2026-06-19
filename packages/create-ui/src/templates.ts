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

type Library = 'atomic' | 'headless' | 'headless-ssr';

export interface Template {
  /** CLI-facing template name passed to `--template`. */
  name: string;
  /** Library the template is built on, used for grouping in prompts. */
  library: Library;
  /** Human-readable description shown in interactive selection. */
  description: string;
  /** Sample directory in the monorepo, relative to the repo root. */
  path: string;
}

const templates: Template[] = [
  // TODO: uncomment when template is available
  // {
  //   name: 'atomic-search',
  //   library: 'atomic',
  //   description: 'Atomic search UI (vanilla + Vite)',
  //   path: 'samples/atomic/search-vite',
  // },
  // {
  //   name: 'atomic-commerce',
  //   library: 'atomic',
  //   description: 'Atomic commerce UI (vanilla + Vite)',
  //   path: 'samples/atomic/commerce-vite',
  // },
  // {
  //   name: 'atomic-search-react',
  //   library: 'atomic',
  //   description: 'Atomic search UI (React)',
  //   path: 'samples/atomic/search-react',
  // },
  // {
  //   name: 'atomic-commerce-react',
  //   library: 'atomic',
  //   description: 'Atomic commerce UI (React)',
  //   path: 'samples/atomic/commerce-react',
  // },
  // {
  //   name: 'headless-search',
  //   library: 'headless',
  //   description: 'Headless search UI (vanilla + Vite)',
  //   path: 'samples/headless/search-vite',
  // },
  // {
  //   name: 'headless-commerce',
  //   library: 'headless',
  //   description: 'Headless commerce UI (vanilla + Vite)',
  //   path: 'samples/headless/commerce-vite',
  // },
  {
    name: 'headless-search-react',
    library: 'headless',
    description: 'Headless search UI (React)',
    path: 'samples/headless/search-react',
  },
  {
    name: 'headless-commerce-react',
    library: 'headless',
    description: 'Headless commerce UI (React)',
    path: 'samples/headless/commerce-react',
  },
  {
    name: 'headless-ssr-search-nextjs',
    library: 'headless-ssr',
    description: 'Headless search SSR (Next.js App Router)',
    path: 'samples/headless-ssr/search-nextjs',
  },
  {
    name: 'headless-ssr-commerce-nextjs',
    library: 'headless-ssr',
    description: 'Headless commerce SSR (Next.js App Router)',
    path: 'samples/headless-ssr/commerce-nextjs',
  },
  {
    name: 'headless-ssr-commerce-nextjs-v4',
    library: 'headless-ssr',
    description:
      'Headless commerce SSR (Next.js App Router, Headless V4 preview)',
    path: 'samples/headless-ssr/commerce-nextjs-v4',
  },
  {
    name: 'headless-ssr-commerce-react-router',
    library: 'headless-ssr',
    description: 'Headless commerce SSR (React Router)',
    path: 'samples/headless-ssr/commerce-react-router',
  },
  {
    name: 'headless-ssr-commerce-express',
    library: 'headless-ssr',
    description: 'Headless commerce SSR (Express)',
    path: 'samples/headless-ssr/commerce-express',
  },
];

export function getTemplate(name: string): Template | undefined {
  return templates.find((t) => t.name === name);
}

export function getTemplates(): Template[] {
  return templates;
}
