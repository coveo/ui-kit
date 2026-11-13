---
'@coveo/headless': minor
---

In the experimental SSR sub-packages, the inference helper types that only the React wrappers used are removed: `InferControllersMapFromDefinition`, `InferControllerStaticStateMapFromDefinitions`, `InferControllerStaticStateMapFromDefinitionsWithSolutionType`, `InferControllerStaticStateFromController` and `InferControllerStaticStateMapFromControllers`. Read the controllers of a page from `InferStaticState<typeof definition>['controllers']` and `InferHydratedState<typeof definition>['controllers']`.
