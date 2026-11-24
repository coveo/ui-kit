---
'@coveo/thermidor': minor
---

`session.isConcurrent({surfaceId, name})` tells whether a dispatch of an action from a surface would now be sent at once, beside any request in flight: the producer announces it as concurrent on that surface, and the session has its token. A search box can read it to send each `fetchSuggestions` at once instead of waiting for the session to be free.
