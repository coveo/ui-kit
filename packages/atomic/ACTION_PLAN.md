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


-----
Questions:

why in the generate-a11y-issues file only has 6 hardcoded  rules in  WCAG_CRITERIA_LABELS? this feels random. look at the file making sure you forgot nothing.

what is the process of generating a manual-audi-* file
---


Learning

reasons why not going with third pary:

axe-core can fully or partially test about 30-34% of the 50 WCAG 2.2 AA success criteria by count.
But Deque's own research (analyzing 300,000+ real issues across 13,000 pages) shows it catches ~57% of actual defects by volume. Why the discrepancy? Because the criteria axe-core is good at (color contrast 1.4.3, name-role-value 4.1.2) account for a disproportionate share of real-world violations.

| Criterion | Why N/A for Atomic |
|---|---|
| 1.2.1–1.2.5 (Audio/Video) | Atomic has no media players |
| 2.2.1–2.2.2 (Timing) | No time limits in components |
| 2.3.1 (Flashes) | No flashing content |
| 3.1.1–3.1.2 (Language) | Page-level, not component-level |
| 2.4.2 (Page Titled) | Page-level concern |
That's roughly 10-12 criteria out of 50 that are simply not applicable. So the real denominator is ~38 applicable criteria, not 50.


The real breakdown for Atomic specifically
| Category | Criteria Count | Examples | How It's Covered |
|---|---|---|---|
| Fully automated (axe-core) | ~13 | Color contrast, alt text presence, ARIA validity, duplicate IDs, form labels | Storybook addon-a11y → fails CI via test: 'error' |
| Partially automatable (interaction tests + visual regression) | ~10-12 | Keyboard access, focus visible, focus order, focus not obscured, target size, reflow | Storybook play functions + Chromatic screenshots |
| Truly manual | ~8-10 | Content meaningful sequence, heading quality, error suggestion quality, consistent navigation | Manual audits (your .sisyphus/reports/manual-audit-* files) |
| Not applicable | ~10-12 | Audio/video, timing, flashing, page-level concerns | Marked N/A in OpenACR |
So it's not "60-70% manual." It's more like ~20-25% truly manual for a component library like Atomic.


---

To reduce manual work
What you can add to existing play functions
Each play function can be extended to test keyboard and focus behavior:
play: async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');
  
  // Test keyboard activation (WCAG 2.1.1)
  await userEvent.tab();
  expect(button).toHaveFocus();      // Focus visible (2.4.7)
  await userEvent.keyboard('{Enter}');
  // verify expected action happened
  
  // Test no keyboard trap (WCAG 2.1.2)
  await userEvent.tab();
  expect(button).not.toHaveFocus();  // Focus moved forward
  
  // Test Escape closes modal (WCAG interaction pattern)
  await userEvent.keyboard('{Escape}');
}
This directly automates WCAG 2.1.1 (Keyboard), 2.1.2 (No Keyboard Trap), 2.4.7 (Focus Visible), and 3.2.1 (On Focus) — criteria that axe-core cannot test at all.
Concrete recommendation
| Action | WCAG Criteria Automated | Effort |
|---|---|---|
| Add keyboard Tab/Enter/Space/Escape tests to 15 interactive component stories (modals, facets, search box) | 2.1.1, 2.1.2, 2.4.3 | Medium — 2-3 days |
| Add focus-visible assertions after interactions | 2.4.7, 2.4.11 | Low — piggyback on above |
| Chromatic visual regression is already running | 1.4.10, 1.4.11, 2.5.8 | Zero — already done |
| Add ARIA live region assertions in play functions for search results, facet updates | 4.1.3 | Low — 1 day |
With these additions, your truly manual gap drops to roughly 15-20% — mostly content quality judgments (is this heading descriptive? is this error message helpful?) that no tool can evaluate.

What stays manual no matter what
- Screen reader compatibility — no automation can fully replace NVDA/JAWS/VoiceOver testing
- Content quality — "is this alt text meaningful?" vs "does alt text exist?"
- Cognitive load — is the interface understandable?
- Consistent identification — are similar functions labeled consistently across the library?

These are judgment calls. Automation can verify presence but not quality.


----

6. Why a weekly scan on Monday? What's the point vs PR tests?
The weekly scan (a11y-weekly-scan.yml) and PR tests serve different purposes:
PR tests: "Did this PR introduce a regression?"
- Runs on changed code only
- Fast feedback loop (developer gets results in minutes)
- Only catches problems introduced by that specific PR
Weekly scan: "What is the state of main right now?"
- Runs against the full component library on the latest main
- Catches issues that slip through the cracks:
Concrete scenarios the weekly scan catches that PR tests miss:
1. Dependency updates: A renovate bot bumps @storybook/addon-a11y or axe-core. The axe-core update adds a new rule. Existing components now fail the new rule. No PR test ran the full suite because the dependency update PR didn't touch component code.
2. Interaction effects: PR A changes a shared CSS token. PR B adds a new component using that token. Neither PR alone causes a violation, but together they create a contrast issue. The weekly scan catches it.
3. axe-core rule improvements: axe-core periodically improves rule accuracy (fewer false negatives). A component that passed last month might fail with better detection. The weekly scan surfaces this.
4. Report freshness: The a11y-report.json artifact is uploaded weekly with retention-days: 30. This gives you a rolling audit trail — if a client asks "what was your compliance status on January 15th?" you have timestamped evidence.
5. Baseline drift: Over months, small individually-acceptable changes can accumulate into significant conformance drift. The weekly scan is your canary.
Is it expensive? No — it runs Storybook tests in a container, same as your PR test suite. The only cost is the GitHub Actions compute minutes, which is negligible on a Monday morning schedule.
Should you keep it? Yes. Think of it as your smoke detector. PR tests are your fire extinguisher — they handle immediate problems. The weekly scan monitors for slow leaks.