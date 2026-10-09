# Atomic Search Sample (Angular)

> **Scaffold template**: `atomic-search-angular`
> A search interface built with [`@coveo/atomic-angular`](https://docs.coveo.com/en/atomic/latest/usage/) — the Angular wrapper for Coveo's Atomic components — using the [Angular CLI](https://angular.dev/tools/cli). It runs against the public `searchuisamples` organization (the `BarcaKnowledge` knowledge base) with no configuration required.

## What it shows

- A search box with query suggestions + instant results
- The same facets as the other Atomic search samples: a hierarchical **Category** facet (`ec_category`) plus **Article type**, **Robot series**, **Difficulty**, and **Author**
- A breadbox, query summary, and a sort dropdown (Relevance / Newest / Oldest)
- A result list with a basic result template and numbered pagination

## Technology stack

- **@coveo/atomic-angular**: Angular components wrapping `@coveo/atomic`
- **@coveo/headless**: builds the search engine
- **Angular** (standalone components, Angular Router) + **Angular CLI**: dev server and build
- **Playwright**: end-to-end tests

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (http://localhost:4200)
pnpm build    # production build (outputs to dist/)
pnpm preview  # serve the production build (http://localhost:4173)
```

## How it works

- `src/app/engine.ts` builds the search engine from `getSampleSearchEngineConfiguration()` scoped to the `BarcaKnowledge` search hub.
- `src/app/pages/search-page.ts` initializes the `<atomic-search-interface>` with that engine and runs the first search; `search-page.html` holds the Atomic markup.
- `src/app/app.routes.ts` routes to the search page. Keep Atomic interfaces in routed (or otherwise dynamically created) components: Angular builds those views before attaching them to the document, so result templates already contain their `<template>` child when Atomic reads them.
- `angular.json` copies Atomic's runtime `assets/` and `lang/` out of the installed `@coveo/atomic` package (served at `/assets` and `/lang`) and adds its `coveo.css` theme to the global styles.

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: `src/app/engine.ts`. It uses `getSampleSearchEngineConfiguration()` (public sample credentials). Replace it with your own `organizationId`/`accessToken` and hub/pipeline.
- **Safe to modify**: `src/app/engine.ts` and the files under `src/app/pages`.
- **Scaffolding you can usually ignore**: `angular.json`, `tsconfig*.json`, and `src/main.ts`.
- **Credentials**: the sample configuration targets the **public `searchuisamples` organization**, safe to share with customers or partners. It is not internal credentials.

## Reproducing against a specific version

```sh
npm install @coveo/atomic-angular@<version>
```

`@coveo/atomic-angular` pins the `@coveo/atomic` version it wraps. If you change it, install the matching `@coveo/atomic` version as well (`npm view @coveo/atomic-angular@<version> dependencies`) so the copied assets and theme match the components.

## Learn more

- [Coveo Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
- [Angular documentation](https://angular.dev/)
