---
'@coveo/headless': minor
---

On the experimental SSR sub-packages, the client ID now decides whether a visitor is tracked: when the navigator context has an empty client ID, or `capture` set to `false`, the engine built for the request sends no analytics, on the server and in the browser after hydration. Pass a client ID only for visitors who agreed to analytics where the law requires it. `CLIENT_ID_COOKIE_NAME` names the cookie in which to persist the client ID so the browser and the next requests report the same visitor.
