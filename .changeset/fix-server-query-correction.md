---
'@coveo/headless': patch
---

Acknowledge server-side query correction when `automaticallyCorrectQuery` is disabled.

When a search pipeline overrides `automaticallyCorrect` to `whenNoResults` but the client sets `automaticallyCorrectQuery: false`, headless now correctly updates `state.query.q` to the corrected query returned by the server. This ensures subsequent requests (e.g., facet "Show More") use the corrected query instead of the original uncorrected one, which previously caused facet values to disappear.
