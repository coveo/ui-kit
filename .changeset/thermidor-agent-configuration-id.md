---
'@coveo/thermidor': minor
---

Name the configured agent that answers the session.

- `SessionConfig` takes `agentConfigurationId`, sent with every request, next to `trackingId`. Both are required, and `createSession` throws when either is missing or blank.
- The locale comes from the configured agent: `SessionConfig` no longer takes `language`, `country` or `currency`, and requests no longer send them.

**Breaking:** `agentConfigurationId` and `trackingId` are now required in `SessionConfig`, and `language`, `country` and `currency` are removed from it.
