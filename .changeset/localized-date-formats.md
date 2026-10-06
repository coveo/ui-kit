---
'@coveo/atomic': minor
---

Support dayjs [localized formats](https://day.js.org/docs/en/display/format#localized-formats) such as `L`, `LL`, and `LLL` in `atomic-result-date`. They follow the interface `language`, so with `language="en-CA"`, `format="L"` renders `2026-09-30` where `en-US` renders `09/30/2026`.
