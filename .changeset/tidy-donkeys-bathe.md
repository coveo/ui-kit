---
'@coveo/headless': patch
---

Fix search and insight engine initialization so `updateSearchConfiguration` only receives serializable supported fields.

This prevents Redux Toolkit dev warnings caused by function-valued configuration properties being forwarded in action payloads.
