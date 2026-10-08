---
'@coveo/thermidor': minor
---

Add `SessionConfig.surfaceScope`. With `'session'`, `dispatchAction` resolves a surface from the turn that created it until a later `deleteSurface` removes it, so one session can host long-lived surfaces such as a header that stays while the page below it changes. The default, `'turn'`, keeps the current behavior.
