# ADR-007: Host @coveo/thermidor-schema in the ui-kit Monorepo

**Status:** Proposed  
**Date:** 2026-08-19  
**Deciders:** Thermidor Stack team  
**Related:** [ADR-003](./ADR-003-public-schema-publication.md)

---

## Context and Problem Statement

ADR-003 decided to publish `@coveo/thermidor-schema` as a public npm package from a public repository. At the time, the decision was written in the context of a standalone repository dedicated to the schema contract. The package has since been developed within the `ui-kit` monorepo (`packages/thermidor-schema/`), where `@coveo/thermidor` already consumes it via `workspace:*`.

This ADR documents and ratifies the decision to host the schema package in ui-kit rather than maintaining a separate repository, and evaluates whether ADR-003's publication requirements remain satisfied.

## Decision Drivers

- `@coveo/thermidor` is the primary consumer of `@coveo/thermidor-schema` and lives in ui-kit.
- Schema, SDK, and sample development must iterate together without intermediate publish cycles.
- Cross-package changes (schema contract + SDK implementation) should be atomic and reviewable in a single PR.
- The monorepo's existing infrastructure (CI, Changesets, Turbo, npm trusted publishing) should be reused rather than duplicated.
- ADR-003's core requirements (public source, npm provenance, auditability) must remain satisfied.
- The schema package should benefit from the same review, testing, and release governance as the rest of the Thermidor stack.

## Considered Options

### Option A: Dedicated standalone repository

- **Summary:** `@coveo/thermidor-schema` lives in its own public GitHub repository with independent CI, release workflow, and versioning.
- **Pros:**
  - Independent release cadence: the schema can be published on its own schedule without depending on the monorepo's release process.
  - Clear boundary: external contributors can engage with the schema contract without navigating the full ui-kit codebase.
- **Cons:**
  - Cross-package changes require coordinated PRs across two repositories.
  - `@coveo/thermidor` must pin a published version rather than using `workspace:*`, introducing version lag and integration friction.
  - Duplicated CI infrastructure (build, test, lint, release, npm trusted publishing).
  - Schema and SDK can drift between repositories; integration testing requires additional cross-repo automation.
  - A separate release pipeline to maintain, monitor, and secure.

### Option B: Host in the ui-kit monorepo

- **Summary:** `@coveo/thermidor-schema` lives in `packages/thermidor-schema/` within the ui-kit monorepo, published alongside other public packages via the existing Changesets workflow.
- **Pros:**
  - Atomic cross-package changes: a schema evolution and its SDK adaptation ship in the same PR and release.
  - `workspace:*` dependency: `@coveo/thermidor` always builds against the current schema — no version lag.
  - Immediate development feedback loop: schema changes, SDK adaptations, and sample validation (`demo-schema-react`) happen in the same workspace — no intermediate publish step required to verify end-to-end integration.
  - Shared infrastructure: Turbo build graph, Vitest, CI pipelines, Changesets, npm trusted publishing — no duplication.
  - Unified review governance: same branch protections, CODEOWNERS, and area labels as the rest of the Thermidor stack.
  - Co-located documentation: schema ADRs, Thermidor SDK ADRs, analysis documents, and validation samples live in the same repository and can reference each other directly.
  - Reduced maintenance burden: one release pipeline, one set of credentials, one provenance chain.
- **Cons:**
  - Schema releases depend on the monorepo's release process: an urgent schema-only publish must go through the standard Changesets workflow.
  - External contributors must clone the full ui-kit monorepo to contribute to the schema (though the package is self-contained within its directory).
  - The schema package inherits the monorepo's commit history, which may include unrelated changes in other packages.

### Option C: Expose the schema from the backend repository (e.g., agent-gateway)

- **Summary:** The schema contract is owned and published by the backend, potentially as an OpenAPI schema exposed directly by the backend service.
- **Pros:**
  - The backend is the authoritative producer of state and actions — owning the schema there aligns ownership with authority.
  - Could enable automatic contract generation from the backend implementation.
  - A single source of truth co-located with the service that enforces it.
- **Cons:**
  - Requires cross-team alignment with the backend team on schema governance, versioning, and release cadence.
  - Frontend iteration on the schema (during early development) would depend on backend PRs and release cycles.
  - The backend team has not yet been consulted on this responsibility.
  - The current TypeScript/Zod projection and generation tooling is frontend-specific and would need to be re-homed or restructured.

This option is not rejected but **deferred**. It requires a discussion with the backend team that has not yet taken place. If that discussion concludes that backend ownership is preferable, this ADR can be superseded.

## Decision Outcome

We adopt **Option B**: `@coveo/thermidor-schema` is hosted in the ui-kit monorepo at `packages/thermidor-schema/`.

### Rationale

The primary consumer of the schema is `@coveo/thermidor`, which lives in the same monorepo. Schema changes almost always require corresponding SDK changes. Hosting both in the same repository makes these changes atomic, reviewable, and releasable together.

A standalone repository would introduce coordination overhead (cross-repo PRs, version pinning, integration testing) for the sole benefit of independent versioning — a benefit that is not needed given the schema's current maturity (`0.x`) and tight coupling with the SDK.

The ui-kit monorepo is already public, uses GitHub Actions trusted publishing, and satisfies all of ADR-003's publication requirements:

| ADR-003 requirement      | Satisfied in ui-kit?                                         |
| ------------------------ | ------------------------------------------------------------ |
| Public source            | Yes — ui-kit is a public repository                          |
| npm provenance           | Yes — GitHub Actions OIDC trusted publishing                 |
| Auditability             | Yes — source, build, and release are in the same public repo |
| No long-lived npm tokens | Yes — same trusted publishing setup as other ui-kit packages |
| Apache-2.0 license       | Yes — ui-kit is Apache-2.0                                   |

### Relationship with ADR-003

ADR-003's core decision — public publication with provenance from a public source — remains valid. What changes is the "repository" context: ADR-003 assumed a standalone repo, this ADR ratifies that the monorepo satisfies the same requirements. The publication-readiness gates from ADR-003 (credential audit, protected branches, release controls) are already met by ui-kit's existing governance.

## Consequences

### Positive

- Schema and SDK evolve in lockstep without cross-repo coordination.
- No duplicated CI, release, or security infrastructure.
- Schema changes go through the same review and testing pipeline as the consuming SDK.
- `workspace:*` eliminates version lag between schema and SDK.

### Negative

- Schema releases depend on the monorepo's release process: an urgent schema-only publish must go through the standard Changesets workflow.
- Contributors interested only in the schema must work within the full monorepo (though `packages/thermidor-schema/` is self-contained with its own scripts and tests).

### Neutral

- The schema package retains its own `package.json`, build scripts, tests, and docs directory. It is a self-contained package within the monorepo.
- Future language projections (e.g., Java) may live in a different repository if they do not benefit from the TypeScript-centric monorepo infrastructure. This ADR does not constrain that decision.
- Backend ownership of the schema (Option C) remains a viable long-term direction. If the backend team decides to own and expose the contract (e.g., via OpenAPI), this ADR should be revisited. The current decision optimizes for frontend development velocity during the `0.x` phase.

---

## References

- [ADR-003: Publish the Thermidor Schema Contract and TypeScript Projection](./ADR-003-public-schema-publication.md)
