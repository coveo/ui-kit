---
"@coveo/headless": minor
---

Add `analytics.disableBrowserPrivacySignals` engine configuration option. For legacy analytics (`analyticsMode: 'legacy'`), setting it to `true` stops honoring browser privacy signals (Do Not Track and Global Privacy Control) so analytics events are sent even when those signals are present. It defaults to `false` (privacy-friendly), has no effect with `analyticsMode: 'next'`, and does not override an explicit `enabled: false`. Enabling it means your integration takes ownership of privacy compliance.
