import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['2.1.1', '2.4.3', '4.1.2'] as const;

export interface NavigationA11yOptions {
  navigationLabel?: string;
}

export async function testNavigationA11y(
  context: StoryContext,
  _options: NavigationA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  await step('Assert navigation landmark exists', async () => {
    const nav = await root.findByShadowRole('navigation', {}, {timeout: 5000});
    await expect(nav).toBeInTheDocument();
  });

  await step('Navigation has accessible label', async () => {
    const nav = await root.findByShadowRole('navigation', {}, {timeout: 5000});
    const hasLabel =
      nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby');
    expect(hasLabel).toBe(true);
  });

  await step('Interactive items are keyboard accessible', async () => {
    const links = canvasElement.querySelectorAll(
      '[role="navigation"] a, [role="navigation"] button, nav a, nav button'
    );

    if (links.length > 0) {
      const firstLink = links[0] as HTMLElement;
      firstLink.focus();

      await userEvent.keyboard('{Tab}');

      await waitFor(
        () => {
          const focused = canvasElement.ownerDocument.activeElement;
          const isNavigable =
            focused?.tagName === 'A' ||
            focused?.tagName === 'BUTTON' ||
            focused?.getAttribute('role') === 'button' ||
            focused?.getAttribute('role') === 'link';
          expect(isNavigable).toBe(true);
        },
        {timeout: 3000}
      );
    }
  });

  context.reporting.addReport({
    type: 'a11y-interactive',
    version: 1,
    status: 'passed',
    result: {criteriaCovered: [...COVERED_CRITERIA]},
  });
}
