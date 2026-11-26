---
'@coveo/atomic': patch
---

Fix `atomic-insight-smart-snippet` so that the "Explain why" feedback modal opens after a user dislikes a snippet, is removed along with the snippet, and still shows the thank-you state after the snippet is re-attached. Pressing Escape no longer closes an `atomic-modal` that is already closed, so the smart snippet feedback modals no longer log a close event on every Escape press.
