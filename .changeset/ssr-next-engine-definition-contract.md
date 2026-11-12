---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, the new `EngineDefinition<TStaticState, THydratedState, TFetchOptions>` type is the contract every engine definition fulfils: `fetchStaticState()` returns the static state, and `hydrateStaticState()` takes it as is. Use it to type code that works with any definition, such as a provider or a framework integration, with two plain type parameters. Both are inferred from the definition passed in, so the controllers stay typed. See the upgrade guide, "Engine definition types".
