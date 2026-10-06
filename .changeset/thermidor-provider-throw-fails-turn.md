---
'@coveo/thermidor': patch
---

A context provider that throws while a request is built now fails the turn instead of leaving the session stuck on a `streaming` turn that ignores every later prompt and action.
