---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, mistakes now fail with a named error instead of unexpected behavior: hydrating a static state with another engine definition than the one that fetched it throws a `SolutionTypeMismatchError` (the static state carries its `solutionType`), two recommendation controllers targeting the same slot throw at definition time, a search controller named `parameterManager` throws at definition time like the reserved commerce names, and invalid `fetchStaticState()` options name the engine definition. `MissingControllerProps`, `MultipleRecommendationError` and `SolutionTypeMismatchError` are exported, together with the `BuildConfig`, `EngineStaticState`, `AugmentedControllerDefinition`, `SearchStaticState`, `CommerceStaticState`, `ControllerStaticState`, `TabManagerDefinition` and `ProductListOptions` types. The visitor's IP address (`forwardedFor`) is no longer serialized into the static state sent to the browser.
