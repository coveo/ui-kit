---
'@coveo/thermidor': minor
---

Add `@coveo/thermidor/private`, an entry point **for internal Coveo use only**. It is not supported for customers and may change without notice. Its `createPrivateSession` opens a session whose request fields and their schema the caller injects, instead of `agentConfigurationId` and `trackingId`. The public `createSession` and `SessionConfig` are unchanged.
