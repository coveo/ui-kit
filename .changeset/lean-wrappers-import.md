---
"@coveo/atomic-react": patch
---

Import each Atomic element from its own `@coveo/atomic/components/<tag-name>` entry point instead of the `@coveo/atomic/components` barrel, so bundles only include the components you use regardless of the bundler. With esbuild, a page using 14 components now registers 32 elements instead of 107.
