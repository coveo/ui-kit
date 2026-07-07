# Headless Commerce with React

> **Scaffold template**: `headless-commerce-react`
> This sample is the scaffold template used by `npm create @coveo/ui` to bootstrap a Coveo Headless commerce project with React.

A custom commerce interface built with [`@coveo/headless/commerce`](https://docs.coveo.com/en/headless/latest/usage/commerce/) controllers and React. It runs against the public `searchuisamples` organization with no configuration required.

## What it shows

- A commerce `search` page (search box, facets, sort, pagination) and product `listing` pages
- Product `recommendations` on the home page
- A cart and a product description page (PDP)
- Product-click analytics via `interactiveProduct.select()`

## Technology stack

- **React** + **TypeScript**
- **@coveo/headless/commerce**: Coveo's headless commerce library
- **Vite**: dev server and build
- **Vitest** + **Playwright**: unit and end-to-end tests

## Getting started

```bash
pnpm install
pnpm dev      # start the dev server (http://localhost:5173)
pnpm build    # production build
pnpm preview  # preview the production build (http://localhost:4173)
pnpm test     # unit tests (Vitest)
pnpm e2e      # end-to-end tests (Playwright)
```

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: everything lives in `src/context/engine.ts`. Replace `organizationId`, `accessToken`, and the `context` (language, country, currency, view) with the values that reproduce your issue. The cart and analytics `trackingId` are set here too.
- **Safe to modify**: `src/context/engine.ts` (configuration), and any component under `src/components` or page under `src/pages` to reproduce a specific UI scenario.
- **Scaffolding you can usually ignore**: `vite.config.js`, `playwright.config.ts`, `e2e/`, and `src/setupTests.ts`.
- **Credentials**: the `accessToken` and `organizationId` in `engine.ts` are **public `searchuisamples` sample credentials**, safe to share with customers or partners. They are not internal credentials.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after scaffolding:

```bash
npm install @coveo/headless@<version>
```

## Learn more

- [Coveo Headless Commerce documentation](https://docs.coveo.com/en/headless/latest/usage/commerce/)
- [Coveo for Commerce](https://docs.coveo.com/en/coveo-for-commerce/)
