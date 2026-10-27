# Thermidor Demo Multi-Surface React

The Storefront Preview layout on **one** Thermidor session: a header that stays (the search box and
the cart) over a page that changes (home recommendations, the assistant's answer to a
search, search results, listing pages). Each view draws its own A2-UI surfaces, all hosted by one
renderer. It runs on the published contract only, and on `@coveo/thermidor`'s session-scoped
surfaces (coveo/ui-kit#8750, #8751, #8752).

## Running it

```bash
pnpm dev
```

This builds the sample's dependencies (`@coveo/thermidor` and the mock), then starts the mock
Converse API on port 3456 and the sample at http://localhost:5174. If the mock is already running,
`pnpm dev:vite` only starts Vite.

Try it (the mock is described [below](#the-multi-surface-mock)):

1. Type a search in the header and press Enter: with the **AI** toggle on (the default), the
   assistant page opens with the answer, its reasoning steps and its surfaces; the header stays. Try
   `boating safety`, `which kayak should I get?`, `what do I need to go snorkeling?`,
   `gift ideas under $50`, or a follow-up from the next actions.
2. On the kayak answer, pick **See all kayaks**: the server runs the search the agent saved behind
   that option and opens it as a search surface (facets, sort, pagination). Change the sort or a
   facet: the server answers from the search it keeps.
3. Click **Add to cart** on a product card: the header's cart counts it. Open the cart to change it.
4. Turn **AI** off and search `kayak`: the search page shows the search surface the server opened
   for it (facets, sort, pagination), answered from the search it keeps.
5. Open a **Listing pages** entry, such as **Surfing**: it sends its category as a search and shows
   the search surface the server opens for it; the URL names that surface
   (`/listing/surfing?surface=ui-…`). Check a facet, search something else, then use the browser's
   **Back**: the server sends the listing again as it keeps it, facet checked (see
   [Going back](#going-back)).
6. Open **One session** at the bottom: every turn, the view that sent it, and the surfaces it
   created that are still alive. `GET http://localhost:3456/multi-surface/sessions` shows what the
   mock keeps for each session.

To run it against a real Agent Gateway, copy `.env.example` to `.env.local`, fill it in and run
`pnpm dev:vite`.

### End-to-end tests

```bash
pnpm e2e
```

Playwright starts the mock on port 3466 and the sample on port 4175, then walks the pages above
(`e2e/storefront.e2e.ts`). Build the sample's dependencies first (`pnpm dev` does); CI builds them
before running the sample's `e2e` script.

## What it reproduces

Storefront Preview (admin-ui) uses one Thermidor session per view today. This sample keeps the
views and puts them on one session:

| View                                             | `context.custom.surfaceId`     | Components                                                                                 |
| ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------ |
| Home page: recommendations                       | `storefront-preview-home`      | ProductCarousel                                                                            |
| Assistant page: the answer to a committed search | `storefront-preview-assistant` | ProductCarousel, NextActionsBar, ComparisonTable, BundleDisplay, ProductResearchCard       |
| Search page: results for a search with AI off    | `storefront-preview-search`    | CommerceSearch, LayoutStack, QuerySummary, Sort, ProductList, Pagination, PageSize, facets |

The behaviour is kept:

- typing in the search box sends nothing: a search is sent when it is committed;
- every page has a URL, and the browser's Back and Forward show it again;
- opening a page gives it fresh surfaces, while the header stays;
- the cart is shared by the header and every page.

## The model

- **One `createSession` for the whole app.** Every view sends its requests through it.
- **Each request declares its view** in `context.custom.surfaceId`, with the values of the
  published contract above. The value names a view, not an A2-UI surface: the surfaces get
  server-chosen `ui-<uuid>` ids.
- **A page draws the surfaces of its own turn.** A page sends its prompt as it is shown, and draws
  the surfaces the turn of that prompt created. The server sends no placement hint, and the app
  never hard-codes a surface id. (`src/views/view-surfaces.ts`, from the turn's
  `response.surfaces`.)
- **The cart is app state.** The app draws it in the header and sends it in `context.cart` on every
  request, whichever view sends it. No surface owns it.
- **Every surface uses the one public Thermidor catalog** (`createSurface.catalogId`). The views
  differ in which of its components they use, not in which catalog.
- **The server keeps every surface.** Each one gets a fresh `ui-<uuid>` id and stays in the
  session's state until the agent deletes it; a new page does not delete the previous page's
  surfaces. The app draws only the current page's.
- **Every live surface takes actions.** The session sends an action from any surface that is still
  alive, whichever turn created it, so a page stays usable after another view has sent a turn.

### One session, one request

`@coveo/thermidor` sends one request at a time, prompts and actions alike, exposes it as
`session.request`, and withholds any dispatch made while it is in flight. The sample builds on that
rather than tracking requests itself:

- **Surfaces lock from the request in flight.** Each view draws its surfaces with
  `demo-schema-react`'s `TurnSurfaces`, which locks them while `session.request` is set
  (`src/views/ViewSurfaces.tsx`). A page only sees the requests of its own turn and surfaces.
- **Loading placeholders come from the data model.** A surface whose data model declares
  `isLoading: true` is drawn as its component's skeleton while its turn streams
  (`DiscoveredSurface.isLoading`). The session drops a placeholder its turn left behind.
- **The package keeps no queue,** so `src/session/turn-scheduler.ts` keeps the latest page prompt
  and sends it once `session.request` clears:

| A new…           | while a request is in flight                   |
| ---------------- | ---------------------------------------------- |
| page prompt      | cancels it, then is sent (the page is leaving) |
| component action | withheld (the surface is locked)               |

A cancelled request unwinds a few microtasks after `session.cancel()`, so the next prompt waits for
`session.request` to clear instead of being withheld.

### Going back

The URL names the page, and the browser keeps the history: the app keeps none
(`src/navigation.ts`). The server keeps each surface's state, so it is the one that shows a page
again:

| Page      | URL                              |
| --------- | -------------------------------- |
| Home      | `/`                              |
| Assistant | `/assistant?q=<prompt>`          |
| Search    | `/search?q=<query>&surface=<id>` |
| Listing   | `/listing/<slug>?surface=<id>`   |

- **The URL names the search surface.** Once a search or listing page's turn creates its search
  surface, the app writes its id into the URL (`history.replaceState`).
- **A page shown again asks the server to restore it.** The browser's Back or Forward, or opening
  the URL, sends the page's prompt as usual, with `context.custom.restoreSurfaceId` set to the id in
  the URL. When the session still has that surface, the server sends it again, same id, with its
  current state (facets, sort, page as last acted on), and runs no search. Otherwise it runs the
  search, and the app puts the new id in the URL. A restore is an ordinary turn, and the page draws
  only what it sends back.
- **Assistant answers aren't restored yet.** Coming back to one with the browser sends nothing, and
  the page says that going back to an answer isn't supported yet.

## Known limits

- **Requests are serialized.** One request is in flight at a time, for every view. With one
  session per view, several stream at once. ADR-018 keeps this for the EAP.
- **No query suggestions.** The search box sends nothing while typing; see below.
- **Assistant answers can't be shown again.** The server has no way to restore an answer yet, so
  the page says so instead of asking again.
- **Listing pages are searches.** The published contract has no view id for them, so a listing sends
  its category as a search on `storefront-preview-search`.
- **The home page sends nothing.** A request needs a message or an action, and the server gives
  `storefront-preview-home` an empty run anyway, so the home page has nothing to ask until the
  session can open itself. The session opens on the first search.

## What changes once the open work lands

- **`initialize`** (ADR-018; coveo/ui-kit#8756): the session opens itself, so the home page can
  open it and show what the server answers for `storefront-preview-home`.
- **The session shell and query suggestions** (coveo/ui-kit#8757, #8758): the producer answers `initialize` with a long-lived `SessionShell`
  holding a `SearchBox` and its `QuerySuggestions`, and a pause in typing dispatches
  `fetchSuggestions`. The header can then draw that surface as its search box, with suggestions.
- **The server:** a view id for listing pages, an answer for `storefront-preview-search` (the mock
  answers it; the real server does not yet), and a
  spike on what a view id should map to (today `custom.surfaceId` names a view, which reads oddly
  next to A2-UI's `surfaceId`).

## Structure

```
e2e/
└── storefront.e2e.ts           Playwright walk through every page, against the mock
src/
├── StorefrontApp.tsx           The header over the page, actions, the page the URL names
├── navigation.ts               URL ↔ page, and the listing pages
├── session/
│   ├── storefront-session.tsx  The ONE session, its configuration and context providers
│   ├── turn-scheduler.ts       The page's prompt, sent once the session is free, and its turn
│   └── cart-store.ts           The app's cart, sent in context.cart
├── views/
│   ├── view-surfaces.ts        Page → surfaces: a page draws its own turn's surfaces
│   └── ViewSurfaces.tsx        Draws them with TurnSurfaces, locked by the page's own request
├── a2ui/
│   ├── catalog.ts              The renderers for the Storefront components
│   └── AddToCartButton/        The button added to every product card
├── components/                 Top bar, search box, listing menu, cart, inspector
└── pages/                      Home, assistant, search and listing pages
```

The renderers for ProductCarousel, NextActionsBar, ComparisonTable, BundleDisplay,
ProductResearchCard, ProductSummary (which BundleDisplay mounts) and the commerce search layout, the
agent answer block with its reasoning steps, `TurnSurfaces`, the session request
helpers and the renderer bridge are imported from
[`demo-schema-react`](../demo-schema-react) by relative path rather than copied. Its product cards
expose `ProductCardActionsContext`, which this sample uses to add **Add to cart**;
`demo-schema-react` provides none, so its cards are unchanged.

## The multi-surface mock

`@coveo/platform-mock-api` answers the sample from one file,
`src/converse/generate-multi-surface-response.ts`. `@coveo/mock-converse-api` hands it every request
on its schema routes (`/converse-schema`, which the sample uses by default) that names a view in
`context.custom.surfaceId`. Every other request gets the usual schema scenarios, so
`demo-schema-react` is unaffected.

It keeps each session's state between requests:

- **every surface** it sent, until the agent deletes it, so a new turn never drops another view's;
- **search options:** the search behind a `searchOption` next action stays on the server, and the
  client only gets its id. Picking it opens a search surface whose actions are answered from the
  kept search (`templates/schema-response-search.ts`);
- **each search surface,** under its own `ui-<uuid>` id, with the search it shows, so a second
  search never replaces the first, its actions answer from its own search, and a page shown again
  can ask for it back in `context.custom.restoreSurfaceId`;
- **the cart:** the request's `context.cart` replaces it, then an `updateCart` action applies to it;
- **one turn at a time:** another assistant or search request while one runs gets a 409.

On `storefront-preview-assistant`, a message runs the agent (the storefront and schema scenarios),
which is told what the shopper is looking at on the search surface. On `storefront-preview-search`,
a message opens a search surface for that query, or, with a `restoreSurfaceId` the session still
has, sends that surface again with its current state. On both, an action is answered by the server.
`storefront-preview` and `storefront-preview-home` get an empty run, and any other view gets a 400.
