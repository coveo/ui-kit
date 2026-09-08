# ADR-004: Generate the Zod Projection Statically with Quicktype

**Status:** Accepted
**Date:** 2026-08-03
**Deciders:** Thermidor Stack team

## Context

ADR-003 establishes that `@coveo/thermidor-schema` will provide a public TypeScript/Zod projection of the canonical JSON Schema contract. The projection must be useful to consumers as a normal Zod package: importing it must not load, resolve, bundle, or convert JSON Schema documents.

The contract uses Draft 2020-12 JSON Schema, spans multiple documents through relative `$ref` values, and contains recursive `Product` values. Public output targets Zod 4. Generated validators and inferred types are committed for review and checked for freshness.

Quicktype provides a reusable JSON Schema input graph, multi-document reference resolution, recursive type handling, and a target-language extension API. Its stock TypeScript Zod target does not fully express Thermidor's desired Zod 4 output, especially unknown-key policy, integer and scalar constraints, URI validation, and recursive getter output. These differences can be implemented in a Thermidor target without moving JSON Schema conversion into consumer runtime code.

## Decision Drivers

- Package consumers must receive prebuilt Zod declarations with no JSON Schema conversion at import time.
- Recursive and cross-document constraints must remain enforced, not silently degrade to permissive validators.
- JSON Schema must remain the single source of truth.
- Generated output must be deterministic, reviewable, and validated against the canonical contract.
- The package should not ship a converter or reference resolver as a runtime dependency.
- The generation implementation should reuse a maintained schema graph and reference resolver rather than reimplementing them project-locally.

## Decision

Use exactly pinned `quicktype-core` as a generation-time-only dependency.

`scripts/generate-zod.ts` follows Quicktype's programmatic `InputData` and `quicktype(...)` flow directly. It supplies an offline local schema store, registers the explicit public projection roots, and writes committed Zod 4 source under `packages/typescript/src/generated/`.

`scripts/quicktype-zod.ts` defines a Thermidor target extending Quicktype's TypeScript Zod target. The target emits Zod 4-specific forms including `z.strictObject`, `z.looseObject`, top-level URI schemas, recursive getters, integer and scalar constraints, and literal discriminators where required by exported runtime contracts.

The Thermidor target is ultimately a Zod 4 target. We should aim to upstream its reusable Zod 4 rendering behavior to Quicktype, while keeping Thermidor-specific projection-root selection and editorial contract composition in this repository.

The generated package remains static. It imports only `zod` at runtime; it does not ship Quicktype, JSON Schema conversion, or reference resolution to consumers.

Ajv remains the authoritative Draft 2020-12 validator. The generated Zod projection is an ergonomic runtime projection and is validated through committed-output freshness checks, targeted generator tests, and Ajv/Zod parity fixtures for exported contracts.

## Alternatives Considered

### Bespoke in-repository JSON Schema-to-Zod generator

We implemented and tested a constrained bespoke generator as an alternative. It proved that static source, recursive validation, cross-document references, and Zod 4 output could satisfy the package requirements. It also provided the regression fixtures that guard recursive validation.

We did not retain it as the chosen implementation because it duplicated document loading, `$ref` resolution, schema graph construction, and rendering behavior that Quicktype already provides. The bespoke implementation is therefore a defunct tested alternative, not the ongoing generator architecture.

### `json-schema-to-zod`

`json-schema-to-zod` emits static source and can target Zod 4. However, its upstream repository is archived. More importantly, when evaluated with Thermidor's recursive `Product` schema, its static output degraded nested recursive references to `z.any()`. A fixture with an invalid child product passed Zod validation while Ajv correctly rejected it.

We reject this alternative because accepting unconstrained recursive children would weaken the published contract.

### `@n8n/json-schema-to-zod`

The n8n fork is actively maintained and emits static source, but its declared peer dependency targets Zod 3. Thermidor's public package targets Zod 4.

We reject this alternative because changing the public package to Zod 3 solely to accommodate a generator would constrain consumers without solving the full cross-document-reference requirements.

### `zod-from-json-schema`

`zod-from-json-schema` supports Zod 4 and recursive internal references, but it constructs Zod schemas at runtime. Its documented external-reference support is incomplete, requiring Thermidor to bundle or resolve the multi-document contract before conversion.

We reject this alternative because consumers would perform schema conversion and reference handling at import time, contrary to the static-package requirement.

### A complete generic JSON Schema compiler

Implementing complete Draft 2020-12 support would be costly and would duplicate mature validator functionality already provided by Ajv.

We reject this alternative because the package needs a bounded projection of Thermidor's own schema profile. Ajv remains the exact validator for the complete JSON Schema contract.

## Consequences

### Positive

- Consumers import only prebuilt Zod validators and TypeScript declarations.
- Quicktype supplies multi-document graph and recursion machinery while Thermidor owns its Zod 4 rendering choices.
- Generated source produces reviewable diffs alongside schema changes.
- Ajv and Vitest parity fixtures detect projection regressions.
- The published runtime dependency surface remains small: consumers need Zod, not JSON Schema conversion tooling.

### Negative and trade-offs

- Quicktype target and renderer APIs are generation internals rather than a stable plugin ABI; the exact version pin and focused generator tests are safeguards.
- JSON Schema and Zod are not equivalent specifications; new or exotic schema vocabulary can require renderer work and parity coverage.
- The generated Zod projection is not a complete Draft 2020-12 compiler; Ajv remains authoritative where exact validation is required.

## Scope

This decision applies to the TypeScript/Zod projection only. It does not constrain future language projections, provided they retain JSON Schema as canonical and preserve their contract semantics.
