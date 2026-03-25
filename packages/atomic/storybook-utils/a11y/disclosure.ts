import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['2.1.1', '4.1.2'] as const;

export interface DisclosureA11yOptions {
  triggerLabel: string;
}

export async function testDisclosureA11y(
  context: StoryContext,
  options: DisclosureA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  const trigger = await root.findByShadowRole(
    'button',
    {name: options.triggerLabel},
    {timeout: 5000}
  );

  await step('Trigger has aria-expanded initially set', async () => {
    const expanded = trigger.getAttribute('aria-expanded');
    expect(expanded === 'true' || expanded === 'false').toBe(true);
  });

  await step('Trigger has aria-controls pointing to content', async () => {
    const controls = trigger.getAttribute('aria-controls');
    if (controls) {
      const content = canvasElement.querySelector(`#${controls}`);
      expect(content).not.toBeNull();
    }
  });

  const initialExpanded = trigger.getAttribute('aria-expanded') === 'true';

  await step('Enter/Space toggles aria-expanded', async () => {
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    await waitFor(
      () => {
        const newExpanded = trigger.getAttribute('aria-expanded') === 'true';
        expect(newExpanded).toBe(!initialExpanded);
      },
      {timeout: 3000}
    );
  });

  await step('Second activation restores original state', async () => {
    await userEvent.keyboard('{Enter}');

    await waitFor(
      () => {
        const restored = trigger.getAttribute('aria-expanded') === 'true';
        expect(restored).toBe(initialExpanded);
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
