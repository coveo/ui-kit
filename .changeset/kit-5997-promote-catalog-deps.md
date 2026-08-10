---
'@coveo/atomic': patch
'@coveo/headless': patch
'coveo.analytics': patch
---

Promote shared dev dependencies to the pnpm catalog. The `node-fetch` (`@coveo/headless`, `coveo.analytics`) and `ts-dedent` (`@coveo/atomic`) specifiers now resolve through the workspace catalog instead of being pinned individually. The resolved versions are unchanged, so there is no change to the published output.
