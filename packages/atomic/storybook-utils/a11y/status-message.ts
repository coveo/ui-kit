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

/**
 * Finds all live regions in the DOM (main + shadow DOMs).
 */
function findLiveRegions(root: HTMLElement): HTMLElement[] {
  const selectors = [
    '[aria-live]',
    '[role="status"]',
    '[role="alert"]',
    '[role="log"]',
    '[role="progressbar"]',
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

  return elements;
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
    await step('Live regions exist before action (baseline)', async () => {
      // Just snapshot — we don't require them to exist before
      findLiveRegions(canvasElement);
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
              return text.length > 0;
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
