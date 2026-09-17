---
'@coveo/atomic': patch
---

Expose headings inside a generated answer to assistive technology. Markdown headings now carry `role="heading"` and `aria-level`, so screen reader users can navigate an answer by heading. The `part` attributes and the rendered DOM structure are unchanged.
