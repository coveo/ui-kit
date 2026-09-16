---
status: Proposed
date: 2026-09-15
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - ./ADR-011-session-serialization.md
---

# Client-owned context via providers

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md).

## Context and Problem Statement

Each request to the unified endpoint carries context that the endpoint uses for
intent routing: ambient navigator data (`view.url`, `referrer`, `userAgent`,
`clientId`) and app-owned commerce data (`cart`, `pinnedProducts`, `source`,
`custom`). Today the request builder hardcodes these to empty/literal values;
there is no way to supply or update them. Context is the one piece of genuinely
client-owned, mutable input in this model — everything else is either
server-authoritative or a fold of server events. This ADR decides how consumers
supply and update it.

## Decision

**Ownership:** the consuming app owns cart and additional context in its own
store. Thermidor holds no context state of its own and never keeps a competing
copy, so there is no "which cart is authoritative" question.

**Mechanism — pull-based providers.** Context is supplied via synchronous
providers on `SessionConfig` and read at request-build time, not captured at
session creation:

```ts
interface SessionConfig<TContracts> {
  organizationId: string;
  accessToken: string;
  endpoint?: string;                                   // full override; see ADR-014
  contracts: TContracts;                               // injected component contracts; see ADR-014
  navigatorContextProvider?: () => NavigatorContext;  // ambient: view.url, referrer, userAgent, clientId
  commerceContextProvider?: () => CommerceContext;    // app-owned: cart, pinnedProducts, source, custom
}
```

The builder calls both providers per request and composes the payload. Because
context is read fresh on every `submit`/`dispatchAction`, "update context while
interacting with the session" is satisfied structurally — the provider returns
whatever the app's store currently holds; there are no setters and no
thermidor-side context state to keep in sync. `dispatchAction` needs no context
argument for the same reason (a dispatching component need not know cart state).

**Absent vs. empty (do not conflate):** send structural empties (`cart: []`,
etc.) only when a provider is *absent* (a purely conversational / non-commerce
consumer with no cart concept). When a provider is present and returns an empty
cart, send `cart: []` meaningfully — the router's intent decision may distinguish
"no commerce context" from "empty cart".

**Synchronous by design:** providers are sync, matching the existing
`navigatorContextProvider`. An async provider would force `submit` to await
context before starting the request, complicating streaming/cancel for a case
that likely does not exist (app stores are synchronously readable). If a genuine
async or one-off-override need arises, add an optional per-call
`submit({ prompt, context })` override rather than making the common path async.

**Not serialized:** context is never part of the serialized session. It reflects
the app's *current* world; a restored session must read today's context from the
app's store, not a stale snapshot. Using functions as providers excludes context
from the blob by construction (see [ADR-011](./ADR-011-session-serialization.md)).

## Consequences

- **Positive:** No staleness by construction; single source of truth (the app's
  store); no thermidor-side context state; SSR/serialization stay clean.
- **Negative:** Consumers must expose a synchronously-readable context store; an
  async-only source needs the per-call override escape hatch.
- **Neutral:** The `absent vs. empty` distinction must be honored by the request
  builder so routing behavior is not silently changed.
