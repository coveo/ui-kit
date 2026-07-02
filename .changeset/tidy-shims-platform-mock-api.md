---
'@coveo/atomic': patch
---

Remove the `storybook-utils/api` re-export shims and import `@coveo/platform-mock-api` directly in Storybook stories and utilities. This drops an unnecessary indirection layer introduced when the mock API was extracted into its own package.
