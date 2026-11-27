---
status: Proposed
date: 2026-11-05
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-012-client-owned-context.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-019-turn-opening-actions.md
  - ./ADR-020-cached-and-concurrent-actions.md
  - ./ADR-021-annex-a-analytics-inventory.md
  - ./ADR-021-annex-b-analytics-in-code.md
  - ./ADR-021-annex-c-migration-to-log-actions.md
  - coveo/ui-kit#8849 (the navigator locale on every request)
  - thermidor-schema ADR-011 (schema-owned commerce actions)
  - thermidor-schema ADR-023 (log actions, coveo-platform/thermidor-schema#203)
  - agent-gateway ADR-005 (conversational message analytics)
  - https://coveord.atlassian.net/browse/KIT-6401
---

# The session logs analytics actions through Relay until the producer logs them

This ADR is an interim. thermidor-schema ADR-023 decides where analytics go in the long term: log
actions that the producer resolves and logs. Until the producer does, the session logs the shopper's
product clicks, cart changes and purchases from the browser, through Relay.
[Annex A](./ADR-021-annex-a-analytics-inventory.md) lists every interaction that needs logging,
[annex B](./ADR-021-annex-b-analytics-in-code.md) shows the decision in code, and
[annex C](./ADR-021-annex-c-migration-to-log-actions.md) details the migration to ADR-023.

## Context and Problem Statement

Product clicks, cart changes and purchases feed the Coveo ranking and recommendation models and the
conversational reports. None is logged from a Thermidor surface today:

- **No renderer dispatches them.** `productClick` is declared on `ProductList` only, whose renderer
  dispatches nothing, and every other component that shows products closes its `actions`.
- **The producer sends nothing.** Agent Gateway routes `productClick`, `updateCart` and `purchase`
  to a handler that builds the `ec.*` events, but the only client it emits through is a no-op.
- **Every action takes the turn slot.** An action dispatched while an answer streams is withheld,
  and a request in flight is cancelled when a click opens another page in the same tab.

ADR-023 decides the long-term answer: log actions with an opaque `analyticsRef`, resolved and
logged by the producer, sent outside the turn slot with `keepalive`. It needs a reference index in
the producer, and its log actions do not ship before a dedicated privacy and consent ADR. Nothing of
it is built yet.

Data Platform joins a click to what the shopper was shown: its `responseId` is the `turnId` of the
turn that showed the item, and its `position` counts from 1 across every item of that turn, in
content order. The browser knows neither the turn nor the position. Every commerce event also names
the currency of its prices, the one the catalog was queried in.

## Decision Drivers

- **Clicks, cart changes and purchases are logged now**, from every surface that shows them.
- **A logged click can be joined** to the turn that showed the item and to its position in that turn.
- **Every event is in the currency the catalog is queried in.**
- **Logging never delays, blocks or fails** a prompt, an answer, another action or a navigation, and
  is not lost while an answer streams.
- **One API for the consumer.** Renderers dispatch typed actions of the contract, as for any other
  interaction (thermidor-schema ADR-011); they never call an analytics library.
- **Nothing is logged twice**, whatever versions of the package and the producer run together.
- **A consumer can turn analytics off.**
- **Removable at the migration:** no public symbol depends on how events are delivered.

## Decision Outcome

Renderers dispatch `productClick`, `updateCart` and `purchase`, the contract's actions, with
`dispatchAction`. The session logs them through Relay, outside the turn slot, and never sends them to
the producer. The producer announces, for each node, the turn that showed it and how many items of
that turn precede it. Every event is in the currency of the navigator context, the one every request
carries, provided Agent Gateway applies the request's locale. Option A below. The breaking change at
the migration to ADR-023 is accepted.

It logs every interaction now, joinable to its turn, without delaying or losing anything while an
answer streams, and renderers keep the one API they use for every interaction. The producer's part is
an announcement, not ADR-023's reference index, and the migration changes only the click's payload.
Option B logs nothing until ADR-023's prerequisites ship, and none is planned. Option C spares
renderers the migration, but costs the producer most of ADR-023's work, only to expose to the browser
what ADR-023 keeps out of it. Option D is `dispatchAction` under another name, with hand-written
types. Option E puts a delivery detail in the public API, which the migration would then break.

### Analytics actions

`productClick`, `updateCart` and `purchase` are **analytics actions**. The session validates their
payload against the dispatching component's contract, like any action, then logs them through
Relay instead of sending them:

| Action         | Event             | From the payload                                                  | From the session                                   |
| -------------- | ----------------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `productClick` | `ec.productClick` | `product {productId, name, price}`, the position in the component | `responseId`, the position in the turn, `currency` |
| `updateCart`   | `ec.cartAction`   | `product`, `operation`, `quantity`                                | `currency`; the change for `setQuantity` (below)   |
| `purchase`     | `ec.purchase`     | `products[{product, quantity}]`, `transaction {id, revenue}`      | `currency`                                         |

`responseId` and the position in the turn come from the producer's attribution, and `currency` from
the navigator context (below).

- **Never sent to the producer**, whether analytics are enabled or not. A version of the package
  therefore has exactly one path for an analytics action, and a producer that logs them later
  counts none twice.
- **Outside the turn slot.** Logging neither waits for nor changes `session.request`; a prompt or
  `cancel()` does not affect it. Relay sends with `keepalive`, so an event survives the navigation
  the click starts.
- **One click per product shown.** A click is logged the first time per item of a response: its
  `responseId`, its position in the turn and its product, the identity Data Platform joins on. A
  repeated or double click is not counted twice, as Headless logs a product's click once. Cart
  changes and purchases are all logged.
- **The gesture is the renderer's.** A renderer dispatches `productClick` from the gestures that open
  the product in its UI, a click, a middle click or "open in a new tab"; the session neither knows nor
  needs them, and logs one click whichever comes first.
- **Failures are quiet:** a development warning, never a rejected promise or an `actionError`.
- **`setQuantity`** logs the change from the quantity the app's cart holds, read from
  `commerceContextProvider` (ADR-012): `add` for an increase, `remove` for a decrease, nothing when
  equal. The renderer dispatches before it updates its cart. Without a provider, nothing is logged.
- **Missing labels** follow the producer's handler: an absent `name` is `""` and an absent `price` is
  `0`.

### Attribution, announced by the producer

The producer announces, in the `metadata` of the `ACTIVITY_SNAPSHOT` that writes a node, which turn
showed the node's items and how many items of that turn precede them:

```json
"metadata": {
  "analyticsAttribution": {
    "<surfaceId>": {"<nodeId>": {"responseId": "<turnId>", "positionOffset": 4}}
  }
}
```

- **Read like ADR-019's and ADR-020's announcements**, but per node: the latest entry for a node
  wins, and an entry that does not have this shape is ignored. A snapshot that replaces another
  merges its entries onto the replaced one's per node, so it may name only the nodes it writes.
- **`responseId`** is the `turnId` of the turn that wrote the node. An answer to an action that is not
  recorded as a turn, such as a facet or a page on a search surface, names the Commerce API response
  that produced its products, with the page's offset, as the Commerce API's own search event does.
- **A concurrent answer is attributed too.** This amends ADR-020, which reads no metadata of a
  concurrent answer: the session reads `analyticsAttribution`, and only it, for the nodes the answer
  writes. Like those writes, the attribution is applied without being recorded: it lives in memory,
  is never serialized, is cached with the answer so a revisited query keeps its own response, and a
  later recorded announcement for the node replaces it. For `InstantProducts`, `responseId` is the
  `productSuggest` response that returned the products, and `positionOffset` is `0`.
- **The position in the turn** is `positionOffset + position`, where `position` counts from 1 within
  the component, as the renderer draws it.
- **No announcement, no click event.** A click on a node the producer has not attributed is not
  logged, with a development warning: an event Data Platform cannot join would only skew reports.
  Cart actions and purchases carry no `responseId` and need none.

Agent Gateway already allocates the `turnId` when the turn starts, so it can announce it with the
turn's first snapshot.

### Currency, from the navigator context

Every event is in the `currency` of the navigator context when it is logged: the currency every
request carries (coveo/ui-kit#8849), which the producer queries the catalog in.

- **Read per event, kept nowhere.** The session reads it from `navigatorContextProvider` when it
  logs, as a request reads it when it is sent. It stores, serializes and exposes no currency.
- **The same value as the prices.** The consumer chooses the locale and sends it with every request,
  so events and prices agree, as in Headless, where one commerce context sets both the Commerce API
  request and the events.
- **A locale switch applies from then on.** Once the page switches locale, events are in the new
  currency, including a click on a product an earlier response showed in the previous one.
  ADR-023's producer does the same: it logs a log action in its request's currency.
- **No currency, no event.** While the navigator context states none, nothing is logged, with a
  development warning.

**Precondition: Agent Gateway applies the request's locale.** Today, a request that names an
`agentConfigurationId` is answered in the locale of the agent configuration, whatever the request
carries. Until the gateway gives the request's locale priority, events are in the page's currency and
prices in the agent's, and the two disagree when the page and the agent differ. The platform decided
that the request carries the locale
([Decision: How a Converse request reaches its configuration](https://coveord.atlassian.net/wiki/spaces/PRODUCT/pages/7119568906/Decision+How+a+Converse+request+reaches+its+configuration));
the gateway change is a prerequisite of this decision for the EAP.

Beside applying the request's locale, the attribution is the only thing this decision adds to the
producer, and ADR-023 makes it unnecessary.

### Identity

- Relay's environment reads the client id, location, referrer and user agent from the
  `navigatorContextProvider` every session has, so events and converse requests name the same
  visitor.
- Events carry the session's `trackingId` and `source: ["@coveo/thermidor"]`; Relay appends its own
  version.

### Configuration

```ts
interface SessionConfig {
  // …
  analytics?: AnalyticsConfig;
}

interface AnalyticsConfig {
  /** Defaults to `true`. */
  enabled?: boolean;
  /** Full events URL override; derived from `organizationId` when absent. */
  endpoint?: string;
}
```

- **Opt-in.** Without `analytics`, or with `enabled: false`, nothing is logged and Relay is not
  created. Analytics actions are still not sent to the producer.
- **No visitor cookie.** The client id always comes from the navigator context, so Relay never
  writes its own, whether analytics are on or off.
- `endpoint` mirrors `SessionConfig.endpoint`: the full events URL, for a proxy or a local mock,
  where Headless names it `analytics.proxyBaseUrl`. It is meaningless once the producer logs, and is
  deprecated then.
- **No currency.** Events take the navigator context's, the one the requests carry.
- No Relay type appears in the public API.

### Consent

Whether a visitor consented is the question ADR-023 leaves to a dedicated privacy and consent ADR,
before which its log actions do not ship. This ADR does not decide it. It provides the switch the
consumer needs meanwhile: `analytics` absent or `enabled: false` sends no event.

### Contracts

- **Action names** are the schema's: `productClick` on `ProductList`, and `updateCart` and
  `purchase` on `Cart`, which Agent Gateway's handler already routes and ADR-023 keeps. No name is
  added. Two follow the commerce events they map to (`ec.productClick`, `ec.purchase`); `updateCart`
  names what the shopper does, and maps to `ec.cartAction`.
- **Action payloads** stay in thermidor-schema, the only contract a consumer sees. `productClick`
  and `updateCart` each become one shared action definition, titled after the action, the shape
  ADR-023 gives its log actions. Every component that shows products references `productClick`, and
  every one that offers to add to cart references `updateCart`: all but `InstantProducts`. The
  action is the same on every component, so the projections carry one type per action, and the
  migration rewrites one definition: `productClick` composes ADR-023's log-action base instead of
  the action base. The components that gain them declare them as optional, so a producer's nodes
  stay valid without them; `ProductList` and `Cart` keep the ones they already require. `position`
  counts from 1.
- **Event payloads** belong to Coveo's analytics schema, typed for the session by
  `@coveo/relay-event-types`. thermidor-schema does not repeat them.
- **The mapping** lives in the session's internal module, typed by a structural view of the payload
  on one side and `@coveo/relay-event-types` on the other, and tested against the same cases as the
  producer's handler, except `setQuantity`, which the handler sends as is and the session logs as
  the change (above).

## Migration to ADR-023

The migration is one release of `@coveo/thermidor`, once the producer logs all three actions: it
resolves `productClick` as a log action, and it logs cart changes and purchases under the decision
on who owns the cart (below). Relay then leaves with every action at once.

**What the consumer changes:** each renderer dispatches `productClick {analyticsRef}` with the
reference the item carries, instead of the product's ids, name, price and position. This is the
accepted breaking change, announced in the changelog with before-and-after code.

**What the consumer keeps:** the action names, the components that dispatch them, `dispatchAction`
and `analytics.enabled`. No Relay symbol was public.

**What the release removes:** the Relay module and its dependency, the reading of the
`analyticsAttribution` announcement, and the need for an analytics token and an analytics origin in
the page's CSP. `analytics.endpoint` is deprecated.

**What the producer keeps:** the `analyticsAttribution` announcement, as long as a version of the
package that reads it is supported. Those versions log only from it, so removing it with the release
would silence every page that has not upgraded, and every rollback.

**What the release keeps working:**

- **The visitor and the currency:** both come from the navigator context, before and after.
- **No double logging:** older versions log from the browser and never send analytics actions; newer
  ones send log actions, and `updateCart` as the cart decision rules. Both can run against the same
  producer.
- **Rollback:** reinstalling the previous version, which logs from the producer's announcements
  again.

**What the release does not keep:** a click on a product restored from a session serialized before
the release. Its products carry no `analyticsRef`, so the renderer sends no click for it, as ADR-023
asks; a click dispatched anyway fails the contract and is not logged, with a development warning. Invalidating those sessions would lose the shopper's
conversation to save the clicks on its older products.

**What changes in the data:** events come from the producer (`source`), with the shopper's IP and
user agent as the producer forwards them, and are no longer lost to content blockers. Reports show
the shift on the release date. Two more depend on ADR-023's follow-ups, raised on its pull request:
its events carry no product name or price yet, and its producer logs every dispatch, where the
session logs a product's click once per item.

`updateCart` stays an ordinary action in ADR-023, and `purchase` is left open there. They migrate
with the decision on who owns the cart: the app, under ADR-012, or the producer's session cart, which
`updateCart` writes today. The release waits for that decision.

## Impact on the Charter

- **Faithful transmission and rendering (MUST):** an exception, for three actions and until the
  migration to ADR-023. The session does not transmit `productClick`, `updateCart` and `purchase` to
  the endpoint: it logs them itself, and so names actions, which the package otherwise never does
  (ADR-019, ADR-020). It does not reinterpret them: the payload is validated against the contract and
  mapped field for field, in parity with the producer's handler but for `setQuantity`, logged as the
  change. The exception is confined to one internal module, which the migration to ADR-023 deletes, after which the session transmits them again.
- **Public API independence (MUST):** unchanged. No Relay type or event payload is public;
  `SessionConfig.analytics` names what the consumer decides (on or off, an endpoint), not how events
  are delivered.
- **Best-in-class consumer DX (MUST):** improved. Renderers dispatch typed actions of the contract,
  with autocomplete and checked payloads, as for any interaction, and keep doing so after the
  migration.
- **Consumer-owned inputs (MUST):** unchanged. The consumer supplies the events endpoint when needed,
  and the visitor and the currency come from its `navigatorContextProvider`, as for its requests.
- **Simplicity and legibility (SHOULD):** slightly reduced. The session gains a module, a
  dependency and a metadata key to read, all removed by the migration.

## Consequences

- **Positive:** product clicks, cart changes and purchases are logged from every Thermidor surface,
  joinable to their turn, during an answer and across navigation.
- **Positive:** renderers learn one rule, dispatch the contract's action, and keep it after the
  migration; only the click's payload changes.
- **Negative:** the session names three actions and depends on Relay until the migration.
- **Negative:** the migration breaks every renderer that dispatches `productClick`.
- **Negative:** the producer must announce the attribution of each node, until no supported version
  of the package reads it.
- **Negative:** Relay and the analytics module add about 3 kB to the package's main entry (from
  12.38 kB to 15.36 kB as `size-limit` measures it).
- **Negative:** until Agent Gateway applies the request's locale, an event can be in another
  currency than the prices the shopper saw.
- **Negative:** after a locale switch, a click on a product shown before it is logged in the new
  currency, as ADR-023's producer will log it.
- **Negative:** the migration waits for the decision on who owns the cart, so `productClick` cannot
  move to the producer before cart changes and purchases do.
- **Negative:** ADR-020's concurrent answers are no longer metadata-free: the session reads their
  analytics attribution, and keeps it with the cached answer.
- **Neutral:** the producer's own handler stays unused for these actions until the migration.

## Implementation and Follow-up

- thermidor-schema: shared `productClick` and `updateCart` action definitions, over shared
  `ProductClickPayload` and `UpdateCartPayload` definitions, referenced by every component that shows
  products (`updateCart` by all but `InstantProducts`), and `clickUri` on `ComparisonProduct`. The generators project a
  shared definition under its title. Coordinated with ADR-023's pull request, which edits the same
  files.
- Agent Gateway: announce `analyticsAttribution` on every snapshot that writes a node with products,
  with the `turnId` the turn already allocates when it starts.
- Prerequisite, outside this ADR: Agent Gateway applies the request's locale rather than the agent
  configuration's (above).
- `@coveo/thermidor`: the `analytics` configuration, the internal module (mapping, one click per
  item), the currency and the visitor read from the navigator context.
- demo-schema-react: dispatch `productClick` from every product link. demo-multi-surface-react:
  dispatch `updateCart` from the add-to-cart button of a product card. No producer draws a `Cart`
  node yet, so `purchase` is covered by the session's tests only. The mock announces attribution
  and records events locally.
- `InstantProducts`, in its own sub-task: the session reads the attribution of concurrent answers
  and caches it; Agent Gateway announces the `productSuggest` response on `fetchInstantProducts`
  answers; the demo's instant products dispatch `productClick`, and the mock announces them.
- Follow-ups outside this ADR: document and citation clicks (annex A), the privacy and consent ADR,
  the cart's owner, and the producer's log actions (ADR-023).

## Considered Options

### Option A (selected): Relay in the session, with the payloads the renderer knows

- **Summary:** renderers dispatch `productClick {productId, name?, price?, position}`, `updateCart`
  and `purchase`. The session maps them to `ec.*` events and emits them through Relay, outside the
  turn slot, and never sends them to the producer. The producer only announces, for each node, the
  turn that showed it and how many items precede it in that turn. Events take the navigator
  context's currency.
- **Pros:** meets every driver. The producer's part is small: an announcement, no index. The
  payloads already exist on `ProductList` and `Cart`.
- **Cons:** the payloads differ from ADR-023's `{analyticsRef}`, so the migration is a breaking change
  for renderers. The session names actions, an exception to the charter. The browser holds the
  analytics token and the event vocabulary until the migration.

#### Set aside within Option A

- **A currency in `SessionConfig.analytics`.** A second value beside the one the requests carry, which
  the consumer would have to keep equal to it.
- **A currency stated by the producer on `RUN_STARTED`, kept per response by the session.** Exact for
  the products a response showed before a locale switch, but it costs a field on every response, a
  change to Agent Gateway's core stream writer, and a serialized table in the session, for a
  precision ADR-023's producer does not keep.
- **A currency in each node's attribution.** The same precision, with the producer stating the
  currency in every attribution it builds, for as long as older versions of the package are
  supported.

### Option B: wait for ADR-023

- **Summary:** log nothing until the producer resolves log actions.
- **Pros:** nothing to build and remove.
- **Cons:** nothing is logged until the reference index, the producer's log-action path and the
  privacy and consent ADR ship, and none of them is planned.

### Option C: Relay in the session, with ADR-023's payload

- **Summary:** renderers dispatch `{analyticsRef}` from the start. The producer streams, with each
  reference, what it stands for, and the session resolves it and emits through Relay.
- **Pros:** the migration does not touch renderers.
- **Cons:** the producer must write references on every item and stream their resolution, most of
  ADR-023's producer work, only to expose to the browser what ADR-023 keeps out of it. Logging from the
  browser then costs about as much as the target.

### Option D: an analytics API on the session

- **Summary:** `session.analytics.logProductClick(...)` and its siblings, outside the contract.
- **Pros:** names no action in the session.
- **Cons:** a second API next to `dispatchAction`, with hand-written payload types. To attribute a
  click it must still carry the surface and node, so it is `dispatchAction` under another name.

### Option E: a Relay instance supplied by the consumer

- **Summary:** the consumer creates Relay and passes it in `SessionConfig`.
- **Pros:** the consumer controls Relay.
- **Cons:** puts a delivery detail in the public API, the opposite of the removable driver, and every
  integrator repeats the same setup.
