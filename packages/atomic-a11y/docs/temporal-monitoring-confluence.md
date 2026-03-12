# Accessibility Temporal Monitoring

| **Team** | DXUI |
| --- | --- |
| **Primary author** | Yassine Lakhdar |
| **Status** | DRAFT |
| **Created** | 2026-03-12 |
| **Parent RFC** | [Atomic Accessibility Compliance Pipeline](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6071287872) |
| **Related** | [AI Accessibility Research Document](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6154649704/AI+accessibility+Research+Document) |

---

## 1. Overview

This page documents the **temporal monitoring** enhancement to the AI accessibility audit pipeline in `@coveo/atomic-a11y`. The change replaces a polling-based snapshot capture of `aria-live` regions with a MutationObserver-based approach that records every DOM mutation with high-resolution timestamps.

**What changed:** The `captureLiveRegionAnnouncements()` function in `src/audit/browser-capture.ts` no longer polls for text changes over a deadline. Instead, it injects a MutationObserver into the browser page before the interaction, records all mutations to `[aria-live]` elements with `performance.now()` timestamps, and collects them after the interaction settles.

**Why it matters:** The AI agent can now evaluate WCAG 4.1.3 (Status Messages) using actual announcement timing, ordering, and content — not just a before/after text diff. This narrows one of the key gaps identified in the parent RFC's "Screen Reader Testing" analysis.

---

## 2. Background: The AI Audit Pipeline

The [parent RFC](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6071287872) established a 5-layer compliance model for WCAG 2.2 AA coverage across Coveo Atomic's ~145 components:

| Layer | Name | What It Does | Coverage |
| --- | --- | --- | --- |
| 0 | N/A Overrides | Marks criteria that don't apply to Atomic's component library (audio, video, timing, authentication, page-level navigation) | 15 criteria |
| 1 | Axe-core | Automated static analysis during Storybook test runs | ~19 criteria |
| 2 | Manual Audit | Human QA reviewers evaluate criteria via delta files | Supplements all layers |
| 3 | **AI Audit** | Playwright evidence capture + GPT-4o evaluation | **22 criteria** (19 LLM + 3 static N/A) |
| 4 | Human QA | Screen reader testing, runtime behavior verification | Remaining ~30-40% of SR concerns |

The [AI Accessibility Research Document](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6154649704/AI+accessibility+Research+Document) details the full Layer 3 implementation. Key points relevant to temporal monitoring:

- The AI agent captures **7 types of browser evidence** per component using Playwright: default viewport screenshots, ARIA accessibility tree snapshots, hover state diffs, multi-viewport screenshots, text spacing resilience, focus state captures, and target size measurements.
- Evidence capture is **deterministic and upfront** — all browser interactions happen before any LLM call, ensuring reproducible inputs.
- Each component is evaluated through **2 LLM calls** (16 criteria + 3 viewport criteria) plus 3 static N/A assignments, totaling 22 criteria.
- Three **enhanced capture layers** extend the base evidence: multi-story capture (Layer 1), ARIA-role interaction protocols (Layer 2), and play function enrichment (Layer 3).

The ARIA-role interaction protocols (Layer 2) are where live region capture fits. When the agent discovers components with `aria-live` regions and matching interaction protocols, it performs a deterministic action (e.g., click "Next" on a pager, type in a facet search, or observe content on page load) and captures the live region response.

---

## 3. Problem Statement: Why Temporal Monitoring is Needed

### The old approach: Polling-based snapshot capture

The previous `captureLiveRegionAnnouncements()` implementation used a polling loop with `Date.now()` against a deadline:

1. **Before interaction**: Snapshot the `textContent` of all `[aria-live]` elements.
2. **Perform interaction**: Click the protocol's target element (e.g., pagination "Next" button).
3. **Poll for changes**: Loop with `Date.now()` checks against a ~1500ms deadline, repeatedly reading `textContent` of live regions until a change is detected or the deadline expires.
4. **Return result**: Report the final text content as the "announcement."

This approach had several fundamental limitations:

**Only the final state was captured.** If a single click triggered multiple sequential announcements — for example, the pager's live region updating from "" → "Loading..." → "Results 11 to 20 of 150" → "" (debounce clear) → "Page 2 of 15" — the polling loop would only capture the text at the moment it detected a change or the deadline expired. Intermediate announcements were invisible.

**No timing information.** The polling loop could detect *that* a change happened, but not *when* relative to the interaction. A screen reader user's experience depends heavily on timing — an announcement that fires 50ms after a click feels responsive; one that fires 2000ms later feels broken.

**No ordering guarantees.** When multiple live regions update (e.g., both an `assertive` error region and a `polite` status region), the polling approach had no way to determine which updated first.

**Debounce noise.** Coveo Atomic's `AtomicAriaLive` component uses a 500ms debounced queue that clears region text between announcements. The polling loop could accidentally capture an empty string during a debounce clear and report "no change detected" when an announcement was actually in progress.

**Implementation issues.** The old code used a `first()` cast hack on `PlaywrightLocator` (not available on the interface), and the `deadline/Date.now()` polling pattern was brittle and hard to tune.

### What the RFC identified

The parent RFC's "Screen Reader Testing" section explicitly catalogued what the AI cannot evaluate:

> **Announcement timing and content**: When VoiceOver announces "3 results found," the actual announcement text, timing, and interruption behavior depend on the screen reader's internal logic. The ARIA tree shows `aria-live="polite"` exists, but not whether the announcement actually fires, what text is spoken, or whether it interrupts the current utterance.

> **Announcement on dynamic updates**: When a facet count changes from "5" to "3" after a search, whether the screen reader announces this change depends on `aria-live` region configuration, the screen reader's debouncing logic, and the timing of DOM mutations. The AI can verify the `aria-live` attribute exists but cannot verify the announcement actually occurs.

Temporal monitoring addresses the DOM-side of both concerns. While we still cannot observe what the screen reader actually speaks, we can now capture the full timeline of DOM mutations that the screen reader would consume — significantly better evidence for the LLM to evaluate.

### WCAG 4.1.3: Status Messages

WCAG 2.2 criterion 4.1.3 states:

> In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus.

Evaluating this criterion requires understanding not just that a live region exists, but that:
- The correct text appears in the live region after an interaction.
- Announcements fire in a logical order (e.g., result count before page description).
- Announcements happen within a reasonable time after the user action.
- The `aria-live` priority level (`polite` vs `assertive`) is appropriate for the content.

The old polling approach could only verify "a live region exists and its text changed." Temporal monitoring provides the full mutation timeline needed for meaningful evaluation.

---

## 4. Proposal: MutationObserver-Based Temporal Capture

### Core idea

Replace the `Date.now()` polling loop with a `MutationObserver` injected into the browser page. The observer watches all `[aria-live]` elements for DOM mutations and records each one with a `performance.now()` timestamp relative to the observer's start time. After the interaction and a settling period, all recorded mutations are collected, the observer is disconnected, and browser globals are cleaned up.

### Observer lifecycle

The temporal capture follows a 5-step lifecycle for interaction-triggered protocols:

```
┌──────────────────────────────────────────────────────────────────┐
│             Interaction Capture Lifecycle                         │
│                                                                   │
│  1. START OBSERVER                                                │
│     └─ Inject MutationObserver via page.evaluate()                │
│     └─ Initialize window.__ariaLiveMutations = []                 │
│     └─ Record startTime = performance.now()                       │
│     └─ Query all [aria-live] elements                             │
│     └─ Observe each with { childList, characterData, subtree }    │
│     └─ Store observer ref: window.__ariaLiveObserver              │
│                                                                   │
│  2. TRIGGER INTERACTION                                           │
│     ├─ If keys present: focus element → press each key            │
│     │   (150ms gap between key presses)                           │
│     └─ If no keys: click the target element                       │
│     └─ Observer records mutations as they happen                  │
│                                                                   │
│  3. SETTLE (800ms)                                                │
│     └─ await new Promise(r => setTimeout(r, 800))                 │
│     └─ Allows debounced announcements to complete                 │
│     └─ AtomicAriaLive has a 500ms debounced queue                 │
│     └─ 800ms = 500ms debounce + 300ms buffer                     │
│                                                                   │
│  4. COLLECT MUTATIONS                                             │
│     └─ Retrieve window.__ariaLiveMutations via page.evaluate()    │
│     └─ Disconnect observer                                        │
│     └─ Delete window.__ariaLiveMutations                          │
│     └─ Delete window.__ariaLiveObserver                           │
│     └─ Action name = "role/action-name" (e.g., "pagination/       │
│        click-next")                                               │
│                                                                   │
│  5. MAP TO LiveRegionChange[]                                     │
│     └─ Round offsetMs to integer                                  │
│     └─ Set action = "role/action-name" from protocol              │
│     └─ Build selector from region ID                              │
│     └─ Extract regionName from ID via regex                       │
│     └─ Preserve ariaLive priority level                           │
│     └─ Set source = 'interaction'                                 │
│                                                                   │
│  5b. ZERO-MUTATION SENTINEL (if no mutations collected)           │
│      └─ Create a single LiveRegionChange with:                    │
│         noAnnouncement: true, source: 'interaction'               │
│      └─ Ensures the LLM sees the attempt even when silent         │
└──────────────────────────────────────────────────────────────────┘
```

For **on-load protocols** (passive observation), a separate flow reads existing DOM content without triggering any interaction:

```
┌──────────────────────────────────────────────────────────────────┐
│               On-Load Capture Lifecycle                           │
│                                                                   │
│  captureOnLoadLiveRegions(page, protocols)                        │
│                                                                   │
│  For each protocol where action.name === 'observe-load':          │
│  1. Locate element via liveRegionSelector                         │
│  2. Check if element exists and is visible                        │
│  3. Read textContent                                              │
│  4. Record LiveRegionChange with:                                 │
│     └─ action = "role/observe-load"                               │
│     └─ source = 'on-load'                                         │
│     └─ noAnnouncement = true if empty/missing/invisible           │
│     └─ announcementText = trimmed text content if present         │
└──────────────────────────────────────────────────────────────────┘
```

### How the MutationObserver works in the browser

The observer is injected as a single `page.evaluate()` call. Inside the browser context:

1. **Initialize storage**: `window.__ariaLiveMutations = []` — an array that persists across observer callbacks.
2. **Record start time**: `const startTime = performance.now()` — all mutation timestamps are relative to this.
3. **Discover live regions**: `document.querySelectorAll('[aria-live]')` — finds all elements with explicit `aria-live` attributes. If none are found, the function returns early (no-op).
4. **Create observer**: A single `MutationObserver` instance processes all mutations.
5. **Observe each element**: Each live region element is observed with `{ childList: true, characterData: true, subtree: true }`.

For each mutation callback:

- **Resolve target element**: For `characterData` mutations (text node changes), the target is a `Text` node — we walk up to `parentElement`. For `childList` mutations, the target is already an `Element`.
- **Determine `aria-live` value**: Check the target element's `aria-live` attribute first. If not found, walk up the DOM via `closest('[aria-live]')`. Fall back to `'polite'` if neither is found.
- **Extract text content**: `target.textContent?.trim() ?? ''`. **Skip if empty** — this filters out the debounce clearing noise from AtomicAriaLive.
- **Extract region name**: Parse the element's `id` (or nearest ancestor's `id`) using the regex `atomic-aria-live-[^-]+-(.+)` to get the semantic name (e.g., `"atomic-pager"`, `"breadbox"`, `"search-box"`). Fall back to `'unknown'`.
- **Record mutation**: Push `{ text, regionId, regionName, ariaLive, offsetMs: performance.now() - startTime }` to the array.

### Key design decisions

**Self-contained lifecycle.** The `captureLiveRegionAnnouncements()` wrapper function handles the entire start → interact → settle → collect flow internally for each protocol. The caller (`ai-wcag-audit.ts`) simply passes a page and protocol — it doesn't need to manage observer state.

An alternative considered was splitting start/collect across the caller (start observer in the protocol loop, collect after all interactions). This was rejected because each protocol should have independent temporal context — mixing mutations from different interactions would make the data meaningless.

**Empty text filtering.** AtomicAriaLive uses a 500ms debounced queue that works by:
1. Receiving an announcement message.
2. Clearing the region text (setting `textContent = ""`).
3. After 500ms of no new announcements, setting the new text.

Without filtering, the observer would record a mutation for step 2 (empty text) that adds noise to the LLM prompt. The `if (!text) continue` check in the observer callback eliminates this.

**Graceful failure.** Both `startLiveRegionObserver()` and `collectLiveRegionMutations()` wrap their entire body in `try/catch {}` with empty catch blocks. This follows the project convention that the reporter/audit agent never throws — a failure in live region capture should not prevent other evidence capture or LLM evaluation from proceeding. The wrapper function `captureLiveRegionAnnouncements()` also catches errors and returns `{ liveRegionChanges: [], summary: "Live region capture failed: ..." }`.

**Region name extraction via regex.** Coveo Atomic components use a predictable ID format for live regions: `atomic-aria-live-{randomId}-{regionName}`. The random ID segment prevents collisions when multiple instances of the same component exist on a page. The regex `atomic-aria-live-[^-]+-(.+)` captures everything after the random segment as the semantic name. This is more robust than parsing specific component names because it automatically handles any future component that uses the AtomicAriaLive infrastructure.

**800ms settle time.** The settle wait (`800ms`) was chosen as `500ms debounce queue + 300ms buffer`. This is a heuristic — it's long enough for AtomicAriaLive's debounced queue to flush but short enough to keep the audit fast. Components with longer async operations (e.g., API calls that take 1-2 seconds) may need longer waits, which is noted as a known limitation.

**Action attribution.** The `collectLiveRegionMutations()` function accepts an `actionName` parameter (e.g., `"pagination/click-next"`) instead of hardcoding `'live-region-update'`. This allows the LLM to see exactly which protocol action triggered each mutation, making it easier to correlate announcements with their cause.

**Zero-mutation sentinels.** When an interaction produces no mutations, a sentinel `LiveRegionChange` entry is created with `noAnnouncement: true`. This ensures the LLM sees every attempted protocol — including ones where the component failed to announce. Without sentinels, the LLM would have no evidence that the interaction was attempted, and could not flag missing announcements.

**On-load capture.** Some live region content (query summaries, error messages, generated answers) is present on page load without requiring user interaction. The `captureOnLoadLiveRegions()` function reads this content directly from the DOM, avoiding unnecessary MutationObserver overhead. These entries use `source: 'on-load'` to distinguish them from interaction-triggered mutations in the LLM prompt.

---

## 5. Implementation Details

### Data structures

The `LiveRegionChange` interface in `src/audit/types.ts` represents a single captured mutation:

```typescript
export interface LiveRegionChange {
  action: string;              // "role/action-name" (e.g., "pagination/click-next")
  selector: string;            // CSS selector: [id="<regionId>"]
  regionName: string;          // Semantic name extracted from ID (e.g., "atomic-pager")
  announcementText: string;    // The text content of the live region at mutation time
  ariaLive: 'polite' | 'assertive'; // The aria-live priority level
  offsetMs: number;            // Milliseconds since observer start (rounded integer)
  noAnnouncement?: boolean;    // true = zero-mutation sentinel or empty on-load content
  source?: 'interaction' | 'on-load'; // How this entry was captured
}
```

The `LiveRegionCaptureResult` wraps the changes with a human-readable summary:

```typescript
export interface LiveRegionCaptureResult {
  liveRegionChanges: LiveRegionChange[];
  summary: string;  // e.g., "Captured 3 live region announcement(s)"
}
```

### Exported functions

Four functions in `src/audit/browser-capture.ts` implement the temporal capture:

#### `startLiveRegionObserver(page: PlaywrightPage): Promise<void>`

Injects the MutationObserver into the browser page. This function:

- Creates `window.__ariaLiveMutations = []` to store mutations.
- Records `startTime = performance.now()` for relative timestamps.
- Finds all `[aria-live]` elements on the page. Returns early if none exist.
- Creates a `MutationObserver` that, for each mutation:
  - Resolves the target `Element` (handling `characterData` Text node mutations).
  - Reads the `aria-live` attribute from the target or its closest ancestor.
  - Reads `textContent`, skips if empty.
  - Extracts the region name from the element's `id`.
  - Pushes the mutation data with `offsetMs` to the array.
- Observes each live region element with `{ childList: true, characterData: true, subtree: true }`.
- Stores the observer reference as `window.__ariaLiveObserver`.

Wrapped in `try/catch {}` — silently no-ops on failure.

#### `collectLiveRegionMutations(page: PlaywrightPage, actionName: string): Promise<LiveRegionChange[]>`

Retrieves recorded mutations from the browser page and cleans up. This function:

- Reads `window.__ariaLiveMutations` via `page.evaluate()`.
- Disconnects the observer via `window.__ariaLiveObserver.disconnect()`.
- Deletes both `window.__ariaLiveMutations` and `window.__ariaLiveObserver`.
- Maps raw browser-side objects to `LiveRegionChange[]`:
  - Sets `action` to the provided `actionName` (e.g., `"pagination/click-next"`).
  - Builds `selector: [id="${m.regionId}"]`.
  - Preserves `regionName`, `announcementText`, `ariaLive`.
  - Rounds `offsetMs` via `Math.round()`.
  - Sets `source: 'interaction'`.

Returns `[]` on any error.

#### `captureLiveRegionAnnouncements(page, protocol): Promise<LiveRegionCaptureResult>`

The high-level wrapper that orchestrates the full interaction capture lifecycle:

```typescript
export async function captureLiveRegionAnnouncements(
  page: PlaywrightPage,
  protocol: InteractionProtocol
): Promise<LiveRegionCaptureResult> {
  try {
    await startLiveRegionObserver(page);
    const action = protocol.actions[0];
    if (action && action.name === 'observe-load') {
      // On-load protocols are handled by captureOnLoadLiveRegions(), not here
      return {liveRegionChanges: [], summary: 'On-load protocol — skipped in interaction capture'};
    }
    if (action && action.keys.length > 0) {
      const el = page.locator(protocol.selector).nth(0);
      await el.focus();
      await page.waitForTimeout(200);
      for (const key of action.keys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(150);
      }
    } else {
      await page.locator(protocol.selector).nth(0).click();
    }
    await new Promise<void>((r) => setTimeout(r, 800));
    let liveRegionChanges = await collectLiveRegionMutations(
      page,
      `${protocol.role}/${protocol.actions[0]?.name ?? 'unknown'}`
    );

    if (liveRegionChanges.length === 0) {
      liveRegionChanges = [
        {
          action: `${protocol.role}/${protocol.actions[0]?.name ?? 'unknown'}`,
          selector: protocol.liveRegionSelector ?? protocol.selector,
          regionName: protocol.role,
          announcementText: '',
          ariaLive: 'polite',
          offsetMs: 0,
          noAnnouncement: true,
          source: 'interaction',
        },
      ];
    }

    const summary =
      liveRegionChanges.length > 0 && !liveRegionChanges[0].noAnnouncement
        ? `Captured ${liveRegionChanges.length} live region announcement(s)`
        : `No live region announcement detected after ${protocol.role}/${protocol.actions[0]?.name ?? 'unknown'}`;

    return {liveRegionChanges, summary};
  } catch (error) {
    return {
      liveRegionChanges: [],
      summary: `Live region capture failed: ${String(error)}`,
    };
  }
}
```

Key changes from the original temporal monitoring implementation:
- **Action attribution**: Uses `"role/action-name"` format instead of hardcoded `'live-region-update'`.
- **Keyboard support**: Protocols with `keys` trigger `focus → keyboard.press()` sequences (with 150ms gaps) instead of always clicking.
- **On-load skip**: Protocols with `observe-load` action are returned early — they are handled by `captureOnLoadLiveRegions()`.
- **Zero-mutation sentinel**: When no mutations are detected, a sentinel entry with `noAnnouncement: true` is created.

#### `captureOnLoadLiveRegions(page, protocols): Promise<LiveRegionChange[]>`

Captures live region content that is present on page load without triggering any interaction:

```typescript
export async function captureOnLoadLiveRegions(
  page: PlaywrightPage,
  protocols: InteractionProtocol[]
): Promise<LiveRegionChange[]> {
  try {
    const results: LiveRegionChange[] = [];
    const onLoadProtocols = protocols.filter(
      (p) => p.actions.length > 0 && p.actions[0].name === 'observe-load'
    );

    for (const protocol of onLoadProtocols) {
      const selector = protocol.liveRegionSelector ?? protocol.selector;
      const locator = page.locator(selector);
      const count = await locator.count();

      if (count === 0) {
        results.push({ /* noAnnouncement: true, source: 'on-load' */ });
        continue;
      }

      const el = locator.nth(0);
      const isVisible = await el.isVisible();

      if (!isVisible) {
        results.push({ /* noAnnouncement: true, source: 'on-load' */ });
        continue;
      }

      const textContent = (await el.textContent()) ?? '';

      if (textContent.trim() === '') {
        results.push({ /* noAnnouncement: true, source: 'on-load' */ });
      } else {
        results.push({
          action: `${protocol.role}/observe-load`,
          selector,
          regionName: protocol.role,
          announcementText: textContent.trim(),
          ariaLive: 'polite',
          offsetMs: 0,
          noAnnouncement: false,
          source: 'on-load',
        });
      }
    }

    return results;
  } catch (error) {
    return [];
  }
}
```

This function is called before the interaction capture loop in `ai-wcag-audit.ts`, so on-load content is captured before any protocol interactions might alter the page state.

### Caller context

The caller in `src/audit/ai-wcag-audit.ts` orchestrates both on-load and interaction capture. It filters `INTERACTION_PROTOCOLS` for entries with `expectsLiveRegion: true`, runs on-load capture first, then iterates per-protocol for interaction capture, and merges all results:

```typescript
const liveRegionProtocols = INTERACTION_PROTOCOLS.filter(
  (p) => p.expectsLiveRegion === true
);
const liveRegionResults: LiveRegionCaptureResult[] = [];
const onLoadChanges = await captureOnLoadLiveRegions(page, liveRegionProtocols);

for (const protocol of liveRegionProtocols) {
  const result = await captureLiveRegionAnnouncements(page, protocol);
  liveRegionResults.push(result);
}

const allChanges = [
  ...onLoadChanges,
  ...liveRegionResults.flatMap((r) => r.liveRegionChanges),
];

const combinedLiveRegion: LiveRegionCaptureResult = {
  liveRegionChanges: allChanges,
  summary: allChanges.length > 0
    ? `Captured ${allChanges.length} live region announcement(s)${temporalRange}`
    : 'No live region announcements captured',
};
```

---

## 6. Interaction Protocols (Live Region)

Fourteen interaction protocols define the live region scenarios the agent tests. Each protocol specifies what action to perform and where to look for the announcement:

| # | Protocol | Role | Action Type | Action Name | Trigger Selector | Live Region Selector | What It Tests |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Pagination | `pagination` | Click | `click-next` | `atomic-pager button[aria-label="Next"]` | `atomic-aria-live div[id*="atomic-pager"]` | Clicks the "Next" page button. Expects the pager's live region to announce the new result range. |
| 2 | Breadcrumb removal | `breadcrumb-removal` | Click | `remove-filter` | `atomic-breadbox button[aria-label*="Remove"]` | `atomic-aria-live div[id*="breadbox"]` | Clicks a breadcrumb filter's remove button. Expects the breadbox's live region to announce the updated result count. |
| 3 | Search clear | `search-clear` | Click | `clear-search` | `atomic-search-box button[aria-label*="clear" i]` | `atomic-aria-live div[id*="search-box"]` | Clicks the search box's clear button. Expects the search box's live region to announce the result update. |
| 4 | Recent queries clear | `recent-queries-clear` | Click | `clear-recent-queries` | `[aria-label*="Clear recent searches"]` | `atomic-aria-live div[id*="search-box"]` | Clicks the "Clear recent searches" button. Expects the search box's live region to announce the cleared state. |
| 5 | Query summary | `query-summary` | On-load | `observe-load` | `atomic-query-summary` | `atomic-aria-live div[id*="query-summary"]` | Checks if the query summary live region has content after page load. |
| 6 | No results | `no-results` | On-load | `observe-load` | `atomic-no-results` | `atomic-aria-live div[id*="no-results"]` | Checks if the no-results message is present after page load. |
| 7 | Query error | `query-error` | On-load | `observe-load` | `atomic-query-error` | `atomic-aria-live div[id*="query-error"]` | Checks if the query error message is present after page load. |
| 8 | Generated answer | `generated-answer` | On-load | `observe-load` | `atomic-generated-answer` | `atomic-aria-live div[id*="generated-answer"]` | Checks if the generated answer content is present after page load. |
| 9 | Notifications | `notifications` | On-load | `observe-load` | `atomic-notifications` | `atomic-aria-live div[id*="notifications"]` | Checks if notification content is present after page load. |
| 10 | Facet search | `facet-search` | Keyboard | `search-facet` | `atomic-facet input[type="search"]` | `atomic-aria-live div[id*="facet"]` | Types "abc" in the facet search input. Expects the facet's live region to announce filtered results. |
| 11 | Category facet select | `category-facet-select` | Keyboard | `select-category` | `atomic-category-facet button[part="value-label"]` | `atomic-aria-live div[id*="facet"]` | Presses Enter on a category facet value. Expects the facet's live region to announce the selection. |
| 12 | Color facet select | `color-facet-select` | Keyboard | `select-color` | `atomic-color-facet button[part="value-label"]` | `atomic-aria-live div[id*="facet"]` | Presses Enter on a color facet value. Expects the facet's live region to announce the selection. |
| 13 | Search suggestions | `search-suggestions` | Keyboard | `navigate-suggestions` | `atomic-search-box input` | `atomic-aria-live div[id*="suggestions"]` | Presses ArrowDown×2 in the search input. Expects the suggestions live region to announce navigation. |
| 14 | Quickview | `quickview` | Keyboard | `open-quickview` | `atomic-quickview button` | `atomic-aria-live div[id*="quickview"]` | Presses Enter on the quickview button. Expects the quickview's live region to announce opening. |

All protocols share the same structure:

```typescript
{
  role: 'pagination',
  selector: 'atomic-pager button[aria-label="Next"]',
  stateAttributes: [],
  expectsLiveRegion: true,
  liveRegionSelector: 'atomic-aria-live div[id*="atomic-pager"]',
  actions: [{name: 'click-next', keys: [], focusFirst: false}],
}
```

Protocol action types:
- **Click protocols** (1-4): `keys: []` — the function falls through to `.click()`.
- **On-load protocols** (5-9): `action.name === 'observe-load'` — handled by `captureOnLoadLiveRegions()`, skipped in interaction capture.
- **Keyboard protocols** (10-14): `keys: ['a', 'b', 'c']` or `keys: ['Enter']` or `keys: ['ArrowDown', 'ArrowDown']` — the function focuses the element and presses each key with 150ms gaps.

The `expectsLiveRegion: true` flag signals the orchestrator to call `captureLiveRegionAnnouncements()` for this protocol (and excludes it from Pipeline A's `captureInteractionStates()`). The `liveRegionSelector` provides context but the MutationObserver watches all `[aria-live]` elements regardless.

---

## 7. LLM Integration: How Temporal Data Reaches the AI

### Prompt formatting

The temporal data is formatted into the LLM evaluation prompt in `src/audit/prompts.ts`. When `liveRegionData.liveRegionChanges` is non-empty, the prompt includes a "Live Region Announcements" section:

```
## Live Region Announcements
- At +45ms after [pagination/click-next]: region "atomic-pager" announced "Results 11 to 20 of 150" (aria-live=polite)
- At +520ms after [pagination/click-next]: region "atomic-pager" announced "Page 2 of 15, showing results 11 to 20" (aria-live=polite)
- [On page load]: region "query-summary" announced "147 results" (aria-live=polite)
- After [facet-search/search-facet]: region "facet" — **No announcement detected** (aria-live=polite)
```

The formatting template handles three cases:

```typescript
${liveRegionData.liveRegionChanges.map((c) => {
  if (c.noAnnouncement) {
    return `- After [${c.action}]: region "${c.regionName}" — **No announcement detected** (aria-live=${c.ariaLive})`;
  }
  const prefix = c.source === 'on-load'
    ? '[On page load]'
    : c.offsetMs ? `At +${c.offsetMs}ms after [${c.action}]` : `After [${c.action}]`;
  return `- ${prefix}: region "${c.regionName}" announced "${c.announcementText}" (aria-live=${c.ariaLive})`;
}).join('\n')}
```

- **Interaction captures with timing**: `At +{offsetMs}ms after [{action}]: region "{name}" announced "{text}" (aria-live={level})`
- **On-load captures**: `[On page load]: region "{name}" announced "{text}" (aria-live={level})`
- **Zero-mutation sentinels**: `After [{action}]: region "{name}" — **No announcement detected** (aria-live={level})`

When no live region changes are detected at all, the section is omitted entirely from the prompt.

### What the LLM receives

For each component with live region protocols, the LLM prompt includes the temporal data alongside all other evidence (screenshots, ARIA snapshots, hover states, etc.). The LLM uses this to evaluate criterion 4.1.3 (Status Messages) with the following information:

| Data Point | What the LLM Can Assess |
| --- | --- |
| **Temporal ordering** | Whether announcements appear in a logical sequence (e.g., result count before page description) |
| **Timing** (`offsetMs`) | Whether announcements fire promptly after the interaction (45ms = responsive, 3000ms = concerning) |
| **Region identification** (`regionName`) | Whether the correct component region is announcing (pager region for pager actions, not search region) |
| **Priority level** (`ariaLive`) | Whether the priority is appropriate — `assertive` for urgent interruptions, `polite` for routine status updates |
| **Announcement content** (`announcementText`) | Whether the text is meaningful, descriptive, and matches the visual state change |
| **Mutation count** | Whether the component produces too many announcements (chatty) or too few (silent) |
| **Action attribution** (`action`) | Which specific user action triggered each announcement (e.g., "pagination/click-next" vs "search-clear/clear-search") |
| **Missing announcements** (`noAnnouncement`) | Whether the component failed to announce after an attempted interaction |
| **On-load content** (`source`) | Whether live regions have meaningful initial content without requiring user interaction |

### Example: What the LLM sees for a pagination interaction

```
## Live Region Announcements
- [On page load]: region "query-summary" announced "147 results" (aria-live=polite)
- At +38ms after [pagination/click-next]: region "atomic-pager" announced "Page 2, Results 11 to 20 of 147 results" (aria-live=polite)
- After [facet-search/search-facet]: region "facet" — **No announcement detected** (aria-live=polite)
```

The LLM can then evaluate:
- The query summary announces on page load (live region is functional at initialization).
- The pagination announcement exists and fires quickly (38ms after click = responsive).
- The text is descriptive ("Page 2, Results 11 to 20 of 147 results" — includes page number, range, and total).
- The priority is appropriate (`polite` — result count update shouldn't interrupt current speech).
- The correct region announced (`atomic-pager` region, not some other component).
- The facet search produced no announcement, which the LLM can flag as a potential 4.1.3 failure.

---

## 8. AtomicAriaLive Component Context

Understanding the temporal capture requires understanding how Coveo Atomic's live region infrastructure works.

### Architecture

The `AtomicAriaLive` component is a Lit web component that manages accessibility announcements for all Atomic components. Key characteristics:

- **Light DOM rendering**: Unlike most Atomic components that use Shadow DOM, `AtomicAriaLive` renders its content in the light DOM. This is required because screen readers may not reliably detect `aria-live` changes inside Shadow DOM boundaries.
- **Dual regions**: The component maintains two `<div>` elements — one with `aria-live="polite"` and one with `aria-live="assertive"`.
- **ID format**: Each region's ID follows the pattern `atomic-aria-live-{randomId}-{regionName}`, where `randomId` prevents collisions when multiple instances exist and `regionName` identifies the semantic purpose (e.g., `"atomic-pager"`, `"breadbox"`, `"search-box"`).
- **Debounced queue**: Announcements are batched through a 500ms debounced queue. When a new announcement arrives:
  1. The region text is cleared (set to empty string).
  2. After 500ms of no new announcements, the final text is set.
  
  This debouncing prevents screen reader chatter when rapid updates occur (e.g., multiple facet selections in quick succession).

### Why the debounce matters for temporal capture

The 500ms debounce creates a clear → wait → set pattern that produces empty-text mutations. Without filtering, the observer would record:

```
+0ms: "" (clear)
+502ms: "3 results found" (final announcement)
```

The empty mutation at +0ms is noise — it represents the clearing step, not a meaningful announcement. The observer's `if (!text) continue` filter eliminates this, so only the meaningful mutation is recorded:

```
+502ms: "3 results found"
```

### Which components use live regions

Components that dispatch announcement messages to AtomicAriaLive include:
- `atomic-pager` — Result range and page navigation announcements.
- `atomic-breadbox` — Filter addition/removal result count updates.
- `atomic-search-box` — Query-related status announcements.
- `atomic-query-summary` — Result count summary on page load.
- `atomic-no-results` — "No results found" messages.
- `atomic-query-error` — Error messages on failed queries.
- `atomic-generated-answer` — AI-generated answer content.
- `atomic-notifications` — System notification messages.
- `atomic-facet` / `atomic-category-facet` / `atomic-color-facet` — Facet filtering result updates.
- `atomic-quickview` — Quickview panel opening announcements.
- Various result list components — Result count updates after search execution.

---

## 9. Before vs After Comparison

| Aspect | Before (Polling) | After (MutationObserver + Action Attribution) |
| --- | --- | --- |
| **Capture method** | `Date.now()` polling loop against ~1500ms deadline | `MutationObserver` with `performance.now()` relative timestamps |
| **Intermediate announcements** | Only final state captured — intermediate mutations invisible | Every mutation recorded in DOM order |
| **Timing data** | None — only knows "change detected within deadline" | Precise `offsetMs` per mutation, relative to observer start |
| **Announcement ordering** | Cannot determine which region updated first | Mutations recorded in actual DOM event order |
| **Empty text noise** | Could capture empty string during debounce clear | Filtered out — `textContent.trim()` empty check |
| **Region identification** | Generic selector matching against `[aria-live]` | Semantic name extracted from ID via regex |
| **aria-live priority** | Hardcoded `'polite'` for all | Reads actual attribute from element or nearest ancestor |
| **Action attribution** | None — all actions labeled `'live-region-update'` | Specific `"role/action-name"` per protocol (e.g., `"pagination/click-next"`) |
| **Interaction types** | Click only | Click, keyboard sequences (focus + key presses), and on-load observation |
| **Missing announcements** | Silent — no evidence of attempted interaction | Zero-mutation sentinels with `noAnnouncement: true` |
| **On-load content** | Not captured | Captured via `captureOnLoadLiveRegions()` with `source: 'on-load'` |
| **Protocol count** | 4 protocols (click-only) | 14 protocols (4 click + 5 on-load + 5 keyboard) |
| **Error handling** | Polling could hang until deadline on edge cases | Observer disconnects + cleans up after collection |
| **Locator API** | Used `first()` cast hack not on PlaywrightLocator interface | Uses `nth(0)` which is available on the interface |
| **LLM evaluation quality** | "Live region text changed from X to Y" | "At +38ms after [pagination/click-next]: region 'pager' announced 'Page 2, Results 11-20 of 147' (polite)" |
| **WCAG 4.1.3 coverage** | Can detect that a live region exists and its text changed | Can evaluate announcement timing, ordering, content, priority, action attribution, and missing announcements |

---

## 10. Limitations and Future Work

### Current limitations

**Not actual screen reader output.** MutationObserver captures DOM mutations — the raw events that screen readers consume. But the actual announcement text, timing, interruption behavior, and verbosity settings are determined by each screen reader's internal logic. VoiceOver, NVDA, and JAWS may each process the same DOM mutation differently. Temporal monitoring provides better evidence than polling, but verifying actual screen reader behavior still requires Layer 4 (human QA with a real screen reader).

**800ms settle time is a heuristic.** The 800ms wait was calibrated for AtomicAriaLive's 500ms debounce queue plus a 300ms buffer. Components that trigger async operations (API calls, animations) before updating their live region may announce after the collection window closes. These announcements would be missed.

**Single-action protocols only.** Each protocol performs exactly one action (click, keyboard sequence, or on-load observation). Multi-step interaction sequences — for example, type a query → wait for autocomplete → select a suggestion → verify the search results announcement — are not yet supported. The observer lifecycle would need to be extended to span multiple interactions while maintaining clear temporal context per step.

**No assertive/polite priority simulation.** Screen readers treat `assertive` and `polite` regions differently: `assertive` interrupts the current utterance, while `polite` waits for a pause. The observer records the priority level but doesn't model how this affects the user's actual experience. The LLM has this data in the prompt and can reason about it, but it's reasoning from specification knowledge rather than observed behavior.

**Observer only watches existing elements.** `document.querySelectorAll('[aria-live]')` runs once at observer start. If a live region is dynamically added to the page after the observer starts (e.g., a lazy-loaded component), it won't be observed. For Atomic's current architecture where `AtomicAriaLive` renders early, this is not a practical concern.

**On-load capture is snapshot-based.** Unlike interaction capture which uses MutationObserver for temporal data, on-load capture reads `textContent` once. If the content updates shortly after page load (e.g., a generated answer streaming in), the initial snapshot may not reflect the final state.

### Potential future enhancements

- **Multi-step protocol sequences**: Extend the observer lifecycle to span multiple interactions with per-step timestamps.
- **Configurable settle times**: Allow protocols to specify custom wait times for components with longer async operations.
- **Mutation diffs**: Record old text → new text transitions for richer LLM context (e.g., "region text changed from 'Page 1' to 'Page 2'").
- **Play function integration**: Extend temporal capture to run during Storybook play functions, capturing announcements during developer-authored interaction sequences.
- **Aggregate temporal analysis**: Cross-component temporal analysis to detect conflicting announcements (two regions updating simultaneously) or announcement storms.
- **Commerce/Insight/Recs variants**: Extend protocols to cover commerce, insight, and recommendation search interface variants (currently search-only).

---

## 11. Connection to the Broader Strategy

### Layer 3 enhancement

Temporal monitoring is an incremental improvement to the AI audit agent (Layer 3). It does not introduce a new layer or change the pipeline's architecture. The same `captureLiveRegionAnnouncements()` function is called by the same orchestrator in the same place — the implementation evolved from polling to MutationObserver-based observation, and later gained action attribution, keyboard support, on-load capture, and zero-mutation sentinels.

### Narrowing the AI's gap

The parent RFC identified 5 categories of screen reader concerns the AI cannot evaluate:

1. **Announcement timing and content** — *Partially addressed by temporal monitoring*
2. **Screen reader interaction mode behavior** — Not addressed
3. **Announcement on dynamic updates** — *Partially addressed by temporal monitoring*
4. **Virtual cursor navigation** — Not addressed
5. **Shadow DOM boundary behavior** — Not addressed

For categories 1 and 3, the AI now has temporal DOM mutation data with action attribution. It can evaluate whether announcements fire promptly, in logical order, with appropriate content, priority, and tied to the correct user action. It can also flag missing announcements via zero-mutation sentinels. It still cannot verify that the screen reader actually speaks the text, or how it handles interruption and debouncing — but the structural evidence is significantly richer.

### Updated screen reader coverage

The RFC's Screen Reader Coverage Summary table should be updated:

| Category | Before Temporal Monitoring | After Temporal Monitoring |
| --- | --- | --- |
| **Live region presence** | Detects `aria-live` attribute exists (Medium confidence) | Detects attribute + evaluates announcement behavior via temporal data (Medium-High confidence) |
| **Announcement timing** | None — AI cannot evaluate | Partial — AI has `offsetMs` data, can assess responsiveness |
| **Announcement ordering** | None — AI cannot evaluate | Partial — AI sees mutation sequence, can assess logical order |
| **Action attribution** | None — all mutations labeled generically | Full — each mutation tied to specific protocol action |
| **Missing announcements** | None — silent failures invisible | Partial — zero-mutation sentinels expose attempted-but-silent interactions |
| **On-load content** | None — only interaction-triggered mutations | Partial — on-load capture reads initial live region content |

### Layer 4 still necessary

Temporal monitoring improves the AI's first-pass assessment but does not replace human QA with real screen readers. The following still require manual testing:

- Actual screen reader output matches expected text.
- `assertive` announcements correctly interrupt current speech.
- Announcements don't overlap or cause confusion.
- Cross-screen-reader compatibility (VoiceOver, NVDA, JAWS, TalkBack).
- Focus management after dynamic updates completes correctly.

---

## 12. References

- **Parent RFC**: [Atomic Accessibility Compliance Pipeline](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6071287872)
- **AI Accessibility Research Document**: [Link](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/6154649704/AI+accessibility+Research+Document)
- **Pipeline Architecture**: [docs/pipeline-architecture.md](pipeline-architecture.md)
- **Implementation branch**: `feat/a11y-audit-orchestrator`
- **Source files**:
  - `src/audit/browser-capture.ts` — Observer functions and capture implementations (748 lines)
  - `src/audit/types.ts` — `LiveRegionChange`, `LiveRegionCaptureResult` interfaces
  - `src/audit/prompts.ts` — LLM prompt temporal formatting (lines 182-193)
  - `src/audit/interaction-protocols.ts` — 14 live-region protocols (lines 356-468)
  - `src/audit/ai-wcag-audit.ts` — Orchestration: on-load capture (line 639), interaction loop (lines 649-652)
- **WCAG 2.2 criterion 4.1.3**: [Status Messages](https://www.w3.org/TR/WCAG22/#status-messages)
- **WAI-ARIA `aria-live`**: [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live)
- **MutationObserver API**: [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
