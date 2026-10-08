---
'@coveo/thermidor': minor
---

**Breaking:** `Session.submit({prompt})` is removed. Use `session.dispatchAction({name: 'submitPrompt', payload: {prompt}})` instead.
