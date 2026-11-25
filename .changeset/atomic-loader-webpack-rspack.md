---
'@coveo/atomic': patch
---

Apps that bundle Atomic with webpack 5 or Rspack no longer fail with "Can't import the named export 'version' (reexported as 'headlessVersion') from default-exporting module" when they import `@coveo/atomic/loader`. Atomic now sets `headlessVersion` when it is built, instead of importing it from the `package.json` file of `@coveo/headless`. Its value doesn't change.
