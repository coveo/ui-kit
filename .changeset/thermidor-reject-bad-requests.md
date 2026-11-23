---
'@coveo/thermidor': minor
---

A session now rejects, before sending, the requests the endpoint would refuse. A request fails with its own message when the navigator context has a `null` or blank `location`, or a blank `clientId`. `createSession` throws when `agentConfigurationId` is not a UUID. `createPrivateSession` throws when `trackingId` is blank, and `PrivateSessionConfig.trackingId` is now required. A `submitPrompt` with a blank prompt, or one over 20000 characters, is withheld before a turn opens, so `retry` cannot repeat it.
