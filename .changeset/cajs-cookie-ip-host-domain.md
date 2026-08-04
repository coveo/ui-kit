---
'coveo.analytics': minor
---

Stop deriving a cookie `domain` attribute from an IP address host. On a host such as `192.168.1.5`, `Cookie.set` previously wrote `;domain=1.5`, which browsers reject, so the visitor ID cookie was silently dropped. IP hosts are now written without a `domain` attribute, matching the behavior already used for hosts without a dot.
