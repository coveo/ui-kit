---
"@coveo/atomic": patch
---

Fix two generated answer accessibility issues:
- Strip markdown syntax from the aria-live announcement so screen readers read clean prose instead of raw markdown characters (e.g. `##`, `**`, `` ` ``).
- Announce error states (e.g. "Answer could not be generated") assertively so the message is not skipped when a screen reader is already announcing "Generating answer".
