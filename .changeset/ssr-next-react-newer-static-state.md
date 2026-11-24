---
'@coveo/headless-react': patch
---

In the experimental SSR sub-packages of `@coveo/headless-react`, a provider that receives a newer static state renders it as static until it hydrates, and `useHydration()` reports `static` meanwhile, instead of keeping the previous page's live engine and controllers.
