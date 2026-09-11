---
"@coveo/headless": patch
---

Fixed an issue in the insight panel where calling `fetchMoreResults` more than once re-fetched the same batch of results instead of fetching the next one.

Fixed the insight panel's fetchMoreResults analytics logging, which was silently dropped because an action factory was passed instead of a dispatchable analytics action.