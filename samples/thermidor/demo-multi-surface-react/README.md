# Thermidor Demo Multi-Surface React

The Storefront Preview layout on **one** Thermidor session: a header that stays (search-as-you-type
suggestions and the cart) over a page that changes (home recommendations, the assistant's answer to a
search, search results, listing pages). Each view draws its own A2-UI surfaces, all hosted by one
renderer. It runs on `@coveo/thermidor` as it is, and on the published contract only.

## Running it

```bash
pnpm dev:mock
```

This builds `@coveo/platform-mock-api`, `@coveo/mock-converse-api` and `@coveo/thermidor`, starts the
mock Converse API on port 3456 and opens the sample at http://localhost:5174. If the mock is already
running, `pnpm dev` only starts Vite.

Try it:

1. The home page loads two recommendation carousels.
2. Type `life` in the header: after a 300 ms pause, the popover shows query suggestions and
   matching products, both from the mock's catalog. Keep typing: each new pause replaces the
   streaming header turn.
3. Click **Add** on a suggested product, or **Add to cart** on a product card: the header's cart
   counts it. Open the cart to change it.
4. Press Enter, or pick a completion: with the **AI** toggle on (the default), the assistant page
   opens with the answer, its reasoning steps and its surfaces. The home carousels are gone; the
   header stays. Try `boating safety`, `which kayak should I get?`,
   `what do I need to go snorkeling?`, `gift ideas under $50`, or a follow-up from the next actions.
5. Turn **AI** off and search, or open a **Listing pages** entry: these pages show an _In progress_
   placeholder and send no request (see below).
6. Open **One session** at the bottom: every turn, the view that sent it, and the surfaces it
   created that are still alive.

To run it against a real Agent Gateway, copy `.env.example` to `.env.local` and fill it in.

## What it reproduces

Storefront Preview (admin-ui) uses three Thermidor sessions today, one per view. This sample keeps
the three views and puts them on one session:

| View                                             | `context.custom.surfaceId`     | Components                                                                           |
| ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------ |
| Header: search-as-you-type suggestions           | `storefront-preview`           | QuerySuggestions                                                                     |
| Home page: recommendations                       | `storefront-preview-home`      | ProductCarousel                                                                      |
| Assistant page: the answer to a committed search | `storefront-preview-assistant` | ProductCarousel, NextActionsBar, ComparisonTable, BundleDisplay, ProductResearchCard |

The behaviour is kept:

- the search is debounced by 300 ms, a new keystroke cancels a streaming header turn, and a prompt
  identical to the last one is not sent again;
- the assistant page sends its prompt once per visit;
- going Home ↔ Assistant gives the page fresh surfaces, while the header stays;
- the cart is shared by the header and every page.

## The model

- **One `createSession` for the whole app.** Every view sends its requests through it.
- **Each request declares its view** in `context.custom.surfaceId`, with the three values of the
  published contract above. That is the field agent-gateway's private route reads today. The value
  names a view, not an A2-UI surface: the surfaces get server-chosen `ui-<uuid>` ids.
- **The app maps views to surfaces.** It remembers which view sent each turn (and, for a page, which
  visit of it). A view draws the surfaces its own turns created: the header draws the latest
  header turn's suggestions surface, a page draws the surfaces of its visit's turns. The server
  sends no placement hint, and the app never hard-codes a surface id.
  (`src/views/view-surfaces.ts`, on top of `demo-schema-react`'s `buildSurfaceStream`.)
- **The cart is app state.** The app draws it in the header and sends it in `context.cart` on every
  request, whichever view sends it. No surface owns it.
- **Every surface uses the one public Thermidor catalog** (`createSurface.catalogId`). The views
  differ in which of its components they use, not in which catalog.
- **The mock mirrors the gateway's lifecycle.** Every turn creates fresh `ui-<uuid>` surfaces. A
  header turn deletes the previous suggestions surface, and a page turn deletes the previous page's
  surfaces (`deleteSurface`), so the renderer only holds what is on screen.

### One session, one stream

A Thermidor session streams one turn at a time: it ignores a prompt while a turn is streaming, and
drops an action. With one session, the views take turns. `src/session/turn-scheduler.ts` decides who
waits:

| A new…           | while a header turn streams | while a page turn streams        |
| ---------------- | --------------------------- | -------------------------------- |
| keystroke        | cancels it                  | waits; only the latest is kept   |
| page prompt      | cancels it                  | cancels it (the page is leaving) |
| component action | waits                       | waits                            |

## Known limits

- **A new turn makes the previous view's surfaces inert.** The session only sends actions for the
  surfaces of its latest turn. As soon as the header sends a keystroke, the page's surfaces belong
  to an earlier turn, and their server actions (such as a gateway search option in the next actions)
  are dropped. The page says so in a note. App-side controls keep working: Add to cart, and the
  follow-ups the app turns into a new assistant prompt. Session-scoped surfaces
  ([ADR-017, coveo/ui-kit#8707](https://github.com/coveo/ui-kit/pull/8707)) lift this.
- **Turns are serialized.** Typing in the header while the assistant answers doesn't cut the answer
  short, but the suggestions only arrive after it. With three sessions, both stream at once.
- **Pages with no view id show a placeholder.** The published contract has ids for the header, home
  and assistant only. Search results and listing pages show _In progress_ and send nothing.

## What would need to change

- **@coveo/thermidor:** session-scoped surfaces (ADR-017), so a surface keeps sending actions until
  it is deleted, whichever turn created it.
- **agent-gateway:** view ids for search results and listing pages, and a spike on what a view id
  should map to (today `custom.surfaceId` names a view, which reads oddly next to A2-UI's
  `surfaceId`).
- **@coveo/thermidor-schema:** export `QuerySuggestionsPropsSchema` from `@coveo/thermidor-schema/zod3`.
  It is generated but not exported, so this sample rebuilds it from the exported state schema.

## Structure

```
src/
├── StorefrontApp.tsx           The header over the page, actions, page visits
├── navigation.ts               Page visits and the listing pages
├── session/
│   ├── storefront-session.tsx  The ONE session, its configuration and context providers
│   ├── turn-scheduler.ts       Who waits and who interrupts; the view and visit of each turn
│   └── cart-store.ts           The app's cart, sent in context.cart
├── views/
│   ├── view-surfaces.ts        View → surfaces: each view draws its own turns' surfaces
│   └── SurfaceList.tsx         Draws a view's surfaces, loading placeholders as skeletons
├── a2ui/
│   ├── catalog.ts              The renderers for the Storefront components
│   ├── QuerySuggestions/       New: completions | products popover
│   └── AddToCartButton/        The button added to every product card
├── components/                 Top bar, search box, listing menu, cart, In progress, inspector
└── pages/                      Home, assistant, search and listing pages
```

The renderers for ProductCarousel, NextActionsBar, ComparisonTable, BundleDisplay,
ProductResearchCard and ProductSummary (which BundleDisplay mounts), the agent answer block with its
reasoning steps, the surface stream and the renderer bridge are imported from
[`demo-schema-react`](../demo-schema-react) by relative path rather than copied. Its product cards
expose `ProductCardActionsContext`, which this sample uses to add **Add to cart**;
`demo-schema-react` provides none, so its cards are unchanged.

The mock lives in `@coveo/platform-mock-api` (`src/converse/generate-storefront-response.ts`, with
`templates/schema-response-storefront.ts` and `templates/storefront-conversations.ts`). The schema
routes of `@coveo/mock-converse-api` (`/converse-schema`, which the sample uses by default, and the
`/schema/...` routes `demo-schema-react` uses) hand it every request whose `context.custom.surfaceId`
names a Storefront view. Every other request gets the usual schema scenarios, so `demo-schema-react`
is unaffected.
