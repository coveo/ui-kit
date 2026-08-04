---
'@coveo/headless': minor
---

Added `numberOfSuggestions` option to the Commerce SearchBox and StandaloneSearchBox controllers, allowing configuration of how many query suggestions are requested from the API.

Additionally, the `count` property passed to `registerQuerySuggest` is now sent in the commerce query-suggest API request. Previously it was stored in state but ignored when building the request.
