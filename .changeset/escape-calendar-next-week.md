---
'@coveo/atomic': patch
---

Fix `atomic-result-date` with `relative-time` for dates 2 to 6 days ahead, which rendered a garbled "next week" label in 15 languages, such as `Näc81te Woc8e` in German. Like in English and French, they now render the weekday, such as `Freitag`.
