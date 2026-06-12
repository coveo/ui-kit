import type {StoryContext} from '@storybook/web-components-vite';
import {expect, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by status-message tests.
 *
 * - 4.1.3 Status Messages: status messages are programmatically determinable
 *   through role or properties so they can be announced by assistive technologies
 *   without receiving focus
 *
 * @see https://www.w3.org/TR/WCAG22/#status-messages — WCAG 2.2 SC 4.1.3 Status Messages (Level AA)
 */
export const COVERED_CRITERIA = ['4.1.3'] as const;

export interface StatusMessageA11yOptions {
  /**
   * A function that performs the action expected to produce a status message
   * (e.g., submit a search, apply a filter, trigger an error).
   */
  triggerAction: (canvasElement: HTMLElement) => Promise<void>;

  /**
   * Expected text content (or substring) of the status message.
   * The test verifies the live region contains this text.
   */
  expectedText: string | RegExp;

  /**
   * Timeout in ms to wait for the status message to appear.
   * @default 5000
   */
  timeout?: number;
}

export interface StatusMessageSequenceA11yOptions {
  /**
   * A function that performs the action expected to produce status messages
   * (e.g., submit a search that triggers loading then results).
   */
  triggerAction: (canvasElement: HTMLElement) => Promise<void>;

  /**
   * An ordered sequence of expected announcements. The test verifies that
   * live region content matches each item in order, ensuring the user hears
   * a meaningful progression of status updates.
   */
  expectedSequence: Array<string | RegExp>;

  /**
   * Timeout in ms to wait for the entire sequence to complete.
   * @default 5000
   */
  timeout?: number;
}

function isHiddenByAncestor(element: HTMLElement): boolean {
  let current: Element | null = element.parentElement;
  while (current) {
    if (current instanceof HTMLElement) {
      if (current.getAttribute('aria-hidden') === 'true') {
        return true;
      }
    }
    const root = current.getRootNode();
    if (root instanceof ShadowRoot) {
      current = root.host;
    } else {
      current = current.parentElement;
    }
  }
  return false;
}

/**
 * Finds all live regions in the DOM (main + shadow DOMs).
 */
function findLiveRegions(root: HTMLElement): HTMLElement[] {
  const selectors = [
    '[aria-live]',
    '[role="status"]',
    '[role="alert"]',
    '[role="log"]',
  ].join(', ');

  const elements: HTMLElement[] = [];

  elements.push(...Array.from(root.querySelectorAll<HTMLElement>(selectors)));

  for (const host of root.querySelectorAll('*')) {
    if (host.shadowRoot) {
      elements.push(
        ...Array.from(host.shadowRoot.querySelectorAll<HTMLElement>(selectors))
      );
    }
  }

  return elements.filter((el) => {
    if (el.getAttribute('aria-live') === 'off') return false;
    if (isHiddenByAncestor(el)) return false;
    return true;
  });
}

/**
 * Tests that a user action produces a status message in an ARIA live region.
 *
 * Verifies that:
 * 1. After the action, a live region (`aria-live`, `role="status"`,
 *    `role="alert"`) exists with non-empty content
 * 2. The live region is not `aria-hidden`
 * 3. Optionally, the content matches expected text
 *
 * @remarks
 * This is an opt-in helper. Developers must provide the action that triggers
 * the status message since this varies per component.
 */
export async function testStatusMessageA11y(
  context: StoryContext,
  options: StatusMessageA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';
  const timeout = options.timeout ?? 5000;

  try {
    let baselineTexts: Set<string> = new Set();

    await step('Capture baseline live region content', async () => {
      const liveRegions = findLiveRegions(canvasElement);
      for (const region of liveRegions) {
        const text = region.textContent?.trim() ?? '';
        if (text.length > 0) {
          baselineTexts.add(text);
        }
      }
    });

    await step(
      'Trigger action that should produce a status message',
      async () => {
        await options.triggerAction(canvasElement);
      }
    );

    await step(
      'Status message appears in a live region after action',
      async () => {
        await waitFor(
          () => {
            const liveRegions = findLiveRegions(canvasElement);

            const populatedRegions = liveRegions.filter((region) => {
              if (region.getAttribute('aria-hidden') === 'true') return false;
              const text = region.textContent?.trim() ?? '';
              if (text.length === 0) return false;
              return !baselineTexts.has(text);
            });

            expect(populatedRegions.length).toBeGreaterThan(0);

            const regionTexts = populatedRegions.map(
              (region) => region.textContent?.trim() ?? ''
            );
            const combined = regionTexts.join('\n');
            if (typeof options.expectedText === 'string') {
              expect(combined).toContain(options.expectedText);
            } else {
              expect(combined).toMatch(options.expectedText);
            }
          },
          {timeout}
        );
      }
    );
  } catch (error) {
    status = 'failed';
    throw error;
  } finally {
    context.reporting?.addReport?.({
      type: 'a11y-interactive',
      version: 1,
      status,
      result: {criteriaCovered: [...COVERED_CRITERIA]},
    });
  }
}

function textMatches(text: string, expected: string | RegExp): boolean {
  return typeof expected === 'string'
    ? text.includes(expected)
    : expected.test(text);
}

/**
 * Returns true when every expected announcement appears, in order, within the
 * observed announcements. Extra announcements in between are allowed.
 */
function isOrderedSubsequence(
  observed: string[],
  expected: Array<string | RegExp>
): boolean {
  let matched = 0;
  for (const text of observed) {
    if (matched < expected.length && textMatches(text, expected[matched])) {
      matched++;
    }
  }
  return matched === expected.length;
}

function describeSequence(
  expected: Array<string | RegExp>,
  observed: string[]
): string {
  const format = (items: Array<string | RegExp>) =>
    items.length === 0
      ? '  (none)'
      : items
          .map(
            (item, index) =>
              `  ${index + 1}. ${typeof item === 'string' ? `"${item}"` : item}`
          )
          .join('\n');

  return (
    `Expected status messages in order:\n${format(expected)}\n\n` +
    `Observed announcements:\n${format(observed)}`
  );
}

/**
 * Tests that a user action produces a meaningful, ordered sequence of status
 * messages in ARIA live regions (e.g. "Generating answer" then "Generated
 * answer: ...").
 *
 * This is stronger than a single {@link testStatusMessageA11y} assertion: it
 * validates the full progression of announcements a screen reader user hears,
 * not just that one message eventually appears. Live regions are polled while
 * waiting, so every distinct state a region passes through is recorded; the
 * test passes once each entry in `expectedSequence` has been announced in order.
 *
 * @remarks
 * This is an opt-in helper. The caller provides the action that triggers the
 * status messages since this varies per component.
 */
export async function testStatusMessageSequenceA11y(
  context: StoryContext,
  options: StatusMessageSequenceA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const timeout = options.timeout ?? 5000;

  let status: 'passed' | 'failed' = 'passed';

  try {
    const lastTextByRegion = new Map<HTMLElement, string>();
    const observed: string[] = [];

    // Seed each region's current text as a baseline so pre-existing content is
    // not mistaken for a new announcement.
    for (const region of findLiveRegions(canvasElement)) {
      lastTextByRegion.set(region, region.textContent?.trim() ?? '');
    }

    const recordNewAnnouncements = () => {
      for (const region of findLiveRegions(canvasElement)) {
        if (region.getAttribute('aria-hidden') === 'true') {
          continue;
        }
        const text = region.textContent?.trim() ?? '';
        if (text.length === 0 || lastTextByRegion.get(region) === text) {
          continue;
        }
        lastTextByRegion.set(region, text);
        observed.push(text);
      }
    };

    await step('Trigger action that should produce status messages', () =>
      options.triggerAction(canvasElement)
    );

    await step('Status messages are announced in the expected order', () =>
      waitFor(
        () => {
          recordNewAnnouncements();
          expect(
            isOrderedSubsequence(observed, options.expectedSequence),
            describeSequence(options.expectedSequence, observed)
          ).toBe(true);
        },
        {timeout}
      )
    );
  } catch (error) {
    status = 'failed';
    throw error;
  } finally {
    context.reporting?.addReport?.({
      type: 'a11y-interactive',
      version: 1,
      status,
      result: {criteriaCovered: [...COVERED_CRITERIA]},
    });
  }
}
