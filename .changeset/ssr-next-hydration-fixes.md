---
'@coveo/headless': patch
---

Fix several defects in the experimental SSR sub-packages: seeded recommendations now receive the `productId` passed to `fetchStaticState()`, search hydration no longer replays the search actions twice, commerce hydration waits for the replayed requests to complete, and a missing navigator context no longer makes the platform client skip the configured `preprocessRequest`. The `cart` of the engine configuration is kept when `fetchStaticState()` receives none, and the static state passed to `hydrateStaticState()` is no longer mutated.
