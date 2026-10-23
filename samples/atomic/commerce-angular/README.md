# Atomic Commerce Sample (Angular)

> **Scaffold template**: `atomic-commerce-angular`
> A multi-page commerce experience built with [`@coveo/atomic-angular`](https://docs.coveo.com/en/atomic/latest/usage/) — the Angular wrapper for Coveo's Atomic components — using the [Angular CLI](https://angular.dev/tools/cli). It runs against the public `barca` sample commerce organization with no configuration required.

## What it shows

Four page types, mirroring the other Atomic commerce samples, wired with the Angular Router (`src/app/app.routes.ts`) and pill-tab navigation:

- **Home** (`/`) — product recommendations plus a **standalone search box** that redirects to the search page on submit.
- **Search** (`/search`) — `<atomic-commerce-interface type="search">`: search box with query suggestions + instant products, facets, sort, a product grid, and a pager.
- **Product listings** (`/listing/surf-accessories`, `/listing/toys`) — `<atomic-commerce-interface type="product-listing">` bound to a catalog `view` URL, each with its own standalone search box, facets, sort, grid, and pager.

Every non-search page has a search box (`redirection-url="/search"`) so a query always takes the shopper to the search page.

## Technology stack

- **@coveo/atomic-angular**: Angular components wrapping `@coveo/atomic`
- **@coveo/headless/commerce**: builds the commerce engine
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

- `src/app/engine.ts` builds a commerce engine from `getSampleCommerceEngineConfiguration()` bound to a page's catalog `view.url`.
- Each page (`src/app/pages/*`) initializes its `<atomic-commerce-interface>` (or `<atomic-commerce-recommendation-interface>`) with that engine; the listing page receives its title and catalog URL from the route's `data`.
- Keep Atomic interfaces in routed (or otherwise dynamically created) components: Angular builds those views before attaching them to the document, so product templates already contain their `<template>` child when Atomic reads them.
- `angular.json` copies Atomic's runtime `assets/` and `lang/` out of the installed `@coveo/atomic` package (served at `/assets` and `/lang`) and adds its `coveo.css` theme to the global styles.

## Using this sample as an MRE

- **Where to change the configuration**: `src/app/engine.ts` (public `barca` sample credentials). Replace it with your own `organizationId`/`accessToken` and set each page's catalog URL in `src/app/app.routes.ts` and the page components.
- **Safe to modify**: `src/app/engine.ts`, `src/app/app.routes.ts`, and the page components under `src/app/pages`.
- **Scaffolding you can usually ignore**: `angular.json`, `tsconfig*.json`, and `src/main.ts`.
- **Credentials**: the sample configuration targets the **public `barca` sample commerce organization**, safe to share with customers or partners.

## Reproducing against a specific version

```sh
npm install @coveo/atomic-angular@<version>
```

`@coveo/atomic-angular` pins the `@coveo/atomic` version it wraps. If you change it, install the matching `@coveo/atomic` version as well (`npm view @coveo/atomic-angular@<version> dependencies`) so the copied assets and theme match the components.

## Learn more

- [Coveo Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
- [Coveo for Commerce documentation](https://docs.coveo.com/en/coveo-for-commerce/)
- [Angular documentation](https://angular.dev/)
