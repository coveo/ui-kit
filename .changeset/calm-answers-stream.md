---
'@coveo/headless': patch
---

Preserve synchronous Redux thunk execution during access token checks to prevent buffered generated answer chunks from overwriting one another.
