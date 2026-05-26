# Color System — Napkin Spec

> Status: Draft · Approach: Less-is-more

## Problem

The current themes (`coveo.css`, `accessible.css`) hardcode ~20 color values. Each variant (light, dark, background) is an independent hex constant — making themes brittle, hard to extend, and requiring manual recalculation when the brand color changes.

## Proposed Approach: Derive, Don't Define

Define a **small set of base colors** and use **CSS relative color syntax** + **OKLCH** to derive everything else at compute time.

### Why OKLCH?

- **Perceptually uniform** — a `+0.1` lightness step looks the same regardless of hue
- **Hue-stable mixing** — no muddy in-betweens when lightening/darkening
- **Easy to reason about** — `l` ∈ [0,1] (dark→light), `c` ∈ [0,0.4] (gray→vivid), `h` ∈ [0,360] (hue angle)

### CSS Relative Color Syntax

```css
/* Pick any channel from the source color and transform it */
oklch(from var(--source) calc(l + 0.2) c h)   /* lighten */
oklch(from var(--source) calc(l - 0.1) c h)   /* darken */
oklch(from var(--source) l calc(c * 0.2) h)   /* mute/desaturate */
oklch(from var(--source) l c h / 50%)          /* add transparency */
```

Support: Chrome 119+, Firefox 128+, Safari 16.4+ (~92% global).

---

## The ≤ 5 Base Colors

| Token              | Approximate value       | Role                                   |
| ------------------ | ----------------------- | -------------------------------------- |
| `--atomic-primary` | `oklch(0.52 0.20 258)`  | Brand / interactive actions            |
| `--atomic-neutral` | `oklch(0.75 0.015 240)` | UI chrome: borders, dividers, surfaces |
| `--atomic-success` | `oklch(0.55 0.16 142)`  | Positive feedback                      |
| `--atomic-error`   | `oklch(0.52 0.18 35)`   | Destructive actions, errors            |
| `--atomic-visited` | `oklch(0.44 0.18 303)`  | Visited-link state                     |

> These are the only values a theme author needs to change.
> `--atomic-neutral` is chosen as a **mid-tone anchor** (~50–75% lightness), so we can derive both lighter and darker steps in both directions.

---

## Derived Colors

All of the following are **computed, not hardcoded**:

```css
:root {
  /* --- Primary scale --- */
  /* Fallback: OKLCH lightness threshold (l < 0.6 → white, l > 0.6 → black) */
  --atomic-on-primary: oklch(
    from var(--atomic-primary) clamp(0, (0.6 - l) * 1000, 1) 0 h
  );
  --atomic-primary-light: oklch(
    from var(--atomic-primary) calc(l + 0.15) calc(c * 0.85) h
  );
  --atomic-primary-dark: oklch(
    from var(--atomic-primary) calc(l - 0.12) calc(c * 1.1) h
  );
  --atomic-primary-background: oklch(
    from var(--atomic-primary) 0.97 calc(c * 0.12) h
  );
  --atomic-ring-primary: oklch(from var(--atomic-primary) l c h / 50%);

  /* --- Neutral scale --- */
  --atomic-neutral-dark: oklch(from var(--atomic-neutral) calc(l - 0.28) c h);
  --atomic-neutral-dim: oklch(from var(--atomic-neutral) calc(l - 0.1) c h);
  --atomic-neutral-light: oklch(
    from var(--atomic-neutral) calc(l + 0.18) calc(c * 0.6) h
  );
  --atomic-neutral-lighter: oklch(
    from var(--atomic-neutral) calc(l + 0.22) calc(c * 0.4) h
  );
  --atomic-disabled: oklch(
    from var(--atomic-neutral) calc(l + 0.1) calc(c * 0.8) h
  );

  /* --- Surfaces --- */
  --atomic-background: oklch(
    1 0 0
  ); /* always white; see open questions for dark mode */
  --atomic-on-background: oklch(from var(--atomic-neutral) 0.18 calc(c * 2) h);

  /* --- Semantic state backgrounds --- */
  --atomic-success-background: oklch(
    from var(--atomic-success) 0.95 calc(c * 0.18) h
  );
  --atomic-error-background: oklch(
    from var(--atomic-error) 0.95 calc(c * 0.18) h
  );
}

/* Enhance on-primary with contrast-color() where supported */
@supports (color: contrast-color(red)) {
  :root {
    --atomic-on-primary: contrast-color(var(--atomic-primary));
  }
}
```

> **Caveat — mid-tone primaries:** Both `contrast-color()` and the OKLCH threshold only output `black` or `white`. If `--atomic-primary` falls in the mid-tone range (roughly `l ∈ [0.45, 0.65]`), neither black nor white will satisfy WCAG AA for small text — this is a fundamental limitation of the CSS spec, not a bug in this system. Themers should keep their primary color sufficiently light (`l > 0.65`) or dark (`l < 0.45`). See the [MDN warning on `contrast-color()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color).

---

## Opinionated Constants

A few colors have narrow, non-themeable roles. They are **overridable but not base colors**:

```css
--atomic-rating-icon-active-color: oklch(
  0.87 0.17 87
); /* gold — star ratings */
--atomic-inline-code: oklch(0.46 0.2 25); /* red — inline code */
```

These exist outside the derived palette because no consumer of the design system should need to theme them as part of a brand identity.

---

## Theming Surface

A consumer needs to override **at most 5** variables to fully theme the library:

```css
[data-theme='my-brand'] {
  --atomic-primary: oklch(0.55 0.22 160); /* e.g. teal brand */
  --atomic-neutral: oklch(0.8 0.008 200); /* cool-gray UI chrome */
  /* success, error, visited → inherit defaults if not overriding */
}
```

The accessible theme (`accessible.css`) becomes a set of **different base values** applied to the same derived system — not a separate file full of hardcoded overrides.

---

## Comparing Before / After

|                             | Before | After                                     |
| --------------------------- | ------ | ----------------------------------------- |
| Hardcoded values per theme  | ~20    | **5**                                     |
| Values a themer must change | ~20    | **≤ 5**                                   |
| Consistent lightness steps  | Manual | **Computed**                              |
| Dark mode ready             | No     | **Yes (auto via `prefers-color-scheme`)** |

---

## Dark Mode

The 5 base colors are **brand colors** — they don't change between light and dark mode. What changes is the **surface layer**: how far each neutral step and state background is pushed from the anchor.

### Why not a `* -1` multiplier?

The neutral anchor sits at `oklch(0.72)`. In light mode, `neutral-lighter` needs to reach `~0.95` (+0.23 offset). In dark mode, the semantically equivalent "background-like surface" needs to reach `~0.22` (−0.50 offset). White and near-black are **not equidistant** from `0.72` — a simple sign flip produces mid-grays, not proper dark surfaces. Hiding this asymmetry in a `calc()` multiplier creates unreadable formulas. Explicit overrides in a `@media` block are clearer.

### Implementation

The default `:root` block defines light mode. A `@media (prefers-color-scheme: dark)` block overrides only the surface-layer derived tokens:

```css
/* Light mode (default) — --atomic-background already defined in :root */

@media (prefers-color-scheme: dark) {
  :root {
    --atomic-background: oklch(0.13 0 0);

    /* Neutral scale inverts: dark → light text, light → dark surfaces */
    --atomic-neutral-dark: oklch(
      from var(--atomic-neutral) calc(l + 0.26) c h
    ); /* ~0.98, near-white text */
    --atomic-neutral-light: oklch(
      from var(--atomic-neutral) calc(l - 0.18) calc(c * 0.6) h
    ); /* ~0.54, mid-dark surface */
    --atomic-neutral-lighter: oklch(
      from var(--atomic-neutral) calc(l - 0.5) calc(c * 0.35) h
    ); /* ~0.22, deep-dark surface */
    --atomic-disabled: oklch(
      from var(--atomic-neutral) calc(l - 0.3) calc(c * 0.75) h
    ); /* ~0.42, muted */

    /* State backgrounds: push toward near-black instead of near-white */
    --atomic-primary-background: oklch(
      from var(--atomic-primary) 0.17 calc(c * 0.25) h
    );
    --atomic-success-background: oklch(
      from var(--atomic-success) 0.17 calc(c * 0.3) h
    );
    --atomic-error-background: oklch(
      from var(--atomic-error) 0.17 calc(c * 0.3) h
    );
  }
}
```

`--atomic-on-background` and `--atomic-on-primary` require no change — the `contrast-color()` / OKLCH threshold pattern already adapts to whatever background they're placed on.

### The asymmetry is intentional

| Token             | Light offset | Dark offset | Reason                                          |
| ----------------- | ------------ | ----------- | ----------------------------------------------- |
| `neutral-dark`    | −0.26        | +0.26       | Symmetric around anchor; cleanly inverts        |
| `neutral-light`   | +0.16        | −0.18       | Slightly deeper dark to avoid mid-gray surfaces |
| `neutral-lighter` | +0.23        | −0.50       | Dark mode needs near-black, not near-0.5        |

### Overriding the color scheme

`--atomic-background` is **not a base themer variable** — it is auto-derived by the media query. To force a color scheme regardless of OS preference (e.g., a "dark mode toggle" in the app):

```css
/* Force dark */
[data-color-scheme='dark'] {
  --atomic-background: oklch(0.13 0 0);
  --atomic-neutral-dark: oklch(from var(--atomic-neutral) calc(l + 0.26) c h);
  --atomic-neutral-light: oklch(
    from var(--atomic-neutral) calc(l - 0.18) calc(c * 0.6) h
  );
  --atomic-neutral-lighter: oklch(
    from var(--atomic-neutral) calc(l - 0.5) calc(c * 0.35) h
  );
  --atomic-disabled: oklch(
    from var(--atomic-neutral) calc(l - 0.3) calc(c * 0.75) h
  );
  --atomic-primary-background: oklch(
    from var(--atomic-primary) 0.17 calc(c * 0.25) h
  );
  --atomic-success-background: oklch(
    from var(--atomic-success) 0.17 calc(c * 0.3) h
  );
  --atomic-error-background: oklch(
    from var(--atomic-error) 0.17 calc(c * 0.3) h
  );
}
```

> A future iteration could extract the dark-mode overrides into a shared mixin (PostCSS, Sass, or CSS `@layer`) to avoid repeating the block. Out of scope for now.

---

## Decided

- **`--atomic-visited` stays as a base color.** A hue-rotation approach is too fragile across brand hues.
- **No PostCSS fallback.** Target browsers that support CSS relative color syntax natively (~92% global, Chrome 119+, Firefox 128+, Safari 16.4+).
- **`--atomic-user-actions-timeline-separator-background`** derives from `--atomic-neutral`:
  ```css
  --atomic-user-actions-timeline-separator-background: var(
    --atomic-user-actions-timeline-separator-background,
    oklch(from var(--atomic-neutral) calc(l + 0.15) calc(c * 0.5) h)
  );
  ```
  The outer `var()` fallback pattern preserves the consumer override escape hatch without adding a new base variable.

---

## Open Questions

1. **`--atomic-table-*` in accessible theme** — `outer-border`, `inner-border`, `header-background`, `header-delimiter` are currently hardcoded in `accessible.css` only. Out of scope for now.

---

## `--atomic-neutral` anchor lightness — Decision: Option B

**Decided:** Move the anchor to mid-tone (`oklch ~0.72`) and rename what was `--atomic-neutral` (the border/divider shade) to `--atomic-neutral-dim`. Ships as a **breaking change** in a major version bump, with a migration note.

### Rationale

The old anchor (`oklch(0.93 ...)`) required a `calc(l - 0.46)` step to reach `neutral-dark` — fragile and leaves almost no room to go lighter. A mid-tone anchor gives ≤ ±0.26 offsets in both directions and makes the derivation math obvious and symmetric.

### New neutral scale

| Token                      | OKLCH l (approx)  | Role                                                        | Change                         |
| -------------------------- | ----------------- | ----------------------------------------------------------- | ------------------------------ |
| `--atomic-neutral-dark`    | 0.46              | Body text on light bg                                       | Derived (unchanged appearance) |
| `--atomic-neutral-dim`     | 0.72              | **New name for old `--atomic-neutral`** (borders, dividers) | **Renamed**                    |
| `--atomic-neutral`         | **0.72** ← anchor | Mid-tone base; themer sets this                             | **Semantic change**            |
| `--atomic-neutral-light`   | 0.88              | Subtle surfaces                                             | Derived (unchanged appearance) |
| `--atomic-neutral-lighter` | 0.95              | Near-white backgrounds                                      | Derived (unchanged appearance) |

> `--atomic-neutral` and `--atomic-neutral-dim` share the same anchor value by default — `dim` is simply an alias. Consumers who override `--atomic-neutral` to a lighter or darker value will see `dim` track with it, which is the desired behaviour.

### Derived tokens with new offsets

```css
--atomic-neutral-dark: oklch(from var(--atomic-neutral) calc(l - 0.26) c h);
--atomic-neutral-dim: var(--atomic-neutral); /* alias; same shade at default */
--atomic-neutral-light: oklch(
  from var(--atomic-neutral) calc(l + 0.16) calc(c * 0.6) h
);
--atomic-neutral-lighter: oklch(
  from var(--atomic-neutral) calc(l + 0.23) calc(c * 0.35) h
);
--atomic-disabled: oklch(
  from var(--atomic-neutral) calc(l + 0.12) calc(c * 0.75) h
);
```

### Migration note (for changelog / upgrade guide)

- `--atomic-neutral` now represents a **mid-tone** (~`oklch(0.72 0.012 240)`), not the light border shade it was before.
- If you were using `--atomic-neutral` directly as a border or divider color, switch to `--atomic-neutral-dim`.
- If you were overriding `--atomic-neutral` to set your border color, override `--atomic-neutral-dim` instead (and set `--atomic-neutral` to your mid-tone).
