---
'@coveo/headless': minor
---

The experimental SSR sub-packages export `buildNavigatorContext()`, which builds the navigator context of a server-side request from its headers (a `Headers` instance or a plain object), the page URL and the visitor's client ID. When no valid client ID is provided, the client ID is left empty and the requests are sent without analytics capture.
