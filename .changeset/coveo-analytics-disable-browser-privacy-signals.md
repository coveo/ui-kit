---
"coveo.analytics": minor
---

Add the `disableBrowserPrivacySignals` client option. When set to `true`, the analytics clients (search page, insight, case assist) and the underlying analytics client stop honoring browser privacy signals (Do Not Track and Global Privacy Control), so analytics is sent regardless of those signals. It defaults to `false` (signals are honored) and does not override an explicit `enableAnalytics: false`. The integrator that enables it is responsible for complying with the applicable privacy obligations.
