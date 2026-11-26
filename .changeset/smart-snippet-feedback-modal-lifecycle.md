---
'@coveo/atomic': patch
---

Fix `atomic-smart-snippet` so that its "Explain why" feedback modal is removed along with the snippet and put back, with the thank-you state still working, when the snippet is re-attached. Removing the snippet while the feedback modal is open now closes the feedback workflow, which clears the `atomic-modal-opened` class from the page. A snippet that renders while the answer is already disliked now opens the feedback modal when a user clicks "Explain why".
