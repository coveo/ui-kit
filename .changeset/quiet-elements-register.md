---
"@coveo/atomic": patch
---

Make each Atomic element import the elements it renders, so that importing a single element (rather than the whole `@coveo/atomic` barrel or the lazy loader) no longer leaves `atomic-icon`, `atomic-focus-trap`, `atomic-result-link`, `atomic-result`, `atomic-product-section-name`, `atomic-product-section-visual` or `atomic-generated-answer-inline-link` unregistered.
