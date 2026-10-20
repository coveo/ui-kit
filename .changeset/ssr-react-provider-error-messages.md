---
'@coveo/headless-react': patch
---

The SSR hook errors no longer name providers that only exist in the samples: a hook used outside its provider, or a controller that the current engine definition does not include, now explain which provider or engine definition to use. In the experimental commerce SSR sub-package, passing a static state to the provider of another engine definition is a compile-time error, now that the static state carries its solution type.
