import {
  type AccessibilityNode,
  diffAccessibilityTrees,
} from './accessibility-tree.js';
import type {PlaywrightBrowser, PlaywrightPage} from './types.js';

export interface BrowserContext {
  browser: PlaywrightBrowser;
  pages: PlaywrightPage[];
}

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

  return {screenshot, accessibilityTree};
}

export interface HoverCaptureResult {
  hoverDetected: boolean;
  hoverScreenshot: string | null;
  hoverDetails: string;
}

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
        root.querySelectorAll(selector).forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            results.push({
              tag: el.tagName.toLowerCase(),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              text: (el.textContent || '').trim().slice(0, 30),
            });
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
 * Per-role interaction protocol definitions.
 * Each entry describes keyboard interactions for a given ARIA role,
 * the expected state attribute to monitor, and the key sequence to execute.
 */
export interface InteractionProtocol {
  role: string;
  selector: string;
  /** Attribute on the element to capture before/after (e.g. aria-expanded). */
  stateAttributes: string[];
  apgPattern?: string;
  /** Sequence of keyboard actions to execute. */
  actions: Array<{
    name: string;
    keys: string[];
    /** If true, press keys on the element itself (focus first). */
    focusFirst?: boolean;
  }>;
}

export const INTERACTION_PROTOCOLS: InteractionProtocol[] = [
  {
    role: 'combobox',
    selector: '[role="combobox"], input[role="combobox"]',
    stateAttributes: ['aria-expanded', 'aria-activedescendant'],
    apgPattern: 'combobox',
    actions: [
      {name: 'open', keys: ['ArrowDown'], focusFirst: true},
      {
        name: 'navigate',
        keys: ['ArrowDown', 'ArrowDown', 'ArrowDown'],
        focusFirst: false,
      },
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'tab',
    selector: '[role="tab"]',
    stateAttributes: ['aria-selected'],
    apgPattern: 'tabs',
    actions: [
      {
        name: 'navigate-right',
        keys: ['ArrowRight', 'ArrowRight'],
        focusFirst: true,
      },
      {name: 'navigate-left', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'accordion',
    selector: '[role="heading"] button[aria-expanded], details > summary',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'accordion',
    actions: [
      {name: 'toggle', keys: ['Enter'], focusFirst: true},
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: false},
    ],
  },
  {
    role: 'button[aria-expanded]',
    selector: 'button[aria-expanded], [role="button"][aria-expanded]',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'disclosure',
    actions: [{name: 'toggle', keys: ['Enter'], focusFirst: true}],
  },
  {
    role: 'button',
    selector:
      'button:not([aria-expanded]):not([aria-haspopup]), [role="button"]:not([aria-expanded]):not([aria-haspopup])',
    stateAttributes: ['aria-pressed', 'aria-disabled'],
    apgPattern: 'button',
    actions: [
      {name: 'activate', keys: ['Enter'], focusFirst: true},
      {name: 'activate-space', keys: [' '], focusFirst: false},
    ],
  },
  {
    role: 'carousel',
    selector:
      '[role="group"][aria-roledescription="slide"], [aria-roledescription="carousel"]',
    stateAttributes: ['aria-live', 'aria-label'],
    apgPattern: 'carousel',
    actions: [
      {name: 'next', keys: ['ArrowRight'], focusFirst: true},
      {name: 'prev', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'checkbox',
    selector: '[role="checkbox"], input[type="checkbox"]',
    stateAttributes: ['aria-checked', 'checked'],
    apgPattern: 'checkbox',
    actions: [{name: 'toggle', keys: [' '], focusFirst: true}],
  },
  {
    role: 'disclosure',
    selector:
      '[data-disclosure] button[aria-expanded], nav button[aria-expanded]',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'disclosure',
    actions: [{name: 'toggle', keys: ['Enter'], focusFirst: true}],
  },
  {
    role: 'feed',
    selector: '[role="feed"]',
    stateAttributes: ['aria-busy'],
    apgPattern: 'feed',
    actions: [
      {name: 'next-article', keys: ['PageDown'], focusFirst: true},
      {name: 'prev-article', keys: ['PageUp'], focusFirst: false},
    ],
  },
  {
    role: 'grid',
    selector: '[role="grid"]',
    stateAttributes: ['aria-multiselectable', 'aria-readonly'],
    apgPattern: 'grid',
    actions: [
      {name: 'navigate-right', keys: ['ArrowRight'], focusFirst: true},
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: false},
      {name: 'navigate-left', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'listbox',
    selector: '[role="listbox"]',
    stateAttributes: ['aria-multiselectable', 'aria-activedescendant'],
    apgPattern: 'listbox',
    actions: [
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: true},
      {name: 'navigate-up', keys: ['ArrowUp'], focusFirst: false},
      {name: 'select', keys: [' '], focusFirst: false},
    ],
  },
  {
    role: 'menu-button',
    selector:
      'button[aria-haspopup="menu"], [role="button"][aria-haspopup="menu"]',
    stateAttributes: ['aria-expanded', 'aria-haspopup'],
    apgPattern: 'menu-button',
    actions: [
      {name: 'open', keys: ['Enter'], focusFirst: true},
      {
        name: 'navigate-down',
        keys: ['ArrowDown', 'ArrowDown'],
        focusFirst: false,
      },
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'menubar',
    selector: '[role="menubar"]',
    stateAttributes: ['aria-orientation'],
    apgPattern: 'menubar',
    actions: [
      {
        name: 'navigate-right',
        keys: ['ArrowRight', 'ArrowRight'],
        focusFirst: true,
      },
      {name: 'navigate-left', keys: ['ArrowLeft'], focusFirst: false},
      {name: 'open-submenu', keys: ['ArrowDown'], focusFirst: false},
    ],
  },
  {
    role: 'switch',
    selector: '[role="switch"]',
    stateAttributes: ['aria-checked'],
    apgPattern: 'switch',
    actions: [{name: 'toggle', keys: [' '], focusFirst: true}],
  },
  {
    role: 'radio-group',
    selector: '[role="radiogroup"]',
    stateAttributes: ['aria-required'],
    apgPattern: 'radio-group',
    actions: [
      {name: 'select-next', keys: ['ArrowDown'], focusFirst: true},
      {name: 'select-prev', keys: ['ArrowUp'], focusFirst: false},
    ],
  },
  {
    role: 'slider',
    selector: '[role="slider"]',
    stateAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    apgPattern: 'slider',
    actions: [
      {name: 'increase', keys: ['ArrowRight'], focusFirst: true},
      {name: 'decrease', keys: ['ArrowLeft'], focusFirst: false},
      {name: 'min', keys: ['Home'], focusFirst: false},
      {name: 'max', keys: ['End'], focusFirst: false},
    ],
  },
  {
    role: 'spinbutton',
    selector: '[role="spinbutton"], input[type="number"]',
    stateAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    apgPattern: 'spinbutton',
    actions: [
      {name: 'increase', keys: ['ArrowUp'], focusFirst: true},
      {name: 'decrease', keys: ['ArrowDown'], focusFirst: false},
    ],
  },
  {
    role: 'toolbar',
    selector: '[role="toolbar"]',
    stateAttributes: ['aria-orientation', 'aria-label'],
    apgPattern: 'toolbar',
    actions: [
      {
        name: 'navigate-right',
        keys: ['ArrowRight', 'ArrowRight'],
        focusFirst: true,
      },
      {name: 'navigate-left', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'tooltip',
    selector: '[aria-describedby][tabindex], button[aria-describedby]',
    stateAttributes: ['aria-describedby', 'aria-hidden'],
    apgPattern: 'tooltip',
    actions: [
      {name: 'show', keys: ['Tab'], focusFirst: true},
      {name: 'dismiss', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'tree',
    selector: '[role="tree"]',
    stateAttributes: ['aria-multiselectable'],
    apgPattern: 'treeview',
    actions: [
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: true},
      {name: 'expand', keys: ['ArrowRight'], focusFirst: false},
      {name: 'collapse', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'treegrid',
    selector: '[role="treegrid"]',
    stateAttributes: ['aria-multiselectable'],
    apgPattern: 'treegrid',
    actions: [
      {name: 'navigate-down', keys: ['ArrowDown'], focusFirst: true},
      {name: 'expand', keys: ['ArrowRight'], focusFirst: false},
      {name: 'collapse', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'window-splitter',
    selector: '[role="separator"][tabindex]',
    stateAttributes: [
      'aria-valuenow',
      'aria-valuemin',
      'aria-valuemax',
      'aria-orientation',
    ],
    apgPattern: 'windowsplitter',
    actions: [
      {name: 'increase', keys: ['ArrowRight'], focusFirst: true},
      {name: 'decrease', keys: ['ArrowLeft'], focusFirst: false},
    ],
  },
  {
    role: 'menuitem',
    selector: '[role="menuitem"]',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'menubar',
    actions: [
      {name: 'activate', keys: ['Enter'], focusFirst: true},
      {
        name: 'navigate-down',
        keys: ['ArrowDown', 'ArrowDown'],
        focusFirst: false,
      },
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'dialog',
    selector:
      '[role="dialog"] button, button[aria-haspopup="true"]:not([aria-haspopup="dialog"]):not([aria-haspopup="alertdialog"])',
    stateAttributes: ['aria-modal'],
    apgPattern: 'dialog',
    actions: [
      {name: 'open', keys: ['Enter'], focusFirst: true},
      {name: 'focus-trap', keys: ['Tab', 'Tab', 'Tab'], focusFirst: false},
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'alertdialog',
    selector: '[role="alertdialog"] button, [aria-haspopup="alertdialog"]',
    stateAttributes: ['aria-modal'],
    apgPattern: 'alertdialog',
    actions: [
      {name: 'open', keys: ['Enter'], focusFirst: true},
      {name: 'close', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'dialog-trigger',
    selector: '[aria-haspopup="dialog"], button[aria-haspopup="dialog"]',
    stateAttributes: ['aria-expanded'],
    apgPattern: 'dialog',
    actions: [
      {name: 'open-dialog', keys: ['Enter'], focusFirst: true},
      {
        name: 'focus-trap-test',
        keys: [
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
          'Tab',
        ],
        focusFirst: false,
      },
      {name: 'close-dialog', keys: ['Escape'], focusFirst: false},
    ],
  },
  {
    role: 'alert',
    selector: '[role="alert"]',
    stateAttributes: ['aria-live', 'aria-atomic'],
    apgPattern: 'alert',
    actions: [],
  },
  {
    role: 'breadcrumb',
    selector: '[aria-label="breadcrumb"] ol, nav[aria-label="breadcrumb"]',
    stateAttributes: ['aria-current'],
    apgPattern: 'breadcrumb',
    actions: [],
  },
  {
    role: 'landmark',
    selector:
      '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]',
    stateAttributes: ['aria-label', 'aria-labelledby'],
    apgPattern: 'landmark-regions',
    actions: [],
  },
  {
    role: 'meter',
    selector: '[role="meter"], meter',
    stateAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    apgPattern: 'meter',
    actions: [],
  },
];

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
        result['__focusedRole'] =
          active?.getAttribute('role') ??
          active?.tagName?.toLowerCase() ??
          'none';
        result['__focusedName'] =
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
 * Capture interaction states by executing deterministic keyboard protocols
 * for each ARIA role found on the page. Returns before/after state snapshots
 * for each interaction, enabling the LLM to evaluate WCAG criteria related
 * to keyboard operability, state management, and focus handling.
 */
export async function captureInteractionStates(
  page: PlaywrightPage
): Promise<InteractionCaptureResult> {
  const interactions: InteractionStateCapture[] = [];

  for (const protocol of INTERACTION_PROTOCOLS) {
    try {
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
