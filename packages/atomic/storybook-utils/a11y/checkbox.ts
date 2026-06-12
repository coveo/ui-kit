import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by checkbox interaction tests.
 *
 * - 2.1.1 Keyboard: Space key toggles checkbox state
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/ — WAI-ARIA Checkbox Pattern
 * @see https://www.w3.org/TR/WCAG22/#keyboard — WCAG 2.2 SC 2.1.1 Keyboard (Level A)
 */
export const COVERED_CRITERIA = ['2.1.1'] as const;

export interface CheckboxA11yOptions {
  /** Matches aria-label of the checkbox. If omitted, uses first role="checkbox" found. */
  checkboxName?: string | RegExp;
}

async function findCheckboxes(
  root: ReturnType<typeof within>,
  options?: CheckboxA11yOptions
): Promise<HTMLElement[]> {
  const queryOptions: Record<string, unknown> = {};
  if (options?.checkboxName !== undefined) {
    queryOptions.name = options.checkboxName;
  }

  let elements: HTMLElement[];
  try {
    elements = await root.findAllByShadowRole('checkbox', queryOptions, {
      timeout: 5000,
    });
  } catch {
    elements = [];
  }

  if (elements.length === 0) {
    const criteria = options?.checkboxName
      ? `role="checkbox" with name matching "${String(options.checkboxName)}"`
      : `role="checkbox"`;

    throw new Error(
      `[testCheckboxA11y] No checkbox found matching {${criteria}}.\n\n` +
        `Either this component does not implement the WAI-ARIA checkbox pattern, ` +
        `or the checkboxName option needs to be adjusted.\n` +
        `If this component does not use checkboxes, remove the testCheckboxA11y call from its story.`
    );
  }

  return elements;
}

/**
 * Tests the WAI-ARIA Checkbox pattern.
 *
 * Verifies that:
 * 1. At least one checkbox with `role="checkbox"` and `aria-checked` exists
 * 2. Space key toggles the checkbox state
 * 3. `aria-checked` reflects the current state
 */
export async function testCheckboxA11y(
  context: StoryContext,
  options?: CheckboxA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';

  try {
    let checkboxes!: HTMLElement[];

    await step('Find checkbox elements with role="checkbox"', async () => {
      checkboxes = await findCheckboxes(root, options);
      expect(checkboxes.length).toBeGreaterThanOrEqual(1);
    });

    await step('Checkbox has aria-checked attribute', async () => {
      const checkbox = checkboxes[0];
      const ariaChecked = checkbox.getAttribute('aria-checked');
      expect(
        ariaChecked === 'true' ||
          ariaChecked === 'false' ||
          ariaChecked === 'mixed'
      ).toBe(true);
    });

    await step('Space key toggles checkbox state (2.1.1)', async () => {
      const checkbox = checkboxes[0];
      const initialState = checkbox.getAttribute('aria-checked');

      checkbox.focus();
      await userEvent.keyboard(' ');

      await waitFor(
        () => {
          const newState = checkbox.getAttribute('aria-checked');
          expect(newState).not.toBe(initialState);
        },
        {timeout: 3000}
      );
    });

    await step('Space key toggles checkbox state back', async () => {
      const checkbox = checkboxes[0];
      const currentState = checkbox.getAttribute('aria-checked');

      await userEvent.keyboard(' ');

      await waitFor(
        () => {
          const newState = checkbox.getAttribute('aria-checked');
          expect(newState).not.toBe(currentState);
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
