# Manual Audit Guide

This guide explains how to create manual audit baseline files for the Coveo Atomic accessibility pipeline. These files capture human-reviewed WCAG conformance results that feed into the final VPAT (Voluntary Product Accessibility Template) report.

## Why manual audits?

Automated testing (axe-core) can only verify ~30-40% of WCAG success criteria. The remaining criteria require human judgment — keyboard navigation, screen reader behavior, cognitive load, etc. Manual audit baselines fill that gap.

## Where the files go

```
packages/atomic-a11y/
└── a11y/
    └── reports/
        ├── manual-audit-search.json        ← one file per category
        ├── manual-audit-commerce.json
        ├── manual-audit-common.json
        └── ...
```

**Default directory**: `a11y/reports`

## Source of truth

The `manual-audit-*.json` baseline files in `a11y/reports` are the source of truth for manual audits.

Auditors should edit these baseline files directly. There is no separate delta merge step in the standard `pnpm a11y:vpat` workflow.

## File naming

Files **must** match this pattern:

```
manual-audit-{category}.json
```

| ✅ Valid                     | ❌ Invalid (skipped silently)                                  |
| ---------------------------- | -------------------------------------------------------------- |
| `manual-audit-search.json`   | `manual-audit-search-violations.json` (contains `-violations`) |
| `manual-audit-commerce.json` | `audit-search.json` (missing `manual-audit-` prefix)           |
| `manual-audit-common.json`   | `manual-audit-search.yaml` (wrong extension)                   |

The `-violations` exclusion is intentional — files with that suffix are reserved for automated violation logs and are filtered out.

## File format

Each file is a **JSON array** of component entries:

```json
[
  {
    "name": "atomic-search-box",
    "category": "search",
    "manual": {
      "status": "complete",
      "wcag22Criteria": {
        "1.1.1-non-text-content": "pass",
        "1.3.1-info-and-relationships": "partial",
        "1.4.3-contrast-minimum": "fail",
        "2.4.1-bypass-blocks": "not-applicable"
      }
    }
  },
  {
    "name": "atomic-search-box-instant-results",
    "category": "search",
    "manual": {
      "status": "complete",
      "wcag22Criteria": {
        "1.1.1-non-text-content": "pass",
        "2.1.1-keyboard": "pass"
      }
    }
  }
]
```

### Field reference

| Field                   | Type   | Required | Description                                                                                                                                                         |
| ----------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | string | **Yes**  | Component name, must be non-empty. Use the `atomic-*` name as it appears in the automated report (e.g., `atomic-search-box`, `atomic-facet`, `atomic-result-list`). |
| `category`              | string | **Yes**  | One of: `search`, `commerce`, `insight`, `ipx`, `common`, `recommendations`.                                                                                        |
| `manual.status`         | string | **Yes**  | Must be `"complete"` for the entry to be processed. Use `"pending"` for work-in-progress entries — they are silently skipped.                                       |
| `manual.wcag22Criteria` | object | **Yes**  | Map of criterion keys to status values. Only criteria you've actually tested need to be included.                                                                   |

### Criterion key format

Keys in `wcag22Criteria` must follow this pattern:

```
{numeric-id}-{slug}
```

The system extracts the numeric ID using the regex `/^(\d+(?:\.\d+)+)-/`, so what follows the first hyphen can be anything descriptive. Convention is to use the WCAG criterion handle in lowercase kebab-case.

**Examples:**

| Key                            | Extracted ID |
| ------------------------------ | ------------ |
| `1.1.1-non-text-content`       | `1.1.1`      |
| `1.4.3-contrast-minimum`       | `1.4.3`      |
| `2.4.1-bypass-blocks`          | `2.4.1`      |
| `3.3.2-labels-or-instructions` | `3.3.2`      |

### Status values

| Status           | OpenACR Conformance | Meaning                                                                                              |
| ---------------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| `pass`           | Supports            | The component fully meets this criterion.                                                            |
| `fail`           | Does Not Support    | The component fails this criterion.                                                                  |
| `partial`        | Partially Supports  | The component meets this criterion in some but not all scenarios.                                    |
| `not-applicable` | Not Applicable      | This criterion does not apply to this component (e.g., no audio content for audio-related criteria). |

Any other status value is logged as a warning and skipped.

### Adding remarks (optional)

For each criterion, you can optionally provide `remarks` to document **why** you assigned that status. This helps engineers understand the auditor's reasoning and makes it easier to track remediation efforts.

**Two formats are supported:**

**Simple format** (no remarks):

```json
"1.1.1-non-text-content": "pass"
```

**Object format** (with remarks):

```json
"1.1.1-non-text-content": {
  "conformance": "pass",
  "remarks": "All images have meaningful alt text"
}
```

**Complete example:**

```json
{
  "name": "atomic-search-box",
  "category": "search",
  "manual": {
    "status": "complete",
    "wcag22Criteria": {
      "1.1.1-non-text-content": {
        "conformance": "pass",
        "remarks": "All images have alt text; icons use aria-label"
      },
      "1.4.3-contrast-minimum": {
        "conformance": "partial",
        "remarks": "Pass ratio meets AA standards. Focus indicators on dark backgrounds need refinement."
      },
      "2.4.1-bypass-blocks": {
        "conformance": "fail",
        "remarks": "No skip-to-main-content link. Keyboard users must tab through search filters."
      },
      "2.1.1-keyboard": "pass"
    }
  }
}
```

Remarks are included in the OpenACR report and help reviewers understand which criteria need attention or may require follow-up testing.

## How conformance is resolved

When multiple components report on the same criterion, the system applies **worst-wins** precedence:

```
fail > partial > pass > not-applicable
```

For example, if `atomic-search-box` reports `pass` and `atomic-result-list` reports `fail` for criterion `1.1.1`, the final conformance for `1.1.1` is `does-not-support`.

### Priority chain across data sources

Manual audits are one of four conformance sources. The full priority chain (highest to lowest):

1. **Overrides** (`a11y/a11y-overrides.json`) — explicit exceptions set by engineering
2. **Manual audits** — your baseline files (as described in this guide)
3. **Existing report conformance** — previously computed values in the JSON report
4. **Automated results** — derived from axe-core pass/fail counts

This means manual audit results **override** automated findings, but are themselves overridden by explicit overrides.

## WCAG Rule Blacklist Strategy

All WCAG 2.2 AA criteria have been intentionally marked as `"not-evaluated"` in `a11y/a11y-overrides.json`. This is a **gradual enablement strategy** to prevent CI failures when accessibility auditing is enabled.

### Why blacklist all rules?

When PR #7134 enables automated accessibility testing in CI, it will detect violations across many components. Blacklisting rules temporarily prevents CI from failing and allows the team to address accessibility debt incrementally as components are remediated.

### How to enable rules (contributor workflow)

As your components become compliant with WCAG criteria, gradually remove them from the blacklist:

1. **Identify a criterion to remediate** — choose one WCAG rule you're ready to commit to (e.g., `1.1.1` for non-text content)
2. **Edit** `a11y/a11y-overrides.json`:
  - Find the corresponding entry (e.g., `"criterion": "1.1.1"`)
  - Remove that entire entry from the `overrides` array
3. **Run audits** to verify compliance:
  - Run automated tests: `pnpm test` or `pnpm a11y:scan`
  - Verify your components pass the criterion using axe DevTools or manual testing
  - Update manual audit baselines if needed
4. **Submit PR** with:
  - Updated `a11y/a11y-overrides.json` (one rule removed)
  - Any necessary component fixes or manual audit files
  - Description: list which criterion was enabled and how it was validated

### Rules marked "not-applicable"

Some rules are permanently excluded because they don't apply to a component library:

- **Media criteria** (1.2.1-1.2.5): Atomic includes no audio/video components
- **Timing & motion** (2.2.1, 2.2.2, 2.3.1, 2.5.4): No time limits or motion-triggered features
- **Host-level concerns** (2.4.2, 2.4.5, 3.1.1, 3.2.3, 3.2.4): Page titles, navigation, language - set by the application, not components
- **Multi-step forms & auth** (3.3.7, 3.3.8): Atomic doesn't include form flows or authentication

These are distinguished from "not-evaluated" rules and won't be removed during gradual enablement.

### Strategy timeline

- **Current phase**: All criteria are blacklisted (not-evaluated) to allow foundation work
- **Next phase**: Teams pick criteria to remediate and remove from the override file one at a time
- **Final phase**: Once components are WCAG 2.2 AA compliant, the override file will only contain the 17 "not-applicable" rules

## Complete example

A minimal but complete baseline file for search components (`manual-audit-search.json`):

```json
[
  {
    "name": "atomic-search-box",
    "category": "search",
    "manual": {
      "status": "complete",
      "wcag22Criteria": {
        "1.1.1-non-text-content": "pass",
        "1.3.1-info-and-relationships": "pass",
        "1.3.2-meaningful-sequence": "pass",
        "2.1.1-keyboard": "pass",
        "2.4.3-focus-order": "pass",
        "2.4.7-focus-visible": "pass",
        "3.2.1-on-focus": "pass",
        "3.2.2-on-input": "pass",
        "3.3.2-labels-or-instructions": "pass",
        "4.1.2-name-role-value": "partial"
      }
    }
  },
  {
    "name": "atomic-search-box-instant-results",
    "category": "search",
    "manual": {
      "status": "pending",
      "wcag22Criteria": {}
    }
  }
]
```

In this example:

- `atomic-search-box` is fully audited — all 10 tested criteria will appear in the VPAT
- `atomic-search-box-instant-results` is pending — it will be **silently skipped** until `status` is changed to `"complete"`

## Validation rules

The system validates each entry before processing. An entry is **skipped with a warning** if:

- `name` is missing or empty
- `manual` is missing or not an object
- `manual.status` is missing
- `manual.wcag22Criteria` is missing or not an object

Additionally, individual criterion entries within `wcag22Criteria` are skipped if:

- The value is neither a string nor an object with string `conformance`
- The key doesn't match the `{numeric-id}-{slug}` pattern
- The status value is not one of `pass`, `fail`, `partial`, `not-applicable`

## Workflow

1. Pick a component category (search, commerce, etc.)
2. Create or edit `a11y/reports/manual-audit-{category}.json`
3. For each component you've audited:
   a. Set "status": "complete"
   b. Add criterion results to wcag22Criteria
4. Commit the file
5. The CI pipeline runs:

```
   pnpm a11y:vpat
     → reads a11y-report.json (automated)
     → reads manual-audit-*.json (your files)
     → merges both → OpenACR YAML → VPAT markdown
```

## Tips

- **Start with `"pending"`** — set `status` to `"pending"` while auditing, then flip to `"complete"` when done. Pending entries are safely ignored.
- **One file per category** — keeps diffs small and ownership clear.
- **You don't need every criterion** — only include criteria you've actually tested. Untested criteria remain as `"not-evaluated"` in the VPAT.
- **Component names must match** — use the exact `atomic-*` name from the automated `a11y-report.json`. Open that file to see the list of detected components and their names.
- **Criteria keys are flexible** — only the numeric prefix matters (`1.1.1-`). The slug after the hyphen is for human readability.
