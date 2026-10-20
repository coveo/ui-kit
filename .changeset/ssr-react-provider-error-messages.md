---
'@coveo/headless-react': patch
---

The SSR hook errors no longer name providers that only exist in the samples: a hook used outside its provider, or a controller that the current engine definition does not include, now explain which provider or engine definition to use.
