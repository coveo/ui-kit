---
'@coveo/thermidor': minor
---

List a loading placeholder in `response.surfaces` only while the run that created it streams: while its turn streams, or while the request in flight streams into it, unless the turn had already left it behind when that request started. A placeholder the agent left behind once its run ended, after a cancelled run, an error or a restore, leaves the list, so a consumer draws a skeleton for every surface whose `isLoading` holds, with no rule of its own.
