# Public API Governance

This document describes how `@coveo/thermidor` keeps its public type surface clean — no internal seams, no transport DTOs, and no third-party library types leaking into what consumers see.

## Why it matters

Consumers of the package see only what's exported from `src/index.ts`. The session-client surface is deliberately narrow: `createSession`, the `Session` handle, the `Turn` / `TurnResponse` domain model, `SessionConfig`, the versioned `SerializedSession` shape, and the generic `RemoteController` type and its derivation helpers (see [architecture.md](../architecture.md)).

If an internal seam (like the `RemoteControllerSource` type or the internal `buildRemoteController` factory) or a raw transport DTO (the AG-UI SSE event shapes, the converse request/response bodies) leaks into the public `.d.ts`, consumers become coupled to implementation details they cannot control. A refactor of an internal seam would then become a breaking change. The charter ([ADR-009](adr/ADR-009-architecture-decision-charter-v2.md)) makes public-API independence a MUST, and dropping the engine/interface/Redux layers ([ADR-010](adr/ADR-010-unified-endpoint-session-client.md)) makes most of that independence structural — there is no state library or facade type left to leak. This governance guards against reintroducing leakage as the package evolves.

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
| `apiReport.enabled`      | `false`               | Disabled until the API stabilizes (see below).                                                                  |

### Why this catches what lint cannot

There is no lint rule policing the public surface for state-library or transport imports — the collapse to the session client removed the layers that made such a rule meaningful, and non-leakage is now largely structural. What remains worth guarding is the _transitive_ case: exporting a domain type that happens to reference an internal or third-party type in its definition. A direct-import lint rule would never catch that; api-extractor does, because it walks every type reachable from the entry point rather than inspecting import statements. (The one structural import rule the package still keeps is the `zod` peer-only, type-only ban in `.oxlintrc.json`, per [ADR-014](adr/ADR-014-consumer-supplied-endpoint-and-schema.md) — that guards the runtime dependency boundary, not the `.d.ts` surface.)

### Commands

- `pnpm run test:dts` — local validation with the `--local` flag (does not fail on a stale API report)
- `pnpm run test:dts:ci` — CI validation without `--local` (strict; fails on a stale API report once reports are enabled)

## API Report (snapshot) — not yet enabled

Api-extractor can generate an "API Report" file — a human-readable snapshot of the entire public API surface, committed to the repo. On every run, api-extractor compares the current surface against the committed snapshot; any difference (new export, changed signature, removed type) fails the check until the report is explicitly updated.

### Why it's disabled

The package is in active development and its public API still changes. A committed report would need updating on nearly every PR, adding friction without much value yet.

### When to enable it

Enable `apiReport` once the package reaches a stable public API (likely before the first non-prerelease version). At that point:

1. Set `"apiReport": { "enabled": true, "reportFolder": "./api-report/" }` in `api-extractor.json`
2. Run `pnpm run test:dts` to generate the initial report
3. Commit the report file
4. From that point, any public API change requires an explicit report update plus review

This provides a reviewable diff for every public API change — catching accidental breaking changes before they ship.

## Keeping internal seams out of the surface

The remote controller is the one place where an internal seam is deliberately kept narrow yet unexported. `session.remoteController(id, type)` returns the public `RemoteController<TContracts, T>` type, but it delegates to an internal `buildRemoteController({ source, ... })` factory whose `RemoteControllerSource` seam exists only so the controller stays unit-testable against a fake source ([ADR-013](adr/ADR-013-remote-controller-vending.md)). Neither `buildRemoteController`, `RemoteControllerSource`, nor `selectRemoteControllerState` is re-exported from `src/index.ts`, and api-extractor enforces that none of them appears transitively in the public `.d.ts`. When adding a new public type, thread only domain-level concepts through the entry point and run `pnpm run test:dts` to confirm nothing internal came along for the ride.
