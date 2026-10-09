---
"@coveo/atomic-angular": major
---

`@coveo/atomic-angular` no longer re-exports the `@coveo/headless` API. Its public surface is now limited to what the wrapper provides: the Angular components, `AtomicAngularModule`, `Bindings` and `i18n`. This matches `@coveo/atomic-react`.

To migrate, import Headless symbols from `@coveo/headless`, which is already a peer dependency, instead of from `@coveo/atomic-angular`:

```diff
- import {buildSearchEngine, type Result} from '@coveo/atomic-angular';
+ import {buildSearchEngine, type Result} from '@coveo/headless';
```
