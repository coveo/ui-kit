#!/usr/bin/env node

import {parseArgs as nodeParseArgs} from 'node:util';
import {writeFile, readFile, rename, unlink, mkdir} from 'node:fs/promises';
import path from 'node:path';

const SYSTEM_PROMPT = `You are an accessibility expert evaluating WCAG 2.2 Level AA compliance for a web component rendered in isolation in Storybook. You will be shown screenshots and/or accessibility tree data captured from the component. Evaluate ONLY the specific criteria listed in each request. Respond ONLY with valid JSON matching the exact schema provided. Do not include markdown fences, explanations, or any text outside the JSON object.

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

const ALL_AI_CRITERIA = [
  '1.3.2-meaningful-sequence',
  '1.3.3-sensory-characteristics',
  '1.3.4-orientation',
  '1.4.5-images-of-text',
  '1.4.10-reflow',
  '1.4.11-non-text-contrast',
  '1.4.13-content-on-hover-focus',
  '3.3.3-error-suggestion',
  '3.3.4-error-prevention',
];

const CALL1_KEYS = [
  '1.3.2-meaningful-sequence',
  '1.3.3-sensory-characteristics',
  '1.4.5-images-of-text',
  '1.4.11-non-text-contrast',
  '1.4.13-content-on-hover-focus',
  '3.3.3-error-suggestion',
  '3.3.4-error-prevention',
];

const CALL2_KEYS = ['1.3.4-orientation', '1.4.10-reflow'];

const VALID_STATUSES = new Set(['pass', 'fail', 'partial', 'not-applicable']);

const SURFACE_PREFIXES = {
  commerce: 'commerce',
  search: 'search',
  insight: 'insight',
  ipx: 'ipx',
  recommendations: 'recommendations',
};

const PROGRESS_FILE = 'a11y/reports/deltas/.ai-audit-progress.json';
const PROGRESS_TMP = PROGRESS_FILE + '.tmp';

class RateLimitExhaustedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitExhaustedError';
  }
}

class LLMParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LLMParseError';
  }
}

function parseArgs() {
  const {values} = nodeParseArgs({
    options: {
      surface: {type: 'string', default: 'all'},
      component: {type: 'string', default: ''},
      'dry-run': {type: 'boolean', default: false},
      resume: {type: 'boolean', default: false},
      'max-components': {type: 'string', default: 'Infinity'},
      model: {type: 'string', default: 'gpt-4o'},
      concurrency: {type: 'string', default: '1'},
      verbose: {type: 'boolean', default: false},
      'storybook-url': {type: 'string', default: 'http://localhost:4400'},
      help: {type: 'boolean', default: false},
    },
    strict: false,
    allowPositionals: false,
  });

  const config = {
    surface: values.surface,
    component: values.component || null,
    dryRun: values['dry-run'],
    resume: values.resume,
    maxComponents: parseInt(values['max-components'], 10) || Infinity,
    model: values.model,
    concurrency: Math.max(1, parseInt(values.concurrency, 10) || 1),
    verbose: values.verbose,
    storybookUrl: values['storybook-url'].replace(/\/$/, ''),
    help: values.help,
  };

  const validSurfaces = [
    'all',
    'commerce',
    'search',
    'insight',
    'ipx',
    'recommendations',
  ];
  if (!validSurfaces.includes(config.surface)) {
    console.error(
      `Error: --surface must be one of: ${validSurfaces.join(', ')} (got "${config.surface}")`
    );
    process.exit(1);
  }

  return config;
}

function printHelp() {
  console.log(`AI WCAG 2.2 Audit Agent
Evaluates Storybook components against 9 WCAG 2.2 criteria using LLM vision analysis.

Usage:
  node a11y/scripts/ai-wcag-audit.mjs [options]

Options:
  --surface <name>        Surface to audit: commerce, search, insight, ipx, recommendations, all (default: all)
  --component <name>      Audit a single component by tag name (e.g., atomic-commerce-facet)
  --dry-run               Show what would be audited without making LLM calls
  --resume                Resume from a previous interrupted run
  --max-components <n>    Maximum number of components to audit (default: all)
  --model <id>            LLM model to use (default: gpt-4o)
  --concurrency <n>       Number of parallel LLM calls (default: 1)
  --verbose               Print raw LLM responses for debugging
  --storybook-url <url>   Storybook base URL (default: http://localhost:4400)
  --help                  Show this help message

Environment:
  GITHUB_TOKEN            Required. GitHub PAT with 'models' scope for GitHub Models API.

Examples:
  node a11y/scripts/ai-wcag-audit.mjs --surface commerce
  node a11y/scripts/ai-wcag-audit.mjs --component atomic-commerce-facet --verbose
  node a11y/scripts/ai-wcag-audit.mjs --surface commerce --max-components 25
  node a11y/scripts/ai-wcag-audit.mjs --surface commerce --resume
  node a11y/scripts/ai-wcag-audit.mjs --surface search --model gpt-4o-mini

Output:
  Delta files in a11y/reports/deltas/delta-YYYY-MM-DD-ai-audit-<surface>.json
  Validate with: node a11y/scripts/manual-audit-delta.mjs validate <delta-file>
  Merge with:    node a11y/scripts/manual-audit-delta.mjs merge --dry-run`);
  process.exit(0);
}

async function validateEnvironment(config) {
  if (!process.env.GITHUB_TOKEN) {
    console.error(
      'Error: GITHUB_TOKEN environment variable is required.\n\n' +
        'Set a GitHub Personal Access Token with the "models" scope:\n' +
        '  export GITHUB_TOKEN="ghp_your_token_here"\n\n' +
        'Create a token at: https://github.com/settings/tokens\n' +
        'Required scope: "models" (GitHub Models API access)'
    );
    process.exit(1);
  }

  try {
    const res = await fetch(`${config.storybookUrl}/index.json`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (error) {
    console.error(
      `Error: Cannot reach Storybook at ${config.storybookUrl}\n\n` +
        'Start Storybook first:\n' +
        '  pnpm storybook\n\n' +
        `Details: ${error.message}`
    );
    process.exit(1);
  }

  try {
    await import('openai');
  } catch {
    console.error(
      'Error: The "openai" npm package is required but not installed.\n\n' +
        'Install it:\n' +
        '  npm install openai\n' +
        '  # or: pnpm add -D openai'
    );
    process.exit(1);
  }
}

async function fetchStoryIndex(storybookUrl) {
  const res = await fetch(`${storybookUrl}/index.json`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch story index: HTTP ${res.status}`);
  }
  return res.json();
}

function detectSurface(storyTitle) {
  if (!storyTitle) return null;
  const prefix = storyTitle.split('/')[0].toLowerCase();
  return SURFACE_PREFIXES[prefix] || null;
}

function extractComponentName(importPath) {
  if (!importPath) return null;
  const pattern =
    /\/src\/components\/(?:commerce|search|insight|ipx|recommendations)\/([^/]+)\//;
  const match = importPath.match(pattern);
  return match ? match[1] : null;
}

function selectStories(indexEntries, config) {
  const byComponent = new Map();

  for (const [storyId, entry] of Object.entries(indexEntries)) {
    if (entry.type !== 'story') continue;
    if (entry.title?.includes('Example Pages')) continue;

    const surface = detectSurface(entry.title);
    if (!surface) continue;

    if (config.surface !== 'all' && surface !== config.surface) continue;

    const componentName = extractComponentName(entry.importPath);
    if (!componentName) continue;

    if (config.component && componentName !== config.component) continue;

    const existing = byComponent.get(componentName);
    if (!existing) {
      byComponent.set(componentName, {
        storyId,
        componentName,
        surface,
        storyTitle: entry.title,
        storyName: entry.name,
      });
    }
    if (entry.name?.toLowerCase() === 'default') {
      byComponent.set(componentName, {
        storyId,
        componentName,
        surface,
        storyTitle: entry.title,
        storyName: entry.name,
      });
    }
  }

  const stories = [...byComponent.values()].sort((a, b) =>
    a.componentName.localeCompare(b.componentName, 'en-US')
  );

  if (config.maxComponents < stories.length) {
    return stories.slice(0, config.maxComponents);
  }

  return stories;
}

async function loadProgress(config) {
  if (!config.resume) return null;

  try {
    const content = await readFile(PROGRESS_FILE, 'utf8');
    const data = JSON.parse(content);
    console.log(
      `Resuming from previous run: ${data.completedComponents.length} components already completed.`
    );
    return {
      ...data,
      completedComponents: new Set(data.completedComponents),
    };
  } catch {
    console.log('No previous progress found. Starting fresh.');
    return null;
  }
}

async function saveProgress(progressState, config) {
  const serializable = {
    startedAt: progressState.startedAt,
    model: config.model,
    surface: config.surface,
    completedComponents: Array.isArray(progressState.completedComponents)
      ? progressState.completedComponents
      : [...progressState.completedComponents],
    entries: progressState.entries,
  };
  const json = JSON.stringify(serializable, null, 2);
  await writeFile(PROGRESS_TMP, json, 'utf8');
  await rename(PROGRESS_TMP, PROGRESS_FILE);
}

async function clearProgress() {
  try {
    await unlink(PROGRESS_FILE);
  } catch {
    // File doesn't exist - nothing to clean up
  }
}

function flattenTree(node, result = []) {
  if (!node) return result;
  result.push(node);
  for (const child of node.children || []) {
    flattenTree(child, result);
  }
  return result;
}

function nodeKey(node) {
  return `${node.role || ''}|${node.name || ''}|${node.value || ''}|${node.description || ''}`;
}

function diffAccessibilityTrees(before, after) {
  const beforeKeys = new Set(flattenTree(before).map(nodeKey));
  const afterNodes = flattenTree(after);
  return afterNodes.filter((node) => !beforeKeys.has(nodeKey(node)));
}

function pruneTree(node, maxDepth, currentDepth = 0) {
  if (!node) return null;

  const result = {...node};
  if (currentDepth >= maxDepth) {
    if (node.children?.length > 0) {
      result.children = [
        {role: 'note', name: `[${node.children.length} children pruned]`},
      ];
    }
  } else if (node.children) {
    result.children = node.children
      .map((child) => pruneTree(child, maxDepth, currentDepth + 1))
      .filter(Boolean);
  }

  return result;
}

function truncateAccessibilityTree(tree, maxTokenEstimate) {
  const fullJson = JSON.stringify(tree, null, 2);
  const estimatedTokens = Math.ceil(fullJson.length / 4);

  if (estimatedTokens <= maxTokenEstimate) {
    return fullJson;
  }

  const pruned = pruneTree(tree, 3);
  const prunedJson = JSON.stringify(pruned, null, 2);
  const nodeCount = flattenTree(tree).length;
  const prunedCount = flattenTree(pruned).length;

  return (
    prunedJson +
    `\n\n[Truncated: full tree has ${nodeCount} nodes, showing ${prunedCount} nodes at depth <= 3]`
  );
}

async function initBrowser() {
  const {chromium} = await import('playwright');
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();
  await page.setViewportSize({width: 1024, height: 768});
  return {browser, page};
}

async function navigateToStory(page, storybookUrl, storyId) {
  const url = `${storybookUrl}/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
  // Wait for component to render
  await page.waitForTimeout(1000);
}

async function captureDefaultViewport(page) {
  await page.setViewportSize({width: 1024, height: 768});
  await page.waitForTimeout(300);

  const screenshot = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');
  const accessibilityTree = await page.accessibility.snapshot({
    interestingOnly: false,
  });

  return {screenshot, accessibilityTree};
}

async function captureHoverState(page) {
  const treeBefore = await page.accessibility.snapshot({
    interestingOnly: false,
  });

  const interactiveSelector = [
    'button',
    'a[href]',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="combobox"]',
    'input:not([type="hidden"])',
    'select',
    '[tabindex="0"]',
  ].join(', ');

  const interactiveLocators = page.locator(interactiveSelector);
  const totalCount = await interactiveLocators.count();
  const testCount = Math.min(totalCount, 5);

  let hoverDetected = false;
  let hoverScreenshot = null;
  let hoverDetails = '';

  for (let i = 0; i < testCount; i++) {
    const el = interactiveLocators.nth(i);

    try {
      const isVisible = await el.isVisible();
      if (!isVisible) continue;

      await el.hover({timeout: 2000, force: false});
      await page.waitForTimeout(500);

      const treeAfter = await page.accessibility.snapshot({
        interestingOnly: false,
      });
      const newNodes = diffAccessibilityTrees(treeBefore, treeAfter);

      if (newNodes.length > 0) {
        hoverDetected = true;
        hoverScreenshot = (await page.screenshot({type: 'png'})).toString(
          'base64'
        );

        const newNodeDescriptions = newNodes
          .slice(0, 5)
          .map((n) => `${n.role}${n.name ? `: "${n.name}"` : ''}`)
          .join(', ');
        const tagName = await el.evaluate((e) => e.tagName.toLowerCase());
        hoverDetails =
          `Hovering over interactive element ${i} (${tagName}) ` +
          `revealed ${newNodes.length} new accessibility node(s): ${newNodeDescriptions}`;

        break;
      }
    } catch {
      continue;
    }
  }

  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);

  return {hoverDetected, hoverScreenshot, hoverDetails};
}

async function captureMultiViewport(page) {
  // Reflow test - 320px wide (simulates 400% zoom on 1280px display)
  await page.setViewportSize({width: 320, height: 480});
  await page.waitForTimeout(500);
  const reflowScreenshot = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');
  const hasHorizontalScroll = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );

  // Portrait
  await page.setViewportSize({width: 375, height: 812});
  await page.waitForTimeout(500);
  const portrait = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');

  // Landscape
  await page.setViewportSize({width: 812, height: 375});
  await page.waitForTimeout(500);
  const landscape = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');

  // Restore default viewport
  await page.setViewportSize({width: 1024, height: 768});
  await page.waitForTimeout(300);

  return {
    reflow: {screenshot: reflowScreenshot, hasHorizontalScroll},
    portrait,
    landscape,
  };
}

function buildCall1UserPrompt(
  componentName,
  accessibilityTree,
  hoverDetected,
  hoverDetails
) {
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

function buildCall2UserPrompt(componentName, hasHorizontalScroll) {
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initLLMClient(config) {
  // Dynamically import openai (already validated in validateEnvironment)
  // We'll store the promise and resolve it once
  let clientPromise;
  return {
    async getClient() {
      if (!clientPromise) {
        clientPromise = import('openai').then(({default: OpenAI}) => {
          return new OpenAI({
            baseURL: 'https://models.inference.ai.azure.com',
            apiKey: process.env.GITHUB_TOKEN,
          });
        });
      }
      return clientPromise;
    },
    config,
  };
}

async function callLLMWithRetry(
  clientWrapper,
  messages,
  config,
  maxRetries = 5
) {
  const client = await clientWrapper.getClient();
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: config.model,
        messages,
        response_format: {type: 'json_object'},
        temperature: 0.1,
      });

      const content = response.choices?.[0]?.message?.content;

      if (config.verbose) {
        console.log('\n--- Raw LLM response ---');
        console.log(content);
        console.log('--- End LLM response ---\n');
      }

      if (!content) {
        throw new Error('LLM returned empty content');
      }

      return JSON.parse(content);
    } catch (error) {
      lastError = error;

      if (error?.status === 429 || error?.code === 'rate_limit_exceeded') {
        if (attempt >= maxRetries) {
          throw new RateLimitExhaustedError(
            `Rate limit exceeded after ${maxRetries + 1} attempts. ` +
              'Save progress and resume later with --resume.'
          );
        }

        const delay = Math.pow(2, attempt + 1) * 1000;
        const jitter = delay * (0.75 + Math.random() * 0.5);
        const waitMs = Math.round(jitter);

        console.log(
          `  Rate limited (attempt ${attempt + 1}/${maxRetries + 1}). ` +
            `Retrying in ${(waitMs / 1000).toFixed(1)}s...`
        );
        await sleep(waitMs);
        continue;
      }

      if (error instanceof SyntaxError) {
        if (attempt < 1) {
          console.log('  LLM returned invalid JSON. Retrying...');
          continue;
        }
        throw new LLMParseError(
          `LLM returned invalid JSON after retry: ${error.message}`
        );
      }

      if (error?.status === 401 || error?.status === 403) {
        throw new Error(
          'Authentication failed. Check that GITHUB_TOKEN is valid and has the "models" scope.\n' +
            `API error: ${error.message}`
        );
      }

      if (error?.status >= 500) {
        if (attempt >= maxRetries) {
          throw new Error(
            `Server error after ${maxRetries + 1} attempts: ${error.message}`
          );
        }
        const delay = Math.pow(2, attempt) * 1000;
        console.log(
          `  Server error (${error.status}). Retrying in ${delay / 1000}s...`
        );
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('callLLMWithRetry exhausted all retries');
}

function buildCall1Messages(
  componentName,
  defaultScreenshot,
  accessibilityTree,
  hoverDetected,
  hoverScreenshot,
  hoverDetails
) {
  const userText = buildCall1UserPrompt(
    componentName,
    accessibilityTree,
    hoverDetected,
    hoverDetails
  );

  const imageContent = [
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

function buildCall2Messages(
  componentName,
  reflowScreenshot,
  hasHorizontalScroll,
  portraitScreenshot,
  landscapeScreenshot
) {
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

function validateLLMResponse(parsed, expectedKeys) {
  if (!parsed || typeof parsed !== 'object' || !parsed.criteria) {
    const result = {};
    for (const key of expectedKeys) {
      result[key] = {
        status: 'not-applicable',
        evidence: 'LLM did not return a valid evaluation for this criterion.',
      };
    }
    return {criteria: result};
  }

  const result = {};
  for (const key of expectedKeys) {
    const entry = parsed.criteria[key];
    if (!entry || !VALID_STATUSES.has(entry.status)) {
      result[key] = {
        status: 'not-applicable',
        evidence:
          entry?.evidence ||
          'LLM did not return a valid evaluation for this criterion.',
      };
    } else {
      result[key] = {
        status: entry.status,
        evidence: typeof entry.evidence === 'string' ? entry.evidence : '',
      };
    }
  }

  return {criteria: result};
}

function mergeResults(call1Result, call2Result) {
  const wcag22Criteria = {};
  const evidenceParts = [];

  const allCriteria = {...call1Result.criteria, ...call2Result.criteria};

  for (const key of ALL_AI_CRITERIA) {
    const entry = allCriteria[key];
    if (entry) {
      wcag22Criteria[key] = entry.status;
      if (entry.status !== 'not-applicable' && entry.evidence) {
        evidenceParts.push(`${key}: ${entry.evidence}`);
      }
    } else {
      wcag22Criteria[key] = 'not-applicable';
    }
  }

  return {wcag22Criteria, evidenceParts};
}

function buildDeltaEntry(componentName, surface, model, mergedResults) {
  const date = new Date().toISOString().slice(0, 10);
  const auditor = `AI Agent (${model})`;

  let notes = `AI-evaluated (${model}, ${date}).`;
  if (mergedResults.evidenceParts.length > 0) {
    notes += ' ' + mergedResults.evidenceParts.join(' | ');
  }

  return {
    name: componentName,
    surface,
    auditor,
    results: {
      wcag22Criteria: mergedResults.wcag22Criteria,
      notes,
    },
  };
}

function buildFallbackEntry(story, model) {
  const date = new Date().toISOString().slice(0, 10);
  const wcag22Criteria = {};
  for (const key of ALL_AI_CRITERIA) {
    wcag22Criteria[key] = 'not-applicable';
  }
  return {
    name: story.componentName,
    surface: story.surface,
    auditor: `AI Agent (${model})`,
    results: {
      wcag22Criteria,
      notes: `AI-evaluated (${model}, ${date}). LLM returned invalid response; all criteria defaulted to not-applicable.`,
    },
  };
}

async function writeDeltaFiles(entries, config) {
  const date = new Date().toISOString().slice(0, 10);
  const auditor = `AI Agent (${config.model})`;

  const bySurface = new Map();
  for (const entry of entries) {
    const surface = entry.surface;
    if (!bySurface.has(surface)) {
      bySurface.set(surface, []);
    }
    bySurface.get(surface).push(entry);
  }

  const writtenFiles = [];

  for (const [surface, surfaceEntries] of bySurface) {
    const delta = {
      date,
      pr: 'ai-audit',
      auditor,
      entries: surfaceEntries.sort((a, b) =>
        a.name.localeCompare(b.name, 'en-US')
      ),
    };

    const fileName = `delta-${date}-ai-audit-${surface}.json`;
    const filePath = path.join('a11y', 'reports', 'deltas', fileName);

    await mkdir(path.dirname(filePath), {recursive: true});
    await writeFile(filePath, JSON.stringify(delta, null, 2) + '\n', 'utf8');
    writtenFiles.push(filePath);
  }

  return writtenFiles;
}

async function evaluateComponent(page, clientWrapper, story, config) {
  await navigateToStory(page, config.storybookUrl, story.storyId);

  const {screenshot: defaultScreenshot, accessibilityTree} =
    await captureDefaultViewport(page);

  const {hoverDetected, hoverScreenshot, hoverDetails} =
    await captureHoverState(page);

  const call1Messages = buildCall1Messages(
    story.componentName,
    defaultScreenshot,
    accessibilityTree,
    hoverDetected,
    hoverScreenshot,
    hoverDetails
  );
  const call1Response = await callLLMWithRetry(
    clientWrapper,
    call1Messages,
    config
  );
  const call1Validated = validateLLMResponse(call1Response, CALL1_KEYS);

  const {reflow, portrait, landscape} = await captureMultiViewport(page);

  const call2Messages = buildCall2Messages(
    story.componentName,
    reflow.screenshot,
    reflow.hasHorizontalScroll,
    portrait,
    landscape
  );
  const call2Response = await callLLMWithRetry(
    clientWrapper,
    call2Messages,
    config
  );
  const call2Validated = validateLLMResponse(call2Response, CALL2_KEYS);

  const merged = mergeResults(call1Validated, call2Validated);

  return buildDeltaEntry(
    story.componentName,
    story.surface,
    config.model,
    merged
  );
}

function summarizeCriteria(wcag22Criteria) {
  const values = Object.values(wcag22Criteria);
  return {
    pass: values.filter((v) => v === 'pass').length,
    fail: values.filter((v) => v === 'fail').length,
    partial: values.filter((v) => v === 'partial').length,
    na: values.filter((v) => v === 'not-applicable').length,
  };
}

function pct(n, total) {
  return total === 0 ? '0%' : `${((n / total) * 100).toFixed(1)}%`;
}

async function main() {
  const config = parseArgs();
  if (config.help) printHelp();

  console.log('AI WCAG 2.2 Audit Agent');
  console.log('='.repeat(50));

  // Fetch story index (needed for both dry-run and real run)
  let index;
  try {
    index = await fetchStoryIndex(config.storybookUrl);
  } catch (error) {
    if (config.dryRun) {
      console.error(
        `Warning: Cannot reach Storybook at ${config.storybookUrl}. ` +
          'Dry-run requires a running Storybook instance to discover stories.\n' +
          `Details: ${error.message}`
      );
      process.exit(1);
    }
    throw error;
  }

  if (!config.dryRun) {
    await validateEnvironment(config);
  }

  const stories = selectStories(index.entries ?? index, config);

  if (stories.length === 0) {
    console.log('No components found matching the specified filters.');
    process.exit(0);
  }

  const existingProgress = await loadProgress(config);
  const alreadyDone = existingProgress?.completedComponents?.size ?? 0;
  const remaining = stories.filter(
    (s) => !existingProgress?.completedComponents?.has(s.componentName)
  );
  const estimatedCalls = remaining.length * 2;

  console.log(`Model:       ${config.model}`);
  console.log(`Surface:     ${config.surface}`);
  console.log(`Storybook:   ${config.storybookUrl}`);
  console.log(
    `Components:  ${stories.length} found, ${remaining.length} to audit` +
      (alreadyDone > 0 ? ` (${alreadyDone} already completed)` : '')
  );
  console.log(`API calls:   ${estimatedCalls} estimated (2 per component)`);

  if (estimatedCalls > 50) {
    console.log(
      `  Note: Free tier has a 50 calls/day limit. Use --max-components ${Math.floor(50 / 2)} ` +
        `to stay within daily quota.`
    );
  }
  console.log('');

  if (config.dryRun) {
    console.log('[DRY RUN] Components that would be audited:\n');
    for (const story of stories) {
      const done = existingProgress?.completedComponents?.has(
        story.componentName
      );
      console.log(
        `  ${done ? 'done' : '    '} ${story.componentName} (${story.surface}) - ${story.storyTitle}`
      );
    }
    console.log(
      `\nRemove --dry-run to execute. Estimated API calls: ${estimatedCalls}`
    );
    process.exit(0);
  }

  const {browser, page} = await initBrowser();
  const clientWrapper = initLLMClient(config);

  const progressState = {
    startedAt: existingProgress?.startedAt ?? new Date().toISOString(),
    model: config.model,
    surface: config.surface,
    completedComponents: existingProgress
      ? [...existingProgress.completedComponents]
      : [],
    entries: existingProgress?.entries ?? [],
  };

  const maxNameLen = Math.max(...stories.map((s) => s.componentName.length));
  const pad = String(stories.length).length;

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];

    if (existingProgress?.completedComponents?.has(story.componentName)) {
      console.log(
        `[${String(i + 1).padStart(pad)}/${stories.length}] ` +
          `${story.componentName} ` +
          `${'·'.repeat(maxNameLen - story.componentName.length + 2)} already completed`
      );
      continue;
    }

    try {
      const entry = await evaluateComponent(page, clientWrapper, story, config);
      progressState.entries.push(entry);
      progressState.completedComponents.push(story.componentName);
      await saveProgress(progressState, config);

      const counts = summarizeCriteria(entry.results.wcag22Criteria);
      console.log(
        `[${String(i + 1).padStart(pad)}/${stories.length}] ` +
          `${story.componentName} ` +
          `${'·'.repeat(maxNameLen - story.componentName.length + 2)} ` +
          `${counts.pass} pass, ${counts.fail} fail, ` +
          `${counts.partial} partial, ${counts.na} n/a`
      );
    } catch (error) {
      if (error instanceof RateLimitExhaustedError) {
        console.log(`\n${error.message}`);
        console.log(
          `Progress saved: ${progressState.completedComponents.length} of ${stories.length} components completed.`
        );
        console.log(
          `Resume with: node a11y/scripts/ai-wcag-audit.mjs` +
            (config.surface !== 'all' ? ` --surface ${config.surface}` : '') +
            ` --resume`
        );
        await saveProgress(progressState, config);
        await browser.close();
        process.exit(2);
      }

      if (error instanceof LLMParseError) {
        console.log(
          `[${String(i + 1).padStart(pad)}/${stories.length}] ` +
            `${story.componentName} ` +
            `${'·'.repeat(maxNameLen - story.componentName.length + 2)} ` +
            `LLM parse error - defaulting to not-applicable`
        );
        const fallback = buildFallbackEntry(story, config.model);
        progressState.entries.push(fallback);
        progressState.completedComponents.push(story.componentName);
        await saveProgress(progressState, config);
        continue;
      }

      console.error(
        `[${String(i + 1).padStart(pad)}/${stories.length}] ` +
          `${story.componentName} ` +
          `${'·'.repeat(maxNameLen - story.componentName.length + 2)} ` +
          `Error: ${error.message}`
      );
      continue;
    }
  }

  await browser.close();
  const writtenFiles = await writeDeltaFiles(progressState.entries, config);
  await clearProgress();

  console.log('\n' + '='.repeat(50));
  console.log('Summary');
  const allCriteriaValues = progressState.entries.flatMap((e) =>
    Object.values(e.results.wcag22Criteria)
  );
  const totals = {
    pass: allCriteriaValues.filter((s) => s === 'pass').length,
    fail: allCriteriaValues.filter((s) => s === 'fail').length,
    partial: allCriteriaValues.filter((s) => s === 'partial').length,
    na: allCriteriaValues.filter((s) => s === 'not-applicable').length,
  };
  const totalEvals = allCriteriaValues.length;

  console.log(`  Components:      ${progressState.entries.length}`);
  console.log(
    `  Evaluations:     ${totalEvals} (${progressState.entries.length} x 9)`
  );
  console.log(
    `  Pass:            ${totals.pass} (${pct(totals.pass, totalEvals)})`
  );
  console.log(
    `  Fail:            ${totals.fail} (${pct(totals.fail, totalEvals)})`
  );
  console.log(
    `  Partial:         ${totals.partial} (${pct(totals.partial, totalEvals)})`
  );
  console.log(
    `  Not applicable:  ${totals.na} (${pct(totals.na, totalEvals)})`
  );
  console.log('');
  console.log('Delta files written:');
  for (const f of writtenFiles) {
    console.log(`  ${f}`);
  }
  console.log('');
  console.log('Next steps:');
  for (const f of writtenFiles) {
    console.log(`  node a11y/scripts/manual-audit-delta.mjs validate ${f}`);
  }
  console.log('  node a11y/scripts/manual-audit-delta.mjs merge --dry-run');
}

main().catch((error) => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
