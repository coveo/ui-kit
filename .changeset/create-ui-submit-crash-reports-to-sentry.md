---
'@coveo/create-ui': minor
---

Add opt-in crash reporting to the CLI. When project scaffolding fails unexpectedly, `create-ui` now writes a local crash report and prints a `report` command you can run to submit it to Coveo. Nothing is ever sent automatically, and reporting is skipped entirely when `DO_NOT_TRACK` is set.
