# Atomic Commerce Sample (vanilla + Vite)

> **Scaffold template**: `atomic-commerce-vite`
> A multi-page commerce experience built with [`@coveo/atomic`](https://docs.coveo.com/en/atomic/latest/) web components in plain HTML/JS, bundled with [Vite](https://vitejs.dev/). It runs against the public `barca` sample commerce organization with no configuration required.

## What it shows

Three page types, mirroring the Headless commerce samples:

- **Home** (`index.html`) — product recommendations plus a **standalone search box** that redirects to the search page on submit.
- **Search** (`search.html`) — `atomic-commerce-interface type="search"`: search box with query suggestions + instant products, facets, breadbox, sort, product grid, and a pager.
- **Product listings** (`listing-surf-accessories.html`, `listing-toys.html`) — `atomic-commerce-interface type="product-listing"` bound to a catalog `view` URL, each with its own standalone search box, facets, sort, product grid, and pager.

Every non-search page has a search box (`atomic-commerce-search-box` with a `redirection-url`) so a query always takes the shopper to the search page.

## Technology stack

- **@coveo/atomic**: Coveo's web-component library
- **@coveo/headless/commerce**: provides the sample commerce engine
- **Vite**: dev server and multi-page build
- **Playwright**: end-to-end tests

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (opens the home page)
pnpm build    # production build (all pages)
pnpm preview  # preview the production build (http://localhost:4173)
pnpm e2e      # end-to-end tests (Playwright)
```

## How it works

- `src/engine.js` builds a commerce engine from `getSampleCommerceEngineConfiguration()` bound to a page's catalog `view.url` (declared via a `data-view-url` attribute).
- `src/commerce-page.js` initializes the single interface on the **search** and **listing** pages.
- `src/home-page.js` initializes the standalone search-box interface and the recommendation interface(s) on the **home** page.
- On the home and listing pages the search box sets `redirection-url="/search.html"`, so submitting a query navigates to the search page.
- `vite.config.js` runs as a multi-page app and copies Atomic's runtime `lang/` and `assets/` out of the installed package (served at `/lang` and `/assets`).

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: `src/engine.js`. It uses `getSampleCommerceEngineConfiguration()` (public sample credentials). Replace it with your own `organizationId`/`accessToken`, and set each page's `data-view-url` to your catalog URLs.
- **Safe to modify**: `src/engine.js` and the Atomic markup in the `*.html` pages.
- **Scaffolding you can usually ignore**: `vite.config.js`, `playwright.config.ts`, and `e2e/`.
- **Credentials**: the sample configuration targets the **public `barca` sample commerce organization**, safe to share with customers or partners. It is not internal credentials.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after
scaffolding:

```sh
npm install @coveo/atomic@<version>
```

## Learn more

- [Coveo Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
- [Coveo for Commerce documentation](https://docs.coveo.com/en/coveo-for-commerce/)
