# WCAG 2.2 Manual Audit Checklist (Level A & AA)

This checklist covers the Web Content Accessibility Guidelines (WCAG) 2.2 Level A and AA criteria that cannot be fully or reliably tested by automated tools like `axe-core`. Automation typically catches 30-40% of accessibility issues; the remaining criteria require human judgment, interaction testing, and context analysis.

## Core Testing Tools

- **Keyboard Only**: Unplug mouse/trackpad.
- **Screen Readers**: VoiceOver (macOS/iOS), NVDA (Windows), JAWS (Windows), TalkBack (Android).
- **Browser Zoom**: 200% and 400% (Reflow).
- **Color Contrast Analyzers**: For gradients and complex backgrounds.
- **Accessibility Tree Inspector**: Browser DevTools (Chrome/Firefox/Edge).

---

## High-Priority Atomic Components

The following components use patterns that demand rigorous manual verification:

### 1. Components with `role="application"`

- **`atomic-search-box`**
- **`atomic-commerce-search-box`**
- _Context_: Applied to the suggestions popup. Disables screen reader browse mode shortcuts.
- _Test Priority_: Ensure all navigation (arrow keys) and selection (Enter) are handled explicitly and announced correctly.

### 2. Live Region Central Hub

- **`atomic-aria-live`**
- _Context_: Centralized manager for `aria-live` status messages.
- _Test Priority_: Verify that announcements for dynamic changes (search results count, errors, clear actions) actually trigger in screen readers.

### 3. Modals and Dialogs

- **`atomic-modal`** (incorporates `atomic-focus-trap`)
- _Test Priority_: Verify focus trapping, "Escape" key dismissal, and focus return to the trigger element.

### 4. Custom Interaction Widgets

- **`carousel`**
- _Test Priority_: Verify `aria-roledescription="carousel"` announcement and reachable controls.

---

## 1. Perceivable (Principle 1)

### 1.1.1 Non-text Content (Level A)

**Why Manual:** Axe checks for presence of `alt`, but not its accuracy or context.
**Test Procedure:**

1. Inspect images and verify `alt` text accurately describes the image's purpose.
2. Ensure decorative images have `alt=""` or `role="presentation"`.
3. Verify icons (e.g., in `atomic-icon`) have descriptive hidden text if they convey meaning.
   **Applicable Components:** `atomic-icon`, `atomic-result-image`, `atomic-search-box` (search button).

### 1.3.1 Info and Relationships (Level A)

**Why Manual:** Axe cannot verify if visual layout maps correctly to programmatic roles.
**Test Procedure:**

1. Verify that bolded text acting as a heading is coded as an `<h1-h6>`.
2. Check that grouped elements (like facets) use semantic lists or fieldsets.
3. Ensure visual relationships (e.g., a label next to a value) are programmatically linked.
   **Applicable Components:** `atomic-facet`, `atomic-result-list`, `atomic-layout`.

### 1.3.2 Meaningful Sequence (Level A)

**Why Manual:** DOM order might differ from visual order due to CSS (flexbox, grid, absolute positioning).
**Test Procedure:**

1. Disable CSS and verify the reading order remains logical.
2. Use a screen reader to navigate; ensure the sequence of information makes sense.
   **Applicable Components:** `atomic-layout`, `atomic-result-list` (with custom templates).

### 1.3.3 Sensory Characteristics (Level A)

**Why Manual:** Automation cannot understand textual instructions referring to visual cues.
**Test Procedure:**

1. Search for instructions like "Click the red button" or "See instructions on the right".
2. Ensure instructions do not rely solely on shape, size, visual location, or sound.
   **Applicable Components:** Documentation, tooltips, onboarding guides.

---

## 2. Operable (Principle 2)

### 2.1.1 Keyboard (Level A)

**Why Manual:** Axe cannot simulate full keyboard interaction flows.
**Test Priority: CRITICAL for `role="application"` components.**
**Test Procedure:**

1. Navigate the entire interface using only the `Tab` and `Shift+Tab` keys.
2. Verify all interactive elements (buttons, links, inputs, facets) are reachable.
3. Verify `atomic-search-box` suggestions can be navigated with `Arrow Keys` and selected with `Enter`.
   **Applicable Components:** `atomic-search-box`, `atomic-facet`, `atomic-modal`, `atomic-sort`.

### 2.1.2 No Keyboard Trap (Level A)

**Why Manual:** Requires interaction to see if focus gets "stuck".
**Test Procedure:**

1. Enter a modal or complex widget.
2. Ensure you can exit using only the keyboard (e.g., `Escape` or `Tab` to a close button).
   **Applicable Components:** `atomic-modal`, `atomic-focus-trap`.

### 2.4.3 Focus Order (Level A)

**Why Manual:** Axe cannot judge if the sequence of focus is "logical".
**Test Procedure:**

1. Tab through the page.
2. Ensure the focus moves in an order that preserves meaning and operability, usually top-to-bottom, left-to-right.
   **Applicable Components:** `atomic-layout`, `atomic-search-interface`.

### 2.4.7 Focus Visible (Level A)

**Why Manual:** Axe only checks if a focus style _exists_ in CSS; not if it is visible/distinguishable to a human.
**Test Procedure:**

1. Tab through the page.
2. Ensure every focused element has a highly visible indicator (e.g., a thick outline or high-contrast border).
   **Applicable Components:** All interactive components.

### 2.4.11 Focus Not Obscured (Minimum) (Level AA) - [NEW 2.2]

**Why Manual:** Automation cannot detect if sticky headers/footers or overlays cover a focused element.
**Test Procedure:**

1. Scroll through a page with sticky elements (e.g., a sticky search box or header).
2. Tab to elements that might be behind these sticky sections.
3. Verify the focused element is at least partially visible.
   **Applicable Components:** `atomic-search-box` (if sticky), `atomic-external-component`.

### 2.5.7 Dragging Movements (Level AA) - [NEW 2.2]

**Why Manual:** Axe cannot verify if a dragging action has a single-pointer alternative.
**Test Procedure:**

1. Identify any component requiring a dragging motion (e.g., sliders, reordering lists).
2. Ensure the same functionality is available via a single-pointer click (e.g., clicking on a slider track or using buttons).
   **Applicable Components:** Custom range sliders, reorderable result lists.

### 2.5.8 Target Size (Minimum) (Level AA) - [NEW 2.2]

**Why Manual:** Axe 4.8+ has a rule but often flags "Needs Review" due to spacing/context.
**Test Procedure:**

1. Verify all interactive targets are at least 24x24 CSS pixels.
2. Exception: If the target has sufficient spacing (at least 24px diameter from center of one to center of another).
   **Applicable Components:** `atomic-facet` checkboxes, `atomic-pager` buttons, `atomic-icon-button`.

---

## 3. Understandable (Principle 3)

### 3.2.6 Consistent Help (Level A) - [NEW 2.2]

**Why Manual:** Automation cannot verify consistency across multiple pages/views.
**Test Procedure:**

1. Locate "Help" mechanisms (Contact info, Chat, FAQ).
2. Ensure they are in the same relative location across all pages of the search interface.
   **Applicable Components:** Global footer, support facets.

### 3.3.7 Redundant Entry (Level A) - [NEW 2.2]

**Why Manual:** Requires tracking user input across a multi-step process.
**Test Procedure:**

1. In a multi-step form or search process, verify that if the user already provided information, they aren't asked to re-enter it.
2. Exceptions: Security information, or if re-entry is essential.
   **Applicable Components:** Multi-step commerce checkouts, advanced search forms.

### 3.3.8 Accessible Authentication (Minimum) (Level AA) - [NEW 2.2]

**Why Manual:** Axe cannot detect "cognitive function tests".
**Test Procedure:**

1. Check if the login/authentication process requires a cognitive test (e.g., solving a puzzle, memorizing a password).
2. Ensure an alternative is provided (e.g., copy-paste support, external authentication).
   **Applicable Components:** Auth-protected search interfaces.

---

## 4. Robust (Principle 4)

### 4.1.2 Name, Role, Value (Level A)

**Why Manual:** Axe checks for presence of attributes, but not if they reflect the _actual_ state during interaction.
**Test Procedure:**

1. Use a screen reader to interact with a facet.
2. Verify it announces "Expanded" and "Collapsed" correctly as you toggle it.
3. Check that checkboxes announce "Checked" or "Unchecked" accurately.
   **Applicable Components:** `atomic-facet`, `atomic-sort`, `atomic-search-box`.

### 4.1.3 Status Messages (Level AA)

**Why Manual:** Axe doesn't verify if a status message is actually spoken by a screen reader.
**Test Priority: HIGH for `atomic-aria-live`.**
**Test Procedure:**

1. Trigger a search or an error.
2. Verify the screen reader automatically announces the status (e.g., "10 results found") without the user moving focus.
   **Applicable Components:** `atomic-aria-live`, `atomic-query-error`.
