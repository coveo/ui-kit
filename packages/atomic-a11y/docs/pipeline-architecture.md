# AI Audit Pipeline Architecture

| **Team** | DXUI |
| --- | --- |
| **Primary author** | Yassine Lakhdar |
| **Status** | DRAFT |
| **Created** | 2026-03-12 |
| **Parent RFC** | [Atomic Accessibility Compliance Pipeline](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6071287872) |

---

## 1. Overview

The AI accessibility audit in `@coveo/atomic-a11y` evaluates each Atomic component against 22 WCAG 2.2 AA criteria that axe-core cannot automate. The audit captures browser evidence using Playwright, then sends it to an LLM for evaluation.

Evidence capture is split into two distinct pipelines based on what kind of accessibility behavior is being tested:

| Pipeline | WCAG Focus | Capture Method | Entry Point |
| --- | --- | --- | --- |
| **Pipeline A** — Keyboard Interaction States | 4.1.2 Name, Role, Value (and related keyboard/focus criteria) | Deterministic keyboard protocols → before/after ARIA state snapshots | `captureInteractionStates(page)` |
| **Pipeline B** — Live Region Mutations | 4.1.3 Status Messages | MutationObserver → temporal announcement timeline | `captureLiveRegionAnnouncements(page, protocol)` + `captureOnLoadLiveRegions(page, protocols)` |

Both pipelines are orchestrated by `src/audit/ai-wcag-audit.ts` and feed their results into the LLM prompt as structured text evidence alongside screenshots, ARIA tree snapshots, and other captures.

---

## 2. Background: The 5-Layer Compliance Model

The parent RFC established a 5-layer model for WCAG 2.2 AA coverage across Coveo Atomic's ~145 components:

| Layer | Name | What It Does | Coverage |
| --- | --- | --- | --- |
| 0 | N/A Overrides | Marks criteria that don't apply to Atomic's component library (audio, video, timing, authentication, page-level navigation) | 15 criteria |
| 1 | **Axe-core** | Automated static analysis during Storybook test runs | ~19 criteria |
| 2 | Manual Audit | Human QA reviewers evaluate criteria via delta files | Supplements all layers |
| 3 | **AI Audit** (Pipelines A + B) | Playwright evidence capture + LLM evaluation | 22 criteria (19 LLM + 3 static N/A) |
| 4 | Human QA | Screen reader testing, runtime behavior verification | Remaining SR concerns |

**Layers 1 and 3 are the automated layers.** They cover different, non-overlapping sets of WCAG criteria. Pipeline A and Pipeline B are both part of Layer 3.

---

## 3. Axe-core (Layer 1) vs AI Audit (Layer 3)

### What axe-core covers

Axe-core runs during Storybook tests via the `VitestA11yReporter`. It evaluates the rendered DOM against ~90 rules, each tagged with the WCAG criteria they test (e.g., `wcag111` → criterion 1.1.1). The reporter maps these tags to criterion IDs using `extractCriteriaFromTags()` in `src/data/axe-rule-mappings.ts`.

Axe-core excels at **structural, machine-verifiable** checks:
- Color contrast ratios (1.4.3, 1.4.6)
- Missing alt text (1.1.1)
- Form label associations (1.3.1, 4.1.2 partial)
- Duplicate IDs (4.1.1)
- ARIA attribute validity (4.1.2 partial)
- Language attributes (3.1.1, 3.1.2)
- Heading hierarchy (1.3.1)
- Link and button names (2.4.4 partial, 4.1.2 partial)

These are checks where a tool can compute a definitive pass/fail from the DOM alone.

### What axe-core cannot cover

Axe-core cannot evaluate criteria that require:
- **Visual judgment** — Is the reading order meaningful? (1.3.2) Does the non-text contrast look sufficient? (1.4.11)
- **Interaction behavior** — Does the component respond correctly to keyboard input? (2.1.1, 2.4.7) Does focus remain visible? (2.4.11)
- **Semantic assessment** — Are headings descriptive? (2.4.6) Are error messages helpful? (3.3.3)
- **Multi-viewport behavior** — Does content reflow at 320px? (1.4.10) Does it work in portrait and landscape? (1.3.4)
- **Dynamic announcements** — Do live regions fire status messages after interactions? (4.1.3)

These 22 criteria are defined in `ALL_AI_CRITERIA` (`src/shared/constants.ts`) and evaluated by the AI audit agent.

### Coverage split

```
55 total WCAG 2.2 AA criteria
├── 15 criteria → Layer 0: Not applicable (audio, video, timing, auth, page-level)
├── ~19 criteria → Layer 1: Axe-core (automated static analysis)
├── 22 criteria → Layer 3: AI audit (19 LLM-evaluated + 3 static N/A)
│   ├── 16 criteria → Merged Call 1+3 (MERGED_CALL1_3_KEYS)
│   ├── 3 criteria → Call 2 (CALL2_KEYS: orientation, resize-text, reflow)
│   └── 3 criteria → Static N/A (STATIC_NA_CRITERIA: consistent-help, redundant-entry, accessible-auth)
└── Remaining → Layer 2 + 4: Manual audit + human QA
```

**Key point:** Layers 1 and 3 cover different criteria. Axe-core handles the machine-verifiable structural checks; the AI audit handles the judgment-dependent criteria that require visual, behavioral, or semantic evaluation. There is no overlap — `VALID_WCAG_KEYS` in `src/shared/constants.ts` explicitly defines the 22 criteria "not covered by axe-core automated testing."

---

## 4. Pipeline A — Keyboard Interaction State Capture

### Purpose

Pipeline A captures **before/after ARIA state snapshots** during deterministic keyboard interactions. It answers the question: "When a user performs a keyboard action on this component, does the ARIA state change correctly?"

This provides evidence for criteria related to keyboard operability (2.1.1), focus visibility (2.4.7, 2.4.11), and name/role/value correctness (4.1.2).

### How it works

```
┌─────────────────────────────────────────────────────────────────┐
│               Pipeline A: Interaction State Capture             │
│                                                                 │
│  For each INTERACTION_PROTOCOL where expectsLiveRegion ≠ true: │
│                                                                 │
│  1. LOCATE element via protocol.selector                        │
│     └─ Skip if not found or not visible                         │
│                                                                 │
│  2. GET accessible name                                         │
│     └─ aria-label → textContent → tagName                       │
│                                                                 │
│  3. For each ACTION in protocol.actions:                        │
│     a. Snapshot BEFORE state (protocol.stateAttributes)         │
│     b. Focus element (if action.focusFirst)                     │
│     c. Execute keyboard sequence (page.keyboard.press per key)  │
│     d. Snapshot AFTER state                                     │
│     e. Record: { role, elementName, action, beforeState,        │
│                  afterState, stateChanged }                      │
│                                                                 │
│  4. Return InteractionCaptureResult                             │
│     └─ { interactions: InteractionStateCapture[], summary }     │
└─────────────────────────────────────────────────────────────────┘
```

### Entry point

```typescript
// src/audit/browser-capture.ts, line 432
export async function captureInteractionStates(
  page: PlaywrightPage
): Promise<InteractionCaptureResult>
```

Called from `src/audit/ai-wcag-audit.ts` (line 618):
```typescript
const {interactions, summary: interactionSummary} =
  await captureInteractionStates(page);
```

### Protocol routing

The `InteractionProtocol` type (`src/audit/interaction-protocols.ts`) has an `expectsLiveRegion` flag:

```typescript
export interface InteractionProtocol {
  role: string;
  selector: string;
  stateAttributes: string[];
  apgPattern?: string;
  expectsLiveRegion?: boolean;    // true → Pipeline B, absent/false → Pipeline A
  liveRegionSelector?: string;
  actions: Array<{
    name: string;
    keys: string[];
    focusFirst?: boolean;
  }>;
}
```

Pipeline A explicitly skips protocols with `expectsLiveRegion: true`:

```typescript
if (protocol.expectsLiveRegion) continue;  // line 439
```

### Protocol count

Currently **30 keyboard-only protocols** covering ARIA roles: combobox, tablist, tree, slider, checkbox, radio, menu, dialog, tooltip, disclosure, switch, alertdialog, listbox, grid, spinbutton, separator, scrollbar, feed, toolbar, link, navigation, progressbar, status, alert, log, timer, marquee, complementary, meter, and more.

### Data flow into LLM prompt

The interaction results are injected into the prompt as a text summary:

```typescript
// src/audit/prompts.ts, line 181
**APG keyboard interaction data**: ${interactionSummary}
```

The LLM uses this to evaluate whether keyboard interactions produce correct state changes — for example, whether pressing ArrowDown on a combobox sets `aria-expanded="true"` and updates `aria-activedescendant`.

---

## 5. Pipeline B — Live Region Mutation Capture

### Purpose

Pipeline B captures **temporal DOM mutation timelines** from `aria-live` regions after interactions. It answers the question: "When a user performs an action, does the component announce the right status message, at the right time, in the right live region?"

This provides evidence specifically for criterion 4.1.3 (Status Messages).

### How it works

Pipeline B has two sub-flows:

#### Sub-flow 1: On-load capture

For protocols with `observe-load` actions (passive protocols), content is read directly from the DOM after page load — no interaction is triggered.

```
┌──────────────────────────────────────────────────────────────┐
│         Pipeline B, Sub-flow 1: On-Load Capture              │
│                                                              │
│  captureOnLoadLiveRegions(page, protocols)                   │
│                                                              │
│  For each protocol where action.name === 'observe-load':     │
│  1. Locate the live region via liveRegionSelector             │
│  2. Check if element exists and is visible                   │
│  3. Read textContent                                         │
│  4. Record LiveRegionChange with source: 'on-load'           │
│     └─ If empty/missing: noAnnouncement: true                │
│     └─ If content found: announcementText = trimmed text     │
└──────────────────────────────────────────────────────────────┘
```

**5 passive protocols:** query-summary, no-results, query-error, generated-answer, notifications.

#### Sub-flow 2: Interaction capture

For protocols with click or keyboard actions, a MutationObserver records DOM changes after the interaction.

```
┌──────────────────────────────────────────────────────────────┐
│       Pipeline B, Sub-flow 2: Interaction Capture            │
│                                                              │
│  captureLiveRegionAnnouncements(page, protocol)              │
│                                                              │
│  1. START OBSERVER                                           │
│     └─ Inject MutationObserver via page.evaluate()           │
│     └─ Watch all [aria-live] elements for mutations          │
│                                                              │
│  2. TRIGGER ACTION                                           │
│     ├─ If keys present: focus → keyboard press sequence      │
│     │   (150ms gap between keys)                             │
│     └─ If no keys: click the target element                  │
│                                                              │
│  3. SETTLE (800ms)                                           │
│     └─ 500ms AtomicAriaLive debounce + 300ms buffer          │
│                                                              │
│  4. COLLECT MUTATIONS                                        │
│     └─ Retrieve mutations, disconnect observer, cleanup      │
│     └─ Action = "role/action-name" (e.g., "pagination/       │
│        click-next")                                          │
│                                                              │
│  5. ZERO-MUTATION SENTINEL                                   │
│     └─ If no mutations: create sentinel entry with           │
│        noAnnouncement: true so the LLM sees the attempt      │
│                                                              │
│  6. Return LiveRegionCaptureResult                           │
│     └─ { liveRegionChanges[], summary }                      │
└──────────────────────────────────────────────────────────────┘
```

**9 interaction protocols:** pagination, breadcrumb-removal, search-clear, recent-queries-clear, facet-search, category-facet-select, color-facet-select, search-suggestions, quickview.

### Entry points

```typescript
// src/audit/browser-capture.ts

// On-load capture (line 671)
export async function captureOnLoadLiveRegions(
  page: PlaywrightPage,
  protocols: InteractionProtocol[]
): Promise<LiveRegionChange[]>

// Interaction capture (line 614)
export async function captureLiveRegionAnnouncements(
  page: PlaywrightPage,
  protocol: InteractionProtocol
): Promise<LiveRegionCaptureResult>
```

Called from `src/audit/ai-wcag-audit.ts` (lines 639-652):
```typescript
const onLoadChanges = await captureOnLoadLiveRegions(page, liveRegionProtocols);

for (const protocol of liveRegionProtocols) {
  const result = await captureLiveRegionAnnouncements(page, protocol);
  liveRegionResults.push(result);
}
```

### Protocol count

Currently **14 live-region protocols** (all have `expectsLiveRegion: true`):

| # | Protocol | Action Type | Action Name | What It Tests |
| --- | --- | --- | --- | --- |
| 1 | pagination | Click | `click-next` | Pager live region announces new result range |
| 2 | breadcrumb-removal | Click | `remove-filter` | Breadbox announces updated result count |
| 3 | search-clear | Click | `clear-search` | Search box announces result update |
| 4 | recent-queries-clear | Click | `clear-recent-queries` | Search box announces cleared state |
| 5 | query-summary | On-load | `observe-load` | Query summary visible after page load |
| 6 | no-results | On-load | `observe-load` | No-results message visible after page load |
| 7 | query-error | On-load | `observe-load` | Query error message visible after page load |
| 8 | generated-answer | On-load | `observe-load` | Generated answer content visible after page load |
| 9 | notifications | On-load | `observe-load` | Notification content visible after page load |
| 10 | facet-search | Keyboard | `search-facet` | Typing "abc" in facet search triggers announcement |
| 11 | category-facet-select | Keyboard | `select-category` | Pressing Enter on category facet triggers announcement |
| 12 | color-facet-select | Keyboard | `select-color` | Pressing Enter on color facet triggers announcement |
| 13 | search-suggestions | Keyboard | `navigate-suggestions` | ArrowDown×2 in search box triggers suggestions announcement |
| 14 | quickview | Keyboard | `open-quickview` | Pressing Enter on quickview button triggers announcement |

### Data structures

```typescript
// src/audit/types.ts
export interface LiveRegionChange {
  action: string;              // "role/action-name" (e.g., "pagination/click-next")
  selector: string;            // CSS selector: [id="<regionId>"]
  regionName: string;          // Semantic name from ID (e.g., "atomic-pager")
  announcementText: string;    // Text content at mutation time
  ariaLive: 'polite' | 'assertive';
  offsetMs: number;            // Milliseconds since observer start
  noAnnouncement?: boolean;    // true = zero-mutation sentinel
  source?: 'interaction' | 'on-load';
}
```

### Data flow into LLM prompt

Live region data is formatted into the prompt with temporal context:

```typescript
// src/audit/prompts.ts, lines 182-193
## Live Region Announcements
- At +38ms after [pagination/click-next]: region "atomic-pager" announced "Page 2, Results 11 to 20" (aria-live=polite)
- [On page load]: region "query-summary" announced "147 results" (aria-live=polite)
- After [facet-search/search-facet]: region "facet" — **No announcement detected** (aria-live=polite)
```

The formatting rules:
- **Interaction captures with timing:** `At +{offsetMs}ms after [{action}]: region "{name}" announced "{text}"`
- **On-load captures:** `[On page load]: region "{name}" announced "{text}"`
- **Zero-mutation sentinels:** `After [{action}]: region "{name}" — **No announcement detected**`

---

## 6. Pipeline A vs Pipeline B — Comparison

| Aspect | Pipeline A (Interaction States) | Pipeline B (Live Regions) |
| --- | --- | --- |
| **WCAG focus** | Keyboard operability, state management, focus handling | Status messages (4.1.3) |
| **What it captures** | Before/after ARIA attribute snapshots | Temporal DOM mutation timeline |
| **Trigger** | Keyboard sequences (ArrowDown, Enter, Escape, etc.) | Click, keyboard, or passive on-load observation |
| **Observation target** | The interacted element itself | `[aria-live]` regions anywhere on the page |
| **Timing data** | No — compares discrete before/after states | Yes — `offsetMs` per mutation relative to action |
| **Protocol routing** | `expectsLiveRegion` absent or false | `expectsLiveRegion: true` |
| **Protocol count** | 30 protocols | 14 protocols |
| **Browser API** | Playwright locator + `getAttribute()` | `MutationObserver` injected via `page.evaluate()` |
| **LLM prompt field** | `interactionSummary` (text) | `liveRegionChanges` (structured list in "Live Region Announcements" section) |
| **Failure mode** | Returns empty interactions array | Returns empty changes array (or sentinel with `noAnnouncement: true`) |

---

## 7. End-to-End Data Flow

```
                    INTERACTION_PROTOCOLS (44 total)
                           │
                ┌──────────┴──────────┐
                │                     │
         expectsLiveRegion?      expectsLiveRegion?
            false/absent              true
                │                     │
         ┌──────┘                     └──────┐
         │                                    │
    Pipeline A                           Pipeline B
    captureInteractionStates()           │
         │                          ┌────┴────┐
         │                          │         │
         │                    On-load     Interaction
         │                    captureOn   captureLiveRegion
         │                    LoadLive    Announcements()
         │                    Regions()        │
         │                          │         │
         │                          └────┬────┘
         │                               │
         ▼                               ▼
  InteractionCaptureResult    LiveRegionCaptureResult
  { interactions[], summary } { liveRegionChanges[], summary }
         │                               │
         ▼                               ▼
    Prompt: "APG keyboard         Prompt: "## Live Region
    interaction data: ..."         Announcements\n- At +38ms..."
         │                               │
         └───────────┬───────────────────┘
                     │
                     ▼
              LLM Evaluation
         (MERGED_CALL1_3_KEYS: 16 criteria
          + CALL2_KEYS: 3 criteria
          + STATIC_NA: 3 criteria)
                     │
                     ▼
              AI Audit Results
         (22 criteria per component)
```

---

## 8. How This Relates to Axe-core

### Different layers, different strengths

| Capability | Axe-core (Layer 1) | AI Audit Pipelines (Layer 3) |
| --- | --- | --- |
| **Execution time** | During Storybook tests (CI) | Separate Playwright run (on-demand) |
| **Analysis method** | Rule-based DOM analysis | Evidence capture → LLM judgment |
| **Criteria coverage** | ~19 structural criteria | 22 judgment-dependent criteria |
| **Overlap** | None — criteria sets are disjoint | None — criteria sets are disjoint |
| **Confidence** | High — deterministic pass/fail | Medium — LLM reasoning with evidence |
| **False positives** | Low — well-tuned rules | Higher — LLM may misjudge visual evidence |
| **Can evaluate keyboard behavior?** | No — static DOM only | Yes — Pipeline A captures state changes |
| **Can evaluate live regions?** | No — no interaction context | Yes — Pipeline B captures mutation timeline |
| **Can evaluate visual layout?** | Partially (contrast ratios) | Yes — screenshots + LLM vision |

### Why axe-core can't do what Pipeline A does

Axe-core runs against a **static DOM snapshot**. It can verify that ARIA attributes exist and have valid values, but it cannot:

1. **Simulate keyboard interactions** — It doesn't press keys or observe how the component responds.
2. **Compare before/after states** — It sees one point in time, not a state transition.
3. **Evaluate interaction patterns** — It can check that `aria-expanded` exists, but not that pressing ArrowDown on a combobox changes it from `"false"` to `"true"`.

Pipeline A fills this gap by executing APG-defined keyboard sequences and capturing the state delta.

### Why axe-core can't do what Pipeline B does

Axe-core can verify that `aria-live` attributes exist on elements, but it cannot:

1. **Trigger user actions** — It doesn't click buttons or type in search boxes.
2. **Observe DOM mutations over time** — It sees a snapshot, not a timeline.
3. **Detect announcement content** — It can see `aria-live="polite"` exists, but not what text appears after an interaction.
4. **Evaluate timing** — It has no concept of "38ms after the click, the pager announced the new page."

Pipeline B fills this gap by using a MutationObserver to record the full temporal mutation history triggered by each interaction.

### Complementary, not competitive

The two layers form a **funnel**:

```
Layer 1 (Axe-core):  "Does the HTML structure meet WCAG requirements?"
                      → Catches ~19 criteria worth of structural issues
                      → Runs automatically in CI on every PR

Layer 3 (AI Audit):  "Does the component behave correctly for users?"
                      → Pipeline A: "Do keyboard interactions work?"
                      → Pipeline B: "Do status messages announce?"
                      → Catches 22 criteria that need judgment
                      → Runs on-demand via CLI
```

A component can pass all axe-core checks (valid ARIA attributes, proper contrast, correct heading structure) and still fail Pipeline A (pressing Enter on a dialog doesn't close it) or Pipeline B (clicking "Next" on the pager produces no announcement). The layers are complementary by design.

---

## 9. References

- **Source files:**
  - `src/audit/browser-capture.ts` — Pipeline A (`captureInteractionStates`, line 432) and Pipeline B (`captureLiveRegionAnnouncements`, line 614; `captureOnLoadLiveRegions`, line 671)
  - `src/audit/ai-wcag-audit.ts` — Orchestration (Pipeline A call at line 618, Pipeline B calls at lines 639-652)
  - `src/audit/interaction-protocols.ts` — Protocol definitions (30 keyboard + 14 live-region)
  - `src/audit/types.ts` — `LiveRegionChange`, `LiveRegionCaptureResult` interfaces
  - `src/audit/prompts.ts` — LLM prompt construction (`MERGED_CALL1_3_KEYS` line 111, `CALL2_KEYS` line 22)
  - `src/shared/constants.ts` — `ALL_AI_CRITERIA` (line 78), `VALID_WCAG_KEYS` (line 52), `STATIC_NA_CRITERIA` (line 113)
  - `src/reporter/vitest-a11y-reporter.ts` — Axe-core result capture
  - `src/data/axe-rule-mappings.ts` — Axe rule → WCAG criterion tag mapping
- **Parent RFC:** [Atomic Accessibility Compliance Pipeline](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6071287872)
- **AI Accessibility Research Document:** [Link](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6154649704/AI+accessibility+Research+Document)
- **Temporal Monitoring:** [docs/temporal-monitoring-confluence.md](temporal-monitoring-confluence.md)
- **WCAG 2.2 criterion 4.1.2:** [Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value)
- **WCAG 2.2 criterion 4.1.3:** [Status Messages](https://www.w3.org/TR/WCAG22/#status-messages)
