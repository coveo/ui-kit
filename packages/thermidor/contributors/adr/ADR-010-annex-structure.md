---
status: Accepted
date: 2026-09-15
related:
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-011-session-serialization.md
  - ./ADR-013-remote-controller-vending.md
  - ./ADR-014-consumer-supplied-endpoint-and-schema.md
---

# ADR-010 — Annex: package structure (current → target)

Supporting, **illustrative** detail for
[ADR-010](./ADR-010-unified-endpoint-session-client.md). It maps the _current_
`packages/thermidor/src` tree to what survives, transforms, or is removed under the
collapse, to make the "dramatically smaller surface" claim checkable and to scope
the implementation follow-up.

> **This is a target shape, not a binding manifest.** Directories/categories are
> the durable part; individual filenames are indicative and will be settled by the
> implementation PR, which is the source of truth. Do not treat any specific
> filename here as contractual.

## Current inventory (as of this ADR)

`src/` today, grouped by area:

- `internal/api/protocol/` — SSE `stream`, `sse-parser`, `buffer`,
  `error-handling`, `stream-types`, `activity-metadata` (+ tests)
- `internal/api/unified/` — `unified-runtime`, `unified-event-dispatcher`,
  `unified-conversation-request-builder`, `unified-request-selector`,
  `unified-endpoint-client`, `unified-endpoint-types` (+ tests, `index`)
- `internal/api/organization-endpoint.ts` (+ test)
- `internal/engine/` — `engine`, `engine-types` (+ test, `index`, README)
- `internal/interfaces/` — `generative-unified` (+ test, `index`)
- `internal/features/configuration/` — slice/actions/selectors/types (+ tests, `index`)
- `internal/features/generative/` — slice/actions/selectors/types, `generative-state-port` (+ tests, `index`)
- `internal/utils/` — `base-controller`, `base-interface`, `controller-types`,
  `interface-types`, `interface-cache-registry`, `memoized-state-selector`,
  `select-slice`, `noop-thunk`, `deep-equal`, `id-generator`,
  `navigator-context-types` (+ tests)
- `public/controllers/remote/` — `remote-controller` (+ tests)
- `public/controllers/unified-converse/` — `unified-converse-controller`,
  `converse-controller-serialization`, `derive-surface-id` (+ tests)
- `public/interfaces/generative-unified.ts`
- `public/controllers/{index,controller-types}.ts`
- `test/test-utils.ts`

## Disposition by area

### Survives (the valuable core — ADR-010 "Preserved")

| Area                                                                                                                 | Disposition                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `internal/api/protocol/*`                                                                                            | **Keep as-is.** SSE parsing, buffering, stream reading, error handling — the hard-won protocol code.                                                                                           |
| `unified-event-dispatcher`                                                                                           | **Keep** as the event-fold reducer (the pure `activities → turn` fold).                                                                                                                        |
| `unified-conversation-request-builder`, `unified-endpoint-client`, `unified-endpoint-types`, `organization-endpoint` | **Keep**, adjusted for the full converse-URL contract (ADR-014) and provider-sourced context (ADR-012).                                                                                        |
| `unified-runtime`                                                                                                    | **Keep**, but it becomes the session's internal engine of submit/dispatch/cancel/stream-consume (folded into the `Session` implementation rather than driving a controller).                   |
| `remote-controller`                                                                                                  | **Keep**, but vended from the session and generic over the injected schema (ADR-013, ADR-014); `RemoteControllerSource`/`selectRemoteControllerState`/`buildRemoteController` become internal. |
| `converse-controller-serialization` (types + hydration transform)                                                    | **Keep** as the serialize/restore logic (ADR-011); reshaped to the new `Turn` shape and a versioned serialized type.                                                                           |
| `derive-surface-id`                                                                                                  | **Keep short-term**, but folded into the event-fold to produce a typed `response.surfaces` (ADR-015); the raw traversal is interim debt.                                                       |
| `id-generator`, `navigator-context-types`, small pure utils actually used by the above                               | **Keep** the ones still referenced.                                                                                                                                                            |

### Transforms

| Area                                                                                         | Disposition                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `internal/features/generative/*` (slice, actions, selectors, `generative-state-port`, types) | **Collapse.** The RTK slice + ~20-method state port + selectors become a plain observable store + the event-fold. The _domain view types_ (`Turn`, `Activity`, `AgentMessage`, `ReasoningStep`, `ToolCallStep`, …) survive, reshaped to the ADR-010 `Turn`/`TurnResponse` model. |
| `internal/features/configuration/*`                                                          | **Reduce** to whatever config the session needs (org/token/endpoint/context providers), no longer an RTK slice.                                                                                                                                                                  |
| `public/controllers/unified-converse/unified-converse-controller`                            | **Becomes** the `Session` (`createSession`) — same behaviors (submit/dispatch/cancel/retry/serialize/subscribe), no engine/interface underneath.                                                                                                                                 |

### Removed wholesale (ADR-010 "Removed machinery")

| Area                                                                                         | Why                                                                      |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `internal/engine/*`                                                                          | No engine in the lean model.                                             |
| `internal/interfaces/*` and `public/interfaces/*`                                            | No `Interface` layer; single endpoint.                                   |
| `internal/utils/base-interface`, `interface-types`, `interface-cache-registry`, `noop-thunk` | Facade/`Supports<F>`/resolver machinery — dead.                          |
| `internal/utils/base-controller`, `memoized-state-selector`, `select-slice`                  | Controller-base + Redux selector plumbing — not needed by a plain store. |
| `@reduxjs/toolkit` dependency                                                                | No state library.                                                        |
| `@coveo/thermidor-schema` **direct** dependency                                              | Schema is injected (ADR-014).                                            |

## Target shape (illustrative)

```
src/
├── index.ts                      ← exports createSession + domain/config types
├── session/
│   ├── create-session.ts         ← the Session factory + observable store
│   ├── fold.ts                   ← activities → Turn fold (from unified-event-dispatcher)
│   ├── serialize.ts              ← serialize/restore (ADR-011)
│   └── types.ts                  ← Session, Turn, TurnResponse, input/config types
├── remote-controller/
│   └── remote-controller.ts      ← generic, schema-validated (ADR-013/014); internal source seam
├── api/
│   ├── protocol/                 ← stream / sse-parser / buffer / error-handling (kept)
│   ├── request-builder.ts        ← full converse-URL + provider context (ADR-012/014)
│   ├── endpoint-client.ts
│   └── organization-endpoint.ts
├── surfaces.ts                   ← typed surface discovery from activities (ADR-015, interim)
└── test/
```

Folder names/grouping above are indicative. The load-bearing claims are: (1) the
protocol code and the fold survive; (2) engine/interface/facade/RTK/state-port are
gone; (3) the public surface is `createSession` + a vended remote controller + a
handful of domain/config types.
