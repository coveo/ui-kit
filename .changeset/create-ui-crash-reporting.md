---
"@coveo/create-ui": minor
---

Add opt-in, crash-only error reporting. On an unexpected crash the CLI now writes a human-readable JSON report and prints `npx @coveo/create-ui report <path>` to submit it — nothing is sent automatically. Reports contain crash diagnostics only, with file paths scrubbed (home directory redacted to `~`), and honor the `DO_NOT_TRACK` convention.
