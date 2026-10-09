---
"@coveo/atomic": minor
---

Add per-component entry points: `@coveo/atomic/components/<tag-name>` (e.g., `@coveo/atomic/components/atomic-facet`) exports a single component class, so bundlers only include the components you use. Import the class and use it: these entry points are pure re-exports, so a bare `import '@coveo/atomic/components/atomic-facet'` registers nothing once bundled. The existing `@coveo/atomic/components` entry point is unchanged.
