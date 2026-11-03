---
'@coveo/thermidor': minor
---

Add `@coveo/thermidor/private`, an entry point **for internal Coveo use only**. It is not supported for customers and may change without notice. Its `createPrivateSession` takes the `createSession` configuration with `agentConfigurationId` and `trackingId` optional, plus optional `language`, `country` and `currency`, and sends each one that is set with every request. The public `createSession` and `SessionConfig` are unchanged.
