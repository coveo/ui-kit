---
'@coveo/atomic': patch
---

Fixed `atomic-relevance-inspector` so it releases its bindings subscription when removed, opens again on alt+double-click after it is re-attached, and no longer throws when removed before it receives bindings.
