import {
  type AccessibilityNode,
  annotateBoundingBoxes,
  collectBoundingBoxes,
  diffAccessibilityTrees,
} from './accessibility-tree.js';
import {
  INTERACTION_PROTOCOLS,
  type InteractionProtocol,
} from './interaction-protocols.js';
import type {
  LiveRegionCaptureResult,
  LiveRegionChange,
  PlaywrightBrowser,
  PlaywrightPage,
} from './types.js';

export interface BrowserContext {
  browser: PlaywrightBrowser;
  pages: PlaywrightPage[];
}

/**
 * Launch a headless Chromium browser and create reusable page instances for
 * parallel story evaluation. Each page is pre-configured with a 1024×768
 * desktop viewport.
 *
 * @param concurrency - Number of parallel browser pages to create.
 */
export async function initBrowser(
  concurrency: number
): Promise<BrowserContext> {
  const {chromium} = await import('playwright' as string);
  const browser = await chromium.launch({headless: true});
  const pages = await Promise.all(
    Array.from({length: concurrency}, async () => {
      const page = await browser.newPage();
      await page.setViewportSize({width: 1024, height: 768});
      return page;
    })
  );
  return {browser, pages};
}

/**
 * Navigate a Playwright page to a specific Storybook story rendered in
 * isolation via the iframe endpoint. Waits for network idle and an additional
 * 1 s for component hydration.
 *
 * @param page - Playwright page instance.
 * @param storybookUrl - Base URL of the running Storybook server.
 * @param storyId - Storybook story ID (e.g. `commerce-atomic-product--default`).
 */
export async function navigateToStory(
  page: PlaywrightPage,
  storybookUrl: string,
  storyId: string
): Promise<void> {
  const url = `${storybookUrl}/iframe.html?id=${storyId}&viewMode=story`;
  await page.goto(url, {waitUntil: 'networkidle', timeout: 30000});
  // Wait for component to render
  await page.waitForTimeout(1000);
}

export interface CaptureResult {
  screenshot: string;
  accessibilityTree: AccessibilityNode | null;
}

/**
 * Capture the baseline visual and semantic state of the component at the
 * default desktop viewport (1024×768).
 *
 * Returns a full-page screenshot (base64 PNG) and the complete accessibility
 * tree snapshot. Together these provide the LLM with both visual and semantic
 * evidence for evaluating criteria that rely on layout-vs-DOM-order comparison,
 * role/name/state inspection, and visual content analysis.
 *
 * **WCAG 2.2 criteria supported:**
 * - 1.3.2 Meaningful Sequence — compare a11y tree order vs. visual layout
 * - 1.3.3 Sensory Characteristics — inspect visible text for sensory-only cues
 * - 1.3.5 Identify Input Purpose — check a11y tree for `autocomplete` on inputs
 * - 1.4.5 Images of Text — detect text rendered as images
 * - 1.4.11 Non-text Contrast — assess UI boundary contrast from screenshot
 * - 2.4.4 Link Purpose — inspect link/button accessible names in the a11y tree
 * - 2.4.6 Headings and Labels — check heading/label text quality in the a11y tree
 * - 3.3.3 Error Suggestion — look for error states and suggestion text
 * - 3.3.4 Error Prevention — look for confirmation/undo patterns
 * - 4.1.3 Status Messages — check a11y tree for `aria-live` regions
 */
export async function captureDefaultViewport(
  page: PlaywrightPage
): Promise<CaptureResult> {
  await page.setViewportSize({width: 1024, height: 768});
  await page.waitForTimeout(300);

  const screenshot = (
    await page.screenshot({type: 'png', fullPage: true})
  ).toString('base64');
  const accessibilityTree = await page.accessibility.snapshot({
    interestingOnly: false,
  });

  // Annotate a11y tree nodes with visual bounding boxes so consumers can
  // compare DOM reading order (tree sequence) vs visual layout order (bbox y,x).
  const domBoxes = await collectBoundingBoxes(page);
  annotateBoundingBoxes(accessibilityTree, domBoxes);

  return {screenshot, accessibilityTree};
}

export interface HoverCaptureResult {
  hoverDetected: boolean;
  hoverScreenshot: string | null;
  hoverDetails: string;
}

/**
 * Detect hover-triggered supplementary content (tooltips, popovers, menus).
 *
 * Snapshots the accessibility tree before interaction, then hovers up to 5
 * interactive elements. After each hover, a second tree snapshot is diffed
 * against the baseline. If new nodes appear, a screenshot is captured and a
 * human-readable description is generated for the LLM.
 *
 * Resets the mouse position to (0, 0) after testing to avoid polluting
 * subsequent captures.
 *
 * **WCAG 2.2 criteria supported:**
 * - 1.4.13 Content on Hover/Focus — the LLM evaluates whether revealed content
 *   is dismissible, hoverable, and persistent based on the screenshot and details
 */
export async function captureHoverState(
  page: PlaywrightPage
): Promise<HoverCaptureResult> {
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
    'textarea',
    'select',
    '[tabindex="0"]',
  ].join(', ');

  const interactiveLocators = page.locator(interactiveSelector);
  const totalCount = await interactiveLocators.count();
  const testCount = Math.min(totalCount, 5);

  let hoverDetected = false;
  let hoverScreenshot: string | null = null;
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
        const tagName = await el.evaluate((e: Element) =>
          e.tagName.toLowerCase()
        );
        hoverDetails =
          `Hovering over interactive element ${i} (${tagName}) ` +
          `revealed ${newNodes.length} new accessibility node(s): ${newNodeDescriptions}`;

        break;
      }
    } catch {}
  }

  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);

  return {hoverDetected, hoverScreenshot, hoverDetails};
}

export interface MultiViewportResult {
  reflow: {screenshot: string; hasHorizontalScroll: boolean};
  portrait: string;
  landscape: string;
}

/**
 * Capture responsive behaviour across three viewport sizes:
 *
 * 1. **Reflow (320×480)** — simulates 400% zoom on a 1280 px display. Also
 *    measures `scrollWidth > clientWidth` to programmatically detect horizontal
 *    overflow.
 * 2. **Portrait (375×812)** — iPhone-sized portrait orientation.
 * 3. **Landscape (812×375)** — same device rotated to landscape.
 *
 * Restores the viewport to 1024×768 before returning.
 *
 * **WCAG 2.2 criteria supported:**
 * - 1.3.4 Orientation — portrait vs. landscape usability comparison
 * - 1.4.4 Resize Text — 320 px screenshot shows text legibility at effective 400% zoom
 * - 1.4.10 Reflow — 320 px viewport + horizontal-scroll flag tests content reflow
 */
export async function captureMultiViewport(
  page: PlaywrightPage
): Promise<MultiViewportResult> {
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

export interface FocusCaptureResult {
  focusScreenshots: string[];
  focusDetails: string;
  hasFocusableElements: boolean;
}

/**
 * Capture keyboard focus indicator visibility by tabbing through the component.
 *
 * Clicks at (0, 0) to clear any existing focus, then presses Tab up to 5 times.
 * After each Tab press, a screenshot is taken and the focused element's tag name
 * is recorded (including shadow DOM active elements). If the first Tab does not
 * move focus, the component is considered to have no focusable elements.
 *
 * **WCAG 2.2 criteria supported:**
 * - 2.4.7 Focus Visible — screenshots show whether focused elements have a
 *   distinguishable indicator (outline, ring, highlight)
 * - 2.4.11 Focus Not Obscured — screenshots show whether focused elements are
 *   at least partially visible and not covered by overlays or sticky elements
 */
export async function captureFocusStates(
  page: PlaywrightPage
): Promise<FocusCaptureResult> {
  try {
    await page.mouse.click(0, 0);
    await page.waitForTimeout(300);

    const initialTag = await page.evaluate(
      () => document.activeElement?.tagName || 'BODY'
    );

    const focusScreenshots: string[] = [];
    const focusSteps: string[] = [];
    let focusMoved = false;

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      const currentTag = await page.evaluate(() => {
        const ae = document.activeElement;
        return (
          ae?.shadowRoot?.activeElement?.tagName || ae?.tagName || 'unknown'
        );
      });

      if (i === 0 && currentTag === initialTag) {
        await page.mouse.click(0, 0);
        await page.waitForTimeout(300);
        return {
          focusScreenshots: [],
          focusDetails: 'No focusable elements detected',
          hasFocusableElements: false,
        };
      }

      focusMoved = true;
      const screenshot = (await page.screenshot({type: 'png'})).toString(
        'base64'
      );
      focusScreenshots.push(screenshot);
      focusSteps.push(`Tab ${i + 1}: ${currentTag}`);
    }

    await page.mouse.click(0, 0);
    await page.waitForTimeout(300);

    return {
      focusScreenshots,
      focusDetails: focusSteps.join(', '),
      hasFocusableElements: focusMoved,
    };
  } catch {
    return {
      focusScreenshots: [],
      focusDetails: 'Focus capture failed',
      hasFocusableElements: false,
    };
  }
}

export interface TextSpacingResult {
  textSpacingScreenshot: string;
}

/**
 * Apply WCAG 1.4.12 text-spacing overrides and capture the result.
 *
 * Injects CSS into every element (traversing shadow DOMs) with:
 * - `line-height: 1.5`
 * - `letter-spacing: 0.12em`
 * - `word-spacing: 0.16em`
 * - `margin-bottom: 2em` (paragraph spacing)
 *
 * Takes a full-page screenshot after injection, then reloads the page to
 * restore the original state for subsequent captures.
 *
 * **WCAG 2.2 criteria supported:**
 * - 1.4.12 Text Spacing — the LLM compares this screenshot against the default
 *   to detect text overflow, truncation, overlapping, or broken layout
 */
export async function captureTextSpacing(
  page: PlaywrightPage
): Promise<TextSpacingResult> {
  try {
    await page.evaluate(() => {
      function applySpacing(root: Document | ShadowRoot) {
        root.querySelectorAll('*').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.lineHeight = '1.5';
          htmlEl.style.letterSpacing = '0.12em';
          htmlEl.style.wordSpacing = '0.16em';
          htmlEl.style.setProperty('margin-bottom', '2em', 'important');
          if (htmlEl.shadowRoot) applySpacing(htmlEl.shadowRoot);
        });
      }
      applySpacing(document);
    });
    await page.waitForTimeout(500);

    const textSpacingScreenshot = (
      await page.screenshot({type: 'png', fullPage: true})
    ).toString('base64');

    await page.reload({waitUntil: 'networkidle'});
    await page.waitForTimeout(1000);

    return {textSpacingScreenshot};
  } catch {
    return {textSpacingScreenshot: ''};
  }
}

export interface TargetSizeResult {
  targetSizeData: string;
  targetSizeScreenshot: string;
}

/**
 * Measure the bounding-box dimensions of all interactive elements on the page,
 * including those inside shadow DOMs.
 *
 * Returns a human-readable summary of each element's tag, text label, and
 * `width×height` in CSS pixels, plus a viewport screenshot. The data allows the
 * LLM to compare measured sizes against the 24×24 px minimum threshold.
 *
 * **WCAG 2.2 criteria supported:**
 * - 2.5.8 Target Size (Minimum) — element dimensions vs. 24×24 px threshold
 * - 2.5.7 Dragging Movements — interactive element inventory helps identify
 *   sliders and draggable widgets that need keyboard alternatives
 */
// TODO: ensure this function captures a representative sample of interactive elements.
export async function captureTargetSizes(
  page: PlaywrightPage
): Promise<TargetSizeResult> {
  try {
    const interactiveSelector = [
      'button',
      'a[href]',
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="combobox"]',
      'input:not([type="hidden"])',
      'textarea',
      'select',
      '[tabindex="0"]',
    ].join(', ');

    const elements = await page.evaluate((selector: string) => {
      function findInteractive(root: Document | ShadowRoot) {
        const results: {
          tag: string;
          width: number;
          height: number;
          text: string;
        }[] = [];
        root.querySelectorAll('*').forEach((el) => {
          if (el.matches(selector)) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              results.push({
                tag: el.tagName.toLowerCase(),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                text: (el.textContent || '').trim().slice(0, 30),
              });
            }
          }
          const htmlEl = el as unknown as {
            shadowRoot: Document | ShadowRoot | null;
          };
          if (htmlEl.shadowRoot)
            results.push(...findInteractive(htmlEl.shadowRoot));
        });
        return results;
      }
      return findInteractive(document);
    }, interactiveSelector);

    const targetSizeData =
      elements.length > 0
        ? 'Interactive elements: ' +
          elements
            .map((e) => `${e.tag} '${e.text}' ${e.width}x${e.height}px`)
            .join(', ')
        : 'No interactive elements found';

    const targetSizeScreenshot = (
      await page.screenshot({type: 'png'})
    ).toString('base64');

    return {targetSizeData, targetSizeScreenshot};
  } catch {
    return {
      targetSizeData: 'Target size capture failed',
      targetSizeScreenshot: '',
    };
  }
}

// ---------------------------------------------------------------------------
// Layer 2: ARIA-Role Interaction Protocols
// ---------------------------------------------------------------------------

export interface InteractionStateCapture {
  role: string;
  elementName: string;
  action: string;
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  stateChanged: boolean;
}

export interface InteractionCaptureResult {
  interactions: InteractionStateCapture[];
  summary: string;
}

/**
 * Read the current ARIA state attributes and focused-element info for a
 * single element matching `selector`. Used as the before/after snapshot
 * helper for {@link captureInteractionStates}.
 */
async function getElementState(
  page: PlaywrightPage,
  selector: string,
  stateAttributes: string[]
): Promise<Record<string, unknown>> {
  try {
    const state = await page.evaluate(
      (args: {selector: string; attrs: string[]}) => {
        const el = document.querySelector(args.selector);
        if (!el) return {exists: false};
        const result: Record<string, unknown> = {exists: true};
        for (const attr of args.attrs) {
          if (attr === 'checked') {
            result[attr] = (el as HTMLInputElement).checked;
          } else {
            result[attr] = el.getAttribute(attr);
          }
        }
        // Also capture the focused element info
        const active = document.activeElement;
        result.__focusedRole =
          active?.getAttribute('role') ??
          active?.tagName?.toLowerCase() ??
          'none';
        result.__focusedName =
          active?.getAttribute('aria-label') ??
          active?.textContent?.trim().slice(0, 40) ??
          '';
        return result;
      },
      {selector, attrs: stateAttributes}
    );
    return state as Record<string, unknown>;
  } catch {
    return {exists: false, error: 'state capture failed'};
  }
}

/**
 * Execute deterministic APG keyboard protocols for every ARIA role found on
 * the page and record before/after state snapshots.
 *
 * Iterates {@link INTERACTION_PROTOCOLS} (25+ patterns: combobox, tab,
 * accordion, checkbox, slider, dialog, etc.). For each role present on the
 * page, the first visible matching element is focused and the protocol's
 * prescribed key sequences are executed (Enter, Space, Arrow keys, Escape,
 * Tab). State attributes (`aria-expanded`, `aria-selected`, `aria-checked`,
 * `aria-activedescendant`, etc.) are captured before and after each action.
 *
 * Protocols marked `expectsLiveRegion` are skipped here — they are handled
 * by {@link captureLiveRegionAnnouncements} instead.
 *
 * **WCAG 2.2 criteria supported:**
 * - 2.4.7 Focus Visible — interaction data shows whether focus remained
 *   visible during widget state changes
 * - 2.5.7 Dragging Movements — state changes on slider roles demonstrate
 *   keyboard alternatives to dragging
 * - 1.4.13 Content on Hover/Focus — tooltip show/dismiss state via Escape
 * - 4.1.3 Status Messages — interaction-triggered state changes inform
 *   whether status updates propagate correctly
 */
export async function captureInteractionStates(
  page: PlaywrightPage
): Promise<InteractionCaptureResult> {
  const interactions: InteractionStateCapture[] = [];

  for (const protocol of INTERACTION_PROTOCOLS) {
    try {
      if (protocol.expectsLiveRegion) continue;
      const locator = page.locator(protocol.selector);
      const count = await locator.count();
      if (count === 0) continue;

      // Only interact with the first matching element per role
      const el = locator.nth(0);
      const isVisible = await el.isVisible();
      if (!isVisible) continue;

      // Get element's accessible name for reporting
      const elementName = await el.evaluate((e: Element) => {
        return (
          e.getAttribute('aria-label') ??
          e.textContent?.trim().slice(0, 40) ??
          e.tagName.toLowerCase()
        );
      });

      for (const action of protocol.actions) {
        const beforeState = await getElementState(
          page,
          protocol.selector,
          protocol.stateAttributes
        );

        // Focus the element if required by this action
        if (action.focusFirst) {
          try {
            await el.focus();
            await page.waitForTimeout(200);
          } catch {
            // If focus fails, try clicking to focus instead
            try {
              await el.click({timeout: 2000, force: false});
              await page.waitForTimeout(200);
            } catch {
              continue;
            }
          }
        }

        // Execute key sequence
        for (const key of action.keys) {
          await page.keyboard.press(key);
          await page.waitForTimeout(150);
        }
        await page.waitForTimeout(300);

        const afterState = await getElementState(
          page,
          protocol.selector,
          protocol.stateAttributes
        );

        // Determine if any tracked state changed
        const stateChanged = protocol.stateAttributes.some(
          (attr) => beforeState[attr] !== afterState[attr]
        );

        interactions.push({
          role: protocol.role,
          elementName,
          action: action.name,
          beforeState,
          afterState,
          stateChanged,
        });
      }
    } catch {
      // Best-effort — skip roles that fail without breaking the whole capture
    }
  }

  // Build human-readable summary for LLM prompt injection
  const summary =
    interactions.length > 0
      ? interactions
          .map((i) => {
            const changes = i.stateChanged ? 'state changed' : 'no change';
            return `${i.role}(${i.elementName}): ${i.action} → ${changes}`;
          })
          .join('; ')
      : 'No interactive ARIA widgets found on page';

  return {interactions, summary};
}

/**
 * Install a `MutationObserver` on every `[aria-live]` element in the page.
 *
 * The observer records text changes (both `childList` and `characterData`
 * mutations) with millisecond timestamps into `window.__ariaLiveMutations`.
 * Call {@link collectLiveRegionMutations} after triggering an interaction to
 * retrieve and clean up recorded mutations.
 *
 * **WCAG 2.2 criteria supported:**
 * - 4.1.3 Status Messages — provides the temporal mutation data that proves
 *   whether `aria-live` regions actually update after user actions
 */
export async function startLiveRegionObserver(
  page: PlaywrightPage
): Promise<void> {
  try {
    await page.evaluate(() => {
      // biome-ignore lint/suspicious/noExplicitAny: accessing Playwright browser context globals
      (window as any).__ariaLiveMutations = [];
      const startTime = performance.now();
      const elements = Array.from(document.querySelectorAll('[aria-live]'));
      if (elements.length === 0) return;
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          let target: Element | null = null;
          if (mutation.type === 'characterData') {
            target = (mutation.target as Text).parentElement;
          } else {
            target = mutation.target as Element;
          }
          if (!target) continue;
          const ariaLive =
            target.getAttribute('aria-live') ??
            target.closest('[aria-live]')?.getAttribute('aria-live') ??
            'polite';
          const text = target.textContent?.trim() ?? '';
          if (!text) continue;
          const id = target.id || target.closest('[id]')?.id || '';
          const regionName =
            id.match(/atomic-aria-live-[^-]+-(.+)/)?.[1] ?? 'unknown';
          // biome-ignore lint/suspicious/noExplicitAny: accessing Playwright browser context globals
          (window as any).__ariaLiveMutations.push({
            text,
            regionId: id,
            regionName,
            ariaLive,
            offsetMs: performance.now() - startTime,
          });
        }
      });
      elements.forEach((el) =>
        observer.observe(el, {
          childList: true,
          characterData: true,
          subtree: true,
        })
      );
      // biome-ignore lint/suspicious/noExplicitAny: accessing Playwright browser context globals
      (window as any).__ariaLiveObserver = observer;
    });
  } catch {}
}

/**
 * Collect all live-region mutations recorded by {@link startLiveRegionObserver},
 * disconnect the observer, and clean up global state.
 *
 * Returns an array of {@link LiveRegionChange} entries, each including the
 * announcement text, region name, `aria-live` politeness, and time offset.
 *
 * **WCAG 2.2 criteria supported:**
 * - 4.1.3 Status Messages — collected mutations are fed to the LLM as evidence
 *   of whether interactions triggered the expected announcements
 */
export async function collectLiveRegionMutations(
  page: PlaywrightPage,
  actionName: string = 'live-region-update'
): Promise<LiveRegionChange[]> {
  try {
    const raw = await page.evaluate(() => {
      // biome-ignore lint/suspicious/noExplicitAny: accessing Playwright browser context globals
      const mutations = (window as any).__ariaLiveMutations ?? [];
      // biome-ignore lint/suspicious/noExplicitAny: accessing Playwright browser context globals
      (window as any).__ariaLiveObserver?.disconnect();
      // biome-ignore lint/suspicious/noExplicitAny: accessing Playwright browser context globals
      delete (window as any).__ariaLiveMutations;
      // biome-ignore lint/suspicious/noExplicitAny: accessing Playwright browser context globals
      delete (window as any).__ariaLiveObserver;
      return mutations as Array<{
        text: string;
        regionId: string;
        regionName: string;
        ariaLive: string;
        offsetMs: number;
      }>;
    });
    return raw.map((m) => ({
      action: actionName,
      selector: `[id="${m.regionId}"]`,
      regionName: m.regionName,
      announcementText: m.text,
      ariaLive: m.ariaLive as 'polite' | 'assertive',
      offsetMs: Math.round(m.offsetMs),
      source: 'interaction' as const,
    }));
  } catch {
    return [];
  }
}

/**
 * Capture live-region announcements triggered by a single interaction protocol.
 *
 * For protocols with key sequences, the target element is focused and the keys
 * are pressed. For click-based protocols, the element is clicked. After an
 * 800 ms settle window, recorded mutations are collected. If no announcements
 * are detected, a sentinel entry with `noAnnouncement: true` is returned so
 * the LLM can evaluate whether an announcement was expected but missing.
 *
 * On-load protocols (`observe-load`) are skipped here — they are handled by
 * {@link captureOnLoadLiveRegions}.
 *
 * **WCAG 2.2 criteria supported:**
 * - 4.1.3 Status Messages — verifies that user interactions (pagination,
 *   filter removal, search clear, etc.) trigger `aria-live` announcements
 */
export async function captureLiveRegionAnnouncements(
  page: PlaywrightPage,
  protocol: InteractionProtocol
): Promise<LiveRegionCaptureResult> {
  const actionName = `${protocol.role}/${protocol.actions[0]?.name ?? 'unknown'}`;
  try {
    const action = protocol.actions[0];
    if (action && action.name === 'observe-load') {
      // On-load protocols are handled by captureOnLoadLiveRegions(), not here
      return {liveRegionChanges: [], summary: 'On-load protocol \u2014 skipped in interaction capture'};
    }

    // Check if the target element exists before attempting interaction
    const locator = page.locator(protocol.selector).nth(0);
    const elementCount = await locator.count();
    if (elementCount === 0) {
      return {
        liveRegionChanges: [{
          action: actionName,
          selector: protocol.liveRegionSelector ?? protocol.selector,
          regionName: protocol.role,
          announcementText: '',
          ariaLive: 'polite',
          offsetMs: 0,
          noAnnouncement: true,
          source: 'interaction',
        }],
        summary: `Element not found: ${protocol.selector}`,
      };
    }

    await startLiveRegionObserver(page);

    if (action && action.keys.length > 0) {
      await locator.focus();
      await page.waitForTimeout(200);
      for (const key of action.keys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(150);
      }
    } else {
      await locator.click({timeout: 5000});
    }
    await new Promise<void>((r) => setTimeout(r, 800));
    let liveRegionChanges = await collectLiveRegionMutations(
      page,
      actionName
    );

    if (liveRegionChanges.length === 0) {
      liveRegionChanges = [
        {
          action: actionName,
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
        : `No live region announcement detected after ${actionName}`;

    return {liveRegionChanges, summary};
  } catch (error) {
    return {
      liveRegionChanges: [],
      summary: `Live region capture failed for ${actionName}: ${String(error)}`,
    };
  }
}

/**
 * Check whether on-load live regions already contain text content after the
 * page has finished rendering (no interaction required).
 *
 * Filters the provided protocols for `observe-load` actions (e.g.
 * `query-summary`, `no-results`, `query-error`, `generated-answer`,
 * `notifications`) and checks each associated live-region selector for
 * visible, non-empty text content.
 *
 * **WCAG 2.2 criteria supported:**
 * - 4.1.3 Status Messages — confirms that server-rendered status content
 *   (result counts, error messages) is present inside `aria-live` containers
 *   on initial page load
 */
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
        results.push({
          action: `${protocol.role}/observe-load`,
          selector,
          regionName: protocol.role,
          announcementText: '',
          ariaLive: 'polite',
          offsetMs: 0,
          noAnnouncement: true,
          source: 'on-load',
        });
        continue;
      }

      const el = locator.nth(0);
      const isVisible = await el.isVisible();

      if (!isVisible) {
        results.push({
          action: `${protocol.role}/observe-load`,
          selector,
          regionName: protocol.role,
          announcementText: '',
          ariaLive: 'polite',
          offsetMs: 0,
          noAnnouncement: true,
          source: 'on-load',
        });
        continue;
      }

      const textContent = (await el.textContent()) ?? '';

      if (textContent.trim() === '') {
        results.push({
          action: `${protocol.role}/observe-load`,
          selector,
          regionName: protocol.role,
          announcementText: '',
          ariaLive: 'polite',
          offsetMs: 0,
          noAnnouncement: true,
          source: 'on-load',
        });
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
