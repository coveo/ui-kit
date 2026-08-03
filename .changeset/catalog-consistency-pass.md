---
'@coveo/atomic': patch
'@coveo/atomic-legacy': patch
'@coveo/create-atomic': patch
'@coveo/headless': patch
'@coveo/headless-react': patch
'@coveo/quantic': patch
---

Adopt the pnpm catalog: protocol for dependencies shared by more than one workspace package. Dependency version specifiers now resolve through the shared catalog instead of being pinned individually; the resolved versions are unchanged, so there is no change to the published output.
