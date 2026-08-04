---
'@coveo/headless': patch
---

Import the `cookie`, `detector`, `storage` and `history-store` modules from `coveo.analytics` instead of keeping vendored copies of them, removing a source of drift between the two packages. No public API change.
