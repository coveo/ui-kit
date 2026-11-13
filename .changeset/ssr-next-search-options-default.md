---
'@coveo/headless': patch
---

In the experimental search SSR sub-package, `SearchEngineDefinitionOptions` checks the controllers of a configuration without a type argument, so `satisfies SearchEngineDefinitionOptions` is enough for a configuration kept in its own file.
