---
'@coveo/atomic': patch
---

Fix the "next week" label of `atomic-result-date` with `relative-time`, which rendered with digits spliced into the text in 15 languages, such as `Näc81te Woc8e` in German. The `calendar-next-week` translations are dayjs format strings and were not bracket-escaped.
