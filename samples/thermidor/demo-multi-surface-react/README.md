# Thermidor Demo Multi-Surface React

The Storefront Preview layout on **one** Thermidor session: a header that stays (the search box and
the cart) over a page that changes (home recommendations, the assistant's answer to a
search, search results with the assistant's chat panel beside them, listing pages). Each view draws its own A2-UI surfaces, all hosted by one
renderer. It runs on the published contract only, and on `@coveo/thermidor`'s session-scoped
surfaces (coveo/ui-kit#8750, #8751, #8752).

## Running it

```bash
pnpm dev
```

`pnpm dev` just works: it builds `@coveo/thermidor`, then starts the sample at
http://localhost:5174 against the public demo organization (`searchuisamples`, in production). It
runs Vite in `demo` mode, which loads the committed [`.env.demo`](.env.demo); in that mode Vite
gives `.env.demo` precedence over `.env.local`. There is no mock: every request goes to a real
Agent Gateway.

| Command                  | Backend                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `pnpm dev`               | The public demo organization (no configuration needed)                             |
| `pnpm dev:local`         | The organization in your `.env.local`                                              |
| `pnpm dev:agent-gateway` | A local Agent Gateway on port 8990, such as thermidor-stack's (needs `.env.local`) |

For `dev:local` and `dev:agent-gateway`, copy `.env.example` to `.env.local` and set
`VITE_COVEO_ORGANIZATION_ID` with its token, agent configuration ID, tracking ID and locale
(`VITE_COVEO_LANGUAGE`, `VITE_COVEO_COUNTRY`, `VITE_COVEO_CURRENCY`). With no
organization set, the sample falls back to the public demo organization as a bundle
([`src/public-sample-configuration.ts`](src/public-sample-configuration.ts), as in
`demo-schema-react`).

Try it:

1. Ask a question in the header and press Enter. The prompt goes to the session shell, and the
   gateway routes it by intent: a question runs the agent, so the assistant layout opens as a chat
   with the answer, its reasoning steps and its surfaces; the header stays. Try
   `which kayak should I get?`, `what do I need to go snorkeling?` or `any gift ideas under $50?`.
   Keep chatting from the input at the bottom of the page, or pick a follow-up from the next
   actions: both go to the agent, and each answer joins the thread with its own surfaces.
2. On the kayak answer, pick **See all kayaks**: the server runs the search the agent saved behind
   that option and opens it as a search surface (facets, sort, pagination). The page switches to
   the search layout: the results on the left, and the conversation so far goes on in the chat
   panel on the right. Change the sort or a facet: the server answers from the search it keeps.
   **← Back** returns to the chat, where **See the results →** opens the search again.
3. Click **Add to cart** on a product card: the header's cart counts it. Open the cart to change it.
4. Search `kayak`: the server opens a search surface for it, so the search layout shows it
   (facets, sort, pagination) with the chat panel beside it, answered from the search it keeps.
5. On that search layout, ask `which one is the cheapest?` in the chat panel on the right: the answer
   names the cheapest kayak, and its reasoning says what the shopper is looking at. The results stay
   as they are and keep working: pick a brand and ask again. A follow-up chip of a panel answer is
   sent in the panel too. A search from the header on the assistant layout also keeps the
   conversation in the panel of the search layout it opens.
6. Open a **Listing pages** entry: it shows an _In progress_ placeholder and sends no request.
7. Open **One session** at the bottom: every turn, the view that sent it, and the surfaces it
   created that are still alive.

## Pull-request previews

This sample is published as a [pkg.pr.new](https://pkg.pr.new) StackBlitz template next to
`demo-schema-react`, so every PR that affects `@coveo/thermidor` gets a link that boots it against
that PR's build of the package, on the public demo organization with no configuration.

A template is published on its own, without its sibling sample, so before publishing
[`prepare-templates.mjs`](../../../.github/actions/publish-preview/prepare-templates.mjs) copies
`demo-schema-react/src` into the template's `vendor/` folder, points the imports at the copy and
adds `demo-schema-react`'s runtime dependencies. It also drops the `turbo run build` step from the
`dev` scripts, since the template installs `@coveo/thermidor` prebuilt. The sample's own source
is not changed.

The template set lives in
[`.github/actions/publish-preview/action.yml`](../../../.github/actions/publish-preview/action.yml).

## What it reproduces

Storefront Preview (admin-ui) uses one Thermidor session per view today. This sample keeps the
views and puts them on one session:

| View                                                 | `context.custom.surfaceId`     | Components                                                                                 |
| ---------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| Home page: recommendations                           | `storefront-preview-home`      | ProductCarousel                                                                            |
| Search box: a committed prompt, routed by the server | `storefront-preview`           | The assistant's components for a question, the search's otherwise                          |
| Assistant layout: a follow-up from the next actions  | `storefront-preview-assistant` | ProductCarousel, NextActionsBar, ComparisonTable, BundleDisplay, ProductResearchCard       |
| Search layout: results (opened by a search surface)  | `storefront-preview`           | CommerceSearch, LayoutStack, QuerySummary, Sort, ProductList, Pagination, PageSize, facets |
| Search layout: the chat panel beside the results     | `storefront-preview-assistant` | The assistant's components                                                                 |

The page follows the answer, not the view that sent the prompt: a turn whose surfaces include a
`CommerceSearch` opens the search layout with the chat panel, any other answer opens the assistant
layout (`src/pages/PromptPage.tsx`).

The behaviour is kept:

- typing in the search box sends nothing: a search is sent when it is committed;
- a prompt page sends its prompt once per visit;
- going Home ↔ a prompt page gives the page fresh surfaces, while the header stays;
- the cart is shared by the header and every page.

## The model

- **One `createSession` for the whole app.** Every view sends its requests through it.
- **Each request declares its view** in `context.custom.surfaceId`, with the values of the
  published contract above. The value names a view, not an A2-UI surface: the surfaces get
  server-chosen `ui-<uuid>` ids.
- **The app maps views to surfaces.** It remembers which view sent each turn (and, for a page, which
  visit of it). A page draws the surfaces of its visit's turns. The server
  sends no placement hint, and the app never hard-codes a surface id.
  (`src/views/view-surfaces.ts`, from each turn's `response.surfaces`.)
- **The cart is app state.** The app draws it in the header and sends it in `context.cart` on every
  request, whichever view sends it. No surface owns it.
- **Every surface uses the one public Thermidor catalog** (`createSurface.catalogId`). The views
  differ in which of its components they use, not in which catalog.
- **The server keeps every surface.** Each one gets a fresh `ui-<uuid>` id and stays in the
  session's state until the agent deletes it; a new page does not delete the previous page's
  surfaces. The app draws only the current visit's.
- **One page can hold two views.** The search page draws its results in the middle and the chat
  panel on the right, on the same visit. Each turn is tagged with the view it was sent on, so the
  middle draws its search turns' surfaces and the panel its assistant turns'. An action goes on the
  view of the turn that created its surface.
- **Every live surface takes actions.** The session sends an action from any surface that is still
  alive, whichever turn created it, so a page stays usable after another view has sent a turn.

### One session, one request

`@coveo/thermidor` sends one request at a time, prompts and actions alike, exposes it as
`session.request`, and withholds any dispatch made while it is in flight. The sample builds on that
rather than tracking requests itself:

- **Surfaces lock from the request in flight.** Each view draws its surfaces with
  `demo-schema-react`'s `TurnSurfaces`, which locks them while `session.request` is set
  (`src/views/ViewSurfaces.tsx`). Every view locks on any view's request: the session withholds
  an action sent while another request is in flight, so the search results lock while the chat
  panel's answer streams.
- **Loading placeholders come from the data model.** A surface whose data model declares
  `isLoading: true` is drawn as its component's skeleton while its turn streams
  (`DiscoveredSurface.isLoading`). The session drops a placeholder its turn left behind.
- **The assistant layout is a chat,** as in `demo-schema-react`: every turn of the conversation,
  each with its prompt, reasoning, answer and surfaces, over an input that sends the next prompt on
  the same visit. Only the latest turn's surfaces take actions (`src/pages/AssistantPage.tsx`).
- **One conversation across pages.** The assistant layout and the search layouts opened from it share
  a conversation (`thread` in `src/navigation.ts`): the chat and the chat panel both show its
  assistant turns, whichever page asked them, and an action of one of them goes on the page that
  shows it. A turn of the conversation that draws a search opens the search layout with its
  results; the chat and the panel draw its other surfaces, never the search.
- **The search box is disabled while a request is in flight,** as in `demo-schema-react`. The
  server runs one turn at a time, so a search sent before the running turn ends would be refused.
- **Nothing else can send while a request is in flight:** the chat panel's input is disabled like
  the search box, follow-up chips sit on locked surfaces, and the home and listing pages send
  nothing. So the pages and the panel call `session.dispatchAction` directly, as
  `demo-schema-react` does. Leaving a page mid-answer lets the answer finish.
- **The app records which view sent each turn.** Just before a send it sets the view that
  `context.custom.surfaceId` names, and after a prompt it records the turn the session opened with
  its view and page visit (`src/session/storefront-session.tsx`). The chat panel records its turns
  under the page's visit with the assistant view, so the page and its panel split by view.

### What each view knows of the other

The views share the session's server state, as Agent Gateway does today:

- **The assistant is told about the search on screen.** Every assistant message is given the
  session's latest search surface (its query, filters, sort and visible products) as what the
  shopper is looking at. Ask the panel for the cheapest product and the agent answers from that
  search.
- **Nothing goes the other way,** except a new search: an answer that draws a search, such as a
  panel answer's **See all kayaks**, replaces the results in the middle. Any other answer leaves
  them as they are.
- **A panel prompt does not leave the page.** It is sent on the assistant view and stays on the
  page's visit. The panel input, the search box and both views' surfaces are disabled
  while any request is in flight, so nothing gets the server's 409 or is dropped.
- **An action that opens no turn streams into the session's latest turn,** which may be the
  panel's after a facet click in the middle. The surface it updates stays in the view that drew
  it, so the middle still shows the new results.

## Known limits

- **Requests are serialized.** One request is in flight at a time, for every view. With one
  session per view, several stream at once. ADR-018 keeps this for the EAP.
- **The search follows nothing the agent says.** The middle shows only the page's own turn; the
  agent cannot change or replace it.
- **The intent rule is the gateway's.** Agent Gateway routes the session shell's message with its
  intent analyzer when intent routing is on (`cpd-intent-routing-enabled`): a search opens a
  search surface, a question runs the agent. The sample only follows the answer.
- **No query suggestions.** The search box sends nothing while typing; see below.
- **Listing pages show a placeholder.** The published contract has no view id for them, so they show
  _In progress_ and send nothing.
- **The home page sends nothing.** A request needs a message or an action, and the server gives
  `storefront-preview-home` an empty run anyway, so the home page has nothing to ask until the
  session can open itself. The session opens on the first search.

## What changes once the open work lands

- **`initialize`** (ADR-018; coveo/ui-kit#8756): Thermidor can now open the session itself; the
  sample still passes `initialize: false` until the server answers `initialize` for this route. Then
  the home page can open the session and show what the server answers for `storefront-preview-home`.
- **The session shell and query suggestions** (coveo/ui-kit#8757, #8758): the producer answers `initialize` with a long-lived `SessionShell`
  holding a `SearchBox` and its `QuerySuggestions`, and a pause in typing dispatches
  `fetchSuggestions`. The header can then draw that surface as its search box, with suggestions.
- **The server:** a view id for listing pages, and a
  spike on what a view id should map to (today `custom.surfaceId` names a view, which reads oddly
  next to A2-UI's `surfaceId`).

## Structure

```
src/
├── StorefrontApp.tsx           The header over the page, actions, page visits
├── navigation.ts               Page visits and the listing pages
├── session/
│   ├── storefront-session.tsx  The ONE session, the view of each turn, and context providers
│   └── cart-store.ts           The app's cart, sent in context.cart
├── views/
│   ├── view-surfaces.ts        View → surfaces: each view draws its own turns' surfaces
│   └── ViewSurfaces.tsx        Draws them with TurnSurfaces, locked by any request in flight
├── a2ui/
│   ├── catalog.ts              The renderers for the Storefront components
│   └── AddToCartButton/        The button added to every product card
├── components/                 Top bar, search box, listing menu, cart, chat panel, In progress, inspector
└── pages/                      Home, prompt (assistant or search layout) and listing pages
```

The renderers for ProductCarousel, NextActionsBar, ComparisonTable, BundleDisplay,
ProductResearchCard, ProductSummary (which BundleDisplay mounts) and the commerce search layout, the
agent answer block with its reasoning steps, `TurnSurfaces`, the session request
helpers and the renderer bridge are imported from
[`demo-schema-react`](../demo-schema-react) by relative path rather than copied. Its product cards
expose `ProductCardActionsContext`, through which each sample adds its own actions: this sample
adds its **Add to cart** button, and `demo-schema-react` adds its own add-to-cart control.
