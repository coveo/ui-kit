---
'@coveo/headless': patch
---

In the experimental commerce SSR sub-package, `ControllerDefinition` keeps the `search`, `listing` and `standalone` flags that tell the engine definitions which kinds of page build a hand-written controller definition: check the definition with `satisfies ControllerDefinition<YourController>` and set the flag of each kind of page it serves, such as `listing: true`.
