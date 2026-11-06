---
related:
  - ./ADR-021-client-delivered-analytics-interim.md
---

# ADR-021 annex B: analytics actions in code

This annex shows [ADR-021](./ADR-021-client-delivered-analytics-interim.md) in code: the contract,
what the producer announces, the session, and a renderer. The snippets are trimmed for reading.
Where they and the ADR disagree, the ADR decides.

## 1. Typing, end to end

```
renderer ──dispatchAction──▶ payload of the action ──session──▶ commerce event ──Relay──▶ Event API
                             thermidor-schema                    @coveo/relay-event-types
                             (validated against the              (Ec.ProductClick, Ec.CartAction,
                              dispatching component)              Ec.Purchase)
```

- **The consumer** types its payloads with the projections of thermidor-schema it injects as
  `contracts` (ADR-014): `ProductClickPayload`, `UpdateCartPayload`, `PurchasePayload`. The session
  validates each dispatch against the dispatching component's contract before anything else.
- **The session** imports no schema. It reads the validated payload through a structural view of
  the fields it maps, and builds events typed by `@coveo/relay-event-types`.
- **What the payload does not carry:** `responseId` and the position in the turn come from the
  producer's attribution; `currency` from the `RUN_STARTED` of the response that showed the
  products, or of the latest response for a node without an attribution.

## 2. The contract

The payloads are shared definitions; each component declares its own actions over them, as the
schema does for every action several components share:

```json
// definitions/product-click-payload.schema.json
{
  "title": "ProductClickPayload",
  "type": "object",
  "required": ["productId", "position"],
  "properties": {
    "productId": {"type": "string", "minLength": 1},
    "name": {"type": "string"},
    "price": {"type": ["number", "null"]},
    "position": {"type": "integer", "minimum": 1}
  },
  "additionalProperties": false
}
```

```json
// components/product-carousel.schema.json
"actions": {
  "type": "object",
  "properties": {
    "productClick": {"$ref": "#/$defs/ProductCarouselProductClickAction"},
    "updateCart": {"$ref": "#/$defs/ProductCarouselUpdateCartAction"}
  },
  "additionalProperties": false
},
"$defs": {
  "ProductCarouselProductClickAction": {
    "title": "productCarouselProductClick",
    "allOf": [{"$ref": "https://schema.thermidor.coveo.com/base/action.schema.json"}],
    "properties": {
      "payload": {"$ref": "https://schema.thermidor.coveo.com/definitions/product-click-payload.schema.json"}
    }
  }
}
```

| Component             | `productClick` | `updateCart` | `purchase` |
| --------------------- | -------------- | ------------ | ---------- |
| `ProductList`         | ✓              | ✓            |            |
| `ProductCarousel`     | ✓              | ✓            |            |
| `ProductSummary`      | ✓              | ✓            |            |
| `ProductResearchCard` | ✓              | ✓            |            |
| `ComparisonTable`     | ✓              | ✓            |            |
| `InstantProducts`     | ✓              |              |            |
| `Cart`                |                | ✓            | ✓          |

## 3. What the producer announces

Agent Gateway adds the attribution to the snapshot that writes the nodes, beside its other
announcements:

```json
{
  "type": "ACTIVITY_SNAPSHOT",
  "activityType": "a2ui-surface",
  "content": {"messages": [/* createSurface, updateComponents, updateDataModel */]},
  "metadata": {
    "turnOpeningActions": {"surface-1": ["selectAction"]},
    "analyticsAttribution": {
      "surface-1": {
        "carousel-1": {"responseId": "6f1c…", "positionOffset": 0},
        "carousel-2": {"responseId": "6f1c…", "positionOffset": 8}
      }
    }
  }
}
```

- On an agent turn, the observer that builds the turn's content blocks for
  `api.conversational.message` computes the offsets from the same traversal, so a click's position
  is the one Data Platform finds among the turn's items.
- On a keyword-search turn, `responseId` is the turn's id and the offsets follow the search's
  product lists.
- On an action answer that is not a turn (a facet, a page), `responseId` is the Commerce API
  response and `positionOffset` is `page × pageSize`.
- On a concurrent `fetchInstantProducts` answer, `responseId` is the `productSuggest` response and
  `positionOffset` is `0`.

Every `RUN_STARTED` states the currency the response's prices are in, the one the catalog was
queried with, beside the continuity keys. The session keeps it as the latest currency, and as the
currency of each response the response's snapshots attribute, and serializes both. A concurrent
answer's `RUN_STARTED` updates the latest currency, which its products are logged in:

```json
{"type": "RUN_STARTED", "conversationToken": "…", "conversationSessionId": "…", "currency": "USD"}
```

## 4. The session

`issueAction` hands analytics actions to the analytics module before anything else, so they never
reach `sendRequest`:

```ts
// session/create-session.ts
function issueAction(recovered: RecoveredAction): Promise<void> {
  const activities = sessionActivities(store.getState());
  if (isAnalyticsAction(recovered.name)) {
    if (hasValidPayload(recovered)) {
      const attribution = analyticsAttribution(
        activities,
        recovered.surfaceId,
        recovered.sourceComponentId,
        unrecordedAttributions
      );
      const {currency, responseCurrencies} = store.getState();
      analytics.log({
        name: recovered.name,
        payload: recovered.context,
        attribution,
        // the currency of the response that showed the products, else the latest
        currency: (attribution && responseCurrencies?.[attribution.responseId]) ?? currency,
      });
    }
    return withhold();
  }
  // … turn-opening, concurrent and ordinary actions
}
```

The attribution is read per node, the latest entry winning. A snapshot that replaces another
merges its announcement onto the replaced one's per node, so the nodes it leaves out keep theirs:

```ts
// session/analytics-attribution.ts
export function analyticsAttribution(activities, surfaceId, nodeId) {
  let attribution;
  for (const activity of activities) {
    const entry = activity.metadata?.analyticsAttribution?.[surfaceId]?.[nodeId];
    if (isAttribution(entry)) attribution = entry;
  }
  return attribution;
}
```

A concurrent answer's attribution is kept beside its writes, for the nodes it writes, and cached
with it, so a revisited query is attributed to the response that answered it:

```ts
// session/concurrent-actions.ts
const announced = readAnnouncedAttributions(event.metadata);
apply({messages, attributions: announced}); // keeps the entries of the nodes the writes update
cache.set(key, {
  messages: accepted.messages,
  attributions: writtenAttributions(accepted.writes, announced),
});

// session/analytics-attribution.ts: the latest recorded entry, unless a concurrent answer
// announced one after it
return concurrent && concurrent.recordedActivities > recordedAt
  ? concurrent.attribution
  : attribution;
```

The mapping, in parity with Agent Gateway's `AnalyticsActionHandler`:

```ts
// internal/analytics/action-events.ts
case 'productClick':
  if (!attribution) return {skipped: 'the producer announced no attribution for its node'};
  return {
    type: 'ec.productClick',
    payload: {
      currency,
      position: attribution.positionOffset + click.position,
      responseId: attribution.responseId,
      product: {productId, name: name ?? '', price: price ?? 0},
    },
  };
```

| Action         | Event             | Rule                                                                                 |
| -------------- | ----------------- | ------------------------------------------------------------------------------------ |
| `productClick` | `ec.productClick` | Skipped without an attribution; once per item of a response                          |
| `updateCart`   | `ec.cartAction`   | `add` and `remove` as they are; `setQuantity` as the change from the provider's cart |
| `purchase`     | `ec.purchase`     | Every product with its quantity, and the transaction                                 |

Every event is skipped, with a development warning, while the producer has stated no currency.

Relay is created once per session, only when analytics are enabled:

```ts
// internal/analytics/session-analytics.ts
const relay = createRelay({
  url: analytics.endpoint ?? eventsUrl(organizationId),
  token: accessToken,
  trackingId: trackingId ?? null,
  source: ['@coveo/thermidor'],
  ...(navigatorContext && {
    environment: {
      ...buildBrowserEnvironment(),
      getClientId: () => navigatorContext().clientId,
      getLocation: () => navigatorContext().location,
      getReferrer: () => navigatorContext().referrer,
      getUserAgent: () => navigatorContext().userAgent,
    },
  }),
});
```

`buildBaseRequest` sends `navigatorContext?.clientId ?? analytics.clientId()`, so a session without
a navigator context names Relay's visitor in its converse requests.

## 5. A renderer

The component that draws the products provides its node's `dispatchAction` to its cards, and a link
logs its click as it opens the product, without preventing the navigation:

```tsx
// demo-schema-react: ProductCarousel
({props, context}) => (
  <ProductActionsContext.Provider value={(action) => context.dispatchAction(action)}>
    {products.map((product, index) => (
      <A2UIProductCard key={product.permanentid} {...cardProps(product)} position={index + 1} />
    ))}
  </ProductActionsContext.Provider>
);

// A2UIProductCard
<a
  href={clickUri}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => dispatch(productClick({productId, name, price}, position))}
>
  {name}
</a>;
```

`position` is the product's rank within the component, from 1. The session adds the node's
`positionOffset` to it (section 3), so a renderer never needs to know what else the turn shows.

The demo dispatches on `click`. A renderer that also wants middle clicks or "open in a new tab"
dispatches from `auxclick` or `contextmenu` too: the session logs the product's click once.

An add-to-cart button dispatches `updateCart` from the same node before the app's cart changes:

```tsx
// demo-multi-surface-react: AddToCartButton
const dispatch = useProductActions();
const add = () => {
  dispatch?.({
    event: {
      name: 'updateCart',
      context: {productId, name, price: price ?? null, quantity: 1, operation: 'add'},
    },
  });
  cart.apply(/* the same update */);
};
```

## 6. Configuration

```ts
createSession({
  // …
  analytics: {
    endpoint: 'http://localhost:3000/rest/organizations/my-org/events/v1', // optional
  },
});
```
