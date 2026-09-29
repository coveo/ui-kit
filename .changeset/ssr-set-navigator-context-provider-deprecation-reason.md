---
"@coveo/headless": patch
---

Clarify in the `setNavigatorContextProvider` deprecation notice that it mutates the shared engine definition and is therefore unsafe under server concurrency, and point to passing `navigatorContext` per request when fetching the static state.
