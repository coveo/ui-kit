---
'@coveo/thermidor': minor
---

Name the configured agent that answers the session.

- `SessionConfig` takes `agentConfigurationId`, sent with every request, next to `trackingId`. Both are required, and `createSession` throws when either is missing or blank.
- `language`, `country` and `currency` stay optional. They are used only when the configured agent has no locale, and a request leaves out the ones the session was not given instead of sending them empty.

**Breaking:** `agentConfigurationId` and `trackingId` are now required in `SessionConfig`.
