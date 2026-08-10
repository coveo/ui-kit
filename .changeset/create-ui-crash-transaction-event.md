---
"@coveo/create-ui": patch
---

Build the crash-report performance transaction from the stored phase spans as a Sentry transaction event that shares the crash event's trace, instead of replaying the tracing API at submit time. The submitted data is unchanged; trace-to-issue linkage is now deterministic and no longer depends on live tracing internals.
