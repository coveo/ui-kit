# Headless Commerce SSR with Express

> **Scaffold template**: `headless-ssr-commerce-express`
> This sample is the scaffold template used by `npm create @coveo/ui` to bootstrap a generic (no-framework) Coveo Headless commerce project with server-side rendering (SSR) on a plain Express server.

A commerce experience built with [`@coveo/headless/ssr-commerce`](https://docs.coveo.com/en/headless/latest/usage/ssr/) and a minimal Express server — no UI framework. Product data is fetched and rendered to HTML on the server, then hydrated on the client for interactivity. It runs against the public `searchuisamples` organization with no configuration required.

## What it shows

- A commerce `search` page (search box, facets, sort, pagination)
- Product `listing` pages served by a single dynamic `/listing/:listingId` route
- Server-side rendering of the initial state with client-side hydration (each component is a plain SSR render function paired with a hydration function)
- URL deep-linking of the query, facets, sort, and pagination via the parameter manager

## Technology stack

- **Express** + **TypeScript**, bundled with **esbuild** (client) and compiled with **tsc** (server)
- **@coveo/headless/ssr-commerce**: Coveo's framework-agnostic SSR commerce controllers
- **Playwright** + **@coveo/platform-mock-api** + **MSW**: deterministic end-to-end tests

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm

## Getting started

```bash
pnpm install
pnpm dev      # build in watch mode + run the server (http://localhost:3000)
pnpm build    # production build (server + client + e2e mocks)
pnpm start    # serve the production build (http://localhost:3000)
pnpm e2e      # end-to-end tests (Playwright, MSW-mocked)
```

`/` redirects to `/search`. No credentials are required — the sample uses the public `searchuisamples` organization.

## Project structure

- `src/server.ts` — Express routes (`/search`, `/listing/:listingId`); fetches the static state and returns fully rendered HTML.
- `src/client.ts` — reads the injected SSR state and hydrates the matching engine (search or listing).
- `src/lib/` — engine configuration (`engine-config.ts`), engine definitions (`engine-definition.ts`), and navigator context.
- `src/components/` — one module per UI concern; each exposes an SSR render function and a client hydration function.
- `src/common/` — the app shell (`renderApp.ts`), the HTML document (`renderHtml.ts`), styles, and helpers.

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: the engine configuration lives in `src/lib/engine-config.ts`. It calls `getSampleCommerceEngineConfiguration()` for the public sample credentials. Replace `organizationId`, `accessToken`, and the `context` with the values that reproduce your issue.
- **Context (language, country, currency, view)**: set per request in `src/server.ts` when calling `fetchStaticState` (each route passes its own `view.url`).
- **Safe to modify**: `src/lib/engine-config.ts` (configuration), and any component in `src/components/` or route in `src/server.ts` to reproduce a specific UI scenario.
- **Scaffolding you can usually ignore**: `playwright.config.ts`, `e2e/`, and `mocks/` (the deterministic test setup).
- **Credentials**: the `accessToken` and `organizationId` are the **public `searchuisamples` sample credentials**, safe to share with customers or partners. They are not internal credentials.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after scaffolding:

```bash
pnpm add @coveo/headless@<version>
```

## How the tests stay deterministic

The Playwright tests never call a live API. Client-side requests are mocked with [`@msw/playwright`](https://www.npmjs.com/package/@msw/playwright) (see `e2e/fixtures.ts`), and the server-side `fetchStaticState` calls are mocked by an MSW server preloaded into the Express process during `pnpm e2e` (the `build:mocks` script bundles `mocks/register.ts` to plain JS, which the `webServer` config in `playwright.config.ts` preloads via `NODE_OPTIONS`). Both reuse the handlers from `@coveo/platform-mock-api`.

## Learn more

- [Coveo Headless SSR documentation](https://docs.coveo.com/en/headless/latest/usage/ssr/)
- [Coveo for Commerce](https://docs.coveo.com/en/coveo-for-commerce/)
