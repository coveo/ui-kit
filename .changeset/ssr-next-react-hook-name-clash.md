---
'@coveo/headless-react': patch
---

In the experimental SSR sub-packages of `@coveo/headless-react`, `defineCommerceEngine()` and `defineSearchEngine()` throw when two controllers would get the same hook, such as a `commerceContext` controller next to the built-in `context` one (`useCommerceContext`), instead of keeping only one of the two hooks.
