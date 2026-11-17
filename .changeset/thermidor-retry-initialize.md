---
'@coveo/thermidor': minor
---

The session now retries its automatic `initialize`, up to 3 attempts within 5 seconds, when the endpoint rejects it with a network error, a `429` (honouring `Retry-After`), `502`, `503` or `504`. A prompt or action dispatched meanwhile stops the retries. The new `session.retryInitialization()` re-sends a failed `initialize`.
