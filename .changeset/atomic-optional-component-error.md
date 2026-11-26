---
'@coveo/atomic': major
---

The `error` property of every Atomic component is now typed `Error | undefined`, and a change to it re-renders the component. A component without an error holds `undefined`, never `null`. Check that `error` is defined before you read it.

See the upgrade guide, "`error` on Atomic components".
