# Atomic Search Sample (Angular)

> **Scaffold template**: `atomic-search-angular`

A search interface built with
[`@coveo/atomic-angular`](https://docs.coveo.com/en/atomic/latest/usage/frameworks/atomic-angular-wrapper/),
the Angular wrapper for Coveo's Atomic components, and the Angular CLI. It runs
against the public `searchuisamples` organization (the `BarcaKnowledge`
knowledge base) with no configuration required.

## What it shows

- A search box with query suggestions and instant results
- The same facets as the other search samples: a hierarchical **Category**
  facet (`ec_category`) plus **Article type**, **Robot series**, **Difficulty**,
  and **Author**
- A breadbox, query summary, and a sort dropdown (Relevance / Newest / Oldest)
- A result list with a basic result template and numbered pagination

## Technology stack

- **@coveo/atomic-angular**: Angular components wrapping `@coveo/atomic`
- **@coveo/headless**: builds the search engine
- **Angular CLI**: dev server and build
- **Playwright**: end-to-end tests (in the ui-kit repository)

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (http://localhost:4200)
pnpm build    # production build
pnpm preview  # serve the production build
```

In the ui-kit repository, `pnpm e2e` runs the Playwright smoke test. It is not
part of the scaffolded project.

## How it works

- `src/app/engine.ts` builds the search engine from
  `getSampleSearchEngineConfiguration()` scoped to the `BarcaKnowledge` search
  hub.
- `src/app/search-page/` holds the Atomic markup. The page initializes its
  `atomic-search-interface` with the engine once it has rendered, using
  `afterNextRender`, then executes the first search.
- `src/app/app.routes.ts` serves that page at `/`.
- `angular.json` serves Atomic's `assets/` and `lang/` folders straight from the
  installed `@coveo/atomic-angular` package, and loads the `coveo.css` theme
  from `@coveo/atomic`.

Keep Atomic markup that contains `<template>` elements, such as result
templates, in a routed page component like this one rather than directly in
`app.html`. Atomic validates each template as soon as it is attached to the
page, and Angular attaches the root component's markup element by element,
before the `<template>` children exist.

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: `src/app/engine.ts`. It uses
  `getSampleSearchEngineConfiguration()` (public sample credentials). Replace it
  with your own `organizationId`/`accessToken` and hub/pipeline.
- **Safe to modify**: `src/app/engine.ts` and the page under
  `src/app/search-page/`.
- **Scaffolding you can usually ignore**: `angular.json` and `tsconfig*.json`.
- **Credentials**: the sample configuration targets the **public
  `searchuisamples` organization**, safe to share with customers or partners. It
  is not internal credentials.

## Reproducing against a specific version

The sample is published in lockstep with `@coveo/atomic-angular`, so the
simplest way to reproduce an issue against a given version is to scaffold the
template at that version:

```sh
npm create @coveo/ui@latest my-app --template atomic-search-angular --template-version <version>
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
- [Coveo Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
