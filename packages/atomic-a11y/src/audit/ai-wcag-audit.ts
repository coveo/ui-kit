import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs as nodeParseArgs} from 'node:util';
import {
  ALL_AI_CRITERIA,
  STATIC_NA_CRITERIA,
  SURFACE_PREFIXES,
} from '../shared/constants.js';
import type {DeltaEntry} from '../shared/types.js';
import {
  captureDefaultViewport,
  captureFocusStates,
  captureHoverState,
  captureInteractionStates,
  captureMultiViewport,
  captureTargetSizes,
  captureTextSpacing,
  initBrowser,
  navigateToStory,
} from './browser-capture.js';
import {
  callLLMWithRetry,
  initLLMClient,
  type LLMClientWrapper,
  type LLMMessage,
  LLMParseError,
  type MergedResults,
  mergeResults,
  RateLimitExhaustedError,
  validateLLMResponse,
} from './llm-client.js';
import {Logger} from './logger.js';
import {
  clearProgress,
  loadProgress,
  type ProgressState,
  saveProgress,
} from './progress.js';
import {
  buildCall2Messages,
  buildMergedCall1_3Messages,
  CALL2_KEYS,
  MERGED_CALL1_3_KEYS,
} from './prompts.js';
import type {PlaywrightPage} from './types.js';

interface Config {
  surface: string;
  component: string | null;
  dryRun: boolean;
  resume: boolean;
  maxComponents: number;
  model: string;
  concurrency: number;
  logSteps: boolean;
  verbose: boolean;
  storybookUrl: string;
  help: boolean;
}

function parseArgs(): Config {
  const {values} = nodeParseArgs({
    options: {
      surface: {type: 'string', default: 'all'},
      component: {type: 'string', default: ''},
      'dry-run': {type: 'boolean', default: false},
      resume: {type: 'boolean', default: false},
      'max-components': {type: 'string', default: 'Infinity'},
      model: {type: 'string', default: 'gpt-4o'},
      concurrency: {type: 'string', default: '1'},
      'log-steps': {type: 'boolean', default: false},
      verbose: {type: 'boolean', default: false},
      'storybook-url': {type: 'string', default: 'http://localhost:4400'},
      help: {type: 'boolean', default: false},
    },
    strict: false,
    allowPositionals: false,
  });

  const config: Config = {
    surface: values.surface as string,
    component: (values.component as string) || null,
    dryRun: values['dry-run'] as boolean,
    resume: values.resume as boolean,
    maxComponents: parseInt(values['max-components'] as string, 10) || Infinity,
    model: values.model as string,
    concurrency: Math.max(1, parseInt(values.concurrency as string, 10) || 1),
    logSteps: (values['log-steps'] as boolean) || (values.verbose as boolean),
    verbose: values.verbose as boolean,
    storybookUrl: (values['storybook-url'] as string).replace(/\/$/, ''),
    help: values.help as boolean,
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

function printHelp(): void {
  console.log(`AI WCAG 2.2 Audit Agent
Evaluates Storybook components against 21 WCAG 2.2 criteria using LLM vision analysis.

Usage:
  node scripts/ai-wcag-audit.mjs [options]

Options:
  --surface <name>        Surface to audit: commerce, search, insight, ipx, recommendations, all (default: all)
  --component <name>      Audit a single component by tag name (e.g., atomic-commerce-facet)
  --dry-run               Show what would be audited without making LLM calls
  --resume                Resume from a previous interrupted run
  --max-components <n>    Maximum number of components to audit (default: all)
  --model <id>            LLM model to use (default: gpt-4o)
  --concurrency <n>       Number of parallel LLM calls (default: 1)
  --log-steps             Print detailed pipeline steps
  --verbose               Print raw LLM responses (implies --log-steps)
  --help                  Show this help message

Environment:
  GITHUB_TOKEN            Required. GitHub PAT with 'models' scope for GitHub Models API.

Examples:
  node scripts/ai-wcag-audit.mjs --surface commerce
  node scripts/ai-wcag-audit.mjs --component atomic-commerce-facet --verbose
  node scripts/ai-wcag-audit.mjs --surface commerce --max-components 25
  node scripts/ai-wcag-audit.mjs --surface commerce --resume
  node scripts/ai-wcag-audit.mjs --component atomic-search-box --log-steps
  node scripts/ai-wcag-audit.mjs --surface search --model gpt-4o-mini

Output:
  Delta files in a11y/reports/deltas/delta-YYYY-MM-DD-ai-audit-<surface>.json
  Validate with: node scripts/manual-audit-delta.mjs validate <delta-file>
  Merge with:    node scripts/manual-audit-delta.mjs merge --dry-run`);
  process.exit(0);
}

async function validateEnvironment(config: Config): Promise<void> {
  if (!process.env.LLM_API_KEY && !process.env.GITHUB_TOKEN) {
    console.error(
      'Error: No API key found.\n\n' +
        'Set one of the following environment variables:\n' +
        '  export LLM_API_KEY="sk-..."        # OpenAI, OpenRouter, or any OpenAI-compatible provider\n' +
        '  export GITHUB_TOKEN="github_pat_..." # GitHub Models (default)\n\n' +
        'For GitHub Models, create a fine-grained PAT with "Models: Read" permission:\n' +
        '  https://github.com/settings/personal-access-tokens/new'
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
        `Details: ${(error as Error).message}`
    );
    process.exit(1);
  }

  try {
    await import('openai' as string);
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

interface StoryIndex {
  entries?: Record<string, StoryEntry>;
  [key: string]: unknown;
}

interface StoryEntry {
  type: string;
  title?: string;
  name?: string;
  importPath?: string;
  [key: string]: unknown;
}

async function fetchStoryIndex(storybookUrl: string): Promise<StoryIndex> {
  const res = await fetch(`${storybookUrl}/index.json`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch story index: HTTP ${res.status}`);
  }
  return res.json() as Promise<StoryIndex>;
}

function detectSurface(storyTitle: string | undefined): string | null {
  if (!storyTitle) return null;
  const prefix = storyTitle.split('/')[0].toLowerCase();
  return SURFACE_PREFIXES[prefix] || null;
}

function extractComponentName(importPath: string | undefined): string | null {
  if (!importPath) return null;
  // Match the last directory segment before the filename — this is the component dir.
  // Handles nested paths like search/facets/atomic-facet/atomic-facet.stories.tsx
  const pattern =
    /\/src\/components\/(?:commerce|search|insight|ipx|recommendations)\/(?:.+\/)?([^/]+)\/[^/]+$/;
  const match = importPath.match(pattern);
  return match ? match[1] : null;
}

interface Story {
  storyId: string;
  componentName: string;
  surface: string;
  storyTitle: string;
  storyName: string;
}

function selectStories(
  indexEntries: Record<string, StoryEntry>,
  config: Config
): Story[] {
  const byComponent = new Map<string, Story>();

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
        storyTitle: entry.title!,
        storyName: entry.name!,
      });
    }
    if (entry.name?.toLowerCase() === 'default') {
      byComponent.set(componentName, {
        storyId,
        componentName,
        surface,
        storyTitle: entry.title!,
        storyName: entry.name!,
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

function buildDeltaEntry(
  componentName: string,
  surface: string,
  model: string,
  mergedResults: MergedResults
): DeltaEntry {
  const date = new Date().toISOString().slice(0, 10);
  const auditor = `AI Agent (${model})`;

  let notes = `AI-evaluated (${model}, ${date}).`;
  if (mergedResults.evidenceParts.length > 0) {
    notes += ` ${mergedResults.evidenceParts.join(' | ')}`;
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

function buildFallbackEntry(story: Story, model: string): DeltaEntry {
  const date = new Date().toISOString().slice(0, 10);
  const wcag22Criteria: Record<string, string> = {};
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

async function writeDeltaFiles(
  entries: DeltaEntry[],
  config: Config
): Promise<string[]> {
  const date = new Date().toISOString().slice(0, 10);
  const auditor = `AI Agent (${config.model})`;

  const bySurface = new Map<string, DeltaEntry[]>();
  for (const entry of entries) {
    const surface = entry.surface;
    if (!bySurface.has(surface)) {
      bySurface.set(surface, []);
    }
    bySurface.get(surface)!.push(entry);
  }

  const writtenFiles: string[] = [];

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
    await writeFile(filePath, `${JSON.stringify(delta, null, 2)}\n`, 'utf8');
    writtenFiles.push(filePath);
  }

  return writtenFiles;
}

async function evaluateComponent(
  page: PlaywrightPage,
  clientWrapper: LLMClientWrapper,
  story: Story,
  config: Config,
  logger: Logger
): Promise<DeltaEntry> {
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

  const countAccessibilityNodes = (node: unknown): number => {
    if (!node || typeof node !== 'object') {
      return 0;
    }
    const children = (node as {children?: unknown[]}).children ?? [];
    let total = 1;
    for (const child of children) {
      total += countAccessibilityNodes(child);
    }
    return total;
  };

  const countImageParts = (messages: LLMMessage[]): number =>
    messages.reduce((total, message) => {
      if (!Array.isArray(message.content)) {
        return total;
      }
      return (
        total +
        message.content.filter(
          (part) =>
            part.type === 'image_url' &&
            !!part.image_url?.url &&
            part.image_url.url.length > 0
        ).length
      );
    }, 0);

  const navigationTimer = logger.timer();
  await navigateToStory(page, config.storybookUrl, story.storyId);
  logger.step(
    'branch',
    'Navigate',
    `iframe.html?id=${story.storyId}`,
    navigationTimer()
  );

  // ── Capture phase (all captures upfront) ──────────────────────────────────
  const defaultCaptureTimer = logger.timer();
  const {screenshot: defaultScreenshot, accessibilityTree} =
    await captureDefaultViewport(page);
  const a11yNodeCount = countAccessibilityNodes(accessibilityTree);
  logger.step(
    'branch',
    'Capture',
    `default-viewport (a11y tree: ${a11yNodeCount} nodes)`,
    defaultCaptureTimer()
  );

  // Hover MUST run before textSpacing (textSpacing reloads the page)
  const hoverCandidates = await page.locator(interactiveSelector).count();
  const hoverTestCount = Math.min(hoverCandidates, 5);
  const hoverCaptureTimer = logger.timer();
  const {hoverDetected, hoverScreenshot, hoverDetails} =
    await captureHoverState(page);
  logger.step(
    'branch',
    'Capture',
    `hover-state (${hoverTestCount} elements tested, ${hoverDetected ? 'hover detected' : 'no hover changes'})`,
    hoverCaptureTimer()
  );
  if (hoverDetected && hoverDetails) {
    logger.substep(`Hover details: ${hoverDetails}`);
  }

  // Multi-viewport restores to 1024x768 — safe between hover and textSpacing
  const multiViewportTimer = logger.timer();
  const {reflow, portrait, landscape} = await captureMultiViewport(page);
  logger.step(
    'branch',
    'Capture',
    `multi-viewport (reflow: ${reflow.hasHorizontalScroll ? 'has h-scroll' : 'no h-scroll'})`,
    multiViewportTimer()
  );

  const textSpacingTimer = logger.timer();
  const {textSpacingScreenshot} = await captureTextSpacing(page);
  const textSpacingApplied = textSpacingScreenshot.length > 0;
  logger.step(
    'branch',
    'Capture',
    `text-spacing (${textSpacingApplied ? 'CSS injected + page reload' : 'capture failed'})`,
    textSpacingTimer()
  );

  const focusTimer = logger.timer();
  const {focusScreenshots, focusDetails, hasFocusableElements} =
    await captureFocusStates(page);
  const focusPath = focusDetails
    .split(', ')
    .map((step) => step.split(': ')[1])
    .filter((tag): tag is string => !!tag)
    .join('→');
  logger.step(
    'branch',
    'Capture',
    `focus-states (${hasFocusableElements ? focusScreenshots.length : 0} focusable${focusPath ? `, tabs: ${focusPath}` : ''})`,
    focusTimer()
  );

  const targetSizeElements = await page.locator(interactiveSelector).count();
  const targetSizeTimer = logger.timer();
  const {targetSizeData} = await captureTargetSizes(page);
  logger.step(
    'branch',
    'Capture',
    `target-sizes (${targetSizeElements} interactive elements)`,
    targetSizeTimer()
  );

  // APG interaction protocols — MUST run last (mutates component state via keyboard)
  const interactionTimer = logger.timer();
  const {interactions, summary: interactionSummary} =
    await captureInteractionStates(page);
  const matchedProtocols = interactions
    .map((i) => i.role)
    .filter((v, i, a) => a.indexOf(v) === i);
  logger.step(
    'branch',
    'Capture',
    `interaction-protocols (${matchedProtocols.length} roles matched, ${interactions.length} actions, ${interactions.filter((i) => i.stateChanged).length} state changes)`,
    interactionTimer()
  );
  if (interactions.length > 0) {
    logger.substep(`Roles: ${matchedProtocols.join(', ')}`);
  }

  // ── LLM call phase (2 calls + 1 static) ─────────────────────────────────

  // Merged Call 1+3: 15 criteria, up to 6 images
  const mergedMessages = buildMergedCall1_3Messages(
    story.componentName,
    defaultScreenshot,
    accessibilityTree,
    hoverDetected,
    hoverScreenshot,
    hoverDetails,
    textSpacingApplied ? textSpacingScreenshot : null,
    focusScreenshots,
    textSpacingApplied,
    focusDetails,
    hasFocusableElements,
    targetSizeData,
    interactionSummary
  );
  const mergedImageCount = countImageParts(mergedMessages);
  const mergedCallTimer = logger.timer();
  const mergedResponse = await callLLMWithRetry(
    clientWrapper,
    mergedMessages,
    config
  );
  logger.step(
    'branch',
    'LLM Call 2',
    `${MERGED_CALL1_3_KEYS.length} criteria (${mergedImageCount} images sent)`,
    mergedCallTimer()
  );
  const mergedValidated = validateLLMResponse(
    mergedResponse,
    MERGED_CALL1_3_KEYS
  );

  // Call 2: 3 viewport-dependent criteria
  const call2Messages = buildCall2Messages(
    story.componentName,
    reflow.screenshot,
    reflow.hasHorizontalScroll,
    portrait,
    landscape
  );
  const call2ImageCount = countImageParts(call2Messages);
  const call2Timer = logger.timer();
  const call2Response = await callLLMWithRetry(
    clientWrapper,
    call2Messages,
    config
  );
  logger.step(
    'branch',
    'LLM Call 2 (viewport)',
    `${CALL2_KEYS.length} criteria (${call2ImageCount} images sent)`,
    call2Timer()
  );
  const call2Validated = validateLLMResponse(call2Response, CALL2_KEYS);

  // Static Call 4: 3 criteria always not-applicable in isolated Storybook
  const staticCall4 = {
    criteria: Object.fromEntries(STATIC_NA_CRITERIA),
  };
  logger.step(
    'branch',
    'Static assignment',
    `${STATIC_NA_CRITERIA.size} criteria (not-applicable)`
  );

  const merged = mergeResults(mergedValidated, call2Validated, staticCall4);
  const counts = summarizeCriteria(merged.wcag22Criteria);
  logger.step(
    'last',
    'Result',
    `${counts.pass} pass, ${counts.fail} fail, ${counts.partial} partial, ${counts.na} n/a`
  );

  return buildDeltaEntry(
    story.componentName,
    story.surface,
    config.model,
    merged
  );
}

interface CriteriaCounts {
  pass: number;
  fail: number;
  partial: number;
  na: number;
}

function summarizeCriteria(
  wcag22Criteria: Record<string, string>
): CriteriaCounts {
  const values = Object.values(wcag22Criteria);
  return {
    pass: values.filter((v) => v === 'pass').length,
    fail: values.filter((v) => v === 'fail').length,
    partial: values.filter((v) => v === 'partial').length,
    na: values.filter((v) => v === 'not-applicable').length,
  };
}

function pct(n: number, total: number): string {
  return total === 0 ? '0%' : `${((n / total) * 100).toFixed(1)}%`;
}

export async function main(): Promise<void> {
  const config = parseArgs();
  const logger = new Logger(config.logSteps);
  if (config.help) printHelp();

  console.log('AI WCAG 2.2 Audit Agent');
  console.log('='.repeat(50));

  // Fetch story index (needed for both dry-run and real run)
  let index: StoryIndex;
  try {
    index = await fetchStoryIndex(config.storybookUrl);
  } catch (error) {
    if (config.dryRun) {
      console.error(
        `Warning: Cannot reach Storybook at ${config.storybookUrl}. ` +
          'Dry-run requires a running Storybook instance to discover stories.\n' +
          `Details: ${(error as Error).message}`
      );
      process.exit(1);
    }
    throw error;
  }

  if (!config.dryRun) {
    await validateEnvironment(config);
  }

  // StoryIndex might be the entries record itself in some versions
  const stories = selectStories(
    (index.entries ?? index) as Record<string, StoryEntry>,
    config
  );

  if (stories.length === 0) {
    console.log('No components found matching the specified filters.');
    process.exit(0);
  }

  const existingProgress = await loadProgress({resume: config.resume});
  const alreadyDone = existingProgress?.completedComponents?.size ?? 0;
  const remaining = stories.filter(
    (s) => !existingProgress?.completedComponents.has(s.componentName)
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
  if (config.concurrency > 1) {
    console.log(`Concurrency: ${config.concurrency} parallel workers`);
  }

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
      const done = existingProgress?.completedComponents.has(
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

  const {browser, pages} = await initBrowser(config.concurrency);
  const clientWrapper = initLLMClient(config);

  const progressState: ProgressState = {
    startedAt: existingProgress?.startedAt ?? new Date().toISOString(),
    model: config.model,
    surface: config.surface,
    completedComponents: existingProgress
      ? new Set(existingProgress.completedComponents)
      : new Set(),
    entries: existingProgress?.entries ?? [],
  };

  const maxNameLen = Math.max(...stories.map((s) => s.componentName.length));
  const pad = String(stories.length).length;

  // Track whether a fatal error (e.g. rate limit) requires aborting all workers
  let abortError: Error | null = null;

  // Progress save mutex — ensures only one write at a time
  let saveLock: Promise<void> = Promise.resolve();
  async function saveProgressSafe(
    state: ProgressState,
    cfg: Config
  ): Promise<void> {
    saveLock = saveLock.then(() =>
      saveProgress(state, {model: cfg.model, surface: cfg.surface})
    );
    return saveLock;
  }

  function formatProgress(idx: number, name: string, suffix: string): string {
    return (
      `[${String(idx + 1).padStart(pad)}/${stories.length}] ` +
      `${name} ` +
      `${'·'.repeat(maxNameLen - name.length + 2)} ${suffix}`
    );
  }

  // Filter to stories that still need processing
  const toProcess: Array<{index: number; story: Story}> = [];
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    if (progressState.completedComponents.has(story.componentName)) {
      console.log(formatProgress(i, story.componentName, 'already completed'));
    } else {
      toProcess.push({index: i, story});
    }
  }

  // ── Build processing queue ──────────────────────────────────────────────

  interface QueueItem {
    index: number;
    story: Story;
  }

  const queue: QueueItem[] = toProcess.map((item) => ({
    index: item.index,
    story: item.story,
  }));

  // ── Worker function ────────────────────────────────────────────────────

  async function processItem(
    page: PlaywrightPage,
    item: QueueItem
  ): Promise<void> {
    const {index, story} = item;

    try {
      if (logger.isVerbose()) {
        logger.line(
          `[${String(index + 1).padStart(pad)}/${stories.length}] ${story.componentName} (${story.surface})`
        );
      }

      const entry = await evaluateComponent(
        page,
        clientWrapper,
        story,
        config,
        logger
      );

      progressState.entries.push(entry);
      progressState.completedComponents.add(story.componentName);
      await saveProgressSafe(progressState, config);

      const counts = summarizeCriteria(entry.results.wcag22Criteria ?? {});
      if (!logger.isVerbose()) {
        console.log(
          formatProgress(
            index,
            story.componentName,
            `${counts.pass} pass, ${counts.fail} fail, ${counts.partial} partial, ${counts.na} n/a`
          )
        );
      }
    } catch (error) {
      if (error instanceof RateLimitExhaustedError) {
        abortError = error;
        return;
      }

      if (error instanceof LLMParseError) {
        console.log(
          formatProgress(
            index,
            story.componentName,
            'LLM parse error - defaulting to not-applicable'
          )
        );
        const fallback = buildFallbackEntry(story, config.model);
        progressState.entries.push(fallback);
        progressState.completedComponents.add(story.componentName);
        await saveProgressSafe(progressState, config);
        return;
      }

      console.error(
        formatProgress(
          index,
          story.componentName,
          `Error: ${(error as Error).message}`
        )
      );
    }
  }

  // ── Execute processing ─────────────────────────────────────────────────

  async function runQueue(queue: QueueItem[]): Promise<void> {
    let qCursor = 0;
    async function qWorker(page: PlaywrightPage): Promise<void> {
      while (!abortError) {
        const next = qCursor++;
        if (next >= queue.length) return;
        await processItem(page, queue[next]);
      }
    }
    await Promise.all(pages.map((page) => qWorker(page)));
  }

  await runQueue(queue);

  // Handle rate limit abort
  if (abortError) {
    console.log(`\n${(abortError as unknown as Error).message}`);
    console.log(
      `Progress saved: ${progressState.completedComponents.size} of ${stories.length} components completed.`
    );
    console.log(
      `Resume with: node scripts/ai-wcag-audit.mjs` +
        (config.surface !== 'all' ? ` --surface ${config.surface}` : '') +
        ` --resume`
    );
    await saveProgress(progressState, {
      model: config.model,
      surface: config.surface,
    });
    await browser.close();
    process.exit(2);
  }

  await browser.close();
  const writtenFiles = await writeDeltaFiles(progressState.entries, config);
  await clearProgress();

  console.log(`\n${'='.repeat(50)}`);
  console.log('Summary');
  const allCriteriaValues = progressState.entries.flatMap((e) =>
    Object.values(e.results.wcag22Criteria ?? {})
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
    `  Evaluations:     ${totalEvals} (${progressState.entries.length} x 21)`
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
    console.log(`  node scripts/manual-audit-delta.mjs validate ${f}`);
  }
  console.log('  node scripts/manual-audit-delta.mjs merge --dry-run');
}
