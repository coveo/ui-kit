---
'@coveo/quantic': patch
---

In `quanticGeneratedAnswer`, the title is now "AI-generated answer" and the default disclaimer now reads "AI-generated content may contain errors. Verify important information." The disclaimer is now displayed while the answer streams, not only once it completes. The screen reader announcement made when an answer finishes generating now starts with "AI-generated answer:" instead of "Answer generated:", and ends with the disclaimer. The visible disclaimer is now a `<small>` element. The announced disclaimer comes from the new `quantic_RGADisclaimerAnnouncement` label, so it can be overridden separately from the visible `quantic_RGADisclaimer` text.

These changes support the transparency obligations for AI-generated content in [Article 50 of the EU AI Act (Regulation (EU) 2024/1689)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj).
