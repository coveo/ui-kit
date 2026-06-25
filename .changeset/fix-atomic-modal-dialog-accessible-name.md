---
"@coveo/atomic": patch
---

A11y: Fix atomic-modal dialog accessible name to exclude the close button. The `aria-labelledby` target now wraps only the title slot, and close buttons moved to a new `header-actions` slot.
