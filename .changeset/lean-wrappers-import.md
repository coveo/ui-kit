---
"@coveo/atomic-react": patch
---

Import each Atomic element from its own `@coveo/atomic/components/<tag-name>` entry point instead of the `@coveo/atomic/components` barrel, so bundles only include the components you use regardless of the bundler. With esbuild, a page using 14 components now registers 32 elements instead of 107.

**Warning:** With bundlers that previously evaluated the whole barrel (such as esbuild), Atomic elements you do not render through an `@coveo/atomic-react` component are no longer registered. This affects, for example, tags written in raw HTML, `innerHTML` or `document.createElement`. Those tags now stay inert and no error is shown. To keep them working, import their class and register it yourself:

```ts
import {AtomicResultBadge} from '@coveo/atomic/components/atomic-result-badge';

customElements.get('atomic-result-badge') ?? customElements.define('atomic-result-badge', AtomicResultBadge);
```
