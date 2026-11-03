---
'@coveo/quantic': patch
---

In `quanticGeneratedAnswer`, the default disclaimer now reads "AI-generated content may contain errors. Verify important information." The disclaimer is now displayed while the answer streams, not only once it completes. Screen readers now treat the disclaimer as a note and announce it after the generated answer. A custom disclaimer passed through the newly documented `disclaimer` slot is announced instead of the default one.
