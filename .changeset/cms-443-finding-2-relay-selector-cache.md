---
'@coveo/headless': patch
---

fix(headless): bound the memoized relay-instance selector to prevent unbounded growth

`getRelayInstanceFromState` used reselect's default `weakMapMemoize`, which never evicts
primitive cache keys. Because the selector is keyed by `accessToken` (a string), servers using
per-user search tokens accumulated one cache entry per distinct token for the lifetime of the
process. The selector now uses a bounded `lruMemoize` cache, keeping the memoization benefit while
capping retention. The change is internal — no public API changes.
