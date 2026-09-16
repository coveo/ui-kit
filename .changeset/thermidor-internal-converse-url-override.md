---
'@coveo/thermidor': patch
---

Added an `@internal` `converseUrl` override to the Thermidor engine configuration. When set, the unified endpoint client sends the converse request to that exact URL, bypassing default endpoint/path composition; when omitted, behavior is unchanged. This is an internal escape hatch (not part of the public API) that unblocks the internal `/private/converse` endpoint and local-gateway work. See `docs/internal/adr/ADR-009-converse-url-override.md`.
