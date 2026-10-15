---
'@coveo/atomic': patch
---

Load the dayjs locales from the CDN one at a time, for the page's language, instead of all 143 of them coming with the dayjs chunk that every page loads. Every CDN page downloads about 33 KB less, gzipped.
