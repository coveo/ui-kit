import {
  type AccessibilityNode,
  truncateAccessibilityTree,
} from './accessibility-tree.js';
import type {LLMMessage} from './llm-client.js';

export const SYSTEM_PROMPT = `You are an accessibility expert evaluating WCAG 2.2 Level AA compliance for a web component rendered in isolation in Storybook. You will be shown screenshots and/or accessibility tree data captured from the component. Evaluate ONLY the specific criteria listed in each request. Respond ONLY with valid JSON matching the exact schema provided. Do not include markdown fences, explanations, or any text outside the JSON object.

Evaluation rules:
- "pass": The component clearly meets the criterion requirements based on the evidence provided.
- "fail": The component clearly violates the criterion. You MUST cite specific evidence.
- "partial": Some aspects pass but others need improvement. Cite what passes and what does not.
- "not-applicable": The criterion does not apply to this component (e.g., no images of text exist to evaluate for 1.4.5, no error states are visible for 3.3.3, no hover-triggered content exists for 1.4.13).

Conservatism rules:
- If you cannot determine compliance from the provided data, use "not-applicable" rather than guessing "pass".
- Prefer "not-applicable" for criteria that genuinely do not apply (e.g., error prevention for a display-only facet component).
- Never mark "pass" unless you have positive evidence of compliance.
- For contrast evaluation (1.4.11), if you cannot measure exact ratios from the screenshot, describe what you observe and use "partial" if boundaries appear low-contrast.`;

export const CALL1_KEYS = [
  '1.3.2-meaningful-sequence',
  '1.3.3-sensory-characteristics',
  '1.3.5-identify-input-purpose',
  '1.4.5-images-of-text',
  '1.4.11-non-text-contrast',
  '1.4.13-content-on-hover-focus',
  '3.3.3-error-suggestion',
  '3.3.4-error-prevention',
  '4.1.3-status-messages',
];

export const CALL2_KEYS = [
  '1.3.4-orientation',
  '1.4.4-resize-text',
  '1.4.10-reflow',
];

export function buildCall1UserPrompt(
  componentName: string,
  accessibilityTree: AccessibilityNode | null,
  hoverDetected: boolean,
  hoverDetails: string
): string {
  const truncatedTree = truncateAccessibilityTree(accessibilityTree, 2000);

  const hoverSection = hoverDetected
    ? `
**Hover state screenshot**: See second attached image.
**Hover interaction details**: ${hoverDetails}

Evaluate 1.4.13 based on the hover state screenshot and details above. Consider:
(a) Can the revealed content likely be dismissed without moving the pointer (e.g., via Escape key)?
(b) Can the pointer move over the revealed content without it disappearing?
(c) Does it persist until the user dismisses it or moves hover/focus away?`
    : `
**Hover interaction**: No tooltip, popover, or additional content was detected when hovering over the first 5 interactive elements. If the component has no hover-triggered supplementary content, mark 1.4.13 as "not-applicable".`;

  return `Evaluate the Storybook component "${componentName}" for WCAG 2.2 Level AA compliance.

## Data Provided

**Screenshot 1 - Default viewport (1024x768)**: See first attached image.
${hoverSection}

**Accessibility tree (JSON)**:
\`\`\`json
${truncatedTree}
\`\`\`

## Criteria to Evaluate

### 1.3.2 Meaningful Sequence
Does the DOM/accessibility tree reading order match the visual layout order shown in the screenshot? A mismatch means screen reader users would hear content in a confusing or illogical sequence. Compare the top-to-bottom, left-to-right visual order of elements in the screenshot against the sequential order of nodes in the accessibility tree.

### 1.3.3 Sensory Characteristics
Does any visible text in the component rely SOLELY on sensory characteristics (shape, color, size, visual location, orientation, or sound) to convey instructions or identify controls? Examples of failure: "click the round button", "use the red link", "see the sidebar on the right". If no instructional text is present in the component, mark "not-applicable".

### 1.3.5 Identify Input Purpose
If the component contains form inputs (text fields, dropdowns, checkboxes, radio buttons, password fields, email fields), do the inputs use the HTML \`autocomplete\` attribute with the appropriate token (e.g., "email", "username", "current-password", "given-name")? Check the accessibility tree for autocomplete attributes on input-role elements. If the component has no form inputs that collect personal data, mark "not-applicable". If inputs exist but lack autocomplete attributes, mark "fail".

### 1.4.5 Images of Text
Are there any images (<img> elements, CSS background images, or SVGs with embedded text bitmaps) that render readable text which should instead be real HTML text? Logos and brand marks are exempt. Decorative images without readable text are exempt. Check for text-containing images in the screenshot that do not appear as text nodes in the accessibility tree.

### 1.4.11 Non-text Contrast
Do the visual boundaries of UI components (button borders, input field borders, focus indicators, icon outlines, custom checkbox/radio outlines) maintain at least a 3:1 contrast ratio against their adjacent background colors? Evaluate what is visible in the screenshot. Disabled/inactive controls are exempt. If boundaries are clearly visible, mark "pass". If any appear very faint or hard to distinguish, describe which ones and mark "partial" or "fail".

### 1.4.13 Content on Hover/Focus
${
  hoverDetected
    ? 'A tooltip or popover was detected during hover testing. Evaluate the hover state screenshot against the three requirements: dismissible, hoverable, persistent. Base your assessment on the component type, visible UI patterns, and common implementation practices for this kind of component.'
    : 'No hover-triggered content was detected. If the component genuinely has no supplementary content revealed on hover or focus, mark "not-applicable".'
}

### 3.3.3 Error Suggestion
If the component displays or could display an error state (form validation errors, query errors, empty states with error messaging), does the error message include a suggestion for how to correct the problem? If no error state is visible in the default story and the component is not primarily an error-displaying component, mark "not-applicable".

### 3.3.4 Error Prevention (Legal, Financial, Data)
If the component allows the user to submit, modify, or delete data that has legal or financial consequences, does it provide at least one of: (a) reversibility/undo, (b) input validation before submission, or (c) a confirmation/review step? For most Atomic components (facets, result lists, search boxes, pagers, sort controls), this criterion is "not-applicable" because they do not perform consequential data transactions.

### 4.1.3 Status Messages
If the component displays status information to users (search result counts, filter changes, loading states, success/error messages, progress updates), is the status message container using an appropriate aria-live region or implicit live role?

Check the accessibility tree for:
- Elements with aria-live="polite" (non-urgent updates) or aria-live="assertive" (urgent alerts)
- Elements with role="status", role="alert", or role="log"
- Status text that updates dynamically should be inside a live region

If status messages exist WITHOUT proper aria-live or role markup, mark "fail". If no dynamic status messages are present in this component, mark "not-applicable". If proper live region structure exists, mark "pass" (note: actual screen reader behavior requires manual verification).

## Required JSON Output

Respond with ONLY this JSON structure, no other text:
{
  "criteria": {
    "1.3.2-meaningful-sequence": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence explaining your assessment>" },
    "1.3.3-sensory-characteristics": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.3.5-identify-input-purpose": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.5-images-of-text": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.11-non-text-contrast": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.13-content-on-hover-focus": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "3.3.3-error-suggestion": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "3.3.4-error-prevention": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "4.1.3-status-messages": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" }
  }
}`;
}

export function buildCall2UserPrompt(
  componentName: string,
  hasHorizontalScroll: boolean
): string {
  return `Evaluate the Storybook component "${componentName}" for viewport-dependent WCAG 2.2 Level AA criteria.

## Data Provided

**Screenshot 1 - Reflow test (320x480 viewport)**: See first attached image.
Horizontal scrollbar detected by DOM measurement: ${hasHorizontalScroll ? 'YES' : 'NO'}

**Screenshot 2 - Portrait orientation (375x812 viewport)**: See second attached image.

**Screenshot 3 - Landscape orientation (812x375 viewport)**: See third attached image.

## Criteria to Evaluate

### 1.3.4 Orientation
Compare the portrait (375x812) and landscape (812x375) screenshots. Does the component render usably in BOTH orientations? Check for:
- Content that is completely hidden or cut off in one orientation but visible in the other
- Functionality that becomes unusable in one orientation
- Layout that breaks or overlaps in one orientation
Components that responsively adapt their layout to the available width are passing. Components that only work in one orientation or that CSS-lock to a single orientation fail. If the component renders identically or adapts gracefully in both orientations, mark "pass".

### 1.4.4 Resize Text
Using the 320px-wide screenshot (which simulates 400% zoom), is text within the component readable without loss of content or functionality? Text should resize without truncation that hides important content, without overlapping adjacent elements, and without requiring a separate viewport. Note: The screenshots for this call were taken at 320px wide — at that width, text-only zoom behavior can be inferred. If all text appears legible and not cut off at this narrow viewport, mark "pass". If text is clipped, overflows its container, or disappears, mark "fail".

### 1.4.10 Reflow
At the 320px-wide viewport (simulating 400% zoom on a 1280px display):
(a) The DOM measurement reports horizontal scrollbar: ${hasHorizontalScroll ? 'YES - this is evidence of a potential reflow failure' : 'NO - no horizontal overflow detected'}.
(b) Is all meaningful content visible without needing to scroll horizontally? Check the screenshot for content cut off at the right edge.
(c) Is text readable and not truncated in a way that loses critical information?
Data tables, maps, toolbars, and complex spatial layouts that inherently require two-dimensional layout are exempt from this criterion. Simple text truncation with ellipsis on non-critical metadata is acceptable.

## Required JSON Output

Respond with ONLY this JSON structure, no other text:
{
  "criteria": {
    "1.3.4-orientation": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence explaining your assessment>" },
    "1.4.4-resize-text": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.10-reflow": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" }
  }
}`;
}

export function buildCall1Messages(
  componentName: string,
  defaultScreenshot: string,
  accessibilityTree: AccessibilityNode | null,
  hoverDetected: boolean,
  hoverScreenshot: string | null,
  hoverDetails: string
): LLMMessage[] {
  const userText = buildCall1UserPrompt(
    componentName,
    accessibilityTree,
    hoverDetected,
    hoverDetails
  );

  const imageContent: Array<{
    type: string;
    text?: string;
    image_url?: {url: string};
  }> = [
    {
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${defaultScreenshot}`},
    },
  ];

  if (hoverDetected && hoverScreenshot) {
    imageContent.push({
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${hoverScreenshot}`},
    });
  }

  return [
    {role: 'system', content: SYSTEM_PROMPT},
    {
      role: 'user',
      content: [{type: 'text', text: userText}, ...imageContent],
    },
  ];
}

export function buildCall2Messages(
  componentName: string,
  reflowScreenshot: string,
  hasHorizontalScroll: boolean,
  portraitScreenshot: string,
  landscapeScreenshot: string
): LLMMessage[] {
  const userText = buildCall2UserPrompt(componentName, hasHorizontalScroll);

  return [
    {role: 'system', content: SYSTEM_PROMPT},
    {
      role: 'user',
      content: [
        {type: 'text', text: userText},
        {
          type: 'image_url',
          image_url: {url: `data:image/png;base64,${reflowScreenshot}`},
        },
        {
          type: 'image_url',
          image_url: {url: `data:image/png;base64,${portraitScreenshot}`},
        },
        {
          type: 'image_url',
          image_url: {url: `data:image/png;base64,${landscapeScreenshot}`},
        },
      ],
    },
  ];
}

export const CALL3_KEYS = [
  '1.4.12-text-spacing',
  '2.4.4-link-purpose',
  '2.4.6-headings-and-labels',
  '2.4.7-focus-visible',
  '2.4.11-focus-not-obscured',
  '2.5.7-dragging-movements',
  '2.5.8-target-size',
];

export function buildCall3UserPrompt(
  componentName: string,
  textSpacingApplied: boolean,
  focusDetails: string,
  hasFocusableElements: boolean,
  targetSizeData: string,
  accessibilityTree: AccessibilityNode | null
): string {
  const truncatedTree = truncateAccessibilityTree(accessibilityTree, 2000);

  const textSpacingSection = textSpacingApplied
    ? `
**Screenshot 2 - Text spacing applied**: See second attached image. Line height ≥1.5×, letter spacing ≥0.12×, word spacing ≥0.16×, and paragraph spacing ≥2× were applied via CSS injection.`
    : `
**Text spacing**: Could not apply text-spacing styles (Shadow DOM or injection failure). Evaluate 1.4.12 as "not-applicable" since no spacing screenshot is available.`;

  const focusSection = hasFocusableElements
    ? `
**Focus state data**: ${focusDetails}. See focus state screenshot(s) in attached images.`
    : `
**Focus state data**: No focusable elements detected. Mark 2.4.7 and 2.4.11 as "not-applicable".`;

  return `Evaluate the Storybook component "${componentName}" for WCAG 2.2 Level AA compliance.

## Data Provided

**Screenshot 1 - Default viewport (1024x768)**: See first attached image.
${textSpacingSection}
${focusSection}

**Target size data**: ${targetSizeData}

**Accessibility tree (JSON)**:
\`\`\`json
${truncatedTree}
\`\`\`

## Criteria to Evaluate

### 1.4.12 Text Spacing
Compare the default screenshot (image 1) with the text-spacing screenshot (image 2). Does the component remain readable and functional after applying increased text spacing (line height ≥1.5×, letter spacing ≥0.12em, word spacing ≥0.16em, paragraph spacing ≥2em)? Check for: text overflow beyond containers, truncated text that hides meaning, overlapping elements, broken layout that makes content unusable. Minor cosmetic changes (slight overflow of decorative elements) are acceptable. If the component fails gracefully or text is still readable, mark "pass". Only mark "fail" if content becomes unreadable or functionality is broken.

### 2.4.4 Link Purpose
Examine all links and buttons in the accessibility tree. Can the purpose of each link/button be determined from its accessible name alone, or from the accessible name plus its surrounding context (paragraph, list item, table cell)? Vague link text like "click here", "read more", or "learn more" without surrounding context fails. Icon-only links without aria-label fail. If the component has no links, mark "not-applicable".

### 2.4.6 Headings and Labels
Do the headings and form labels in this component describe the topic or purpose of the content/input? Check the accessibility tree for heading-role elements and label text. Labels that only use generic words like "field" or "input" without descriptive context may fail.

Additionally, labels should use plain, user-friendly language. Flag technical jargon that typical users would not understand:
- "inclusion filter" / "exclusion filter" → prefer "selected" / "excluded" or describe the action
- "facet" → prefer "filter", "category", or "option"
- "breadcrumb" → prefer describing the navigation path
- Internal system terminology not meaningful to end users

If jargon is present, mark "partial" and cite the specific terms. If the component has no headings or labels, mark "not-applicable".

### 2.4.7 Focus Visible
${hasFocusableElements ? 'Focus state data was captured. ' + focusDetails + '. Based on the focus screenshot(s), is there a clearly visible focus indicator when keyboard focus lands on interactive elements? The focus indicator must be distinguishable from the unfocused state — a visible outline, ring, or highlight. If focus is invisible or extremely subtle (no visible change), mark "fail".' : 'No focusable elements were detected. Mark "not-applicable".'}

### 2.4.11 Focus Not Obscured
${hasFocusableElements ? 'When a focused element receives keyboard focus (see focus screenshots), is the focused element at least partially visible — not completely covered by sticky headers, fixed footers, overlays, cookie banners, or other layered content? This is a component rendered in isolation in Storybook, so sticky UI is unlikely. If the focused element appears visible in the focus screenshot, mark "pass". If obscured, describe what covers it.' : 'No focusable elements detected. Mark "not-applicable".'}

### 2.5.7 Dragging Movements
If the component requires dragging to accomplish any action (sliders, drag-and-drop lists, resizable panels, carousel swipes), is there a single-pointer alternative (e.g., clicking +/- buttons on a slider, keyboard alternatives, tap-to-select instead of drag-to-reorder)? For components with no dragging interactions (most search facets, result lists, pagination), mark "not-applicable".

### 2.5.8 Target Size (Minimum)
Based on the target size data: ${targetSizeData}. Interactive targets (buttons, links, checkboxes, radio buttons) should have a minimum size of 24×24 CSS pixels. Inline links within text are exempt. If most targets meet the 24×24 minimum or have sufficient spacing around them, mark "pass". If multiple targets are smaller than 24×24 with inadequate spacing, mark "fail". If the component has no interactive elements, mark "not-applicable".

## Required JSON Output

Respond with ONLY this JSON structure, no other text:
{
  "criteria": {
    "1.4.12-text-spacing": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.4-link-purpose": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.6-headings-and-labels": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.7-focus-visible": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.11-focus-not-obscured": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.5.7-dragging-movements": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.5.8-target-size": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" }
  }
}`;
}

export function buildCall3Messages(
  componentName: string,
  defaultScreenshot: string,
  textSpacingScreenshot: string | null,
  focusScreenshots: string[],
  textSpacingApplied: boolean,
  focusDetails: string,
  hasFocusableElements: boolean,
  targetSizeData: string,
  accessibilityTree: AccessibilityNode | null
): LLMMessage[] {
  const userText = buildCall3UserPrompt(
    componentName,
    textSpacingApplied,
    focusDetails,
    hasFocusableElements,
    targetSizeData,
    accessibilityTree
  );

  const imageContent: Array<{
    type: string;
    text?: string;
    image_url?: {url: string};
  }> = [
    {
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${defaultScreenshot}`},
    },
  ];

  if (textSpacingScreenshot) {
    imageContent.push({
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${textSpacingScreenshot}`},
    });
  }

  for (const focusShot of focusScreenshots.slice(0, 3)) {
    imageContent.push({
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${focusShot}`},
    });
  }

  return [
    {role: 'system', content: SYSTEM_PROMPT},
    {
      role: 'user',
      content: [{type: 'text', text: userText}, ...imageContent],
    },
  ];
}

/** @deprecated Call 4 has been replaced by STATIC_NA_CRITERIA in constants.ts. */
export const CALL4_KEYS = [
  '3.2.6-consistent-help',
  '3.3.7-redundant-entry',
  '3.3.8-accessible-auth',
];

/**
 * Merged Call 1 + Call 3 keys (16 criteria).
 * Combines visual/semantic checks (Call 1) with interaction/layout checks (Call 3)
 * into a single LLM call to halve API usage.
 */
export const MERGED_CALL1_3_KEYS = [
  // Former Call 1 criteria
  '1.3.2-meaningful-sequence',
  '1.3.3-sensory-characteristics',
  '1.3.5-identify-input-purpose',
  '1.4.5-images-of-text',
  '1.4.11-non-text-contrast',
  '1.4.13-content-on-hover-focus',
  '3.3.3-error-suggestion',
  '3.3.4-error-prevention',
  '4.1.3-status-messages',
  // Former Call 3 criteria
  '1.4.12-text-spacing',
  '2.4.4-link-purpose',
  '2.4.6-headings-and-labels',
  '2.4.7-focus-visible',
  '2.4.11-focus-not-obscured',
  '2.5.7-dragging-movements',
  '2.5.8-target-size',
];

export function buildMergedCall1_3UserPrompt(
  componentName: string,
  accessibilityTree: AccessibilityNode | null,
  hoverDetected: boolean,
  hoverDetails: string,
  textSpacingApplied: boolean,
  focusDetails: string,
  hasFocusableElements: boolean,
  targetSizeData: string
): string {
  const truncatedTree = truncateAccessibilityTree(accessibilityTree, 2000);

  const hoverSection = hoverDetected
    ? `
**Hover state screenshot**: See hover-state image.
**Hover interaction details**: ${hoverDetails}

Evaluate 1.4.13 based on the hover state screenshot and details above. Consider:
(a) Can the revealed content likely be dismissed without moving the pointer (e.g., via Escape key)?
(b) Can the pointer move over the revealed content without it disappearing?
(c) Does it persist until the user dismisses it or moves hover/focus away?`
    : `
**Hover interaction**: No tooltip, popover, or additional content was detected when hovering over the first 5 interactive elements. If the component has no hover-triggered supplementary content, mark 1.4.13 as "not-applicable".`;

  const textSpacingSection = textSpacingApplied
    ? `
**Text spacing screenshot**: See text-spacing image. Line height ≥1.5×, letter spacing ≥0.12×, word spacing ≥0.16×, and paragraph spacing ≥2× were applied via CSS injection.`
    : `
**Text spacing**: Could not apply text-spacing styles (Shadow DOM or injection failure). Evaluate 1.4.12 as "not-applicable" since no spacing screenshot is available.`;

  const focusSection = hasFocusableElements
    ? `
**Focus state data**: ${focusDetails}. See focus state screenshot(s) in attached images.`
    : `
**Focus state data**: No focusable elements detected. Mark 2.4.7 and 2.4.11 as "not-applicable".`;

  return `Evaluate the Storybook component "${componentName}" for WCAG 2.2 Level AA compliance.

## Data Provided

**Screenshot 1 - Default viewport (1024x768)**: See first attached image.
${hoverSection}
${textSpacingSection}
${focusSection}

**Target size data**: ${targetSizeData}

**Accessibility tree (JSON)**:
\`\`\`json
${truncatedTree}
\`\`\`

## Criteria to Evaluate (16 criteria)

### 1.3.2 Meaningful Sequence
Does the DOM/accessibility tree reading order match the visual layout order shown in the screenshot? A mismatch means screen reader users would hear content in a confusing or illogical sequence. Compare the top-to-bottom, left-to-right visual order of elements in the screenshot against the sequential order of nodes in the accessibility tree.

### 1.3.3 Sensory Characteristics
Does any visible text in the component rely SOLELY on sensory characteristics (shape, color, size, visual location, orientation, or sound) to convey instructions or identify controls? Examples of failure: "click the round button", "use the red link", "see the sidebar on the right". If no instructional text is present in the component, mark "not-applicable".

### 1.3.5 Identify Input Purpose
If the component contains form inputs (text fields, dropdowns, checkboxes, radio buttons, password fields, email fields), do the inputs use the HTML \`autocomplete\` attribute with the appropriate token (e.g., "email", "username", "current-password", "given-name")? Check the accessibility tree for autocomplete attributes on input-role elements. If the component has no form inputs that collect personal data, mark "not-applicable". If inputs exist but lack autocomplete attributes, mark "fail".

### 1.4.5 Images of Text
Are there any images (<img> elements, CSS background images, or SVGs with embedded text bitmaps) that render readable text which should instead be real HTML text? Logos and brand marks are exempt. Decorative images without readable text are exempt. Check for text-containing images in the screenshot that do not appear as text nodes in the accessibility tree.

### 1.4.11 Non-text Contrast
Do the visual boundaries of UI components (button borders, input field borders, focus indicators, icon outlines, custom checkbox/radio outlines) maintain at least a 3:1 contrast ratio against their adjacent background colors? Evaluate what is visible in the screenshot. Disabled/inactive controls are exempt. If boundaries are clearly visible, mark "pass". If any appear very faint or hard to distinguish, describe which ones and mark "partial" or "fail".

### 1.4.12 Text Spacing
Compare the default screenshot with the text-spacing screenshot. Does the component remain readable and functional after applying increased text spacing (line height ≥1.5×, letter spacing ≥0.12em, word spacing ≥0.16em, paragraph spacing ≥2em)? Check for: text overflow beyond containers, truncated text that hides meaning, overlapping elements, broken layout that makes content unusable. Minor cosmetic changes are acceptable. If the component fails gracefully or text is still readable, mark "pass". Only mark "fail" if content becomes unreadable or functionality is broken.

### 1.4.13 Content on Hover/Focus
${
  hoverDetected
    ? 'A tooltip or popover was detected during hover testing. Evaluate the hover state screenshot against the three requirements: dismissible, hoverable, persistent. Base your assessment on the component type, visible UI patterns, and common implementation practices for this kind of component.'
    : 'No hover-triggered content was detected. If the component genuinely has no supplementary content revealed on hover or focus, mark "not-applicable".'
}

### 2.4.4 Link Purpose
Examine all links and buttons in the accessibility tree. Can the purpose of each link/button be determined from its accessible name alone, or from the accessible name plus its surrounding context? Vague link text like "click here", "read more", or "learn more" without surrounding context fails. Icon-only links without aria-label fail. If the component has no links, mark "not-applicable".

### 2.4.6 Headings and Labels
Do the headings and form labels in this component describe the topic or purpose of the content/input? Check the accessibility tree for heading-role elements and label text. Labels that only use generic words like "field" or "input" without descriptive context may fail.

Additionally, labels should use plain, user-friendly language. Flag technical jargon that typical users would not understand:
- "inclusion filter" / "exclusion filter" → prefer "selected" / "excluded" or describe the action
- "facet" → prefer "filter", "category", or "option"
- "breadcrumb" → prefer describing the navigation path
- Internal system terminology not meaningful to end users

If jargon is present, mark "partial" and cite the specific terms. If the component has no headings or labels, mark "not-applicable".

### 2.4.7 Focus Visible
${hasFocusableElements ? 'Focus state data was captured. ' + focusDetails + '. Based on the focus screenshot(s), is there a clearly visible focus indicator when keyboard focus lands on interactive elements? The focus indicator must be distinguishable from the unfocused state — a visible outline, ring, or highlight. If focus is invisible or extremely subtle (no visible change), mark "fail".' : 'No focusable elements were detected. Mark "not-applicable".'}

### 2.4.11 Focus Not Obscured
${hasFocusableElements ? 'When a focused element receives keyboard focus (see focus screenshots), is the focused element at least partially visible — not completely covered by sticky headers, fixed footers, overlays, cookie banners, or other layered content? This is a component rendered in isolation in Storybook, so sticky UI is unlikely. If the focused element appears visible in the focus screenshot, mark "pass". If obscured, describe what covers it.' : 'No focusable elements detected. Mark "not-applicable".'}

### 2.5.7 Dragging Movements
If the component requires dragging to accomplish any action (sliders, drag-and-drop lists, resizable panels, carousel swipes), is there a single-pointer alternative (e.g., clicking +/- buttons on a slider, keyboard alternatives, tap-to-select instead of drag-to-reorder)? For components with no dragging interactions (most search facets, result lists, pagination), mark "not-applicable".

### 2.5.8 Target Size (Minimum)
Based on the target size data: ${targetSizeData}. Interactive targets (buttons, links, checkboxes, radio buttons) should have a minimum size of 24×24 CSS pixels. Inline links within text are exempt. If most targets meet the 24×24 minimum or have sufficient spacing around them, mark "pass". If multiple targets are smaller than 24×24 with inadequate spacing, mark "fail". If the component has no interactive elements, mark "not-applicable".

### 3.3.3 Error Suggestion
If the component displays or could display an error state (form validation errors, query errors, empty states with error messaging), does the error message include a suggestion for how to correct the problem? If no error state is visible in the default story and the component is not primarily an error-displaying component, mark "not-applicable".

### 3.3.4 Error Prevention (Legal, Financial, Data)
If the component allows the user to submit, modify, or delete data that has legal or financial consequences, does it provide at least one of: (a) reversibility/undo, (b) input validation before submission, or (c) a confirmation/review step? For most Atomic components (facets, result lists, search boxes, pagers, sort controls), this criterion is "not-applicable" because they do not perform consequential data transactions.

### 4.1.3 Status Messages
If the component displays status information to users (search result counts, filter changes, loading states, success/error messages, progress updates), is the status message container using an appropriate aria-live region or implicit live role?

Check the accessibility tree for:
- Elements with aria-live="polite" (non-urgent updates) or aria-live="assertive" (urgent alerts)
- Elements with role="status", role="alert", or role="log"
- Status text that updates dynamically should be inside a live region

If status messages exist WITHOUT proper aria-live or role markup, mark "fail". If no dynamic status messages are present in this component, mark "not-applicable". If proper live region structure exists, mark "pass" (note: actual screen reader behavior requires manual verification).

## Required JSON Output

Respond with ONLY this JSON structure, no other text:
{
  "criteria": {
    "1.3.2-meaningful-sequence": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.3.3-sensory-characteristics": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.3.5-identify-input-purpose": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.5-images-of-text": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.11-non-text-contrast": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.12-text-spacing": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.13-content-on-hover-focus": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.4-link-purpose": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.6-headings-and-labels": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.7-focus-visible": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.11-focus-not-obscured": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.5.7-dragging-movements": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.5.8-target-size": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "3.3.3-error-suggestion": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "3.3.4-error-prevention": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "4.1.3-status-messages": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" }
  }
}`;
}

export function buildMergedCall1_3Messages(
  componentName: string,
  defaultScreenshot: string,
  accessibilityTree: AccessibilityNode | null,
  hoverDetected: boolean,
  hoverScreenshot: string | null,
  hoverDetails: string,
  textSpacingScreenshot: string | null,
  focusScreenshots: string[],
  textSpacingApplied: boolean,
  focusDetails: string,
  hasFocusableElements: boolean,
  targetSizeData: string
): LLMMessage[] {
  const userText = buildMergedCall1_3UserPrompt(
    componentName,
    accessibilityTree,
    hoverDetected,
    hoverDetails,
    textSpacingApplied,
    focusDetails,
    hasFocusableElements,
    targetSizeData
  );

  const imageContent: Array<{
    type: string;
    text?: string;
    image_url?: {url: string};
  }> = [
    {
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${defaultScreenshot}`},
    },
  ];

  if (hoverDetected && hoverScreenshot) {
    imageContent.push({
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${hoverScreenshot}`},
    });
  }

  if (textSpacingScreenshot) {
    imageContent.push({
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${textSpacingScreenshot}`},
    });
  }

  for (const focusShot of focusScreenshots.slice(0, 3)) {
    imageContent.push({
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${focusShot}`},
    });
  }

  return [
    {role: 'system', content: SYSTEM_PROMPT},
    {
      role: 'user',
      content: [{type: 'text', text: userText}, ...imageContent],
    },
  ];
}

export function buildDifferentialUserPrompt(
  componentName: string,
  archetypeComponentName: string,
  archetypeResults: Record<string, {status: string; evidence: string}>,
  accessibilityTree: AccessibilityNode | null,
  hoverDetected: boolean,
  hoverDetails: string
): string {
  const truncatedTree = truncateAccessibilityTree(accessibilityTree, 1500);

  const baselineSection = Object.entries(archetypeResults)
    .map(
      ([key, val]) =>
        `- **${key}**: ${val.status}${val.evidence ? ` — ${val.evidence}` : ''}`
    )
    .join('\n');

  return `Evaluate the Storybook component "${componentName}" for WCAG 2.2 Level AA compliance.

This component is a **surface variant** of the archetype component "${archetypeComponentName}".
The archetype was already evaluated with these results:

${baselineSection}

Your job: determine if "${componentName}" differs from the archetype for any of these 15 criteria.
- If the component is visually and structurally identical to the archetype for a given criterion, carry forward the archetype's status and evidence.
- If you observe a meaningful difference (different DOM structure, missing labels, different contrast, different focus behavior, etc.), provide your own independent assessment.
- Mark criteria as "not-applicable" only if neither the archetype nor the variant has the relevant UI pattern.

## Data Provided

**Screenshot - Default viewport (1024x768)**: See attached image.
${
  hoverDetected
    ? `**Hover interaction**: Hover-triggered content was detected. ${hoverDetails}`
    : '**Hover interaction**: No hover-triggered content detected.'
}

**Accessibility tree (JSON)**:
\`\`\`json
${truncatedTree}
\`\`\`

## Criteria to Evaluate (16 criteria)

1.3.2-meaningful-sequence, 1.3.3-sensory-characteristics, 1.3.5-identify-input-purpose,
1.4.5-images-of-text, 1.4.11-non-text-contrast, 1.4.12-text-spacing,
1.4.13-content-on-hover-focus, 2.4.4-link-purpose, 2.4.6-headings-and-labels,
2.4.7-focus-visible, 2.4.11-focus-not-obscured, 2.5.7-dragging-movements,
2.5.8-target-size, 3.3.3-error-suggestion, 3.3.4-error-prevention,
4.1.3-status-messages

For each criterion, reference the archetype baseline above and decide whether the variant matches or diverges.

## Required JSON Output

Respond with ONLY this JSON structure, no other text:
{
  "criteria": {
    "1.3.2-meaningful-sequence": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.3.3-sensory-characteristics": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.3.5-identify-input-purpose": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.5-images-of-text": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.11-non-text-contrast": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.12-text-spacing": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.13-content-on-hover-focus": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.4-link-purpose": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.6-headings-and-labels": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.7-focus-visible": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.4.11-focus-not-obscured": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.5.7-dragging-movements": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "2.5.8-target-size": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "3.3.3-error-suggestion": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "3.3.4-error-prevention": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "4.1.3-status-messages": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" }
  }
}`;
}

export function buildDifferentialCallMessages(
  componentName: string,
  archetypeComponentName: string,
  archetypeResults: Record<string, {status: string; evidence: string}>,
  defaultScreenshot: string,
  accessibilityTree: AccessibilityNode | null,
  hoverDetected: boolean,
  hoverScreenshot: string | null,
  hoverDetails: string
): LLMMessage[] {
  const userText = buildDifferentialUserPrompt(
    componentName,
    archetypeComponentName,
    archetypeResults,
    accessibilityTree,
    hoverDetected,
    hoverDetails
  );

  const imageContent: Array<{
    type: string;
    text?: string;
    image_url?: {url: string};
  }> = [
    {
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${defaultScreenshot}`},
    },
  ];

  if (hoverDetected && hoverScreenshot) {
    imageContent.push({
      type: 'image_url',
      image_url: {url: `data:image/png;base64,${hoverScreenshot}`},
    });
  }

  return [
    {role: 'system', content: SYSTEM_PROMPT},
    {
      role: 'user',
      content: [{type: 'text', text: userText}, ...imageContent],
    },
  ];
}
