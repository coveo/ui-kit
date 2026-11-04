---
'@coveo/quantic': patch
---

In `quanticGeneratedAnswer`, the title is now "AI-generated answer" and the default disclaimer now reads "AI-generated content may contain errors. Verify important information." The disclaimer is now displayed while the answer streams, not only once it completes. Screen readers now announce "AI-generated answer:" before the answer and the disclaimer after it. They also treat the visible disclaimer as a note. The announced disclaimer comes from the new `quantic_RGADisclaimerAnnouncement` label, so it can be overridden separately from the visible `quantic_RGADisclaimer` text.

These changes support the transparency obligations for AI-generated content in [Article 50 of the EU AI Act (Regulation (EU) 2024/1689)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj).
