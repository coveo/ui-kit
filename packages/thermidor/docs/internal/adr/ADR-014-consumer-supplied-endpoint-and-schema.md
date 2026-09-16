---
status: Proposed
date: 2026-09-15
related:
  - ./ADR-009-architecture-decision-charter-v2.md
  - ./ADR-010-unified-endpoint-session-client.md
  - ./ADR-013-remote-controller-vending.md
  - ./ADR-014-annex-schema-typing.md
  - ./ADR-001-anti-corruption-layer.md
---

# Consumer-supplied endpoint & injected schema

> Part of the unified-endpoint session-client family (core:
> [ADR-010](./ADR-010-unified-endpoint-session-client.md)), governed by the charter
> [ADR-009](./ADR-009-architecture-decision-charter-v2.md).
> Type-system detail lives in the [schema-typing annex](./ADR-014-annex-schema-typing.md).

## Context and Problem Statement

Thermidor must serve multiple deployments: public consumers on the Coveo unified
endpoint, an internal Command-console team on a different (internal) conversational
endpoint with contracts hosted in a private registry (JFrog), and public consumers
fronting the endpoint with a proxy. This ADR decides how one package serves all of
these without forking.

## Decision

Two config inputs cover all deployments: an overridable endpoint URL and an
injected contracts schema.

**Endpoint — full override.** `endpoint` is a fully-overridable base/converse URL,
not a host that the client decorates with a fixed commerce path. This serves the
internal endpoint (different URL shape) and proxy consumers at once. (Confirm the
exact contract: "provide the full converse URL" vs. "provide a base"; today
`getOrganizationEndpoint` appends `/api/preview/.../agents/commerce/agui/converse`,
which the internal endpoint will not share.)

**Schema — injected, not imported.** Verified by tracing: only the remote
controller depends on `@coveo/thermidor-schema` (`remote-controller.ts` for
`ComponentContractsSchema` + `ComponentContracts`; its property test for
enumeration). Nothing in the session/streaming/fold/request path touches it. The
controller depends on a *shape*, not specific contracts: a Zod discriminated union
whose members expose `componentType` (discriminant literal), `state` (a schema to
`safeParse`), and `actions.shape[name].payload`.

Therefore **`@coveo/thermidor` drops its dependency on `@coveo/thermidor-schema`**
and accepts the contracts as input:

```ts
createSession({ ...config, endpoint, contracts: ComponentContractsSchema });
```

- `ComponentType` and `RemoteController<T>` become **generic over the injected
  contracts** (inferred via `z.infer` over the supplied discriminated union) rather
  than a hardcoded import. Public consumers and the sample pass
  `@coveo/thermidor-schema` (public npm); the Command team passes its JFrog-hosted
  schema. Each consumer installs its own schema from its own registry — an ordinary
  per-consumer install, no resolver trickery.
- **Structural compatibility confirmed:** the internal schema is produced by the
  same JSON-Schema → Zod-v4 pipeline, so it is structurally a discriminated union
  with the same member shape — injection is a drop-in, no adapter interface needed.
  `zod` is a peer dependency of the schema package, so both schemas share the
  consumer's single `zod` instance (no dual-instance parsing hazard).
- **Charter fit:** this *strengthens* public-API independence (ADR-009 MUST,
  ADR-001) — thermidor no longer bakes a specific contract catalog into its
  published surface — and directly serves the consumer-owned-inputs MUST.

**DX (intellisense) — verified.** Best-in-class DX is a charter MUST: consumers
must get autocomplete on component types, action names, and payloads to discover
the API. This was prototyped against the real `typeof ComponentContractsSchema`
(beta.3) with `tsc`. Full intellisense is achievable and confirmed when the
concrete schema is pinned at `createSession(...)`. The mechanism, the load-bearing
design rule that preserves it, the failure mode that collapses action typing to
`never`, and the exact Zod-v4 constraint spelling are recorded in the
[schema-typing annex](./ADR-014-annex-schema-typing.md).

## Options Considered

### Option A (selected): Invert the dependency — inject the schema

See Decision above.

### Option B (rejected): Declare the schema dependency twice, resolving in two registries

Mechanically fragile: a package has one dependency graph; registry resolution is an
install-environment concern (`.npmrc` scope mapping), not something a published
`package.json` can express two ways. Risks silent wrong-schema resolution and
lockfile drift. Moot once the dependency is inverted (there is no schema dep to
declare).

### Option C (rejected): Two packages (`thermidor` + `thermidor-internal`) from one source

Duplicate publish pipelines, two version streams to keep in lockstep, standing
drift risk — all to vary which schema is imported. It also does not fully solve the
problem: the forked package would still import the JFrog schema, reintroducing the
private-registry question inside the fork. Injection sidesteps it entirely because
the *consumer* owns that install.

## Consequences

- **Positive:** One schema-agnostic package serves public, internal, and proxied
  deployments; stronger public-API independence; no fork, no registry trickery;
  full consumer DX preserved (annex).
- **Negative:** Requires generic type-threading discipline (annex) to keep
  intellisense; the endpoint-shape contract needs confirmation with the internal
  team.
- **Neutral:** Public consumers now install `@coveo/thermidor-schema` themselves and
  pass it in, rather than getting it transitively.
