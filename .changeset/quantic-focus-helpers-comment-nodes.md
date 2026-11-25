---
'@coveo/quantic': patch
---

Quantic modals, the quickview and the modal accessibility handler no longer risk throwing an error when the content they look through contains comment nodes. Since API version 60, Lightning web components add empty comment nodes around conditional blocks, and the focus helpers only skipped text nodes.
