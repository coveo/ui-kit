---
'@coveo/atomic': minor
---

Atomic now logs a warning through the engine logger, once per engine, when a page sets `reflect-state-in-url`, `enable-relevance-inspector`, `enable-cancel-last-action` or `should-highlight`, or calls `closeRelevanceInspector()`. Version 4 removes these members. Use `disable-state-reflection-in-url`, `disable-relevance-inspector`, `hide-cancel-last-action` and `no-highlight` instead, and set the `open` property of the relevance inspector rather than calling `closeRelevanceInspector()`. The warning for a comma-separated `fields-to-include-in-citations` value now also fires when the value is set as a property, as the React and Angular wrappers do, and follows the configured log level instead of always logging to the console.
