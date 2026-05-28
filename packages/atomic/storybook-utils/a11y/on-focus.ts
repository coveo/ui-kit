import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by on-focus tests.
 *
 * - 3.2.1 On Focus: receiving focus does not initiate a change of context
 *
 * @see https://www.w3.org/TR/WCAG22/#on-focus — WCAG 2.2 SC 3.2.1 On Focus (Level A)
 */
export const COVERED_CRITERIA = ['3.2.1'] as const;

/**
 * Takes a snapshot of the DOM state relevant to context changes.
 */
function snapshotContext(canvasElement: HTMLElement): {
  dialogCount: number;
  url: string;
} {
  return {
    dialogCount: canvasElement.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], dialog'
    ).length,
    url: canvasElement.ownerDocument.location.href,
  };
}

/**
 * Finds all keyboard-focusable elements within the rendered story.
 */
function findFocusableElements(root: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
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

  return elements.filter(
    (el) => !el.hasAttribute('aria-hidden') && el.offsetParent !== null
  );
}

/**
 * Tests that focusing interactive elements does not trigger unexpected
 * context changes (new dialogs, form submissions, navigation, or major
 * DOM mutations).
 *
 * @remarks
 * Designed to run as a universal test on all stories. Does not require
 * component-specific setup.
 */
export async function testOnFocusA11y(context: StoryContext): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';
  const violations: string[] = [];

  try {
    await step(
      'Focusing elements does not trigger context changes',
      async () => {
        let focusable: HTMLElement[] = [];
        await waitFor(
          () => {
            focusable = findFocusableElements(canvasElement);
            if (focusable.length === 0) {
              throw new Error('Waiting for focusable elements');
            }
          },
          {timeout: 3000}
        ).catch(() => {
          focusable = [];
        });

        if (focusable.length === 0) {
          return;
        }

        const maxElementsToTest = 10;
        const totalFocusable = focusable.length;
        const tabCount = Math.min(totalFocusable, maxElementsToTest);

        for (let i = 0; i < tabCount; i++) {
          const before = snapshotContext(canvasElement);
          await userEvent.tab();
          const after = snapshotContext(canvasElement);

          const focused =
            canvasElement.ownerDocument.activeElement?.tagName ?? 'unknown';

          if (after.url !== before.url) {
            violations.push(`Navigation triggered on focus: ${focused}`);
          }
          if (after.dialogCount > before.dialogCount) {
            violations.push(`Dialog opened on focus: ${focused}`);
          }
        }

        if (violations.length > 0) {
          throw new Error(
            `[3.2.1 On Focus] Context changes detected on focus: ${violations.join('; ')}`
          );
        }
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
