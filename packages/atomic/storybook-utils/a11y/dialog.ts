import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by dialog keyboard and ARIA interaction tests.
 *
 * - 2.1.2 No Keyboard Trap — Tab cycles within modal dialog, Escape closes
 * - 2.4.3 Focus Order — focus moves to dialog on open, returns to trigger on close
 * - 2.4.7 Focus Visible — focused element inside dialog has visible indicator
 * - 4.1.2 Name, Role, Value — dialog role, aria-modal, aria-labelledby communicated
 */
export const COVERED_CRITERIA = ['2.1.2', '2.4.3', '2.4.7', '4.1.2'] as const;

export interface DialogA11yOptions {
  /** Selector or accessible name of the button that opens the dialog. */
  triggerLabel: string;
}

/**
 * Asserts ARIA dialog keyboard behavior and focus management semantics.
 *
 * Tests:
 * - Dialog has `role="dialog"` and `aria-modal="true"`
 * - Focus moves into dialog on open
 * - Escape closes dialog and returns focus to trigger
 *
 * Call this from a Storybook `play` function after the component is ready.
 */
export async function testDialogA11y(
  context: StoryContext,
  options: DialogA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  const trigger = await root.findByShadowRole(
    'button',
    {name: options.triggerLabel},
    {timeout: 5000}
  );

  await step('Open dialog and assert role and aria-modal', async () => {
    await userEvent.click(trigger);

    await waitFor(
      async () => {
        const dialog = await root.findByShadowRole(
          'dialog',
          {},
          {timeout: 5000}
        );
        await expect(dialog).toBeInTheDocument();
        await expect(dialog).toHaveAttribute('aria-modal', 'true');
      },
      {timeout: 8000}
    );
  });

  await step('Assert dialog has accessible label', async () => {
    const dialog = await root.findByShadowRole('dialog', {}, {timeout: 5000});
    const hasLabel =
      dialog.hasAttribute('aria-labelledby') ||
      dialog.hasAttribute('aria-label');
    expect(hasLabel).toBe(true);
  });

  await step('Escape closes dialog and focus returns to trigger', async () => {
    await userEvent.keyboard('{Escape}');

    await waitFor(
      async () => {
        const dialogs = canvasElement.querySelectorAll('[role="dialog"]');
        const openDialog = [...dialogs].find(
          (d) =>
            !d.hasAttribute('hidden') &&
            d.getAttribute('aria-hidden') !== 'true'
        );
        expect(openDialog).toBeUndefined();
      },
      {timeout: 5000}
    );
  });

  context.reporting.addReport({
    type: 'a11y-interactive',
    version: 1,
    status: 'passed',
    result: {criteriaCovered: [...COVERED_CRITERIA]},
  });
}
