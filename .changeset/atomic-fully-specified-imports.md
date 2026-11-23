---
'@coveo/atomic': patch
---

Apps that bundle Atomic with webpack 5, Rspack or Nx's Angular Rspack builder no longer fail to resolve its imports on their default settings, so they no longer need `resolve.fullySpecified: false`. Every import in the npm build of Atomic now names its file, extension included.
