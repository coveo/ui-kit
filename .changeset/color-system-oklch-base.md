---
"@coveo/atomic": major
---

Refactor color system to use 5 OKLCH base colors with CSS-derived variants.

**Breaking change:** `--atomic-neutral` is now a mid-tone anchor (`oklch(0.72 0.012 240)`) instead of the previous light border/divider shade (`#e5e8e8`).

- If you were using `--atomic-neutral` directly as a border or divider color, switch to `--atomic-neutral-dim`.
- If you were overriding `--atomic-neutral` to set your border color, override `--atomic-neutral-dim` instead (and set `--atomic-neutral` to your mid-tone value).

**New capabilities:**
- All color variants (`-light`, `-dark`, `-background`, etc.) are now derived at runtime via CSS relative color syntax — changing a base color automatically updates the full scale.
- Built-in dark mode via `@media (prefers-color-scheme: dark)` — no additional configuration needed.
- `--atomic-on-primary` now uses `contrast-color()` where supported, with an OKLCH lightness-threshold fallback.
- New `--atomic-neutral-dim` token (replaces the old `--atomic-neutral` border shade).
