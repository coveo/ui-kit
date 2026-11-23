---
'@coveo/headless-react': minor
---

The experimental SSR sub-packages of `@coveo/headless-react` gain `useHydration()`, which tells a component whether the page renders the static state (`static`), the hydrated engine (`hydrated`) or a failed hydration (`error`). The provider built by `buildProviderWithDefinition()` takes an `onHydrationError` prop: a failed hydration then keeps the static page rendered and calls it once, instead of reaching the nearest error boundary. `Hydration`, `HydrationStatus` and `ProviderProps` are exported.
