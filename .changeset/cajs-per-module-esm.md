---
'coveo.analytics': minor
---

Publish unbundled per-module ESM output under `dist/esm/` (`history.mjs`, `storage.mjs`, `cookieutils.mjs`, `detector.mjs`, each with a matching `.d.mts`), so a consumer can import a single module instead of pulling in a full bundle. Purely additive: no `exports` map is introduced and every existing entry point resolves exactly as before.
