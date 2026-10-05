---
'@coveo/thermidor': minor
---

Add a framework-agnostic optimistic dispatch core so a consumer can reflect a user's intention on screen before the producer answers. New public exports: a dispatch coordinator that sees every dispatch and publishes a single in-flight fact, a dispatch tracker that counts outstanding dispatches per region, an optimistic-value controller that holds a gesture's intended value until its producer catches up, and a per-region stale-scope. The session now exposes an `actions` surface for issuing these dispatches.
