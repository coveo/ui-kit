---
'@coveo/atomic': patch
---

The `language` property of `atomic-commerce-interface` and `atomic-commerce-recommendation-interface` now logs its deprecation warning once per engine instead of on every change, and the warning names the replacement: set the initial language in the `context` of the engine configuration, then call `updateLocale({language})` to change it. Version 4 removes the property and its attribute.
