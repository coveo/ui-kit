---
'@coveo/headless-react': minor
---

In the experimental SSR sub-packages, `buildProviderWithDefinition()` takes any engine definition that has a `StateProvider`, so the same builder serves search and commerce, and the `StateProvider` of a definition is typed with the controllers of its page, the baked-in ones included. The new `HydratableDefinition` and `StateProviderProps` types describe what a provider needs from a definition.
