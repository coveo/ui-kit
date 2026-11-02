---
'@coveo/thermidor': minor
---

**Breaking:** `session.sendAndWait(send)` is removed. Await the `dispatchAction` promise instead: it resolves once the dispatch's own request ends, at once for a dispatch withheld while another request is in flight. A renderer that returns its `onAction` promise hands it back to the component that dispatched, so the component can end an optimistic update when it resolves.
