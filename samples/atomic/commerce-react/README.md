# Atomic Commerce Sample (React)

> **Scaffold template**: `atomic-commerce-react`
> A multi-page commerce experience built with [`@coveo/atomic-react`](https://docs.coveo.com/en/atomic/latest/atomic-react/) — the React wrapper for Coveo's Atomic components — bundled with [Vite](https://vitejs.dev/). It runs against the public `barca` sample commerce organization with no configuration required.

## What it shows

Four page types, mirroring the Headless commerce samples, wired with a tiny
client-side router (`src/App.tsx`) and pill-tab navigation:

- **Home** (`/`) — product recommendations plus a **standalone search box** that redirects to the search page on submit.
- **Search** (`/search`) — `AtomicCommerceInterface type="search"`: search box with query suggestions + instant products, facets, sort, a product grid, and a pager.
- **Product listings** (`/listing/surf-accessories`, `/listing/toys`) — `AtomicCommerceInterface type="product-listing"` bound to a catalog `view` URL, each with its own standalone search box, facets, sort, grid, and pager.

Every non-search page has a search box (`redirectionUrl="/search"`) so a query always takes the shopper to the search page.

## Technology stack

- **@coveo/atomic-react/commerce**: React components wrapping `@coveo/atomic`
- **@coveo/headless/commerce**: builds the commerce engine
- **Vite** + **React**: dev server and build
- **Playwright**: end-to-end tests

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (opens the home page)
pnpm build    # production build
pnpm preview  # preview the production build (http://localhost:4173)
pnpm e2e      # end-to-end tests (Playwright)
```

## How it works

- `src/engine.ts` builds a commerce engine from `getSampleCommerceEngineConfiguration()` bound to a page's catalog `view.url`.
- Each page (`src/pages/*`) renders an `AtomicCommerceInterface` (or `AtomicCommerceRecommendationInterface`) fed that engine.
- `src/App.tsx` is a minimal history-based router with pill-tab navigation.
- `vite.config.js` copies Atomic's runtime `assets`, `lang`, and `themes` out of the installed packages into `public/`; the theme is linked in `index.html`.

## Using this sample as an MRE

- **Where to change the configuration**: `src/engine.ts` (public `barca` sample credentials). Replace it with your own `organizationId`/`accessToken` and set each page's catalog URL.
- **Safe to modify**: `src/engine.ts` and the page components under `src/pages`.
- **Scaffolding you can usually ignore**: `vite.config.js`, `playwright.config.ts`, and `e2e/`.
- **Credentials**: the sample configuration targets the **public `barca` sample commerce organization**, safe to share with customers or partners.

## Reproducing against a specific version

```sh
npm install @coveo/atomic-react@<version>
```

## Learn more

- [Coveo Atomic React documentation](https://docs.coveo.com/en/atomic/latest/atomic-react/)
- [Coveo for Commerce documentation](https://docs.coveo.com/en/coveo-for-commerce/)
