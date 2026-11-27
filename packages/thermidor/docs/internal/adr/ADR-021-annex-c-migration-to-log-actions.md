---
related:
  - ./ADR-021-client-delivered-analytics-interim.md
  - thermidor-schema ADR-023 (log actions)
---

# ADR-021 annex C: migrating to log actions

This annex details the migration [ADR-021](./ADR-021-client-delivered-analytics-interim.md) plans
from the session's Relay logging to thermidor-schema ADR-023's log actions. Where the annex and the
ADR disagree, the ADR decides.

## 1. Preconditions

The release that migrates ships only when the producer:

- writes `analyticsRef` on every product it streams, and resolves it in its reference index;
- answers `productClick` as a log action, outside the turn slot, on every route that serves
  Thermidor, including organizations without stateful commerce and the storefront preview routes;
- logs cart changes and purchases, under the decision on who owns the cart (section 6);
- emits `ec.productClick` through a real analytics client, with the shopper's client id, tracking id,
  IP and user agent;
- logs the same `responseId`, position and currency as the session logs today, checked against the
  cases of annex B;
- applies the privacy and consent ADR that ADR-023's log actions wait for.

## 2. The release

| Area                 | Before the release                                  | After the release                                     |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Renderer             | `productClick {productId, name?, price?, position}` | `productClick {analyticsRef}`                         |
| Delivery             | Relay, from the browser                             | A log action, outside the turn slot, with `keepalive` |
| Attribution          | `analyticsAttribution` announcement                 | Resolved by the producer; the announcement kept (\*)  |
| `analytics.enabled`  | Turns the browser's events on or off                | Kept; what it sends waits for the privacy ADR         |
| Currency             | The navigator context's                             | The log action request's                              |
| `analytics.endpoint` | Events URL                                          | Deprecated, ignored                                   |
| Dependencies         | `@coveo/relay`, `@coveo/relay-event-types`          | Removed                                               |
| Page CSP             | `connect-src` to the analytics origin               | Not needed                                            |
| Token                | Must be allowed to write analytics                  | No analytics privilege needed                         |

(\*) The producer keeps announcing the attribution as long as a version of the package that reads it
is supported: those versions log only from it, so removing it would silence every page that has not
upgraded, and every rollback. The new version no longer reads it.

The visitor comes from the navigator context before and after the release, so no shopper becomes a
new visitor.

A session serialized before the release restores, but its products carry no `analyticsRef`: the
renderer sends no click for them, as ADR-023 asks, and a click dispatched anyway fails the contract
and is not logged, with a development warning.

## 3. Changelog for consumers

> **Breaking:** `productClick` now carries the item's `analyticsRef` instead of its ids, name, price
> and position. The producer logs the click.
>
> ```diff
> - dispatchAction({event: {name: 'productClick', context: {productId: product.permanentid, name, price, position}}});
> + dispatchAction({event: {name: 'productClick', context: {analyticsRef: product.analyticsRef}}});
> ```
>
> You may remove the `connect-src` entry for `*.analytics.org.coveo.com` from your CSP, and the
> analytics privilege from the session's token. `analytics.endpoint` is deprecated and ignored.

## 4. Proving each point

| Point                       | Test                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| One path per version        | The current session never sends an analytics action to the converse endpoint; the migrated session never emits through Relay |
| Same visitor                | The current and the migrated session send the navigator context's client id in events and requests                           |
| Same attribution            | The session's event and the producer's event for the same click carry the same `responseId`, position and currency           |
| Delivered across navigation | A click that opens a page in the same tab still reaches its endpoint                                                         |
| Analytics off               | `enabled: false` sends no event, and what the privacy and consent ADR decides                                                |
| Older versions keep logging | The previous version, against the migrated producer, still logs from its announcements                                       |
| Restored older session      | A product restored from a session serialized before the release, without `analyticsRef`, logs no click                       |

## 5. Data

Events move from the browser to the producer on the release date:

- `source` changes from `@coveo/thermidor` to `@coveo/agent-gateway`;
- events blocked by content blockers in the browser are no longer lost, so volumes rise;
- IP and user agent are the ones the producer forwards;
- product names and prices are missing until ADR-023 decides which values the renderer sends back;
- click counts change if the producer logs every dispatch, where the session logs a product's click
  once per item of a response.

Reports should be annotated with the release date.

## 6. The cart

ADR-023 keeps `updateCart` an ordinary action, because it writes the producer's session cart, and
leaves `purchase` open. The session never sends either to the producer, so the producer's session cart
stays empty, and the cart the app sends with every request (ADR-012) is the only one.

Before the release, one decision is needed: who owns the cart.

- **The app (ADR-012):** the producer reads `context.cart`, and `updateCart` and `purchase` become log
  actions.
- **The producer:** `updateCart` stays an ordinary action that writes the session cart, and the app
  stops sending its own.

Until then, the session keeps logging all three actions through Relay.
