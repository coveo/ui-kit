# Public API Governance

This document describes how `@coveo/thermidor` keeps its public type surface clean — no internal seams, no transport DTOs, and no third-party library types leaking into what consumers see.

## Why it matters

Consumers of the package see only what's exported from `src/index.ts`. The session-client surface is deliberately narrow: `createSession`, the `Session` handle, the `Turn` / `TurnResponse` domain model, `SessionConfig`, the versioned `SerializedSession` shape, the structural `ContractsSchema` types the injected contracts must match, and the client-owned context types (see [architecture.md](./architecture.md)). Every action goes through `session.dispatchAction`; there is no controller type to vend.

If an internal seam (like the session store or the request builder) or a raw transport DTO (the AG-UI SSE event shapes, the converse request/response bodies) leaks into the public `.d.ts`, consumers become coupled to implementation details they cannot control. A refactor of an internal seam would then become a breaking change. The charter ([ADR-009](adr/ADR-009-architecture-decision-charter-v2.md)) makes public-API independence a MUST, and dropping the engine/interface/Redux layers ([ADR-010](adr/ADR-010-unified-endpoint-session-client.md)) makes most of that independence structural — there is no state library or facade type left to leak. This governance guards against reintroducing leakage as the package evolves.

## DTS validation: api-extractor

The primary automated guard is [api-extractor](https://api-extractor.com/), configured in `api-extractor.json`. It analyzes the compiled `dist/index.d.ts` entry point.

### How it works

Api-extractor resolves all types reachable from the public entry point. If a type appears in a public signature but is not itself exported from the entry point, it triggers `ae-forgotten-export`. This is configured as an **error** (not a warning), so the check fails the moment an internal type surfaces in the public `.d.ts`.

### Key configuration choices

| Setting                  | Value                 | Reason                                                                                                          |
| ------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `mainEntryPointFilePath` | `./dist/index.d.ts`   | Validates the compiled public entry point, the exact surface consumers resolve.                                 |
| `bundledPackages`        | `[]` (empty)          | No third-party package gets a free pass. If a `zod` or AG-UI type appears in the public surface, it's an error. |
| `ae-forgotten-export`    | `"logLevel": "error"` | Fail immediately on any leak — no warnings to ignore.                                                           |
| `apiReport.enabled`      | `true`                | Commits a snapshot of the surface, so every public API change shows up as a reviewable diff (see below).        |

### Why this catches what lint cannot

There is no lint rule policing the public surface for state-library or transport imports — the collapse to the session client removed the layers that made such a rule meaningful, and non-leakage is now largely structural. What remains worth guarding is the _transitive_ case: exporting a domain type that happens to reference an internal or third-party type in its definition. A direct-import lint rule would never catch that; api-extractor does, because it walks every type reachable from the entry point rather than inspecting import statements. (The one structural import rule the package still keeps is the `zod` peer-only, type-only ban in `.oxlintrc.json`, per [ADR-014](adr/ADR-014-consumer-supplied-endpoint-and-schema.md) — that guards the runtime dependency boundary, not the `.d.ts` surface.)

### Commands

- `pnpm run test:dts` — local validation with the `--local` flag (does not fail on a stale API report, and updates it). It reads `dist/` and does not build first, so run `pnpm run build && pnpm run test:dts`.
- `pnpm run test:dts:ci` — CI validation without `--local` (strict; fails on a stale API report)

## API Report (snapshot)

Api-extractor generates an "API Report", a human-readable snapshot of the entire public API surface, committed under `api-report/`: `thermidor.api.md` for the root entry and `thermidor-private.api.md` for `@coveo/thermidor/private` (configured in `api-extractor.private.json`). On every run, api-extractor compares the current surface against the committed snapshot; any difference (new export, changed signature, removed type) fails `test:dts:ci` until the report is regenerated with `pnpm run build && pnpm run test:dts` and the change is reviewed.

The report also marks every public declaration that has no TSDoc as `(undocumented)`. The public report must have none: the TypeDoc build (`pnpm run build:typedoc`) fails on any undocumented public member, since the reference on docs.coveo.com is generated from these comments. `pnpm run test` holds `@coveo/thermidor/private` to the same rule with `check:typedoc:private`, a TypeDoc pass over `src/private.ts` (`typedoc.private.json`) that writes no output, so the published reference stays public-only.

## Keeping internal seams out of the surface

The internal-only `createPrivateSession` factory is the one deliberate exception to the narrow surface, and it lives in its own entry point, `@coveo/thermidor/private`, never in `src/index.ts`. Its api-extractor config (`api-extractor.private.json`) validates that entry and its own report separately. The root entry stays free of it because the root report (`thermidor.api.md`) would show any leak, and because the negative `@ts-expect-error` imports in `src/index.test-d.ts` fail `pnpm run test` if `createPrivateSession` or `PrivateSessionConfig` becomes reachable from the root. Vitest type-checks the `*.test-d.ts` files with `tsconfig.typecheck.json`, which turns off `noUnusedLocals`: otherwise the unused-import error alone would satisfy every `@ts-expect-error`, leak or not. The same file asserts that the retired names (`Engine`, the facades, `RemoteController` and its helpers, and the Redux store, slice, reducer, selector and thunk) stay unreachable. When adding a new public type, thread only domain-level concepts through the entry point and run `pnpm run build && pnpm run test:dts` to confirm nothing internal came along for the ride.
