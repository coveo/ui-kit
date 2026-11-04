---
'@coveo/atomic': patch
---

In `atomic-generated-answer` and `atomic-insight-generated-answer`, the title is now "AI-generated answer" and the default disclaimer now reads "AI-generated content may contain errors. Verify important information." Screen readers now announce "AI-generated answer:" before the answer and read the disclaimer after it, including for each follow-up answer. They also treat the disclaimer as a note that describes the answer. A custom disclaimer passed through the newly documented `disclaimer` slot is announced instead of the default one.
