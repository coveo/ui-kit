---
'@coveo/atomic': patch
---

Fixed facet search to announce its result count through an ARIA live region when a query returns no matches (WCAG 4.1.3 Status Messages). Previously the "no matches found" state was only conveyed visually and was never announced to assistive technologies, since the announcer only fired when results were found.
