---
'@coveo/quantic': patch
---

In `quanticGeneratedAnswer`, the title is now "AI-generated answer" and the default disclaimer now reads "AI-generated content may contain errors. Verify important information." The disclaimer is now displayed while the answer streams, not only once it completes. Screen readers now announce "AI-generated answer:" before the answer and read the disclaimer after it. They also treat the disclaimer as a note. A custom disclaimer passed through the newly documented `disclaimer` slot is announced instead of the default one.
