---
'@coveo/headless-react': minor
---

In the experimental SSR sub-packages, the hook of the built-in `context` controller is `useCommerceContext()` on the commerce definitions and `useSearchContext()` on the search definitions, instead of a `useContext()` that shadowed React's own hook. See the upgrade guide, "Context hooks".
