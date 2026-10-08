# Atomic + Headless Hybrid Commerce Sample (TypeScript + Vite)

An [`@coveo/atomic`](https://docs.coveo.com/en/atomic/latest/) commerce storefront in which the search box is replaced by a minimal one built with [`@coveo/headless/commerce`](https://docs.coveo.com/en/headless/latest/), and which is extended with a Headless cart and product page. It runs against the public `barca` sample commerce organization with no configuration required.

Choosing Atomic is a two-way door. You do not have to pick Atomic **or** Headless: start with Atomic, and use Headless only for what Atomic does not cover, keeping everything else. This sample is the working proof of that.

## What it shows

- **Search** (`search.html`): a standard Atomic search page, except for the search box: a minimal custom element driven by the Headless `SearchBox` controller. Each product card also carries an add-to-cart button built with Headless, living _inside_ the Atomic card.
- **Home** (`index.html`): a standalone **Atomic** search box that hands its query over to the Headless one on the search page, and Atomic recommendation lists with the same add-to-cart button in each card.
- **Product page** (`product.html`): the product view event, badges, and add-to-cart are Headless; the "viewed together" recommendations are a standard Atomic list scoped to the product.
- **Cart** (`cart.html`): the cart is Headless (quantities, removal, placing the order); the cart recommendations below it are a standard Atomic list that refreshes when the cart changes.
- A **mini-cart** in every page header, showing the cart count from the same engine.

## Customize, compose, extend, or replace?

Work down this list and stop at the first option that solves the problem. Each step costs more to build and maintain than the one before it.

| Need                                                                                  | Approach                                                                                   | In this sample                                              |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Different look, wording, behavior, or layout of an Atomic component                   | **Customize it**: attributes, `::part()`, CSS custom properties, slots, product templates  | Product templates; `href-template` on `atomic-product-link` |
| Custom UI _around_ an Atomic component: a modal, a drawer, a custom trigger           | **Compose around it**: wrap the component, leave it untouched                              | Not shown                                                   |
| A capability Atomic has no component for                                              | **Extend with Headless**: build that piece on the same engine, keep every Atomic component | Cart, mini-cart, product view, badges                       |
| An existing Atomic component that cannot express a behavior you need                  | **Replace that component** with Headless controllers, keep the rest of Atomic              | The search box on the search page                           |
| Full control of the entire experience, or an existing design system to integrate with | Use Headless for everything                                                                | See the [`headless/`](../../headless/) samples              |

Abandoning Atomic because one piece fell short is the outcome this sample exists to prevent.

### The replaced search box

The search page uses `headless-search-box` (`src/components/headless-search-box.ts`) instead of `atomic-commerce-search-box`. It is deliberately minimal: an input, a submit button, and query suggestions rendered in its own markup, in about 80 lines on top of the Headless `SearchBox` controller. Treat it as the starting point for the box your storefront needs (recent queries, instant products, your own dropdown layout), not as a finished component.

Before replacing, check whether customizing is enough: `atomic-commerce-search-box` accepts custom suggestion providers through the public `dispatchSearchBoxSuggestionsEvent`, so an extra suggestion source alone does not require a replacement.

## Why the cart and the product page

Atomic covers search, listings, facets, and recommendations. It has no cart and no product page support, yet both matter beyond their UI:

- The cart is sent with **every** Commerce API request. Ranking and cart recommendations depend on it.
- The `ec.cartAction`, `ec.purchase`, and `ec.productView` events feed Coveo's personalization and reporting.

Headless provides both through the `Cart`, `ProductView`, and `ProductEnrichment` controllers, so an Atomic storefront extends naturally into them.

## Technology stack

- **@coveo/atomic**: Coveo's web-component library, for results, facets, and recommendations
- **@coveo/headless/commerce**: the commerce engine, and the controllers behind the search box, cart, and product page
- **TypeScript** and **Vite**: plain custom elements, no framework
- **Playwright**: end-to-end tests

The Headless pieces are plain `HTMLElement` subclasses, so they drop into a Shopify theme or any other server-rendered storefront, and port easily to React, Vue, or Angular.

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (opens the home page)
pnpm build    # type-check and build all pages
pnpm preview  # preview the production build (http://localhost:4173)
pnpm e2e      # end-to-end tests (Playwright)
```

## How it works

The engine is the entire integration surface. Every Atomic interface on a page is initialized with the same engine the Headless controllers are built from, so both sides read and write the same state. Neither side knows about the other.

- `src/engine.ts` builds one engine per page, bound to the page's catalog `view.url`, with the cart restored from the store.
- `src/page.ts` initializes every Atomic interface on the page with that engine and binds the mini-cart.
- `src/components/headless-search-box.ts` replaces the Atomic search box; `src/search-page.ts` binds it.
- `src/store-cart.ts` stands in for your platform's cart. `src/cart.ts` is the seam between it and Coveo.
- `src/components/add-to-cart-button.ts` works inside Atomic product cards and on the product page.
- `src/components/cart-view.ts`, `mini-cart.ts`, and `product-badges.ts` are the other Headless pieces.
- `src/product-handoff.ts` simulates the product data a platform-rendered product page already has.

## Integration considerations

The things that actually matter when mixing Atomic and Headless, and what this sample does about each.

### Replacing the search box

- **Order of initialization**: `atomic-commerce-interface` installs its URL manager as the last step of `initializeWithEngine()`. A query submitted before that promise resolves runs, but never reaches the address bar, so `src/search-page.ts` binds the box only afterwards. Its input stays disabled until then.
- **The query changes without typing**: it is restored from the URL, changed by the back button, or handed over by the Atomic standalone search box on the home page. Rendering the input from the controller's `state.value` on every change covers all three.
- **Analytics**: nothing to do. The box dispatches into the engine that `initializeWithEngine()` configured, so its searches are reported like Atomic's own.
- **Styling**: the box lives in the page's light DOM and is styled by `src/style.css` with Atomic's theme variables. The `::part()` hooks of `atomic-commerce-search-box` no longer apply.
- **Accessibility**: the box is minimal on purpose, with no keyboard navigation of the suggestions and no ARIA combobox semantics. Add them before using it in production.

### The store owns the cart

Your platform (Shopify, Salesforce Commerce Cloud, your own backend) is the source of truth for the cart. Coveo only needs to be told about it:

- **On page load**, the cart is passed as the engine's initial state (`cart: {items}` in `src/engine.ts`). It is sent with every request, and no event is emitted, because restoring a cart is not a shopper action. On Shopify, this is `{{ cart.items | json }}` in the theme.
- **On a shopper action**, the change goes to the store first, then is mirrored into the Headless `Cart` controller, which emits `ec.cartAction`. Mirroring only after the store call succeeds means a failed add never reaches Coveo as an event. See `src/cart.ts`.
- **On checkout**, `Cart.purchase()` emits `ec.purchase` with the transaction and empties the Headless cart without emitting removal events.

Use one product-to-cart-item mapping everywhere (`toCartItem` in `src/cart.ts`). The `Cart` controller identifies an item by `productId`, `name`, and `price` together, so a mismatch creates a second line instead of updating the first.

> [!WARNING]
> **On Shopify**, the Coveo app's web pixels may already report cart, purchase, and product view events. If they do, emitting the same events from Headless double-counts them: restore the cart into the engine as shown, but do not emit the events yourself. This is being confirmed with the field teams.

### Analytics

`initializeWithEngine()` records `@coveo/atomic` as the analytics source on the engine, and events emitted by Headless controllers built from that engine carry the same source. Headless events are therefore attributed exactly like Atomic's own. Emit them after the interfaces are initialized, as the product page does with `ProductView.view()`.

### Headless inside an Atomic product card

`add-to-cart-button` sits in `atomic-product-template` like any Atomic product component. Four details make that work:

- **Product and engine**: the public `fetchProductContext()` and `initializeBindings()` helpers from `@coveo/atomic` give a custom element its product and the interface's engine, with nothing passed in.
- **Shadow DOM**: Atomic renders each card inside `atomic-product`'s shadow root, so page stylesheets do not reach the button. It carries its own styles and picks up the Atomic theme through CSS custom properties, which do inherit into shadow DOM. Template markup is copied into each card as HTML, so only attributes survive.
- **Clicks**: in grid display, a click anywhere in an `atomic-product` card opens the product. The button stops its click from propagating.
- **Links**: both the card-wide link (`<template slot="link">`) and the name link use `href-template` to open this sample's product page. `href-template` only interpolates string fields, so prices cannot travel in the URL.

### Refreshing Atomic from Headless

Cart recommendations go stale when the cart changes, and `atomic-commerce-recommendation-list` has no public refresh method. Its state lives in the engine, keyed by slot ID, so the cart page refreshes a Headless `Recommendations` controller for the same slot and the Atomic list re-renders. See `src/cart-page.ts`.

### Accessibility

The Headless pieces are your responsibility, unlike the Atomic components around them:

- Cart changes are announced through the `atomic-aria-live` element the interface already injects (`src/aria-live.ts`), so they queue with Atomic's own announcements instead of competing with them.
- Every button has a label naming its product ("Add Chino khakis to cart", "Increase quantity of Chino khakis").
- The cart view re-renders on every change and puts focus back on the control the shopper was using.

### Product page data

On a real storefront the platform renders the product page and already knows the product. This sample has no product database, so `src/product-handoff.ts` hands the clicked card's product over to the product page. Remove it when you port the product page to your platform.

### Badges

`product-badges` requests merchandiser-managed badges for the badge placements in its `placement-ids` attribute. The public sample organization has no badges configured for the placement used here, so none appear unless you point the sample at an organization that has them; the end-to-end tests mock one.

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: `src/engine.ts`. It uses `getSampleCommerceEngineConfiguration()` (public sample credentials). Replace it with your own `organizationId`/`accessToken`, and update the catalog URLs passed to `startPage()` in each `src/*-page.ts`, the recommendation `slot-id` attributes, and the badge `placement-ids`.
- **Safe to modify**: everything under `src/` and the markup in the `*.html` pages.
- **Scaffolding you can usually ignore**: `vite.config.js`, `playwright.config.ts`, and `e2e/`.
- **Credentials**: the sample configuration targets the **public `barca` sample commerce organization**, safe to share with customers or partners. It is not internal credentials.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after copying the sample:

```sh
npm install @coveo/atomic@<version> @coveo/headless@<version>
```

## Learn more

- [Coveo Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
- [Coveo Headless documentation](https://docs.coveo.com/en/headless/latest/)
- [Coveo for Commerce documentation](https://docs.coveo.com/en/coveo-for-commerce/)
- [`samples/atomic/commerce-vite`](../commerce-vite/): the same storefront built entirely with Atomic
- [`samples/headless/commerce-vite`](../../headless/commerce-vite/): a storefront built entirely with Headless
