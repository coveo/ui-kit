---
'@coveo/headless': minor
---

In the experimental commerce SSR sub-package, `context.view.url` is optional in `fetchStaticState()`: it defaults to `navigatorContext.location`, so the Commerce API and the analytics report the same page without repeating the URL. When neither is set, the error says so.
