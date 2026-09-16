# CMS-443 — SSR commerce memory repro / validator

Reproduces and validates the three server-side memory findings from CMS-443 against a
**locally built** `@coveo/headless`, with a before/after comparison across the fix branches.

This is a **throwaway validation harness**, deliberately kept out of `packages/*` and
`samples/*`: it is not a pnpm workspace, is never published, and is not wired into CI. It exists
so the fixes can be proven with numbers, and so a colleague can replay the before/after.

## Findings

1. **Engine retention** — every engine built from a commerce engine definition was retained for
   the process lifetime via the access-token registry. Measured on the real `fetchStaticState`
   server path (retained heap per call after a forced GC).
2. **Unbounded relay-selector cache** — `getRelayInstanceFromState` memoized one relay instance
   per distinct access token with no eviction. Measured **directly**: flood the selector with N
   distinct tokens, then re-probe the oldest — a cache hit proves it was never evicted.
3. **No per-request token / navigator context** — a per-user token (and navigator context)
   required mutating the shared, process-scoped definition (racy). Behavioral / causal probe,
   split across the two SSR trees:
   - **F3a — `ssr-commerce-next`** (`#8481`, merged): per-request `accessToken` on the ssr-next
     path, proven via the pure `augmentCommerceEngineOptions` function. This tree is kept but is
     **not** the client's package.
   - **F3b — `ssr-commerce`** (supported, the client's package; PRs `#8494` token + `#8495`
     navigator context, stacked): per-request `accessToken` **and** `navigatorContext` on
     `build()`/`fetchStaticState()`, applied on a per-request options copy with the shared
     definition no longer mutated. Causal proof via two concurrent `build()` calls with distinct
     tokens, asserting isolation + the shared definition token stays untouched.

## Usage

```sh
# One ref, against an already-built headless dist/esm:
node --expose-gc utils/cms443-memory-repro/repro.mjs \
  packages/headless/dist/esm

# Full before/after across main + the three fix branches (checks out, builds, runs, tabulates):
utils/cms443-memory-repro/compare.sh
```

`compare.sh` creates isolated git worktrees under the session scratch dir (`TMPDIR`), builds
`@coveo/headless` in each, runs `repro.mjs`, and prints a before/after table. Raw per-ref JSON is
left under `<scratch>/cms443-compare/results/`.

## Expected before/after

| Finding | before (main) | after fix |
|---|---|---|
| F1 `fetchStaticState` retained KB/call | ~37 KB | ~4 KB (static state only) |
| F1 `build()` engines still alive (/500) | 500 | ~1 (released) |
| F1 `hydrateStaticState` live engine gets rotated token | `true` | `true` (no regression) |
| F2 oldest token still cached after flood | `true` | `false` (evicted) |
| F3a `ssr-next` per-request token applied | `false` | `true` (added in ssr-commerce-next, #8481) |
| F3b `ssr-commerce` per-request token isolated | `false` | `true` (added on supported tree, #8494) |
| F3b `ssr-commerce` per-request navigator context | `false` | `true` (added on supported tree, #8495) |
| F3b `ssr-commerce` shared definition mutated | `true` | `false` (per-request options copy) |

> **Note on requirements:** run Node with `--expose-gc`. The measurement performs **no network
> I/O** — `fetchStaticState`'s network call is expected to reject and is swallowed; retention
> happens at engine construction / registration regardless.
