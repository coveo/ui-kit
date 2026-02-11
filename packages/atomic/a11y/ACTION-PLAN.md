# WCAG 2.2 AA — Full Compliance Action Plan

## Current State

| Status                                 | Count | Criteria                                                                                                                             |
| -------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Supports** (automated pass)          | 19    | 1.1.1, 1.3.1, 1.3.5, 1.4.3, 1.4.4, 1.4.12, 2.1.1, 2.2.1, 2.2.2, 2.4.1, 2.4.2, 2.4.4, 2.4.6, 3.1.1, 3.1.2, 3.3.2, 4.1.1, 4.1.2, 4.1.3 |
| **Does Not Support** (known violation) | 1     | 2.5.8 (Target Size) — 7 commerce + 1 IPX component                                                                                   |
| **Not Applicable** (overridden)        | 9     | 2.1.2, 2.4.3, 2.4.7, 2.4.11, 2.5.7, 3.2.1, 3.2.6, 3.3.7, 3.3.8                                                                       |
| **Not Evaluated**                      | 27    | Everything else                                                                                                                      |

The overrides file (`a11y/a11y-overrides.json`) has 17 entries, but only 9 are reflected in the current OpenACR because the report was generated before the overrides feature was wired in. Once regenerated, the count will shift to **17 N/A** and **19 not-evaluated**.

**Bottom line:** 19 of 50 criteria are confirmed passing. 1 is failing. 17 are not-applicable. That leaves **13 criteria that need evaluation.**

---

## The 13 Criteria That Need Work

| #   | Criterion | Name                    | Level | What's Needed                                                          |
| --- | --------- | ----------------------- | ----- | ---------------------------------------------------------------------- |
| 1   | 1.3.2     | Meaningful Sequence     | A     | Manual verification that DOM order matches visual order                |
| 2   | 1.3.3     | Sensory Characteristics | A     | Manual check that no instructions rely on shape/size/location alone    |
| 3   | 1.3.4     | Orientation             | AA    | Test components render correctly in both portrait and landscape        |
| 4   | 1.4.1     | Use of Color            | A     | Manual check that color is never the sole means of conveying info      |
| 5   | 1.4.5     | Images of Text          | AA    | Verify no component renders text as images                             |
| 6   | 1.4.10    | Reflow                  | AA    | Test all components at 320px viewport width                            |
| 7   | 1.4.11    | Non-text Contrast       | AA    | Verify UI boundaries (borders, icons, focus indicators) have 3:1 ratio |
| 8   | 1.4.13    | Content on Hover/Focus  | AA    | Test tooltips/popovers are dismissible, hoverable, persistent          |
| 9   | 2.1.4     | Character Key Shortcuts | A     | Verify no single-character shortcuts (or they can be remapped)         |
| 10  | 2.5.1     | Pointer Gestures        | A     | Verify no multipoint/path-based gestures required                      |
| 11  | 2.5.2     | Pointer Cancellation    | A     | Verify actions fire on up-event, not down-event                        |
| 12  | 2.5.3     | Label in Name           | A     | Verify accessible name includes visible label text                     |
| 13  | 2.5.8     | Target Size (Minimum)   | AA    | **Fix the 8 known violations** (16×16 buttons → 24×24)                 |

---

## Phase 1 — Fix Known Violations (Week 1-2)

### 1.1 Fix Target Size violations (2.5.8)

**7 commerce components + 1 IPX component** have buttons at 16×16px that must be ≥ 24×24px.

| Component                       | Issue                            | Fix                               |
| ------------------------------- | -------------------------------- | --------------------------------- |
| `atomic-commerce-breadbox`      | 5 buttons at 16×16               | Increase button min-size to 24×24 |
| `atomic-commerce-facet`         | 5 buttons at 16×16               | Same                              |
| `atomic-commerce-facets`        | 5 buttons at 16×16               | Same                              |
| `atomic-commerce-numeric-facet` | 5 buttons at 16×16               | Same                              |
| `atomic-commerce-refine-modal`  | 1 button at 20×25                | Increase width to ≥ 24            |
| `atomic-product-description`    | 1 button at 90×24 (height 23.98) | Round up height                   |
| `atomic-product-excerpt`        | 1 button at 90×24 (height 23.98) | Round up height                   |
| `atomic-ipx-embedded` (IPX)     | From manual audit                | Inspect and fix                   |

These are likely the same shared button styles (facet collapse/expand icons). Fixing the shared CSS class once may resolve most of them.

**File the GitHub issues:** `node a11y/scripts/generate-a11y-issues.mjs --execute`

**Verify after fix:** Add Target Size assertions to Storybook `play` functions (see `docs/a11y-storybook-wcag-tests-issue.md`).

### 1.2 Regenerate reports with overrides

After the overrides feature was added, the OpenACR hasn't been regenerated. Run:

```bash
# Run the full test suite to generate a fresh a11y-report.json
pnpm test:storybook

# Generate OpenACR (will pick up a11y/a11y-overrides.json automatically)
npx tsx src/a11y-reporter/json-to-openacr.ts
```

This will shift 17 criteria to `not-applicable` and produce an accurate conformance summary.

---

## Phase 2 — Automate What Can Be Automated (Week 3-4)

### 2.1 Add Storybook `play` function tests

Follow the plan in `docs/a11y-storybook-wcag-tests-issue.md`. Priority order:

1. **Target Size (2.5.8)** — add `getBoundingClientRect` checks to all interactive component stories. This is the most impactful since it found real violations.
2. **Keyboard (2.1.1)** — add Tab/Enter/Escape tests to modal, facet, search box, and pager stories.
3. **Status Messages (4.1.3)** — add `aria-live` assertions to query-summary, did-you-mean, no-results stories.

### 2.2 Add Label in Name check (2.5.3)

axe-core has an experimental `label-in-name` rule. Enable it in `.storybook/preview.ts`:

```typescript
rules: [
  { id: 'label-in-name', enabled: true },
],
```

This moves 2.5.3 from "not-evaluated" to "automated" without any new test code.

### 2.3 Add reflow test (1.4.10)

Add a Storybook story variant at 320px viewport width for key components (search box, facets, result list). Chromatic visual regression will then catch reflow breakages on every PR.

```typescript
export const Reflow320: Story = {
  parameters: {
    viewport: {defaultViewport: 'mobile1'}, // 320px
  },
};
```

---

## Phase 3 — Manual Evaluation of Remaining Criteria (Week 5-6)

These 7 criteria cannot be automated. They require a human to look at the components and make a judgment call. For each, evaluate once and add the result to `a11y/a11y-overrides.json`.

| Criterion                         | How to Evaluate                                                                                                                                                                                           | Expected Result for Atomic                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **1.3.2** Meaningful Sequence     | Open each interactive component story. Compare DOM order (via DevTools) to visual layout. Check if `order`, `flex-direction: reverse`, or `position: absolute` breaks reading order.                      | Likely **supports** — Atomic uses standard DOM flow.                          |
| **1.3.3** Sensory Characteristics | Search component instructions/labels for references to "the round button", "the red field", "the item on the right".                                                                                      | Likely **supports** — Atomic uses text labels, not shape/location references. |
| **1.3.4** Orientation             | Load key stories in both portrait (375×812) and landscape (812×375). Verify nothing breaks or becomes unusable.                                                                                           | Likely **supports** — Atomic is responsive, no orientation locks.             |
| **1.4.1** Use of Color            | Check if any component uses color as the sole indicator of state (selected, error, active). Verify there's always a secondary indicator (icon, text, border).                                             | Review needed — facet selected states, validation errors.                     |
| **1.4.5** Images of Text          | Check that no component renders text content as `<img>` or SVG text. Icons with text are exempt if they're decorative.                                                                                    | Likely **supports** — Atomic renders text as DOM text.                        |
| **1.4.11** Non-text Contrast      | Measure contrast ratio of UI component boundaries (input borders, button borders, focus indicators, icon foregrounds) against their backgrounds. Use browser DevTools or a contrast checker. 3:1 minimum. | Review needed — depends on theme.                                             |
| **1.4.13** Content on Hover/Focus | For any tooltip or popover: (1) hoverable — user can move cursor into the tooltip without it disappearing, (2) dismissible — pressing Escape closes it, (3) persistent — stays visible until user acts.   | Review `atomic-popover`, `atomic-smart-snippet` tooltip behavior.             |

**For each evaluation:**

1. Test the component
2. Record the result in `a11y/a11y-overrides.json` with a reason
3. If it fails, file a GitHub issue for the fix

### Criteria likely already passing

| Criterion                         | Why                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| **2.1.4** Character Key Shortcuts | Atomic has no single-character keyboard shortcuts. Add to overrides as `not-applicable`.       |
| **2.5.1** Pointer Gestures        | No component requires multipoint or path-based gestures. Add to overrides as `not-applicable`. |
| **2.5.2** Pointer Cancellation    | Standard browser click behavior uses up-event. Add to overrides as `supports` with reason.     |

After this phase, add these 3 to `a11y/a11y-overrides.json`:

```json
{ "criterion": "2.1.4", "conformance": "not-applicable", "reason": "Atomic does not implement single-character keyboard shortcuts." },
{ "criterion": "2.5.1", "conformance": "not-applicable", "reason": "No component requires multipoint or path-based pointer gestures." },
{ "criterion": "2.5.2", "conformance": "supports", "reason": "All interactive elements use standard click/tap events which fire on pointer up-event (browser default behavior)." }
```

---

## Phase 4 — Screen Reader Testing (Week 7-8)

Automated tests verify structure (ARIA attributes exist) but not experience (announcements are correct, navigation is logical). Screen reader testing is needed for procurement confidence.

### What to test

Focus on the 15 most interactive components:

- Search box + instant results + query suggestions
- All facet types (regular, category, numeric, timeframe, color, rating)
- Modals (refine, quickview, feedback)
- Pager, results-per-page, sort dropdown
- Generated answer, smart snippet

### Screen reader matrix

| Priority   | Screen Reader | Browser | Platform |
| ---------- | ------------- | ------- | -------- |
| **Must**   | NVDA          | Chrome  | Windows  |
| **Must**   | VoiceOver     | Safari  | macOS    |
| **Should** | JAWS          | Chrome  | Windows  |
| **Could**  | TalkBack      | Chrome  | Android  |

NVDA + Chrome accounts for ~40% of screen reader users. VoiceOver + Safari covers macOS/iOS. These two combinations catch the vast majority of real-world issues.

### What to verify per component

1. **Focus announcement** — When the component receives focus, the screen reader announces its role and name correctly
2. **State changes** — When a facet is selected, the screen reader announces the change (via `aria-live` or role change)
3. **Navigation** — The user can Tab through all interactive elements in a logical order
4. **Error messages** — Error states are announced (not just visually displayed)

### Recording results

Document findings in a new file `a11y/reports/screen-reader-audit.md` with pass/fail per component per screen reader.

---

## Phase 5 — Third-Party Audit (Quarter after Phase 4)

### When it's needed

A self-assessment VPAT is legally sufficient for most procurement. However, a third-party audit is **strongly recommended** when:

- Entering regulated markets (US federal, EU public sector)
- Clients explicitly request third-party validation
- Building confidence for the first conformance claim

### What to look for

- **IAAP-certified auditors** (CPWA or CPACC credential)
- Audit scope: component library (not full application) — much smaller scope = lower cost
- Deliverable: Audited ACR with third-party attestation
- Typical cost: $5K-15K USD for a component library scope
- Typical timeline: 4-6 weeks

### When to schedule

After Phases 1-4 are complete. The audit should validate your self-assessment, not discover new issues.

---

## Phase 6 — Ongoing Maintenance

### CI/CD gates (already in place)

| Gate                        | Trigger             | What it catches                                              |
| --------------------------- | ------------------- | ------------------------------------------------------------ |
| Storybook a11y tests        | Every PR            | axe-core violations (structure + contrast)                   |
| Storybook `play` functions  | Every PR            | Keyboard, target size, focus, status messages                |
| Chromatic visual regression | Every PR            | Focus indicator changes, layout shifts, contrast regressions |
| Chromatic a11y scan         | `a11y-review` label | axe-core in cloud environment (review UX)                    |
| Weekly scan                 | Monday 9am UTC      | Baseline drift, dependency-introduced regressions            |

### Periodic tasks

| Cadence                                     | Task                                                               |
| ------------------------------------------- | ------------------------------------------------------------------ |
| **Every PR** that adds/modifies a component | Add/update `play` function with WCAG assertions                    |
| **Every quarter**                           | Regenerate OpenACR: `npx tsx src/a11y-reporter/json-to-openacr.ts` |
| **Every quarter**                           | Spot-check 5 components with NVDA + VoiceOver                      |
| **Every major release**                     | Full screen reader pass on all Priority 1 components               |
| **Every year**                              | Review `a11y/a11y-overrides.json` — are N/A claims still valid?    |
| **When WCAG updates**                       | Review new/changed criteria and update overrides + tests           |

### Developer process

For every new component:

1. Create Storybook story with `play` function including keyboard + target size assertions
2. Verify no axe-core violations (`pnpm test:storybook`)
3. Quick NVDA/VoiceOver spot-check on interactive components
4. Update `a11y/a11y-overrides.json` if any criterion is N/A for this component

This is documented in `docs/a11y-definition-of-done.md`.

---

## Timeline Summary

| Phase                           | Duration     | Outcome                                                                |
| ------------------------------- | ------------ | ---------------------------------------------------------------------- |
| **Phase 1** — Fix violations    | Week 1-2     | 2.5.8 moves from "does-not-support" → "supports". Reports regenerated. |
| **Phase 2** — Automate          | Week 3-4     | 3 more criteria automated. CI catches regressions.                     |
| **Phase 3** — Manual eval       | Week 5-6     | Remaining 10 criteria evaluated. All 50 criteria have a status.        |
| **Phase 4** — Screen readers    | Week 7-8     | Confidence in real-world AT experience.                                |
| **Phase 5** — Third-party audit | Next quarter | External validation of conformance claim.                              |
| **Phase 6** — Maintenance       | Ongoing      | No regressions, continuous improvement.                                |

### After Phase 3, the conformance summary should be:

| Status             | Count                              |
| ------------------ | ---------------------------------- |
| Supports           | ~30-35                             |
| Partially Supports | 0-3 (depending on manual findings) |
| Does Not Support   | 0 (after fixing target size)       |
| Not Applicable     | ~20                                |
| Not Evaluated      | 0                                  |

**That is full WCAG 2.2 AA conformance** — every criterion has a documented status, violations are fixed, and automation prevents regressions.

---

## QA Manual Audit Delta Workflow

### How it works

Instead of editing baseline audit files (`manual-audit-*.json`) directly, QA creates **delta files** — small JSON patches that record audit results from a PR or release cycle.

### Commands

```bash
# Check current audit status
node a11y/scripts/manual-audit-delta.mjs status

# Validate a delta file before submitting
node a11y/scripts/manual-audit-delta.mjs validate a11y/reports/deltas/delta-2026-02-15-pr-1234.json

# Preview what a merge would do
node a11y/scripts/manual-audit-delta.mjs merge --dry-run

# Merge all deltas into baselines (moves processed deltas to archived/)
node a11y/scripts/manual-audit-delta.mjs merge
```

### QA process

1. **Create a delta file**: Copy `a11y/reports/deltas/EXAMPLE-delta.json`, rename to `delta-YYYY-MM-DD-<context>.json`
2. **Fill in results**: Record audit findings for specific components
3. **Validate**: Run `validate` command to check schema
4. **Submit**: Include the delta file in your PR
5. **Merge**: After PR is approved, run `merge` to fold results into baselines

### Delta file naming

Pattern: `delta-YYYY-MM-DD-<context>.json`

Examples:

- `delta-2026-02-15-pr-1234.json` — results from a specific PR
- `delta-2026-03-01-quarterly-q1.json` — quarterly audit results
- `delta-2026-04-10-screen-reader-nvda.json` — screen reader audit pass

### Filing issues from deltas

The `generate-a11y-issues.mjs` script also reads pending deltas, so failures in delta files will appear in issue generation before they're merged into baselines:

```bash
node a11y/scripts/generate-a11y-issues.mjs          # Dry run
node a11y/scripts/generate-a11y-issues.mjs --execute  # File issues
```
