---
related:
  - ./ADR-021-client-delivered-analytics-interim.md
---

# ADR-021 annex A: what a Thermidor experience must log

This annex lists every shopper interaction of the Thermidor contract, the analytics event each one
needs, and who logged it before ADR-021. It is the scope [ADR-021](./ADR-021-client-delivered-analytics-interim.md)
draws from. Where the annex and the ADR disagree, the ADR decides.

Sources: the 24 components of thermidor-schema `beta`, the demo-schema-react and
demo-multi-surface-react renderers, the 26 event types of `@coveo/relay-event-types` 20.7.1, Headless
and Atomic commerce, Agent Gateway `main`, and the platform's
[Conversational analytics events](https://coveord.atlassian.net/wiki/spaces/PBI/pages/7033847819)
and [CPD reporting: Note to implementers](https://coveord.atlassian.net/wiki/spaces/PBI/pages/7132381319).

## 1. The platform's rule

- **An interaction that changes the output is a turn.** A message, a facet, a sort, a page, a next
  action: the producer answers it, and logs one `api.conversational.message` when the turn ends,
  with the items it showed (`content[].items`). The Commerce API logs the searches it runs when the
  request's `capture` is set.
- **An interaction that changes nothing is not a turn.** A product click, a cart change, a purchase:
  it is logged with the standard commerce event, joined to what the shopper was shown by:
  - `responseId`: the `turnId` of the turn that showed the item, not the Commerce API response
    behind it, and not necessarily the latest turn. An answer that is not recorded as a turn, such
    as a facet or a page on a search surface, or instant products, names the Commerce API response
    instead, which its own search event logs;
  - `position`: from 1, across every item of that turn, in content order.

A click without both cannot be joined to its impression, and its revenue is not attributed.

## 2. Interactions

| Interaction                                                                | Components                                                                                                      | Event                                                    | Who logged it before ADR-021                                                                               | ADR-021                                  |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Product click                                                              | `ProductList`, `ProductCarousel`, `ProductSummary`, `ProductResearchCard`, `ComparisonTable`, `InstantProducts` | `ec.productClick`                                        | Nobody: only `ProductList` declares it, and no renderer dispatches it                                      | In scope                                 |
| Add to cart, remove, change quantity                                       | `Cart`; product cards that offer it                                                                             | `ec.cartAction`                                          | Nobody: `Cart` has no renderer, and the multi-surface demo keeps its cart without dispatching `updateCart` | In scope                                 |
| Purchase                                                                   | `Cart` (checkout is often outside the chat)                                                                     | `ec.purchase`                                            | Nobody                                                                                                     | In scope                                 |
| Related document click                                                     | `ProductResearchCard`, `ComparisonTable`                                                                        | `itemClick`                                              | Nobody; SVCC-6636 is undecided. Documents carry no index identifier                                        | Out of scope (ADR-023's `documentClick`) |
| Citation click                                                             | `RichText` with citations (thermidor-schema#135)                                                                | `itemClick` or `Rga.CitationClick`                       | The component does not exist yet                                                                           | Out of scope                             |
| Message, next action, `searchOption`, facets, sort, paging, `restoreState` | `SearchBox`, `NextActionsBar`, facets, `Sort`, `Pagination`, `PageSize`, `Breadbox`, `CommerceSearch`           | `api.conversational.message`; Commerce API search events | The producer. Action turns are not recorded yet                                                            | Producer                                 |
| Query suggestion picked                                                    | `QuerySuggestions`                                                                                              | Search event                                             | The producer, as a typed query: nothing marks the pick                                                     | Out of scope                             |
| Impressions                                                                | Every surface                                                                                                   | Inside `api.conversational.message`                      | The producer                                                                                               | Producer                                 |
| Answer feedback, copy, retry                                               | No component                                                                                                    | `Rga.AnswerAction`, `Rga.SubmitFeedback`                 | No component draws them                                                                                    | Out of scope                             |
| Product detail view                                                        | No component is a product page                                                                                  | `ec.productView`                                         | —                                                                                                          | Not applicable                           |
| Turn acknowledgement, zero-click resolution                                | —                                                                                                               | No event type                                            | Requested by the platform, not designed                                                                    | Out of scope                             |

`BundleDisplay` logs nothing of its own: each slot is a child node that logs its own clicks.
`selectProducts` on `ProductList` persists a selection; the platform does not define it as an
analytics event.

## 3. What Headless commerce emits, for comparison

| Event             | Trigger                                                                                | Payload                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ec.productClick` | `interactiveProduct.select()` on search, listing, recommendations and instant products | `{currency, position, responseId, product {productId, name, price}}`; `position` from 1 with the page offset |
| `ec.productView`  | `buildProductView().view(product)`, called by the app on a product page                | `{currency, product}`                                                                                        |
| `ec.cartAction`   | `cart.updateItemQuantity()`, `cart.empty()`                                            | `{currency, action: add \| remove, quantity: the change, product}`                                           |
| `ec.purchase`     | `cart.purchase(transaction)`                                                           | `{currency, products [{product, quantity}], transaction {id, revenue}}`                                      |
| `itemClick`       | Spotlight content click                                                                | `{responseId, position, itemMetadata}`                                                                       |

Headless reads `currency` from the engine's commerce context, which also sets the currency of its
Commerce API requests, so its prices and its events share one value. Headless sends no impression
event: the Commerce API logs searches server-side from `capture`.
`@coveo/relay-event-types` documents that, in a conversational context, `responseId` is the `turnId`
of the agent's turn.

## 4. Relay

`@coveo/relay` 2.1.3, about 5 KB minified, depends on `uuid` and `@coveo/explorer-messenger`.

- `createRelay({url, token, trackingId, mode?, source?, environment?})` returns `emit`, `getMeta`,
  `on`, `off` and `updateConfig`.
- `emit(type, payload)` posts `[{...payload, meta}]` with `fetch` and `keepalive: true`; it rejects on
  an HTTP error or an event the Event API does not accept. It validates nothing itself.
- The client id is a UUID read from the `coveo_visitorId` cookie, then the `visitorId` local storage
  key, and written to both, unless the environment supplies `getClientId`, as the session does from
  the navigator context.
- `mode: 'disabled'` sends nothing. Outside a browser, Relay sends nothing unless the environment
  supplies `send`.

## 5. The producer before ADR-021

- `productClick`, `updateCart` and `purchase` reach `AnalyticsActionHandler`, which builds the same
  `ec.*` payloads as Headless and emits them through `NoOpAnalyticsEventClient`: nothing is sent.
- `productClick`'s `responseId` is the stored search response for a search surface, and `""` for
  any other surface.
- `updateCart` writes the producer's session cart, which the producer sends to the Commerce API.
  The app's cart (ADR-012) travels with every request as `context.cart`.
- `purchase` does not clear that cart.
- Analytics actions take the turn slot (`409` during an answer), and are refused (`400`) on an
  organization without stateful commerce.
- The catalog is queried in the currency of the agent configuration's locale; the locale every
  request carries (coveo/ui-kit#8849) is ignored when the request names an agent configuration.
- `api.conversational.message` is published once per turn that has a user message, with
  `turnId`, `parentTurnId`, the content blocks and their products. Its `turnId` is allocated when
  the turn starts, and did not reach the browser.
- `capture` is forced to `true` on the producer's Commerce API calls; respecting the client's value
  is in review ([agent-gateway#574](https://github.com/coveo-platform/agent-gateway/pull/574)).

## 6. Gaps this ADR does not close

- Document and citation clicks, which need item identifiers the schema keeps out of the browser.
- Consent: the session sends no consent signal, and the producer reads none.
- The cart's owner: the producer's session cart and the app's cart can disagree.
- `commerce-protocol.md` in Agent Gateway still documents `product_click`, `cart_action` and
  `product_view`.
