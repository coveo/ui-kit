import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by switch interaction tests.
 *
 * - 2.1.1 Keyboard: all functionality operable via keyboard
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/switch/ — WAI-ARIA Switch Pattern
 * @see https://www.w3.org/TR/WCAG22/#keyboard — WCAG 2.2 SC 2.1.1 Keyboard (Level A)
 */
export const COVERED_CRITERIA = ['2.1.1'] as const;

export interface SwitchA11yOptions {
  /** Matches aria-label of the switch. If omitted, uses first role="switch" found. */
  name?: string | RegExp;
}

async function findSwitch(
  root: ReturnType<typeof within>,
  options?: SwitchA11yOptions
): Promise<HTMLElement> {
  const queryOptions: Record<string, unknown> = {};
  if (options?.name !== undefined) {
    queryOptions.name = options.name;
  }

  let elements: HTMLElement[];
  try {
    elements = await root.findAllByShadowRole('switch', queryOptions, {
      timeout: 5000,
    });
  } catch {
    elements = [];
  }

  if (elements.length === 0) {
    const criteria = options?.name
      ? `role="switch" with name matching "${String(options.name)}"`
      : `role="switch"`;

    throw new Error(
      `[testSwitchA11y] No switch found matching {${criteria}}.\n\n` +
        `Either this component does not implement the WAI-ARIA switch pattern, ` +
        `or the name option needs to be adjusted.`
    );
  }

  return elements[0];
}

/**
 * Tests the WAI-ARIA Switch pattern.
 *
 * Verifies that:
 * 1. A switch with aria-checked exists and has an accessible label
 * 2. Space toggles aria-checked
 * 3. Enter toggles aria-checked
 */
export async function testSwitchA11y(
  context: StoryContext,
  options?: SwitchA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';

  try {
    let switchEl!: HTMLElement;

    await step('Find switch with role="switch" and aria-checked', async () => {
      switchEl = await findSwitch(root, options);
      expect(switchEl).toHaveAttribute('aria-checked');
    });

    await step('Switch has accessible label', async () => {
      const hasLabel =
        switchEl.hasAttribute('aria-label') ||
        switchEl.hasAttribute('aria-labelledby') ||
        switchEl.textContent?.trim();
      expect(hasLabel).toBeTruthy();
    });

    await step('Space toggles aria-checked (2.1.1)', async () => {
      const initial = switchEl.getAttribute('aria-checked');
      const toggled = initial === 'true' ? 'false' : 'true';
      switchEl.focus();
      await userEvent.keyboard(' ');
      await waitFor(
        () => {
          expect(switchEl.getAttribute('aria-checked')).toBe(toggled);
        },
        {timeout: 3000}
      );
    });

    await step('Enter toggles aria-checked (2.1.1)', async () => {
      const current = switchEl.getAttribute('aria-checked');
      const toggled = current === 'true' ? 'false' : 'true';
      switchEl.focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(
        () => {
          expect(switchEl.getAttribute('aria-checked')).toBe(toggled);
        },
        {timeout: 3000}
      );
    });
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
