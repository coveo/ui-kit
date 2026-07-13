# Atomic Search Sample (React)

> **Scaffold template**: `atomic-search-react`
> A search interface built with [`@coveo/atomic-react`](https://docs.coveo.com/en/atomic/latest/atomic-react/) — the React wrapper for Coveo's Atomic components — bundled with [Vite](https://vitejs.dev/). It runs against the public `searchuisamples` organization (the `BarcaKnowledge` knowledge base) with no configuration required.

## What it shows

- A search box with query suggestions + instant results
- The same facets as the Headless search samples: a hierarchical **Category** facet (`ec_category`) plus **Article type**, **Robot series**, **Difficulty**, and **Author**
- A breadbox, query summary, and a sort dropdown (Relevance / Newest / Oldest)
- A result list with a basic result template and numbered pagination

## Technology stack

- **@coveo/atomic-react**: React components wrapping `@coveo/atomic`
- **@coveo/headless**: builds the search engine
- **Vite** + **React**: dev server and build
- **Playwright**: end-to-end tests

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server
pnpm build    # production build
pnpm preview  # preview the production build (http://localhost:4173)
pnpm e2e      # end-to-end tests (Playwright)
```

## How it works

- `src/engine.ts` builds the search engine from `getSampleSearchEngineConfiguration()` scoped to the `BarcaKnowledge` search hub.
- `src/App.tsx` renders an `AtomicSearchInterface` (fed that engine) with the Atomic React components.
- `vite.config.js` copies Atomic's runtime `assets/`, `lang/`, and `themes/` out of the installed packages into `public/` (the components fetch them at `/assets`, `/lang`, and the theme is linked from `/themes`).

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: `src/engine.ts`. It uses `getSampleSearchEngineConfiguration()` (public sample credentials). Replace it with your own `organizationId`/`accessToken` and hub/pipeline.
- **Safe to modify**: `src/engine.ts` and `src/App.tsx`.
- **Scaffolding you can usually ignore**: `vite.config.js`, `playwright.config.ts`, and `e2e/`.
- **Credentials**: the sample configuration targets the **public `searchuisamples` organization**, safe to share with customers or partners. It is not internal credentials.

## Reproducing against a specific version

```sh
npm install @coveo/atomic-react@<version>
```

## Learn more

- [Coveo Atomic React documentation](https://docs.coveo.com/en/atomic/latest/atomic-react/)
- [Coveo Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
