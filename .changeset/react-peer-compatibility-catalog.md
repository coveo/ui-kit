---
'@coveo/atomic-react': patch
'@coveo/headless-react': patch
---

Route React peer dependencies through the shared `peer-compatibility` catalog. The published ranges are now `^18 || ^19` for both packages, and `@types/react(-dom)` are declared as optional peers on `atomic-react`.
