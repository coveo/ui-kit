import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['2.1.1', '4.1.2'] as const;

export interface CollapsibleA11yOptions {
  triggerLabel: string;
}

/**
 * Shared logic for collapsible/accordion patterns. Extracted because
 * disclosure and collapsible share the same ARIA pattern but collapsible
 * applies to multi-section accordion structures.
 */
export async function assertExpandCollapse(
  trigger: HTMLElement
): Promise<void> {
  const initialExpanded = trigger.getAttribute('aria-expanded') === 'true';
  trigger.focus();
  await userEvent.keyboard('{Enter}');

  await waitFor(
    () => {
      const newExpanded = trigger.getAttribute('aria-expanded') === 'true';
      expect(newExpanded).toBe(!initialExpanded);
    },
    {timeout: 3000}
  );

  await userEvent.keyboard('{Enter}');

  await waitFor(
    () => {
      const restored = trigger.getAttribute('aria-expanded') === 'true';
      expect(restored).toBe(initialExpanded);
    },
    {timeout: 3000}
  );
}

export async function testCollapsibleA11y(
  context: StoryContext,
  options: CollapsibleA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  const trigger = await root.findByShadowRole(
    'button',
    {name: options.triggerLabel},
    {timeout: 5000}
  );

  await step('Trigger has aria-expanded attribute', async () => {
    const expanded = trigger.getAttribute('aria-expanded');
    expect(expanded === 'true' || expanded === 'false').toBe(true);
  });

  await step('Collapsed content has aria-hidden when closed', async () => {
    const controls = trigger.getAttribute('aria-controls');
    if (controls) {
      const content = canvasElement.querySelector(`#${controls}`);
      if (content && trigger.getAttribute('aria-expanded') === 'false') {
        const hidden =
          content.getAttribute('aria-hidden') === 'true' ||
          content.hasAttribute('hidden') ||
          (content as HTMLElement).style.display === 'none';
        expect(hidden).toBe(true);
      }
    }
  });

  await step('Enter toggles expanded state', async () => {
    await assertExpandCollapse(trigger as HTMLElement);
  });

  context.reporting.addReport({
    type: 'a11y-interactive',
    version: 1,
    status: 'passed',
    result: {criteriaCovered: [...COVERED_CRITERIA]},
  });
}
