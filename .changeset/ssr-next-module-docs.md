---
'@coveo/headless': patch
---

Correct the module documentation of the experimental SSR sub-packages: the examples now import from their own entry points, pass the `navigatorContext` to `fetchStaticState()`, and hydrate with real controllers. The duplicated `ListingBuildConfig` and `StandaloneBuildConfig` declarations are removed.
