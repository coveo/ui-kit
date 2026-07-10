# Headless Commerce SSR with Next.js

> **Scaffold template**: `headless-ssr-commerce-nextjs`
> This sample is the scaffold template used by `npm create @coveo/ui` to bootstrap a Coveo Headless commerce project with server-side rendering (SSR) and the Next.js App Router.

A commerce experience built with [`@coveo/headless-react/ssr-commerce`](https://docs.coveo.com/en/headless/latest/usage/ssr/) and the Next.js App Router. Product data is fetched and rendered on the server, then hydrated on the client for interactivity. It runs against the public `searchuisamples` organization with no configuration required.

## What it shows

- A commerce `search` page (search box, facets, sort, pagination)
- Product `listing` pages served by a single dynamic `[category]` route
- A `cart` page backed by an external-cart abstraction (cookies)
- Product `recommendations` (popular bought / popular viewed)
- Server-side rendering of the initial state with client-side hydration
- Product-click analytics via `interactiveProduct().select()` (clicks open the real `clickUri`)

## Technology stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **@coveo/headless-react/ssr-commerce**: Coveo's SSR commerce utilities
- **Playwright** + **@coveo/platform-mock-api** + **MSW**: deterministic end-to-end tests

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm

## Getting started

```bash
pnpm install
pnpm dev      # start the dev server (http://localhost:3000)
pnpm build    # production build
pnpm start    # serve the production build (http://localhost:3000)
pnpm e2e      # end-to-end tests (Playwright, MSW-mocked)
```

`pnpm dev` redirects `/` to `/search`. No credentials are required — the sample uses the public `searchuisamples` organization.

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: the engine configuration lives in `lib/commerce-engine-config.ts`. It calls `getSampleCommerceEngineConfiguration()` for the public sample credentials. Replace `organizationId`, `accessToken`, and the `context` with the values that reproduce your issue.
- **Context (language, country, currency, view)**: defaults are in `utils/context.ts`, and each page passes its own `view.url` when calling `fetchStaticState` (see `app/**/page.tsx`).
- **Product images**: if you point the sample at your own catalog, add your image host to `images.remotePatterns` in `next.config.mjs`.
- **Safe to modify**: `lib/commerce-engine-config.ts` and `utils/context.ts` (configuration), and any component in `components/` or page in `app/` to reproduce a specific UI scenario.
- **Scaffolding you can usually ignore**: `playwright.config.ts`, `e2e/`, `mocks/`, and `proxy.ts` (the Next.js proxy/middleware that seeds the navigator context).
- **Credentials**: the `accessToken` and `organizationId` are the **public `searchuisamples` sample credentials**, safe to share with customers or partners. They are not internal credentials.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after scaffolding:

```bash
pnpm add @coveo/headless-react@<version>
```

## How the tests stay deterministic

The Playwright tests never call a live API. Client-side requests are mocked with [`@msw/playwright`](https://www.npmjs.com/package/@msw/playwright) (see `e2e/fixtures.ts`), and the server-side `fetchStaticState` calls are mocked by an MSW server that is preloaded into the Next.js process during `pnpm e2e` (see `mocks/` and the `webServer` config in `playwright.config.ts`). Both reuse the handlers from `@coveo/platform-mock-api`.

## Learn more

- [Coveo Headless SSR documentation](https://docs.coveo.com/en/headless/latest/usage/ssr/)
- [Coveo for Commerce](https://docs.coveo.com/en/coveo-for-commerce/)
- [Next.js App Router](https://nextjs.org/docs/app)
