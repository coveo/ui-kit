# Headless Search Sample (Lit + Vite)

> **Scaffold template**: `headless-search-vite`
> A custom search interface built with [`@coveo/headless`](https://docs.coveo.com/en/headless/latest/) and [Lit](https://lit.dev/). It runs against the public `searchuisamples` organization (the `BarcaKnowledge` knowledge base) with no configuration required.

It shows how to assemble a search experience from small, reusable Web
Components, each wired to a Headless controller.

## What it shows

- A search box with query suggestions
- Facets: category (hierarchical), article type, robot series, difficulty, date, and author
- Sort (Relevance / Most Recent), a query summary, and removable breadcrumbs
- A result list and numbered pagination
- Result-click analytics via `buildInteractiveResult`

## Architecture

The app is a tree of Lit components. State comes entirely from Headless
controllers; the components only render it and forward user intent back to the
controllers.

- **`HeadlessController`** (`src/controllers/headless-controller.js`) is a Lit
  [reactive controller](https://lit.dev/docs/composition/controllers/) that
  bridges Headless to Lit: it subscribes on connect, requests a re-render on
  every state change, and unsubscribes on disconnect. It is the single seam
  between the two libraries.
- **`search-app`** (`src/components/search-app.js`) is the shell: it builds all
  the controllers (search box, query summary, sort, breadcrumbs, result list,
  pager, and facets) and triggers the first search.
- **Presentational components** (`search-box`, `query-summary`, `sort-dropdown`,
  `facet`, `category-facet`, `date-facet`, `breadcrumbs`, `result-list`,
  `pager`) each subscribe to the controller they render, so they update
  independently.

Each component uses the **Shadow DOM** with encapsulated
[`static styles`](https://lit.dev/docs/components/styles/), following the
standard Lit approach. The palette lives in `style.css` as `:root` custom
properties (`--accent`, `--surface`, `--border`, ...), which inherit through
shadow boundaries so every component can reference them via `var(--...)`; a few
small style modules are shared in `src/shared-styles.js`.

## Technology stack

- **Lit** (plain JavaScript, no decorators)
- **@coveo/headless**: Coveo's headless search library
- **Vite**: dev server and build
- **Playwright**: end-to-end tests

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (http://localhost:5173)
pnpm build    # production build
pnpm preview  # preview the production build (http://localhost:4173)
pnpm e2e      # end-to-end tests (Playwright)
```

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: everything lives in `src/engine.js`.
  It uses `getSampleSearchEngineConfiguration()` (public sample credentials)
  layered with the `BarcaKnowledge` search hub. To reproduce your own issue,
  replace that configuration with your `organizationId`, `accessToken`, and
  `search.searchHub`/`pipeline`.
- **Safe to modify**: `src/engine.js` (configuration), and any component under
  `src/components` to reproduce a specific UI scenario.
- **Scaffolding you can usually ignore**: `vite.config.js`,
  `playwright.config.ts`, and `e2e/`.
- **Credentials**: the sample configuration targets the **public
  `searchuisamples` organization**, safe to share with customers or partners.
  It is not internal credentials.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after
scaffolding:

```sh
npm install @coveo/headless@<version>
```

## Project structure

```
src/
  engine.js                     Search engine configuration (BarcaKnowledge)
  main.js                       Entry point: loads styles, registers <search-app>
  style.css                     Palette (:root vars) + <body>
  shared-styles.js              Small style modules shared across components
  controllers/
    headless-controller.js      Lit reactive controller bridging Headless -> Lit
  components/
    search-app.js               App shell (builds controllers, first search)
    search-box.js               Search input + suggestions
    query-summary.js            "Results X-Y of Z"
    sort-dropdown.js            Sort control
    facet.js                    Regular (checkbox) facet
    category-facet.js           Hierarchical facet
    date-facet.js               Date range facet
    breadcrumbs.js              Active facet selections
    result-list.js              Result cards
    pager.js                    Numbered pagination
```

## Testing

```sh
pnpm --filter @coveo/ui-kit-sample-headless-search-vite e2e
```

The Playwright smoke test runs against mocked Search API responses
(`@coveo/platform-mock-api`), so it is deterministic and requires no network.

## Learn more

- [Coveo Headless documentation](https://docs.coveo.com/en/headless/latest/)
- [Lit documentation](https://lit.dev/docs/)
