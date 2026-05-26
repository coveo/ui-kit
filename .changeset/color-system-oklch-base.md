---
"@coveo/atomic": minor
---

Add `coveo.experimental.css` — opt-in OKLCH-based color system.

Load this stylesheet after `coveo.css` to opt into the new color system:

```html
<link rel="stylesheet" href="coveo.css" />
<link rel="stylesheet" href="coveo.experimental.css" />
```

5 OKLCH base color tokens drive all variants via CSS relative color syntax. Includes built-in dark mode via `prefers-color-scheme` and automatic `--atomic-on-primary` via `contrast-color()` where supported.

**Breaking change (experimental only):** `--atomic-neutral` changes from a light border shade to a mid-tone anchor (`oklch(0.72)`). Use `--atomic-neutral-dim` for border/divider colors.

`coveo.css` is unchanged — existing users are unaffected.
