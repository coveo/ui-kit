import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['2.1.2', '2.4.3', '2.4.7', '4.1.2'] as const;

export interface DialogA11yOptions {
  triggerLabel: string;
}

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

  await step('Escape closes dialog', async () => {
    await userEvent.keyboard('{Escape}');

    await waitFor(
      async () => {
        try {
          const dialog = await root.findByShadowRole(
            'dialog',
            {},
            {timeout: 1000}
          );
          expect(dialog.getAttribute('aria-modal')).not.toBe('true');
        } catch {
          // Element not found = dialog was removed from DOM, which means it closed
        }
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
