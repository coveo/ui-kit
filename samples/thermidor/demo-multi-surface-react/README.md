# Thermidor Demo Multi-Surface React

The Storefront Preview layout on **one** Thermidor session: a header that stays (search-as-you-type
suggestions and the cart) over a page that changes (home recommendations, or the assistant's answer
to a search). Each area draws its own A2-UI surfaces, all hosted by one renderer.

## Running it

```bash
pnpm dev:mock
```

This builds `@coveo/platform-mock-api`, `@coveo/mock-converse-api` and `@coveo/thermidor`, starts the
mock Converse API on port 3456 and opens the sample at http://localhost:5174. If the mock is already
running, `pnpm dev` only starts Vite.

Try it:

1. The home page loads two recommendation carousels.
2. Type `life jack` in the header: after a 300 ms pause the suggestions popover shows completions and
   products. Keep typing and each new pause replaces the streaming turn.
3. Click **Add** on a product: the cart in the header counts it.
4. Press Enter, or pick a completion such as `boating safety`: the assistant page opens with the
   answer. The header and the cart stay; the home carousels are gone.
5. Open **One session** at the bottom to see every turn, the area it came from, and the surfaces alive
   in the renderer with the slot each one asked for.

The assistant answers the same prompts as the `/schema` scenarios of `demo-schema-react`: `boating
safety`, `build a beginner surfing kit with budget, mid-range, and premium options`, `i like
cold-water surfing. compare wetsuits for it`, `tell me more about the thermoflex winter wetsuit`, and
a fallback for anything else.

## What it reproduces

Storefront Preview (admin-ui) uses three Thermidor sessions today, one per area:

| Area                                                 | Context                        | Components                                                                           |
| ---------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| Header: search-as-you-type and suggestions, and cart | `storefront-preview`           | QuerySuggestions, Cart                                                               |
| Home page: recommendations                           | `storefront-preview-home`      | ProductCarousel                                                                      |
| Assistant page: the answer to a committed search     | `storefront-preview-assistant` | ProductCarousel, NextActionsBar, ComparisonTable, BundleDisplay, ProductResearchCard |

This sample keeps the behaviour and puts the three areas on one session:

- the search is debounced by 300 ms, a new keystroke cancels the streaming shell turn, and a prompt
  identical to the last one is not sent again;
- the assistant page submits its prompt once per visit;
- going Home ↔ Assistant gives the page fresh surfaces, while the header's surfaces stay;
- the cart lives at session level, so the header and every page share it.

## The model (A2-UI v1.0)

One renderer hosts every surface. A surface id is chosen by the server, unique for the renderer's
lifetime, and the surface lives until a `deleteSurface` removes it. So:

- **Each area is its own surface.** The mock creates `ui-<uuid>` surfaces, as agent-gateway does.
- **Each request names its area.** The sample sends it in `context.custom.surfaceId`, the field
  agent-gateway's private route reads today, with the context values above.
- **The server places each surface.** `createSurface.metadata.extensions.coveo_layout.slot` says
  where a surface belongs (`header.suggestions`, `header.cart` or `main`). The page draws each slot
  from the surfaces that ask for it; it never hard-codes a surface id. A2-UI v1.0 defines
  `metadata.extensions` on `createSurface`, and reserves the `a2ui_` prefix, hence `coveo_layout`.
- **The server owns the lifecycle.**
  - The first turn of the session creates the cart surface, whatever its area.
  - The first header turn creates the suggestions surface, and every later header turn only updates
    its data model.
  - A page turn deletes the previous page's surfaces and creates its own. The page also hides older
    `main` surfaces as soon as it is opened, so it never shows the previous page while the new one
    loads.
- **Actions go to the surface they belong to.** Adding a product from the suggestions dispatches
  `updateCart` on the surface rooted on `Cart`, found by its root component. The cart's contents are
  client-owned and travel in `context.cart`.

### Why `context.custom` and not `supportedCatalogIds`

Every area uses the same catalog (`https://schema.thermidor.coveo.com/a2-ui/catalog.json`); they
differ in which of its components they use. A2-UI's `supportedCatalogIds` tells the agent which
catalogs a renderer can draw, so it can't tell the header from the assistant page. The area is
request context, so the sample sends it in `context.custom`. If the areas get their own catalogs one
day (for example a catalog per area, built from the same components), the renderer could advertise
them in `a2uiRendererCapabilities.supportedCatalogIds` and `createSurface.catalogId` would carry
which one each surface uses.

The field name is the one thing to change: `custom.surfaceId` holds an area, not an A2-UI surface
id, which is confusing next to `createSurface.surfaceId`. Something like `custom.uiContext` would
read better.

### One session, one stream

A Thermidor session streams one turn at a time: it ignores a prompt while a turn is streaming, and
drops an action. With one session for the page, the areas take turns. `src/session/turn-scheduler.ts`
decides who waits:

| A new…           | while a header turn streams | while a page turn streams        |
| ---------------- | --------------------------- | -------------------------------- |
| keystroke        | cancels it                  | waits; only the latest is kept   |
| page prompt      | cancels it                  | cancels it (the page is leaving) |
| component action | waits                       | waits                            |

So typing in the header while the assistant is answering does not cut the answer short: the
suggestions arrive after it. With three sessions, both stream at once. That is the main cost of one
session, and the reason the two changes below are worth making.

## What would need to change

### agent-gateway (private route)

- Read the area from the request context (today `context.custom.surfaceId`; ideally renamed) and
  answer with that area's components only.
- Keep the surfaces of a session alive across turns: reuse the suggestions surface for every header
  turn and update its data model, instead of creating a new `ui-<uuid>` surface per turn.
- Delete the previous page's surfaces when a page turn starts (`deleteSurface`).
- Put a layout hint on each surface, in `createSurface.metadata.extensions` (here `coveo_layout.slot`).
- Create the cart surface once per session, whichever area opens it.

### @coveo/thermidor

- **Done in this PR:** `SessionConfig.surfaceScope: 'session'`. By default `dispatchAction` only
  resolves the surfaces of the active turn, so the cart, created by the first turn, would stop
  accepting actions as soon as another turn runs. Under `'session'`, a surface resolves from the turn
  that created it until a `deleteSurface`. The default is unchanged.
- **Next:** validate inbound `updateDataModel` ops against surfaces of earlier turns too. Today the
  fold validates against the current turn's surfaces, so a later update of the suggestions surface is
  dropped from `response.state` (it still reaches the renderer through `response.a2uiMessages`,
  which is what this sample draws).
- **Next:** keep `createSurface.metadata` in the v0.9 projection, or on `TurnResponse.surfaces`, so a
  consumer doesn't read layout hints from the raw activities (`src/layout/surface-layout.ts` does).
- **Later:** concurrent turns, or one stream per area, so a header turn doesn't wait for a page turn.

### @coveo/thermidor-schema

- Export `QuerySuggestionsPropsSchema` and `CartPropsSchema` from `@coveo/thermidor-schema/zod3`.
  They are generated but not exported, so this sample rebuilds them from the exported state schemas.

## Structure

```
src/
├── StorefrontApp.tsx          The header over the page, the action handler, page visits
├── session/
│   ├── storefront-session.tsx The ONE session (surfaceScope 'session'), its context provider
│   ├── turn-scheduler.ts      Who waits and who interrupts on the one stream
│   └── cart-store.ts          The client-owned cart, sent in context.cart
├── layout/
│   ├── surface-layout.ts      One renderer stream for the session, and each live surface's slot
│   └── Slot.tsx               Draws the surfaces of one slot
├── a2ui/
│   ├── catalog.ts             The renderers for the Storefront components
│   ├── QuerySuggestions/      New: completions and product suggestions
│   └── Cart/                  New: the cart, anchor of updateCart
├── components/                Top bar, search box, session inspector
└── pages/                     Home and assistant pages
```

The renderers for ProductCarousel, NextActionsBar, ComparisonTable, BundleDisplay,
ProductResearchCard and ProductSummary (which BundleDisplay mounts), the agent answer block, the
renderer stream bridge and the environment configuration are imported from
[`demo-schema-react`](../demo-schema-react) by relative path rather than copied. Samples are not
packages, so there is no import path to share them by; if a third sample needs them, moving them to
a shared package would be the next step.

The mock lives in `@coveo/platform-mock-api`
(`src/converse/generate-storefront-response.ts` and
`src/converse/templates/schema-response-storefront.ts`). The `/schema` route of
`@coveo/mock-converse-api` hands it every request whose `context.custom.surfaceId` names a Storefront
area, so `demo-schema-react` is unaffected.
