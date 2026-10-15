---
'@coveo/atomic': patch
---

Stop keeping an interface in memory after it is removed from the page, for example on a route change in a single-page application. The component initialization queue kept every interface it had seen, with its engine and everything it rendered.
