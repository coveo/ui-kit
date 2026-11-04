---
'@coveo/atomic': patch
---

In `atomic-generated-answer` and `atomic-insight-generated-answer`, the title is now "AI-generated answer" and the default disclaimer now reads "AI-generated content may contain errors. Verify important information." Screen readers now announce "AI-generated answer:" before the answer and the disclaimer after it, including for each follow-up answer. They also treat the visible disclaimer as a note that describes the answer. The announced disclaimer comes from the new `generated-answer-disclaimer-announcement` i18n key, so it can be overridden separately from the visible `generated-answer-disclaimer` text.
