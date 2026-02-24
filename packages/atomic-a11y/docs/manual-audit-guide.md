# Manual Audit Guide

This guide explains how to create manual audit baseline files for the Coveo Atomic accessibility pipeline. These files capture human-reviewed WCAG 2.2 conformance results that feed into the final VPAT (Voluntary Product Accessibility Template) report.

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

## File naming

Files **must** match this pattern:

```
manual-audit-{category}.json
```

| ✅ Valid | ❌ Invalid (skipped silently) |
|---------|------------------------------|
| `manual-audit-search.json` | `manual-audit-search-violations.json` (contains `-violations`) |
| `manual-audit-commerce.json` | `audit-search.json` (missing `manual-audit-` prefix) |
| `manual-audit-common.json` | `manual-audit-search.yaml` (wrong extension) |

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Component name, must be non-empty. Use the `atomic-*` name as it appears in the automated report (e.g., `atomic-search-box`, `atomic-facet`, `atomic-result-list`). |
| `category` | string | **Yes** | One of: `search`, `commerce`, `insight`, `ipx`, `common`, `recommendations`. |
| `manual.status` | string | **Yes** | Must be `"complete"` for the entry to be processed. Use `"pending"` for work-in-progress entries — they are silently skipped. |
| `manual.wcag22Criteria` | object | **Yes** | Map of criterion keys to status values. Only criteria you've actually tested need to be included. |

### Criterion key format

Keys in `wcag22Criteria` must follow this pattern:

```
{numeric-id}-{slug}
```

The system extracts the numeric ID using the regex `/^(\d+(?:\.\d+)+)-/`, so the slug after the hyphen can be anything descriptive. Convention is to use the WCAG criterion handle in lowercase kebab-case.

**Examples:**

| Key | Extracted ID |
|-----|-------------|
| `1.1.1-non-text-content` | `1.1.1` |
| `1.4.3-contrast-minimum` | `1.4.3` |
| `2.4.1-bypass-blocks` | `2.4.1` |
| `3.3.2-labels-or-instructions` | `3.3.2` |

### Status values

| Status | OpenACR Conformance | Meaning |
|--------|-------------------|---------|
| `pass` | Supports | The component fully meets this criterion. |
| `fail` | Does Not Support | The component fails this criterion. |
| `partial` | Partially Supports | The component meets this criterion in some but not all scenarios. |
| `not-applicable` | Not Applicable | This criterion does not apply to this component (e.g., no audio content for audio-related criteria). |

Any other status value is logged as a warning and skipped.

## How conformance is resolved

When multiple components report on the same criterion, the system applies **worst-wins** precedence:

```
fail > partial > pass > not-applicable
```

For example, if `atomic-search-box` reports `pass` and `atomic-result-list` reports `fail` for criterion `1.1.1`, the final conformance for `1.1.1` is `does-not-support`.

### Priority chain across data sources

Manual audits are one of four conformance sources. The full priority chain (highest to lowest):

1. **Overrides** (`a11y-overrides.json`) — explicit exceptions set by engineering
2. **Manual audits** — your baseline files (this guide)
3. **Existing report conformance** — previously computed values in the JSON report
4. **Automated results** — derived from axe-core pass/fail counts

This means manual audit results **override** automated findings, but are themselves overridden by explicit overrides.

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
- The value is not a string
- The key doesn't match the `{numeric-id}-{slug}` pattern
- The status value is not one of `pass`, `fail`, `partial`, `not-applicable`

## Workflow

```
1. Pick a component category (search, commerce, etc.)
2. Create or edit `a11y/reports/manual-audit-{category}.json`
3. For each component you've audited:
   a. Set "status": "complete"
   b. Add criterion results to wcag22Criteria
4. Commit the file
5. The CI pipeline runs:
   pnpm a11y:vpat
     → reads a11y-report.json (automated)
     → reads manual-audit-*.json (your files)
     → merges both → OpenACR YAML → VPAT markdown
```

## WCAG 2.2 Level A + AA criteria reference

The pipeline evaluates against these 55 criteria. You don't need to test all of them for every component — only include the ones you've actually verified.

### Level A (31 criteria)

| ID | Name |
|----|------|
| 1.1.1 | Non-text Content |
| 1.2.1 | Audio-only and Video-only (Prerecorded) |
| 1.2.2 | Captions (Prerecorded) |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) |
| 1.3.1 | Info and Relationships |
| 1.3.2 | Meaningful Sequence |
| 1.3.3 | Sensory Characteristics |
| 1.4.1 | Use of Color |
| 1.4.2 | Audio Control |
| 2.1.1 | Keyboard |
| 2.1.2 | No Keyboard Trap |
| 2.1.4 | Character Key Shortcuts |
| 2.2.1 | Timing Adjustable |
| 2.2.2 | Pause, Stop, Hide |
| 2.3.1 | Three Flashes or Below Threshold |
| 2.4.1 | Bypass Blocks |
| 2.4.2 | Page Titled |
| 2.4.3 | Focus Order |
| 2.4.4 | Link Purpose (In Context) |
| 2.5.1 | Pointer Gestures |
| 2.5.2 | Pointer Cancellation |
| 2.5.3 | Label in Name |
| 2.5.4 | Motion Actuation |
| 3.1.1 | Language of Page |
| 3.2.1 | On Focus |
| 3.2.2 | On Input |
| 3.2.6 | Consistent Help |
| 3.3.1 | Error Identification |
| 3.3.2 | Labels or Instructions |
| 3.3.7 | Redundant Entry |
| 4.1.2 | Name, Role, Value |

### Level AA (24 criteria)

| ID | Name |
|----|------|
| 1.2.4 | Captions (Live) |
| 1.2.5 | Audio Description (Prerecorded) |
| 1.3.4 | Orientation |
| 1.3.5 | Identify Input Purpose |
| 1.4.3 | Contrast (Minimum) |
| 1.4.4 | Resize Text |
| 1.4.5 | Images of Text |
| 1.4.10 | Reflow |
| 1.4.11 | Non-text Contrast |
| 1.4.12 | Text Spacing |
| 1.4.13 | Content on Hover or Focus |
| 2.4.5 | Multiple Ways |
| 2.4.6 | Headings and Labels |
| 2.4.7 | Focus Visible |
| 2.4.11 | Focus Not Obscured (Minimum) |
| 2.5.7 | Dragging Movements |
| 2.5.8 | Target Size (Minimum) |
| 3.1.2 | Language of Parts |
| 3.2.3 | Consistent Navigation |
| 3.2.4 | Consistent Identification |
| 3.3.3 | Error Suggestion |
| 3.3.4 | Error Prevention (Legal, Financial, Data) |
| 3.3.8 | Accessible Authentication (Minimum) |
| 4.1.3 | Status Messages |

## Tips

- **Start with `"pending"`** — set `status` to `"pending"` while auditing, then flip to `"complete"` when done. Pending entries are safely ignored.
- **One file per category** — keeps diffs small and ownership clear.
- **You don't need every criterion** — only include criteria you've actually tested. Untested criteria remain as `"not-evaluated"` in the VPAT.
- **Component names must match** — use the exact `atomic-*` name from the automated `a11y-report.json`. Open that file to see the list of detected components and their names.
- **Criteria keys are flexible** — only the numeric prefix matters (`1.1.1-`). The slug after the hyphen is for human readability.
