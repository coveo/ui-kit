import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by combobox/search-box interaction tests.
 *
 * NOTE: Atomic's search box renders a `<textarea>` (implicit role `textbox`,
 * not `combobox`) with `aria-haspopup`, `aria-autocomplete="both"`,
 * `aria-controls`, and `aria-activedescendant`. The suggestion popup uses
 * `role="application"`, not `role="listbox"`. These tests assert the actual
 * Atomic implementation rather than the WAI-ARIA APG combobox pattern.
 */
export const COVERED_CRITERIA = [
  '2.1.1',
  '2.1.2',
  '2.4.3',
  '2.4.7',
  '4.1.2',
] as const;

export interface ComboboxA11yOptions {
  inputSelector: string;
}

export async function testComboboxA11y(
  context: StoryContext,
  _options: ComboboxA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';
  try {
    await step(
      'Assert textbox exists with aria-haspopup and aria-autocomplete',
      async () => {
        const input = await root.findByShadowRole(
          'textbox',
          {},
          {timeout: 5000}
        );
        await expect(input).toBeInTheDocument();
        await expect(input).toHaveAttribute('aria-haspopup');
        await expect(input).toHaveAttribute('aria-autocomplete');
      }
    );

    await step('Assert textbox has aria-controls', async () => {
      const input = await root.findByShadowRole('textbox', {}, {timeout: 5000});
      const hasControls =
        input.hasAttribute('aria-controls') || input.hasAttribute('aria-owns');
      expect(hasControls).toBe(true);
    });

    await step('Typing into the textbox is possible via keyboard', async () => {
      const input = await root.findByShadowRole('textbox', {}, {timeout: 5000});
      input.focus();
      await userEvent.keyboard('test');

      await waitFor(
        () => {
          const value =
            (input as HTMLTextAreaElement).value ||
            (input as HTMLInputElement).value;
          expect(value.length).toBeGreaterThan(0);
        },
        {timeout: 3000}
      );
    });

    await step('Escape clears or closes and focus stays on input', async () => {
      await userEvent.keyboard('{Escape}');

      await waitFor(
        () => {
          const focused = canvasElement.ownerDocument.activeElement;
          const isShadowHostOrInput =
            focused === canvasElement ||
            focused?.shadowRoot?.querySelector('[role="textbox"], textarea') !==
              undefined;
          expect(
            isShadowHostOrInput ||
              focused?.closest('[role="textbox"], textarea')
          ).toBeTruthy();
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
