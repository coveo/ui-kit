# Manual Audit Guide

How to record manual accessibility results for the Coveo Atomic VPAT pipeline. Manual results capture human-reviewed WCAG conformance that automated tooling can't determine on its own.

## Why manual audits?

Automated testing (axe-core) verifies only ~30–40% of WCAG success criteria. The rest — keyboard flows, screen-reader behavior, cognitive load, content that only makes sense in combination — needs human review. Components are audited **as part of a surface**, never in isolation, because they only behave meaningfully when composed together.

## Where the files go

```
packages/atomic-a11y/
└── a11y/
    └── reports/
        ├── manual-audit-search.json
        ├── manual-audit-commerce.json
        ├── manual-audit-insight.json
        └── …
```

One file per **surface**. The `{surface}` label is only a way to split the work into manageable files — the pipeline attaches no meaning to it and it never appears in the VPAT. Use whatever split keeps diffs small and ownership clear (by experience is the obvious one).

`manual-audit-example.json` and any `*-violations*` file are ignored.

## File format

Each file is a **single object**: a `surface` label plus the criteria you audited.

```json
{
  "surface": "commerce",
  "wcag22Criteria": {
    "2.4.7-focus-visible": "pass",
    "1.4.3-contrast-minimum": {
      "conformance": "fail",
      "remarks": "Chrome 124, dark theme: focus ring measures 2.1:1 vs surface (needs 3:1). Repro: Tab to any facet checkbox."
    }
  }
}
```

There is **no per-component dimension** — you audit the surface as a whole.

### Criterion key format

Keys follow `{numeric-id}-{slug}`. Only the numeric id is parsed (regex `/^(\d+(?:\.\d+)+)-/`); the slug is free text for readability. The id **must** be a real WCAG 2.2 A/AA criterion (validated against `src/data/wcag-criteria.ts`).

| Key                            | Criterion |
| ------------------------------ | --------- |
| `2.4.7-focus-visible`          | `2.4.7`   |
| `1.4.3-contrast-minimum`       | `1.4.3`   |
| `2.1.4-character-key-shortcuts`| `2.1.4`   |

### Result values

| Value            | OpenACR Conformance | Meaning                                                       |
| ---------------- | ------------------- | ------------------------------------------------------------- |
| `pass`           | Supports            | The surface meets this criterion.                             |
| `fail`           | Does Not Support    | The surface fails this criterion.                             |
| `partial`        | Partially Supports  | Met in some scenarios but not all.                            |
| `not-applicable` | Not Applicable      | The criterion doesn't apply to this surface.                  |

Use the object form `{ "conformance", "remarks" }` to document *why*; the remark is carried into the VPAT notes. **List only the criteria you tested** — omitted criteria stay *Does Not Support [manual audit required]* until audited.

Put the **test conditions in `remarks`**: the assistive tech + version and browser you used for any criterion that depends on them (screen readers, focus, name/role/value), and a short **repro** for every `fail`/`partial`. A bare `pass` is fine for clearly-visual checks; an AT-dependent `pass`/`fail` without conditions isn't verifiable.

## How conformance is resolved

Each criterion gets **one product-level verdict**. An engineering override is authoritative; otherwise the verdict is the **worst** of the real signals present:

```
fail (does-not-support) > partial > pass (supports) > not-applicable
```

Signals:

1. **Overrides** (`a11y/a11y-overrides.json`) — permanent, by-design exceptions set by engineering. Authoritative: they win outright and bypass worst-wins.
2. **Manual audits** — every result across **all** surface files. The same criterion audited in several files contributes several results; the worst wins.
3. **Interactive** — Storybook keyboard `play()` tests.
4. **Automated** — axe-core, **only for criteria it actually covers**. A criterion axe doesn't cover contributes *no* signal (not a failure), so manual audits can fill those gaps.

Consequences:

- A manual `fail` surfaces even if axe was clean.
- A manual `pass` **cannot** hide a real axe violation — the violation still wins. Fix the code or add a documented override instead.
- A criterion axe can't test (e.g. `2.1.4`) is driven entirely by your manual result.
- A criterion with no signal at all is *Does Not Support [manual audit required]*.

## Validation

When `pnpm a11y:vpat` runs, the loader warns and skips:

- a file that isn't an object with a `wcag22Criteria` map (e.g. the old per-component array shape),
- a criterion key whose id isn't a recognized WCAG 2.2 A/AA criterion,
- a result that isn't `pass` / `fail` / `partial` / `not-applicable` (or `{conformance, remarks}`).

## Workflow

1. Pick a surface and open/create `a11y/reports/manual-audit-{surface}.json`.
2. Add `criterion → result` entries for what you tested.
3. Run `pnpm a11y:vpat` and check the `[json-to-openacr]` output for warnings.
4. Commit the file (and the regenerated VPAT markdown).

## PR checklist

Paste this into the description of any manual-audit PR so a reviewer can trust the results:

```markdown
### Manual audit
- **Surface(s):** <search / commerce / …>
- **Method:** keyboard / screen reader / zoom-reflow / visual (delete what doesn't apply)
- **Environment:** <e.g. NVDA 2024.1 + Chrome 124; VoiceOver + Safari 17; macOS 14>
- **Criteria audited:** <list the WCAG ids, e.g. 1.3.1, 2.1.1, 4.1.2>
- **Fails/partials:** repro steps captured in each criterion's `remarks`
- [ ] `pnpm a11y:vpat` run; no "Unknown WCAG criterion" warnings
- [ ] AT + browser recorded in `remarks` for AT-dependent criteria
- [ ] Reviewed by an accessibility owner
```

## Tips

- **Split by surface, not component.** Keeps diffs small; the VPAT merges everything anyway.
- **Only list what you tested.** Untested criteria remain visible as *[manual audit required]*.
- **Don't paper over real failures.** A manual `pass` won't clear an axe violation — that's intentional. Use an override (with a reason) only for genuine by-design exceptions.
