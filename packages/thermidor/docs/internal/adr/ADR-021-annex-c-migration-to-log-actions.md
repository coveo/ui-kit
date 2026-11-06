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
- emits `ec.productClick` through a real analytics client, with the shopper's client id, tracking id,
  IP and user agent;
- logs the same `responseId`, position and currency as the session logs today, checked against the
  cases of annex B;
- has the consent decision ADR-023 waits for.

## 2. The release

| Area                 | Before the release                                  | After the release                                     |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Renderer             | `productClick {productId, name?, price?, position}` | `productClick {analyticsRef}`                         |
| Delivery             | Relay, from the browser                             | A log action, outside the turn slot, with `keepalive` |
| Attribution          | `analyticsAttribution` announcement                 | Resolved by the producer                              |
| `analytics.enabled`  | Turns the browser's events on or off                | Kept: `enabled: false` sends `capture: false`         |
| Currency             | Stated by the producer on `RUN_STARTED`             | The producer's own, no longer stated                  |
| `analytics.endpoint` | Events URL                                          | Deprecated, ignored                                   |
| Dependencies         | `@coveo/relay`, `@coveo/relay-event-types`          | Removed                                               |
| Page CSP             | `connect-src` to the analytics origin               | Not needed                                            |
| Token                | Must be allowed to write analytics                  | No analytics privilege needed                         |

The session keeps reading and writing the visitor's client id under the same cookie and storage key,
so a consumer without a `navigatorContextProvider` keeps its visitors.

## 3. Changelog for consumers

> **Breaking:** `productClick` now carries the item's `analyticsRef` instead of its ids, name, price
> and position. The producer logs the click.
>
> ```diff
> - dispatch('productClick', {productId: product.ec_product_id, name: product.ec_name, price, position});
> + dispatch('productClick', {analyticsRef: product.analyticsRef});
> ```
>
> You may remove the `connect-src` entry for `*.analytics.org.coveo.com` from your CSP, and the
> analytics privilege from the session's token. `analytics.endpoint` is deprecated and ignored.

## 4. Proving each point

| Point                       | Test                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| One path per version        | The current session never sends an analytics action to the converse endpoint; the migrated session never emits through Relay |
| Same visitor                | A client id written by the current session is read back by the migrated session                                              |
| Same attribution            | The session's event and the producer's event for the same click carry the same `responseId`, position and currency           |
| Delivered across navigation | A click that opens a page in the same tab still reaches its endpoint                                                         |
| Analytics off               | `enabled: false` sends no event and `capture: false`                                                                         |

## 5. Data

Events move from the browser to the producer on the release date:

- `source` changes from `@coveo/thermidor` to `@coveo/agent-gateway`;
- events blocked by content blockers in the browser are no longer lost, so volumes rise;
- IP and user agent are the ones the producer forwards.

Reports should be annotated with the release date.

## 6. The cart

ADR-023 keeps `updateCart` an ordinary action, because it writes the producer's session cart, and
leaves `purchase` open. The session never sends either to the producer, so the producer's session cart
stays empty, and the cart the app sends with every request (ADR-012) is the only one.

Before these actions migrate, one decision is needed: who owns the cart.

- **The app (ADR-012):** the producer reads `context.cart`, and `updateCart` and `purchase` become log
  actions.
- **The producer:** `updateCart` stays an ordinary action that writes the session cart, and the app
  stops sending its own.

Until then, the session keeps logging them through Relay.
