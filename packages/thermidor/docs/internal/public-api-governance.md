# Public API Governance

This document describes how `@coveo/thermidor` ensures its public type surface remains clean — no internal types, no third-party library types, no accidental breaking changes.

## Why it matters

Consumers of the package see only what's exported from `src/index.ts`. If internal types (like `FullEngine`, `FacadeResolverFactory`) or third-party types (like Redux's `AsyncThunk`, Immer's `Draft<T>`) leak into the public `.d.ts`, consumers become coupled to implementation details they cannot control. Updating Redux internally would then become a breaking change.

## Three layers of protection

| Layer                 | Tool                                | What it catches                                                                      | When it runs                                              |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Lint                  | oxlint `no-restricted-imports`      | Direct imports of Redux/Immer/AG-UI in `src/index.ts` and `src/public/**`            | On every lint pass                                        |
| DTS validation        | api-extractor `ae-forgotten-export` | Internal types referenced in public signatures but not exported from the entry point | `pnpm run test:dts` (local) / `pnpm run test:dts:ci` (CI) |
| API Report (snapshot) | api-extractor `apiReport`           | Unintentional changes to the public API surface between versions                     | Not yet enabled — see below                               |

## Lint: no-restricted-imports

Configured in `.oxlintrc.json`. Applies to `src/index.ts` and `src/public/**`:

```json
{
  "patterns": [
    {
      "group": [
        "@reduxjs/toolkit",
        "@reduxjs/toolkit/*",
        "immer",
        "redux-thunk",
        "reselect",
        "@ag-ui/core",
        "@ag-ui/core/*"
      ],
      "message": "Public surface must not depend on Redux, Immer, AG-UI, or related ecosystem packages directly."
    }
  ]
}
```

This prevents any code in the public layer from importing third-party state management libraries. The entry point (`src/index.ts`) can only re-export from `src/public/` and `src/internal/utils/` barrels.

**Limitation:** The lint rule only catches _direct_ imports of restricted packages. It does not catch _indirect_ leaks — for example, exporting an internal type that happens to reference `AsyncThunk` in its definition. That transitive case is caught by api-extractor (see below). The two tools are complementary: lint prevents the obvious mistakes, api-extractor catches the subtle ones.

## DTS validation: api-extractor

Configured in `api-extractor.json`. Analyzes the compiled `dist/index.d.ts` entry point.

### How it works

Api-extractor resolves all types reachable from the public entry point. If any type appears in a public signature but is not itself exported from the entry point, it triggers `ae-forgotten-export`. This is configured as an **error** (not a warning) — the build fails.

### Key configuration choices

| Setting               | Value                 | Reason                                                                                                 |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| `bundledPackages`     | `[]` (empty)          | No third-party package gets a free pass. If a Redux type appears in the public surface, it's an error. |
| `ae-forgotten-export` | `"logLevel": "error"` | Fail the build immediately on any leak — no warnings to ignore.                                        |
| `apiReport.enabled`   | `false`               | Disabled until the API stabilizes (see below).                                                         |

### Commands

- `pnpm run test:dts` — local validation with `--local` flag (doesn't fail on stale API reports)
- `pnpm run test:dts:ci` — CI validation without `--local` (strict mode, used in GitHub Actions). Fails if API reports are stale once enabled.

## The interface/impl pattern

The primary mechanism preventing leaks is architectural: public types are **interfaces**, internal types are **classes**.

```typescript
// Public — exported from index.ts
export interface SearchInterface extends Supports<Facades['search']> {}

// Internal — NOT exported from index.ts
export class SearchInterfaceImpl extends BaseInterface<'search'> implements SearchInterface { ... }
```

Since only the interface is exported, its `.d.ts` declaration contains only `InterfaceHandle` members (`disposed`, `dispose()`) and the phantom brand (`[SupportsBrand]`). The class constructor (which references `FullEngine`, `FacadeResolverFactory`) never appears in the public surface.

The `implements` keyword creates a compile-time contract: if the class drifts from the public interface, TypeScript produces an error.

## API Report (snapshot) — not yet enabled

Api-extractor can generate an "API Report" file — a human-readable snapshot of the entire public API surface. This file is committed to the repo. On every build, api-extractor compares the current surface against the committed snapshot. Any difference (new export, changed signature, removed type) fails the build until the report is explicitly updated.

### Why it's disabled

The package is in active development. The API changes frequently and the report would need updating on nearly every PR, adding friction without much value yet.

### When to enable it

Enable `apiReport` once the package reaches a stable public API (likely before the first non-prerelease version). At that point:

1. Set `"apiReport": { "enabled": true, "reportFolder": "./api-report/" }` in `api-extractor.json`
2. Run `pnpm run test:dts` to generate the initial report
3. Commit the report file
4. From that point, any public API change requires an explicit report update + review

This provides a reviewable diff for every public API change — catching accidental breaking changes before they ship.

## Adding a new interface type — checklist

1. Add an entry to `InterfaceRegistry` in `src/internal/utils/interface-types.ts` (type + facades)
2. Create the public interface (`extends Supports<Facades['myType']>`) in `src/public/interfaces/`
3. Create the internal class (`extends BaseInterface<'myType'> implements MyInterface`) in the same file
4. Export the interface (not the class) from `src/index.ts`
5. Run `pnpm run test:dts` to verify nothing leaks
6. Run `pnpm run test` to verify type tests still pass
