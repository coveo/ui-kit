---
"@coveo/headless": patch
---

FetchEventSource call was missing openWhenHidden: true, causing the CRGA-with-Answer-API stream to abort and reopen a brand-new /generate request whenever the tab/app lost visibility mid-stream and with the previous partial answer never reset, it produced duplicated content.
