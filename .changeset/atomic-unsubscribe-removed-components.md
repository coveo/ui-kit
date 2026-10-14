---
'@coveo/atomic': patch
---

Unsubscribe components from their Headless controller when they leave the DOM, and subscribe them again if they come back. Before, a removed component stayed subscribed and kept re-rendering for the rest of the session.
