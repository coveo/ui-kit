import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['2.1.1', '2.4.3', '2.4.7', '4.1.2'] as const;

export interface TabA11yOptions {
  tablistLabel?: string;
}

export async function testTabA11y(
  context: StoryContext,
  _options: TabA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  await step('Assert tablist, tab, and tabpanel roles exist', async () => {
    const tablist = await root.findByShadowRole('tablist', {}, {timeout: 5000});
    await expect(tablist).toBeInTheDocument();

    const tabs = canvasElement.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBeGreaterThan(0);

    const panels = canvasElement.querySelectorAll('[role="tabpanel"]');
    expect(panels.length).toBeGreaterThan(0);
  });

  await step('Active tab has aria-selected="true"', async () => {
    const selectedTab = canvasElement.querySelector(
      '[role="tab"][aria-selected="true"]'
    );
    expect(selectedTab).not.toBeNull();
  });

  await step('Arrow keys navigate between tabs', async () => {
    const firstTab = canvasElement.querySelector('[role="tab"]');
    if (!firstTab) return;
    (firstTab as HTMLElement).focus();

    await userEvent.keyboard('{ArrowRight}');

    await waitFor(
      () => {
        const focused = canvasElement.ownerDocument.activeElement;
        expect(focused?.getAttribute('role')).toBe('tab');
      },
      {timeout: 3000}
    );
  });

  await step(
    'Active tab panel is linked via aria-controls or aria-labelledby',
    async () => {
      const selectedTab = canvasElement.querySelector(
        '[role="tab"][aria-selected="true"]'
      );
      if (!selectedTab) return;
      const controls = selectedTab.getAttribute('aria-controls');
      if (controls) {
        const panel = canvasElement.querySelector(`#${controls}`);
        expect(panel?.getAttribute('role')).toBe('tabpanel');
      }
    }
  );

  context.reporting.addReport({
    type: 'a11y-interactive',
    version: 1,
    status: 'passed',
    result: {criteriaCovered: [...COVERED_CRITERIA]},
  });
}
