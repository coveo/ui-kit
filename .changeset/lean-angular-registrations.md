---
"@coveo/atomic-angular": major
---

Import each Atomic component from its own `@coveo/atomic/components/<tag-name>` entry point, so an Angular app only bundles and registers the Atomic elements its templates use. On a single search page, this lowers the initial bundle from 1.96 MB to 1.30 MB and the registered elements from 107 to 32.

**Breaking change:** importing `@coveo/atomic-angular` no longer registers every Atomic element. An Atomic tag that does not appear in an Angular template, such as one inserted through `innerHTML`, `document.createElement` or a third-party library, is no longer upgraded and stays inert, without any error.

To migrate, register each such element yourself before you insert it: import its class from `@coveo/atomic/components/<tag-name>` and pass it to `customElements.define`.

```ts
import {AtomicResultBadge} from '@coveo/atomic/components/atomic-result-badge';

customElements.get('atomic-result-badge') ??
  customElements.define('atomic-result-badge', AtomicResultBadge);
```

Passing the class to `customElements.define` is what keeps it in your bundle. A bare import, or only exporting the class from one of your modules, is removed by tree shaking and registers nothing.
