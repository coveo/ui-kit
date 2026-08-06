---
'@coveo/atomic': patch
---

Removed the legacy result template-system stylesheet and migrated the Insight, Recommendation, and result placeholder components to the sanitized template system. Result sections now receive their layout classes consistently across every interface, so per-section styling is applied by the shared result-section components instead of the removed monolithic stylesheet.
