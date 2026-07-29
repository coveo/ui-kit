---
"@coveo/quantic": patch
---

Fixed an issue where the generated answer error state would not render for a follow-up question when the failure occurred before any SSE event was received (e.g., a network error), since the error object in that case has no error code.
