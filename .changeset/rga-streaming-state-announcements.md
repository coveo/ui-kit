---
'@coveo/atomic': patch
---

Expose generated answer streaming and copy state to assistive technology. The answer container now reports `aria-busy` while streaming, copy success and failure are announced through a live region, and the like, dislike, and copy buttons carry explicit accessible names instead of relying on `title` alone.
