---
status: Proposed
date: 2026-11-03
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-012-client-owned-context.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
  - https://coveord.atlassian.net/browse/KIT-6499
---

# Private entry point (internal Coveo use only) that injects the request contract

> **For internal Coveo use only.** The entry point this ADR records,
> `@coveo/thermidor/private`, is not supported for customers and may change without notice.

## Context and Problem Statement

Since 0.7.0 (#8786), `createSession` requires a non-blank `agentConfigurationId` and
`trackingId`, and sends exactly those two fields besides the ones the session builds
itself. Storefront Preview, a Coveo internal application in admin-ui, calls the gateway's
private converse endpoint, which takes no `agentConfigurationId` when the request sends
`trackingId` plus `language`, `country` and `currency`. It can't open a session on 0.7.0.

Whether the public contract should make the ids optional, or take locale fields, is an open
product question. Storefront Preview can't wait for it, and the answer it needs (a request
shape a private endpoint accepts) is not one customers should depend on.

## Decision Drivers

- The public `createSession` and `SessionConfig` behave and type exactly as in 0.7.0.
- Nothing private is reachable from the root entry, so customers can't find or depend on it.
- One session runtime: no fork of the dispatch, retry or stream logic.
- Follows the injection pattern of ADR-014: the caller supplies the schema, the package
  declares no dependency on a request-schema package.
- The fields are read fresh per request, like the context providers (ADR-012).

## Considered Options

### Option A: A `request` option on the root `SessionConfig`

- **Summary:** make `agentConfigurationId`/`trackingId` optional when `request` is given.
- **Pros:** one entry point.
- **Cons:** changes the public type to a union; customers see and can use an unsupported
  contract; preempts the pending product decision.

### Option B: A separate private subpath export over a shared runtime

- **Summary:** `@coveo/thermidor/private` exports `createPrivateSession`, whose
  `request: {schema, fields}` replaces the ids. Both factories call one runtime that takes
  its request contract as an input.
- **Pros:** the root contract is untouched and a type test guards it; the private surface
  is labelled and can change freely; no runtime fork.
- **Cons:** a second published entry, API Extractor run and size budget to maintain.

### Option C: A private fork or a patch in admin-ui

- **Summary:** Storefront Preview patches or vendors thermidor.
- **Pros:** no change here.
- **Cons:** drifts from every fix in the runtime; the patch breaks on each release.

## Decision Outcome

Option B.

- `createSessionRuntime(config, requestContract)` in `create-session.ts` is the shared
  runtime. A request contract is `{readFields(): Record<string, unknown>}`, read on every
  request build. The request is `{...contractFields, ...clientOwnedFields}`: the keys the
  session builds (`clientId`, `message`, `action`, `conversationSessionId`,
  `conversationToken`, `context`, `pinnedProducts`) always win.
- `createSession` keeps its 0.7.0 guard and passes the built-in contract
  `{agentConfigurationId, trackingId}`.
- `createPrivateSession` takes `PrivateSessionConfig`: `SessionConfig` without the ids,
  plus `request: {schema: ParsableSchema, fields: () => Record<string, unknown>}`. Each read
  calls `fields()`, **rejects** a client-owned key, parses with `schema.safeParse`, rejects a
  client-owned key in the parsed value too, and returns the parsed value, which is what is
  sent. It reads once before creating the runtime, so invalid fields throw from
  `createPrivateSession`; after that, a read throws inside the request builder, so an
  invalid read fails that request like a throwing context provider (a prompt fails its turn,
  an action sets `actionError`, `initialize` fails the initialization) and nothing is sent.
- `@coveo/thermidor/private` also re-exports the root entry, so its types resolve from one
  entry (API Extractor checks each entry on its own) and an internal app imports from one place.

### Rationale

Option A fails the first two drivers, and Option C the third. Option B keeps the public
contract byte-for-byte while giving internal apps a typed, validated way to send their own
fields.

A client-owned key is **rejected rather than dropped**: dropping would hide a bug in the
caller (it believes it sent `context`, but did not), while rejecting fails loudly on the
first read, which is the read most such bugs hit. It matches the runtime's existing stance on
invalid action payloads, which are refused, not repaired.

## Consequences

- **Positive:** Storefront Preview can open a session with its locale and no agent
  configuration id; the public contract is unchanged; a future public decision on optional
  ids can reuse the same runtime seam.
- **Negative:** a second entry to build, check with API Extractor and budget in
  `.size-limit.json`. Private-entry callers carry their own schema until a private request
  schema exists in thermidor-schema.
- **Neutral:** the private entry is published in the public package, so the "internal use
  only" label (TSDoc, README, changeset) is the guard, not access control.

## Implementation and Follow-up

- Follow-ups out of scope here: a private converse request schema in thermidor-schema; an
  optional `trackingId` on the gateway's private endpoint; the product decision on the public
  contract's ids.
- Revisit, and likely remove this entry, once the public contract covers Storefront
  Preview's needs.
