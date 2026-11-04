---
'@coveo/atomic': patch
---

In `atomic-generated-answer` and `atomic-insight-generated-answer`, the title is now "AI-generated answer" and the default disclaimer now reads "AI-generated content may contain errors. Verify important information." The screen reader announcement made when an answer finishes generating, including each follow-up answer, now starts with "AI-generated answer:" instead of "Generated answer:", and ends with the disclaimer. The visible disclaimer is now a `<small>` element, and the answer region references it with `aria-describedby`. The announced disclaimer comes from the new `generated-answer-disclaimer-announcement` i18n key, so it can be overridden separately from the visible `generated-answer-disclaimer` text.

These changes support the transparency obligations for AI-generated content in [Article 50 of the EU AI Act (Regulation (EU) 2024/1689)](https://eur-lex.europa.eu/eli/reg/2024/1689/oj).
