import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['2.1.1', '2.4.3', '4.1.2'] as const;

export interface ListboxA11yOptions {
  listboxLabel?: string;
}

export async function testListboxA11y(
  context: StoryContext,
  _options: ListboxA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  await step('Assert listbox role and options exist', async () => {
    const listbox = await root.findByShadowRole('listbox', {}, {timeout: 5000});
    await expect(listbox).toBeInTheDocument();

    const options = canvasElement.querySelectorAll('[role="option"]');
    expect(options.length).toBeGreaterThan(0);
  });

  await step(
    'Arrow keys navigate options and update aria-activedescendant or focus',
    async () => {
      const listbox = await root.findByShadowRole(
        'listbox',
        {},
        {timeout: 5000}
      );
      listbox.focus();
      const initialDescendant = listbox.getAttribute('aria-activedescendant');

      await userEvent.keyboard('{ArrowDown}');

      await waitFor(
        () => {
          const updated = listbox.getAttribute('aria-activedescendant');
          const focused = listbox.ownerDocument.activeElement;
          const navigated =
            updated !== initialDescendant ||
            focused?.getAttribute('role') === 'option';
          expect(navigated).toBe(true);
        },
        {timeout: 3000}
      );
    }
  );

  await step('Selected option has aria-selected="true"', async () => {
    await userEvent.keyboard('{Enter}');

    await waitFor(
      () => {
        const selected = canvasElement.querySelector(
          '[role="option"][aria-selected="true"]'
        );
        expect(selected).not.toBeNull();
      },
      {timeout: 3000}
    );
  });

  context.reporting.addReport({
    type: 'a11y-interactive',
    version: 1,
    status: 'passed',
    result: {criteriaCovered: [...COVERED_CRITERIA]},
  });
}
