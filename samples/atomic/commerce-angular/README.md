# Atomic Commerce Sample (Angular)

> **Scaffold template**: `atomic-commerce-angular`

A multi-page commerce experience built with
[`@coveo/atomic-angular`](https://docs.coveo.com/en/atomic/latest/usage/frameworks/atomic-angular-wrapper/),
the Angular wrapper for Coveo's Atomic components, and the Angular CLI. It runs
against the public `barca` sample commerce organization with no configuration
required.

## What it shows

Four pages, mirroring the other Atomic commerce samples:

- **Home** (`/`): product recommendations plus a **standalone search box** that
  redirects to the search page on submit.
- **Search** (`/search`): `atomic-commerce-interface type="search"` with a search
  box (query suggestions and instant products), facets, a breadbox, sort, a
  product grid, and a pager.
- **Product listings** (`/listing/surf-accessories`, `/listing/toys`):
  `atomic-commerce-interface type="product-listing"` bound to a catalog `view`
  URL, each with its own standalone search box, facets, sort, product grid, and
  pager.

## Technology stack

- **@coveo/atomic-angular**: Angular components wrapping `@coveo/atomic`
- **@coveo/headless/commerce**: builds the commerce engine
- **Angular CLI**: dev server and build
- **Playwright**: end-to-end tests (in the ui-kit repository)

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (http://localhost:4200)
pnpm build    # production build
pnpm preview  # serve the production build
```

In the ui-kit repository, `pnpm e2e` runs the Playwright smoke tests. They are
not part of the scaffolded project.

## How it works

- `src/app/engine.ts` builds a commerce engine from
  `getSampleCommerceEngineConfiguration()` bound to a page's catalog `view.url`.
- `src/app/app.routes.ts` declares one route per page. Each listing route
  carries its heading and catalog URL in its `data`, which the router binds to
  the `ListingPage` inputs.
- Each page component (`src/app/*-page/`) initializes its Atomic interface with
  that engine once it has rendered, using `afterNextRender`.
- `angular.json` serves Atomic's `assets/` and `lang/` folders straight from the
  installed `@coveo/atomic-angular` package, and loads the `coveo.css` theme
  from `@coveo/atomic`.

Keep Atomic markup that contains `<template>` elements, such as product
templates, in routed page components like these rather than directly in
`app.html`. Atomic validates each template as soon as it is attached to the
page, and Angular attaches the root component's markup element by element,
before the `<template>` children exist.

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: `src/app/engine.ts`. It uses
  `getSampleCommerceEngineConfiguration()` (public sample credentials). Replace
  it with your own `organizationId`/`accessToken`, and set each page's catalog
  URL (`viewUrl` in `src/app/app.routes.ts`).
- **Safe to modify**: `src/app/engine.ts`, `src/app/app.routes.ts`, and the
  page components under `src/app/`.
- **Scaffolding you can usually ignore**: `angular.json` and `tsconfig*.json`.
- **Credentials**: the sample configuration targets the **public `barca` sample
  commerce organization**, safe to share with customers or partners. It is not
  internal credentials.

## Reproducing against a specific version

The sample is published in lockstep with `@coveo/atomic-angular`, so the
simplest way to reproduce an issue against a given version is to scaffold the
template at that version:

```sh
npm create @coveo/ui@latest my-app --template atomic-commerce-angular --template-version <version>
```

To change the version of an existing project, install `@coveo/atomic-angular`
together with the exact `@coveo/atomic` and `@coveo/headless` versions that
release depends on (see `npm view @coveo/atomic-angular@<version> dependencies`,
then `npm view @coveo/atomic@<atomic-version> dependencies`):

```sh
npm install @coveo/atomic-angular@<version> @coveo/atomic@<atomic-version> @coveo/headless@<headless-version>
```

Mismatched versions install a second copy of `@coveo/headless`, and the build
then fails on incompatible engine types.

## Learn more

- [Coveo Atomic Angular documentation](https://docs.coveo.com/en/atomic/latest/usage/frameworks/atomic-angular-wrapper/)
- [Coveo for Commerce documentation](https://docs.coveo.com/en/coveo-for-commerce/)
