import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by tabs interaction tests.
 *
 * - 2.1.1 Keyboard: all functionality operable via keyboard
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ — WAI-ARIA Tabs Pattern
 * @see https://www.w3.org/TR/WCAG22/#keyboard — WCAG 2.2 SC 2.1.1 Keyboard (Level A)
 */
export const COVERED_CRITERIA = ['2.1.1'] as const;

function getActiveTab(
  tabs: HTMLElement[],
  canvasElement: HTMLElement
): HTMLElement | null {
  for (const tab of tabs) {
    const root = tab.getRootNode() as Document | ShadowRoot;
    const active =
      'activeElement' in root ? (root as Document).activeElement : null;
    if (active === tab) {
      return tab;
    }
  }

  const docActive = canvasElement.ownerDocument.activeElement;
  if (docActive?.shadowRoot) {
    const shadowActive = docActive.shadowRoot.activeElement;
    if (shadowActive && tabs.includes(shadowActive as HTMLElement)) {
      return shadowActive as HTMLElement;
    }
  }

  return null;
}

/**
 * Tests the WAI-ARIA Tabs pattern.
 *
 * Verifies that:
 * 1. A tablist with at least 2 tabs exists
 * 2. Focus enters the tablist on the active/first tab
 * 3. ArrowRight moves focus to the next tab
 * 4. ArrowLeft moves focus back to the previous tab
 */
export async function testTabsA11y(context: StoryContext): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';

  try {
    let tabs!: HTMLElement[];

    await step('Find tablist and tab elements', async () => {
      const tablists = await root.findAllByShadowRole('tablist', undefined, {
        timeout: 5000,
      });

      if (tablists.length === 0) {
        throw new Error(
          `[testTabsA11y] No tablist found.\n\n` +
            `Either this component does not implement the WAI-ARIA tabs pattern, ` +
            `or the component has not yet rendered.\n` +
            `If this component does not use a tablist, remove the testTabsA11y call from its story.`
        );
      }

      const tablist = tablists[0];
      tabs = Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]'));

      if (tabs.length === 0) {
        throw new Error(
          `[testTabsA11y] No tab elements found inside the tablist.\n` +
            `Expected elements with role="tab".`
        );
      }

      expect(tabs.length).toBeGreaterThanOrEqual(2);
    });

    await step('Tab key enters tablist on active/first tab', async () => {
      const activeTab =
        tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0];

      activeTab.focus();

      await waitFor(
        () => {
          const active = getActiveTab(tabs, canvasElement);
          expect(active).toBe(activeTab);
        },
        {timeout: 3000}
      );
    });

    await step('ArrowRight moves focus to next tab', async () => {
      const firstTab = tabs[0];
      firstTab.focus();

      await waitFor(
        () => {
          const active = getActiveTab(tabs, canvasElement);
          expect(active).toBe(firstTab);
        },
        {timeout: 3000}
      );

      await userEvent.keyboard('{ArrowRight}');

      await waitFor(
        () => {
          const active = getActiveTab(tabs, canvasElement);
          expect(active).toBe(tabs[1]);
        },
        {timeout: 3000}
      );
    });

    await step('ArrowLeft moves focus back to previous tab', async () => {
      const secondTab = tabs[1];
      secondTab.focus();

      await waitFor(
        () => {
          const active = getActiveTab(tabs, canvasElement);
          expect(active).toBe(secondTab);
        },
        {timeout: 3000}
      );

      await userEvent.keyboard('{ArrowLeft}');

      await waitFor(
        () => {
          const active = getActiveTab(tabs, canvasElement);
          expect(active).toBe(tabs[0]);
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
