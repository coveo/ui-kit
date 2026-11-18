---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, every engine definition fulfils one plain contract, the new `EngineDefinition<TStaticState, THydratedState, TFetchOptions>` type: `fetchStaticState()` returns the static state and `hydrateStaticState()` takes it as is. Use it to type code that works with any definition, such as a provider: constrain `TStaticState` to `{controllers: object}` and `THydratedState` to `{engine: unknown; controllers: object}` when the code reads them, and add `TFetchOptions` when it fetches. The type parameters are inferred from the definition passed in, so the controllers stay typed. See the upgrade guide, "Engine definition types".
