---
'@coveo/headless': minor
'@coveo/headless-react': patch
---

In the experimental SSR sub-packages, the static and hydrated states of an engine definition are named after what you wrote: `CommerceStaticState` and `CommerceHydratedState` take the controllers of the definition and its solution type, and `SearchStaticState` and `SearchHydratedState` take the controllers. Their `controllers` member spells out the controllers of the page by name, so editor tooltips and compiler errors list them, and `fetchStaticState()` and `hydrateStaticState()` show their parameter and their result. The `HydratedState`, `FetchStaticState`, `HydrateStaticState`, `HydrateStaticStateOptions` and `CommerceEngineDefinitionBuildResult` types are removed, and `SearchEngineDefinition` and `EngineStaticState` each lose a type parameter: use `InferStaticState<typeof definition>` and `InferHydratedState<typeof definition>` to name the states of a definition.
