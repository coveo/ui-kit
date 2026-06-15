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

| Key                             | Criterion |
| ------------------------------- | --------- |
| `2.4.7-focus-visible`           | `2.4.7`   |
| `1.4.3-contrast-minimum`        | `1.4.3`   |
| `2.1.4-character-key-shortcuts` | `2.1.4`   |

### Result values

| Value            | OpenACR Conformance | Meaning (ITI / Section 508 definition)                         | Remark       |
| ---------------- | ------------------- | -------------------------------------------------------------- | ------------ |
| `pass`           | Supports            | At least one method meets the criterion with no known defects. | Encouraged   |
| `partial`        | Partially Supports  | Some functionality meets the criterion; some does not.         | **Required** |
| `fail`           | Does Not Support    | The majority of functionality does not meet the criterion.     | **Required** |
| `not-applicable` | Not Applicable      | The criterion is not relevant to the surface.                  | Brief reason |

Use the object form `{ "conformance", "remarks" }` to add a remark; it becomes the criterion's **Remarks and Explanations** text in the VPAT/ACR. **List only the criteria you tested** — omitted criteria stay _Does Not Support [manual audit required]_ until audited.

Remarks are read by procurement, legal, and accessibility reviewers — not engineers. Write them to the ACR standard described in [Writing ACR-grade remarks](#writing-acr-grade-remarks).

### Writing ACR-grade remarks

The `remarks` field is the customer-facing **Remarks and Explanations** column of the Accessibility Conformance Report (ACR). Per the [ITI VPAT instructions](https://www.itic.org/policy/accessibility/vpat) and [Section 508 guidance](https://www.section508.gov/sell/how-to-create-acr-with-vpat/), a remark is **required** for `partial` and `fail`, **encouraged** for `pass`, and a **brief reason** for `not-applicable`.

A good remark answers three questions in **1–3 plain-language sentences**:

1. **What** does the surface do, or fail to do, for this criterion?
2. **Where** does it occur — in user-facing terms (which surface / feature)?
3. For `fail` / `partial`, **what is the impact** on the user?

Rules:

- **Write for a non-technical reader.** A procurement or legal reviewer must understand it without opening the product or reading code.
- **Keep bug-ticket detail out of the remark.** Element selectors, code identifiers (e.g. "scope property undefined"), internal ticket IDs (e.g. `KIT-5811`), step-by-step repro, and severity belong in the linked defect/PR — not the ACR. Rule of thumb: _if it reads like a bug ticket it's too detailed; if it reads like marketing ("fully accessible") it's not detailed enough._
- **Record test method and environment once, at the report level.** The assistive tech + versions, browsers, OS, and tools used belong in the report's evaluation methods (`evaluation_methods_used`) and the PR description — not repeated in every remark.
- **Be honest and specific.** Disclose known issues even without a fix date ("under review" / "prioritized for an upcoming release"). Don't reuse identical boilerplate across criteria — reviewers read that as a non-rigorous evaluation and reject the ACR.

Examples:

- **Supports** — `Headings follow a logical hierarchy, and facet, sort, and pager controls have descriptive labels across the search interface.`
- **Partially Supports** — `Most interactive controls show a visible focus indicator; facet checkboxes in the refine modal do not, so keyboard users can lose track of focus there.`
- **Does Not Support** — `When the refine modal is open, keyboard focus can move to a control hidden behind the modal, so a keyboard user cannot see what is focused.`
- **Not Applicable** — `The search interface contains no prerecorded audio or video content.`

Too detailed (belongs in the ticket, not the ACR): `Refine-modal atomic-modal focus trap inactive — scope property undefined at runtime (KIT-5811); focus escapes to elements behind the backdrop.`

## How conformance is resolved

Each criterion gets **one product-level verdict**. An engineering override is authoritative; otherwise the verdict is the **worst** of the real signals present:

```
fail (does-not-support) > partial > pass (supports) > not-applicable
```

Signals:

1. **Overrides** (`a11y/a11y-overrides.json`) — permanent, by-design exceptions set by engineering. Authoritative: they win outright and bypass worst-wins.
2. **Manual audits** — every result across **all** surface files. The same criterion audited in several files contributes several results; the worst wins.
3. **Interactive** — Storybook keyboard `play()` tests.
4. **Automated** — axe-core, **only for criteria it actually covers**. A criterion axe doesn't cover contributes _no_ signal (not a failure), so manual audits can fill those gaps.

Consequences:

- A manual `fail` surfaces even if axe was clean.
- A manual `pass` **cannot** hide a real axe violation — the violation still wins. Fix the code or add a documented override instead.
- A criterion axe can't test (e.g. `2.1.4`) is driven entirely by your manual result.
- A criterion with no signal at all is _Does Not Support [manual audit required]_.

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
- **Fails/partials:** cause + repro recorded in the linked ticket (not in the ACR remark)
- [ ] `pnpm exec turbo run a11y:vpat --filter=@coveo/atomic-a11y` run; no "Unknown WCAG criterion" warnings
- [ ] Remarks are plain-language ACR notes (status / behavior / location / impact) — no selectors, code, ticket IDs, or repro steps
- [ ] Test environment (AT + versions, browser, OS) recorded above
- [ ] Reviewed by an accessibility owner
```

## Tips

- **Split by surface, not component.** Keeps diffs small; the VPAT merges everything anyway.
- **Only list what you tested.** Untested criteria remain visible as _[manual audit required]_.
- **Don't paper over real failures.** A manual `pass` won't clear an axe violation — that's intentional. Use an override (with a reason) only for genuine by-design exceptions.
