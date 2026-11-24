---
'@coveo/headless': patch
---

`@coveo/headless` no longer depends on `@ag-ui/client`: generated answers and follow-up answers stream through a small built-in AG-UI agent that uses the protocol types of `@ag-ui/core`. Generated answers behave the same, and the bundles stay as small as before instead of growing with the `zod` validation that `@ag-ui/client` 1.x brings in.
