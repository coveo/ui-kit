---
'@coveo/headless-react': minor
---

`@coveo/headless-react/ssr-next` is now a React wrapper over the experimental search SSR API of `@coveo/headless/ssr-next`; it used to re-export the legacy `/ssr` API. `defineSearchEngine()` returns the search and standalone engine definitions, each with a `StateProvider`, together with `useEngine`, `useHydration` and one hook per controller (including `useParameterManager`); `buildProviderWithDefinition()` builds the provider that renders a static state and hydrates it. Both experimental sub-packages gain `useHydration()`, which reports `static`, `hydrated` or `error`, and an `onHydrationError` provider prop to handle a failed hydration instead of letting it reach an error boundary. `ControllerHook`, `InferControllerHooksMapFromDefinition`, `ProviderProps` and `UndefinedControllerError` are exported.
