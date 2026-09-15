---
'@coveo/headless': patch
---

Fix a memory leak in the SSR access-token manager. The manager held token-update callbacks in a
plain `Set`, and because the manager lives at module scope for the whole process, every engine
built through `buildFactory` (`fetchStaticState`, `hydrateStaticState`, and `build()`) was retained
for the process lifetime — an unbounded, per-request leak of the Redux store, logger, relay
instance, and API client.

The registry is now weak: callbacks are held through `WeakRef` and anchored to their owner engine
via a `WeakMap`, and a `FinalizationRegistry` prunes dead entries. The garbage collector now
releases a subscription once its engine is unreachable, which fixes every path in both the commerce
and search trees, with no behavior change for engines that are still alive (a hydrated browser
engine keeps receiving token updates).
