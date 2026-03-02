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
  '1.4.5-images-of-text',
  '1.4.11-non-text-contrast',
  '1.4.13-content-on-hover-focus',
  '3.3.3-error-suggestion',
  '3.3.4-error-prevention',
];

export const CALL2_KEYS = ['1.3.4-orientation', '1.4.10-reflow'];

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

## Required JSON Output

Respond with ONLY this JSON structure, no other text:
{
  "criteria": {
    "1.3.2-meaningful-sequence": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence explaining your assessment>" },
    "1.3.3-sensory-characteristics": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.5-images-of-text": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.11-non-text-contrast": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "1.4.13-content-on-hover-focus": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "3.3.3-error-suggestion": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" },
    "3.3.4-error-prevention": { "status": "<pass|fail|partial|not-applicable>", "evidence": "<one sentence>" }
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
