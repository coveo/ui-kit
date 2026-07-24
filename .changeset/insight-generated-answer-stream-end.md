---
"@coveo/headless": patch
---

Fixed `logGeneratedAnswerStreamEnd` always logging the Search analytics event, even when the `GeneratedAnswer` controller is built on an Insight engine. The Insight-specific `logGeneratedAnswerStreamEnd` action is now correctly invoked for Insight use cases, and its signature was aligned with the Search version (`answerGenerated`, `answerId?`, `answerTextIsEmpty?`).
