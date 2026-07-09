# Headless Commerce Sample (Lit + Vite)

> **Scaffold template**: `headless-commerce-vite`
> A custom commerce interface built with [`@coveo/headless/commerce`](https://docs.coveo.com/en/headless/latest/usage/commerce/) and [Lit](https://lit.dev/). It runs against the public `searchuisamples` organization with no configuration required.

It shows how to assemble a commerce experience from small, reusable Web
Components, each wired to a Headless controller.

## What it shows

- A commerce `search` page (search box with query suggestions, facets, sort, pagination)
- A product `listing` page ("Surf Accessories")
- Product `recommendations` on the home page
- A header search box (on non-search pages) with query suggestions and instant products, redirecting to the search page
- A cart: add/remove controls on product cards, a cart tab with a live count, and a cart page (items, total, purchase/empty), persisted to local storage
- Product-click analytics via `interactiveProduct.select()`
- Hash-based routing between `#/`, `#/search`, `#/listing`, and `#/cart`

## Architecture

The app is a tree of Lit components. State comes entirely from Headless
controllers; the components only render it and forward user intent back to the
controllers.

- **`HeadlessController`** (`src/controllers/headless-controller.js`) is a Lit
  [reactive controller](https://lit.dev/docs/composition/controllers/) that
  bridges Headless to Lit: it subscribes to a Headless controller when the host
  connects, requests a re-render on every state change, and unsubscribes when
  the host disconnects. It is the single seam between the two libraries.
- **Page components** (`home-page`, `search-page`, `listing-page`, `cart-page`)
  build the buildable controllers (`buildSearch`, `buildProductListing`,
  `buildRecommendations`) and their sub-controllers (`sort()`, `pagination()`,
  `facetGenerator()`), then hand them to presentational components.
- **Presentational components** (`search-box`, `standalone-search-box`,
  `facet-list`, `product-list`, `product-card`, `sort-dropdown`, `pager`) each
  subscribe to the controller they render, so they update independently.
- **`commerce-app`** is the shell: header, navigation, and the hash router that
  swaps the active page.

Each component uses the **Shadow DOM** with encapsulated
[`static styles`](https://lit.dev/docs/components/styles/), following the
standard Lit approach. The palette lives in `style.css` as `:root`
custom properties (`--accent`, `--surface`, `--border`, ...), which inherit
through shadow boundaries so every component can reference them via `var(--...)`;
a few small style modules are shared in `src/shared-styles.js`.

## Technology stack

- **Lit** (plain JavaScript, no decorators)
- **@coveo/headless/commerce**: Coveo's headless commerce library
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
  Replace `organizationId`, `accessToken`, the analytics `trackingId`, and the
  `context` (language, country, currency, view) with the values that reproduce
  your issue. The cart is initialized here too (restored from local storage).
- **Safe to modify**: `src/engine.js` (configuration), and any component under
  `src/components` to reproduce a specific UI scenario.
- **Scaffolding you can usually ignore**: `vite.config.js`,
  `playwright.config.ts`, and `e2e/`.
- **Credentials**: the `accessToken` and `organizationId` in `engine.js` are
  **public `searchuisamples` sample credentials**, safe to share with customers
  or partners. They are not internal credentials.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after
scaffolding:

```sh
npm install @coveo/headless@<version>
```

## Project structure

```
src/
  engine.js                     Commerce engine configuration
  cart-utils.js                 Cart local-storage persistence
  main.js                       Entry point: loads styles, registers <commerce-app>
  style.css                     Palette (:root vars) + <body>
  shared-styles.js              Small style modules shared across components
  controllers/
    headless-controller.js      Lit reactive controller bridging Headless -> Lit
  components/
    commerce-app.js             App shell + hash router
    home-page.js                Recommendations
    search-page.js              Search use case
    listing-page.js             Product listing use case
    cart-page.js                Cart use case
    search-box.js               Search input + suggestions
    standalone-search-box.js    Header search box (suggestions + instant products)
    facet-list.js               Regular (checkbox) facets
    product-list.js             Product grid
    product-card.js             Single product card + cart controls
    sort-dropdown.js            Sort control
    pager.js                    Previous/next pagination
```

## Testing

```sh
pnpm --filter @coveo/ui-kit-sample-headless-commerce-vite e2e
```

The Playwright smoke tests run against mocked Commerce API responses
(`@coveo/platform-mock-api`), so they are deterministic and require no network.

## Learn more

- [Coveo Headless Commerce documentation](https://docs.coveo.com/en/headless/latest/usage/commerce/)
- [Lit documentation](https://lit.dev/docs/)
