---
'@coveo/atomic': patch
---

Fixed a Safari rendering bug where smooth scrolling during page navigation could cause stale visual layers (white rectangles or previous-page content) to appear over search results. `scrollToTop()` no longer forces `behavior: 'smooth'`, instead deferring to the CSS `scroll-behavior` property on the scroll container (which defaults to instant). Users who want smooth scrolling can opt in via CSS.
