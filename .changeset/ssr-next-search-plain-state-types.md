---
'@coveo/headless': minor
---

In the experimental search SSR sub-package, the new `SearchStaticState<typeof controllers>` and `SearchHydratedState<typeof controllers>` types name the states after the controllers of the definition, so editor tooltips and compiler errors list them. The `HydratedState`, `FetchStaticState` and `HydrateStaticState` types are removed: use `InferStaticState<typeof definition>` and `InferHydratedState<typeof definition>`, and `typeof definition.fetchStaticState` or `typeof definition.hydrateStaticState` for the functions. Write `SearchEngineDefinition<typeof controllers>`, without the engine type argument. In the experimental commerce SSR sub-package, `EngineStaticState<UnknownAction, TStates>` becomes `EngineStaticState<TStates>`.
