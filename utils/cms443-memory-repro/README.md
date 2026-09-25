# CMS-443 — SSR commerce memory repro / validator

Reproduces and validates the three server-side memory findings from CMS-443 against a
**locally built** `@coveo/headless`, with a before/after comparison across the fix.

> **Status:** the fix is **released** — `@coveo/headless` **3.57.0** (F3 on `ssr-commerce`,
> `ssr-commerce-next` setter removal, `ssr-next` search) and `@coveo/headless-react` **2.10.0**
> (React provider). F1 and F2 shipped earlier in 3.56.0. The per-finding fix branches were
> deleted after merge, so the before/after now compares two commit SHAs on `main` (see
> `compare.sh`) rather than branch tips. `repro.mjs` still runs against any built `dist/esm` as a
> standalone regression probe.

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
   split across the SSR trees:
   - **F3a — `ssr-commerce-next`** (`#8481`, merged): per-request `accessToken` on the ssr-next
     commerce path, proven via the pure `augmentCommerceEngineOptions` function. This tree is kept
     but is **not** the client's package.
   - **F3b — `ssr-commerce`** (supported, the client's package; PRs `#8494` token + `#8495`
     navigator context): per-request `accessToken` **and** `navigatorContext` on
     `build()`/`fetchStaticState()`, applied on a per-request options copy with the shared
     definition no longer mutated. Causal proof via two concurrent `build()` calls with distinct
     tokens, asserting isolation + the shared definition token stays untouched + a per-request
     token stays authoritative even after a later shared `setAccessToken()`.
   - **F3c — `ssr-next` search** (`#8505`, released in 3.57.0): per-request `accessToken` on the
     search `BuildConfig`, proven via the pure `augmentSearchEngineOptions` function (mirror of
     F3a). #8505 also removed the shared `setAccessToken()`/access-token manager from the search
     engine definition — the class of bug where two overlapping requests could cross tokens.

### Not covered by this harness

- **#8506 — React provider** (`@coveo/headless-react/ssr-commerce`, released in 2.10.0): the
  `accessToken` prop wiring is a React-provider concern that needs a DOM/render harness to
  exercise; it is out of scope for this network-free Node probe. It is covered by the package's
  own unit tests. Treated as a **known limitation**, not a gap in the fix.
- **#8504 — setter removal** on `ssr-commerce-next` is a source-level deletion (no runtime
  behavior to probe beyond what F3a/F3c already assert about not mutating the shared definition).

## Usage

```sh
# One ref, against an already-built headless dist/esm (standalone regression probe):
node --expose-gc utils/cms443-memory-repro/repro.mjs \
  packages/headless/dist/esm

# Full before/after across the two comparison SHAs (checks out, builds, runs, tabulates):
utils/cms443-memory-repro/compare.sh
```

`compare.sh` creates isolated git worktrees under the session scratch dir (`TMPDIR`), builds
`@coveo/headless` in each, runs `repro.mjs`, and prints a before/after table. The two refs are
bare commit SHAs on `main`:

- **`before-f3`** = `3d05459` — `main` just before #8494 merged (already contains the F1/F2 fixes
  from 3.56.0, but not F3).
- **`after-f3`** = `4f82bb4` — the last stack merge (#8506); equivalent to the
  `@coveo/headless@3.57.0` release.

Raw per-ref JSON is left under `<scratch>/cms443-compare/results/`.

## Expected before/after

| Finding                                                                                 | before-f3                         | after-f3                                                                      |
| --------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| F1 `fetchStaticState` retained KB/call                                                  | ~4 KB (already fixed in 3.56.0)   | ~4 KB                                                                         |
| F1 `build()` engines still alive (/500)                                                 | ~1 (already fixed)                | ~1                                                                            |
| F1 `hydrateStaticState` live engine gets rotated token                                  | `true`                            | `true` (no regression)                                                        |
| F2 oldest token still cached after flood                                                | `false` (already fixed in 3.56.0) | `false`                                                                       |
| F3a `ssr-next` commerce per-request token applied                                       | `true` (already in #8481)         | `true`                                                                        |
| F3b `ssr-commerce` per-request token isolated                                           | `false`                           | `true` (#8494)                                                                |
| F3b `ssr-commerce` per-request navigator context                                        | `false`                           | `true` (#8495)                                                                |
| F3b `ssr-commerce` per-request token stays authoritative after a later `setAccessToken` | `false`                           | `true` (per-request engine not subscribed to the shared token manager, #8494) |
| F3b `ssr-commerce` shared definition mutated                                            | `true`                            | `false` (per-request options copy)                                            |
| F3c `ssr-next` search per-request token applied                                         | `false`                           | `true` (#8505)                                                                |
| F3c `ssr-next` search shared definition not mutated                                     | n/a                               | `true` (per-request options copy, #8505)                                      |

> **Note:** because `before-f3` already contains F1/F2 (shipped in 3.56.0 before the F3 stack),
> only the F3 rows flip between the two columns. F1/F2 are green in both — the harness proved them
> against 3.56.0 during that release; kept here for completeness.

> **Note on requirements:** run Node with `--expose-gc`. The measurement performs **no network
> I/O** — `fetchStaticState`'s network call is expected to reject and is swallowed; retention
> happens at engine construction / registration regardless.
