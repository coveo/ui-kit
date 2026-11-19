---
'@coveo/thermidor': minor
---

The session now retries its automatic `initialize`, up to 3 attempts within 5 seconds, when the endpoint quickly rejects it with a network error, a `429`, `502`, `503` or `504`. A dispatch made during the retries is withheld, as during any request. The new `session.retryInitialization()` re-sends a failed `initialize`, a restored session's included.
