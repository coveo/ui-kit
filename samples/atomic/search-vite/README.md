# Atomic Search Sample (vanilla + Vite)

> **Scaffold template**: `atomic-search-vite`
> A search interface built with [`@coveo/atomic`](https://docs.coveo.com/en/atomic/latest/) web components in plain HTML/JS, bundled with [Vite](https://vitejs.dev/). It runs against the public `searchuisamples` organization (the `BarcaKnowledge` knowledge base) with no configuration required.

It shows how little code is needed to stand up a full Atomic search page: the
experience is declared as markup in `index.html`, and a small entry script
registers the components and points them at the sample organization.

## What it shows

- A search box with query suggestions and instant results
- The same facets as the Headless search samples, managed by an
  `atomic-facet-manager`: a hierarchical **Category** facet (`ec_category`) plus
  **Article type**, **Robot series**, **Difficulty**, and **Author**
- A breadbox, query summary, and a sort dropdown (Relevance / Newest / Oldest)
- A result list with a basic result template (`atomic-result-link`, excerpt)
- Numbered pagination

## Technology stack

- **@coveo/atomic**: Coveo's web-component library
- **@coveo/headless**: provides the sample engine configuration
- **Vite**: dev server and build
- **Playwright**: end-to-end tests

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (opens the browser)
pnpm build    # production build
pnpm preview  # preview the production build (http://localhost:4173)
pnpm e2e      # end-to-end tests (Playwright)
```

## How it works

- `index.html` declares the experience with Atomic layout + components.
- `src/main.js` calls `defineCustomElements()` (from `@coveo/atomic/loader`),
  imports the Coveo theme, then builds a Headless search engine with
  `getSampleSearchEngineConfiguration()` scoped to the `BarcaKnowledge` search
  hub (via `search.searchHub`) and hands it to the interface with
  `initializeWithSearchEngine(engine)` before running the first search.
- `vite.config.js` copies Atomic's runtime `lang/` and `assets/` folders out of
  the installed package into `public/`, because Atomic fetches them from `/lang`
  and `/assets` at runtime.

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: `src/main.js`. It uses
  `getSampleSearchEngineConfiguration()` (public sample credentials). To
  reproduce your own issue, replace it with your `organizationId`,
  `accessToken`, and (if needed) a `search.searchHub`/`pipeline`.
- **Safe to modify**: `src/main.js` (configuration) and the Atomic markup in
  `index.html` to reproduce a specific UI scenario.
- **Scaffolding you can usually ignore**: `vite.config.js`,
  `playwright.config.ts`, and `e2e/`.
- **Credentials**: the sample configuration targets the **public
  `searchuisamples` organization**, safe to share with customers or partners. It
  is not internal credentials.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after
scaffolding:

```sh
npm install @coveo/atomic@<version>
```

## Learn more

- [Coveo Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
- [Atomic component reference](https://docs.coveo.com/en/atomic/latest/reference/)
