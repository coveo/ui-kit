---
'@coveo/headless': minor
'@coveo/headless-react': patch
---

In the experimental commerce SSR sub-package, the static and hydrated states are named after what you wrote: `CommerceStaticState` and `CommerceHydratedState` take the controllers of the definition and its solution type, and their `controllers` member spells out the controllers of the page by name, the baked-in ones included, so editor tooltips and compiler errors list them. `InferStaticState<typeof definition>` and `InferHydratedState<typeof definition>` show under these names. The `HydratedState`, `FetchStaticState`, `HydrateStaticState`, `HydrateStaticStateOptions` and `CommerceEngineDefinitionBuildResult` types are removed. In the React wrapper, the `StateProvider` of a definition is typed with the controllers of its page.
