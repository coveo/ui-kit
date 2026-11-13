---
'@coveo/headless': minor
---

In the experimental search SSR sub-package, the static and hydrated states are named after what you wrote: `SearchStaticState` and `SearchHydratedState` take the controllers of the definition, and their `controllers` member spells out the controllers of the page by name, so editor tooltips and compiler errors list them. The `HydratedState`, `FetchStaticState` and `HydrateStaticState` types are removed and `SearchEngineDefinition` takes only the controllers. In both experimental SSR sub-packages, `EngineStaticState` takes only the controller states. See the upgrade guide's removals.
