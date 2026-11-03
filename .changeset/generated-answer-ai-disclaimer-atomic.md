---
'@coveo/atomic': patch
---

In `atomic-generated-answer` and `atomic-insight-generated-answer`, the default disclaimer now reads "AI-generated content may contain errors. Verify important information." Screen readers now treat the disclaimer as a note that describes the answer, and they announce it after the generated answer, including for each follow-up answer. A custom disclaimer passed through the newly documented `disclaimer` slot is announced instead of the default one.
