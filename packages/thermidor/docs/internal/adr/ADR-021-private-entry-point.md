---
status: Proposed
date: 2026-11-03
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - https://coveord.atlassian.net/browse/KIT-6499
---

# Private entry point (internal Coveo use only) with optional ids and locale

> **For internal Coveo use only.** The entry point this ADR records,
> `@coveo/thermidor/private`, is not supported for customers and may change without notice.

## Context and Problem Statement

Since 0.7.0 (#8786), `createSession` requires a non-blank `agentConfigurationId` and
`trackingId`, and no longer sends `language`, `country` or `currency`. Storefront Preview, a
Coveo internal application in admin-ui, calls the gateway's private converse endpoint,
which takes no `agentConfigurationId` when the request sends `trackingId` plus `language`,
`country` and `currency`. It can't open a session on 0.7.0.

Whether the public contract should make the ids optional or take a locale is an open
product question. Storefront Preview can't wait for it, and customers should not depend on
a request shape only a private endpoint accepts.

## Decision Drivers

- The public `createSession` and `SessionConfig` behave and type exactly as in 0.7.0.
- Nothing private is reachable from the root entry.
- One session runtime: no fork of the dispatch, retry or stream logic.
- The smallest surface that unblocks Storefront Preview.

## Considered Options

### Option A: Optional ids and locale on the root `SessionConfig`

- **Pros:** one entry point.
- **Cons:** changes the public contract and preempts the pending product decision.

### Option B: A private subpath whose config injects a request contract

- **Summary:** `createPrivateSession({request: {schema, fields}})`, the fields read and
  parsed before every request.
- **Pros:** any request shape, validated before it is sent.
- **Cons:** a schema, a fields provider and checks against overriding the session's own keys,
  for three known fields whose values the caller owns.

### Option C: A private subpath whose config makes the ids optional and adds the locale

- **Summary:** `createPrivateSession` takes the public config with `agentConfigurationId`
  and `trackingId` optional, plus optional `language`, `country` and `currency`.
- **Pros:** the same shape as the public config; no new concepts; the root is untouched.
- **Cons:** a new private field means a change here.

## Decision Outcome

Option C.

- `createSessionRuntime(config, requestScope)` in `create-session.ts` is the shared runtime.
  `requestScope` holds the fields that scope every request; each request is
  `{...requestScope, ...sessionBuiltFields}`, so the session's own keys can't be overridden.
- `createSession` keeps its 0.7.0 guard and passes `{agentConfigurationId, trackingId}`.
- `createPrivateSession` takes `PrivateSessionConfig`: `SessionConfig` without the two ids,
  plus `agentConfigurationId?`, `trackingId?`, `language?`, `country?` and `currency?`. Every
  one of these that is set is sent with every converse request (`initialize`, prompts and
  actions, concurrent and cached ones included); an unset one is left out. It throws on
  nothing, blank values included.
- `@coveo/thermidor/private` also re-exports the root entry, so its types resolve from one
  entry (API Extractor checks each entry on its own) and an internal app imports from one place.

### Rationale

Option A fails the first driver. Option B was the first implementation of this ADR and was
simplified to Option C: the caller owns the values, and the gateway validates the request
and rejects what it can't serve, so a client-side schema only duplicated that check and made
the caller describe three string fields twice. Option C needs no new concept, and a private
field the gateway adds later is one optional property here.

## Consequences

- **Positive:** Storefront Preview opens a session with its locale and no agent
  configuration id; the public contract is unchanged; a future public decision on optional
  ids or locale can reuse the same runtime input.
- **Negative:** a second entry to build, check with API Extractor and budget in
  `.size-limit.json`. Invalid values reach the gateway before they fail.
- **Neutral:** the private entry is published in the public package, so the "internal use
  only" label (TSDoc, changeset, this ADR) is the guard, not access control. It is kept out
  of the README, which is written for customers.

## Implementation and Follow-up

- Out of scope: an optional `trackingId` on the gateway's private endpoint; the product
  decision on the public contract's ids and locale.
- Revisit, and likely remove this entry, once the public contract covers Storefront
  Preview's needs.
