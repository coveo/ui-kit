---
'@coveo/thermidor': minor
---

A session now opens itself with the action its contracts mark as session-opening (`opensSession: true` on the action's envelope schema), instead of an action hard-coded as `initialize`. Sessions whose contracts mark no action no longer send `initialize`: the first prompt opens them. `createSession` throws when the contracts mark more than one action.
