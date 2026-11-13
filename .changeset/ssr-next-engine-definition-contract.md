---
'@coveo/headless': minor
'@coveo/headless-react': patch
---

In the experimental SSR sub-packages, every engine definition fulfils one plain contract, the new `EngineDefinition<TStaticState, THydratedState, TFetchOptions>` type: `fetchStaticState()` returns the static state and `hydrateStaticState()` takes it as is. Use it to type code that works with any definition, with two plain type parameters that are inferred from the definition passed in. In the React wrapper, `buildProviderWithDefinition()` takes any engine definition that has a `StateProvider`. See the upgrade guide, "Engine definition types".
