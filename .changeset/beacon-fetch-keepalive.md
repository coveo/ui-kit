---
'coveo.analytics': minor
'@coveo/headless': patch
---

Click events, and the events replayed when a page unloads, are now sent with `fetch` and `keepalive: true` instead of `navigator.sendBeacon`. The Beacon API accepts no headers, so a `preprocessRequest` hook could not add any to click events; hooks now receive the same mutable request options as for every other analytics event, and header mutations are applied to the outgoing request.

The `analyticsBeacon` value of `preprocessRequest`'s `clientOrigin` parameter still identifies those events, and the request URL and body format are unchanged. The value is deprecated and will be merged into `analyticsFetch` in a future major version.
