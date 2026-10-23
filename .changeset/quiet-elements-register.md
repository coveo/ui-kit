---
"@coveo/atomic": patch
---

Make each Atomic element import the elements it renders, so that importing a single element (rather than the whole `@coveo/atomic` barrel or the lazy loader) no longer leaves `atomic-icon`, `atomic-focus-trap`, `atomic-result-link`, `atomic-result`, `atomic-product-section-name`, `atomic-product-section-visual` or `atomic-generated-answer-inline-link` unregistered.

When a modal is closed and no `source` element was provided, focus now returns to the element that had focus when the modal opened (e.g., in `atomic-generated-answer-feedback-modal`).
