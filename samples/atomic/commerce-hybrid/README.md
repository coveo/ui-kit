# Atomic + Headless Hybrid Commerce Sample (vanilla + Vite)

> **Scaffold template**: `atomic-commerce-hybrid`
> An [`@coveo/atomic`](https://docs.coveo.com/en/atomic/latest/) commerce experience in which one component — the search box — is replaced by a custom implementation built directly with [`@coveo/headless/commerce`](https://docs.coveo.com/en/headless/latest/) controllers. It runs against the public `barca` sample commerce organization with no configuration required.

Choosing Atomic is a two-way door. You do not have to pick Atomic **or** Headless: you can start with Atomic and replace only the components that need a capability Atomic does not provide, keeping everything else. This sample is the working proof of that.

## What it shows

- **Search** (`search.html`) — the canonical hybrid. Facets, product grid, sort, pager, breadbox, and query summary are all standard Atomic. The search box is `hybrid-search-box`, a plain custom element driven by Headless controllers.
- **Home** (`index.html`) — the same custom element in **standalone** mode, redirecting to the search page, next to standard Atomic recommendation lists.
- **Pants listing** (`listing-pants.html`) — 100% standard Atomic, search box included. Replacing a component on one page does not oblige any other page to follow.
- **Toys listing** (`listing-toys.html`) — standard Atomic components with `atomic-commerce-facets` opened inside a custom `<dialog>`. Custom surrounding UI does **not** require replacing the Atomic component.

## Customize, compose, or replace?

Work down this list and stop at the first option that solves the problem. Each step costs more to build and maintain than the one before it.

| Need                                                                                                   | Approach                                                                                         | In this sample                                                     |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Different look, wording, or layout of an Atomic component                                              | **Customize it**: attributes, `::part()`, CSS custom properties, slots, result/product templates | Product templates on every page                                    |
| Custom UI _around_ an Atomic component: a modal, a drawer, a custom trigger, a different page position | **Compose around it**: wrap the component, leave it untouched                                    | `facet-modal` on the toys listing                                  |
| A behavior the component cannot express at all                                                         | **Replace that component** with Headless controllers, keep the rest of Atomic                    | `hybrid-search-box` on the search page                             |
| Full control of the entire experience, or an existing design system to integrate with                  | Use Headless for everything                                                                      | Out of scope here — see the [`headless/`](../../headless/) samples |

Replacing the whole interface because one component fell short is the outcome this sample exists to prevent.

### Why the search box is replaced here

The dropdown mixes four sources in one grouped layout: query suggestions, recent searches, **filter suggestions per facet** (brand, color), and instant products. `atomic-commerce-search-box` composes its suggestion children into a fixed one- or two-column layout and has no filter-suggestion support at all, so no amount of styling or slotting produces this.

Other needs in the same category: category-page-scoped suggestions, combining commerce and regular-search suggestions in one box, and specialized dropdown keyboard behavior.

## Technology stack

- **@coveo/atomic**: Coveo's web-component library, used for everything except the search box
- **@coveo/headless/commerce**: the commerce engine, and the controllers behind the custom search box
- **Vite**: dev server and multi-page build
- **Playwright**: end-to-end tests

No framework and no Lit. The custom search box is a plain `HTMLElement` subclass, so it is straightforward to port to React, Vue, Angular, or anything else.

## Getting started

```sh
pnpm install
pnpm dev      # start the dev server (opens the home page)
pnpm build    # production build (all pages)
pnpm preview  # preview the production build (http://localhost:4173)
pnpm e2e      # end-to-end tests (Playwright)
```

## How it works

The engine is the entire integration surface. `atomic-commerce-interface` is initialized with an engine you built, the custom search box dispatches into that same engine, and every Atomic component reads from it. Neither side knows about the other.

- `src/engine.js` builds the commerce engine, bound to a page's catalog `view.url` (declared as a `data-view-url` attribute).
- `src/search-page.js` initializes the interface, **then** binds the search box. See "Order of initialization" below.
- `src/components/hybrid-search-box.js` is the replacement search box. `redirection-url` switches it between in-place search and standalone behavior, the same way `atomic-commerce-search-box` does.
- `src/components/facet-modal.js` wraps its children in a `<dialog>`; the Atomic facet inside is untouched.
- `src/aria-live.js` reuses the `atomic-aria-live` element that the interface already injects.
- `vite.config.js` runs as a multi-page app and copies Atomic's runtime `lang/` and `assets/` out of the installed package.

## Integration considerations

The things that actually bite when replacing a component, and what this sample does about each.

### State and order of initialization

`atomic-commerce-interface` installs its URL manager as the **last** step of `initializeWithEngine()`. A query submitted before that promise resolves will run the search and update the products, but will never reach the address bar. The search box input therefore stays disabled until `initialize()` is called, which `src/search-page.js` does only after awaiting the interface.

Nothing else about ordering matters: `executeFirstRequest()` is a no-op once a search has run, so the box submitting first is harmless.

### Navigation

Once the ordering above is respected, `q` is part of the interface's URL state and a query from the custom box lands in the hash automatically. Deep links and the back button keep working.

The standalone box on the home page is different: the sample has to write the `coveo-standalone-search-box-data` local-storage entry itself, because the destination interface reads it in `executeFirstRequest()` to seed the first query. Skip that write and the search page loads empty.

### Analytics

Nothing to do. `initializeWithEngine()` records `@coveo/atomic` in the engine's analytics configuration, and the Commerce API request builder reads the source list from engine state rather than from the caller, so searches initiated by the custom box are reported exactly like Atomic's own. Product clicks in the dropdown do need an explicit `interactiveProduct(...).select()` call, which `hybrid-search-box` makes before navigating.

One thing to know: `initializeWithEngine()` **replaces** `analytics.source`, so setting your own value on the engine configuration has no effect.

### Accessibility

Replacing the search box moves real responsibility onto you. This sample implements:

- ARIA 1.2 combobox semantics: `role="combobox"` with `aria-expanded`, `aria-controls`, `aria-autocomplete`, and `aria-activedescendant` against a `role="listbox"` popup with `role="group"` sections.
- Keyboard support: arrow keys to move through suggestions, `Enter` to select or submit, `Escape` and `Tab` to close.
- The three screen-reader announcements the Atomic search box owns: suggestion counts, the active suggestion, and "search box cleared". These go through the same `atomic-aria-live` element the interface injects, so they are not announced out of order against `atomic-commerce-query-summary`.

Instant products sit **outside** the listbox, as a labelled region of links. They are not selectable options, so putting them in the listbox would misrepresent them. This differs from `atomic-commerce-search-box`, which wraps its suggestion container in `role="application"`.

Everything else — facet, pager, and summary announcements — keeps working, because those components are unchanged.

### Styling

The ~25 `::part()` hooks and the theme integration of `atomic-commerce-search-box` disappear with it. `src/style.css` styles the replacement from scratch using the sample's own variables. Existing `::part()` overrides for the search box will not carry over.

## Using this sample as an MRE

This sample doubles as a minimal reproducible example for troubleshooting.

- **Where to change the configuration**: `src/engine.js`. It uses `getSampleCommerceEngineConfiguration()` (public sample credentials). Replace it with your own `organizationId`/`accessToken`, and set each page's `data-view-url` to your catalog URLs.
- **Safe to modify**: `src/engine.js`, `src/components/`, and the markup in the `*.html` pages.
- **Scaffolding you can usually ignore**: `vite.config.js`, `playwright.config.ts`, and `e2e/`.
- **Credentials**: the sample configuration targets the **public `barca` sample commerce organization**, safe to share with customers or partners. It is not internal credentials.

Filter suggestions require a Commerce API capability that is not enabled on every organization. If the brand and color groups do not appear against your own organization, contact your Coveo representative; the rest of the sample is unaffected.

## Reproducing against a specific version

To reproduce an issue against a specific Coveo UI Kit version, install it after scaffolding:

```sh
npm install @coveo/atomic@<version> @coveo/headless@<version>
```

## Learn more

- [Coveo Atomic documentation](https://docs.coveo.com/en/atomic/latest/)
- [Coveo Headless documentation](https://docs.coveo.com/en/headless/latest/)
- [Coveo for Commerce documentation](https://docs.coveo.com/en/coveo-for-commerce/)
- [`samples/headless/commerce-vite`](../../headless/commerce-vite/) — the same experience built entirely with Headless
- [`samples/atomic/commerce-vite`](../commerce-vite/) — the same experience built entirely with Atomic
