---
'@coveo/atomic': minor
---

Support locale-aware date formats in `atomic-result-date`. The dayjs `localizedFormat` plugin is now registered, so the [localized format tokens](https://day.js.org/docs/en/display/format#localized-formats) (`L`, `LL`, `LT`, `LLL`, and their variants) resolve against the locale set on the interface's `language` property instead of being emitted verbatim. A single `format="L"` now renders `09/30/2026` for `en-US` and `2026-09-30` for `en-CA`, removing the need for a per-locale format string. The default `format` is unchanged.

Fix the `calendar-next-week` translations, which are consumed as dayjs format strings but were not escaped, so parts of them were interpreted as date tokens. When `relative-time` was enabled, the label was rendered with digits spliced into the translated text in 15 languages.

Document that the `language` property on every interface accepts a full BCP 47 locale (`en-CA`, `fr-CA`, `pt-BR`), not just a language code. The region is what drives number grouping and decimal separators, currency symbol placement, and date ordering, so passing a full locale is recommended. Translations continue to resolve from the language code alone.
