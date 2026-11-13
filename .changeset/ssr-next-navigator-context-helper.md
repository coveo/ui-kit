---
'@coveo/headless': minor
---

The experimental SSR sub-packages export `buildNavigatorContext()`, which builds the navigator context of a server-side request from its headers (a `Headers` instance or a plain object), the page URL and the visitor's client ID, generating a client ID for the request when none, or an invalid one, is provided. `CLIENT_ID_COOKIE_NAME` names the cookie in which to persist the client ID so the browser and the next requests report the same visitor.
