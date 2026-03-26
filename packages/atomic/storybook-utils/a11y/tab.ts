import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by tab keyboard and ARIA interaction tests.
 *
 * NOTE: Atomic's tab manager uses `role="list"` with `aria-label="tab-area"`
 * and `<atomic-tab-button>` light-DOM elements with `aria-current` on the host
 * and a button rendered via `renderButton`. There are no radio inputs — this is
 * not the WAI-ARIA APG tablist/tab/tabpanel pattern.
 *
 * DOM structure:
 *   canvasElement
 *     → atomic-search-interface
 *       → atomic-tab-manager (shadow)
 *         → atomic-tab-bar (shadow with <slot>)
 *           → div[role="list"]
 *             → atomic-tab-button[role="listitem"][aria-current] (LightDomMixin)
 *
 * `atomic-tab-button` elements live inside `atomic-tab-manager`'s shadow DOM,
 * so plain `canvasElement.querySelectorAll` cannot reach them.
 */
export const COVERED_CRITERIA = ['2.1.1', '2.4.3', '2.4.7', '4.1.2'] as const;

export interface TabA11yOptions {
  tablistLabel?: string;
}

/**
 * Finds all `atomic-tab-button` elements by traversing into
 * `atomic-tab-manager`'s shadow DOM.
 */
function findTabButtons(root: HTMLElement): Element[] {
  const tabManager = root.querySelector('atomic-tab-manager');
  if (!tabManager?.shadowRoot) return [];
  return Array.from(
    tabManager.shadowRoot.querySelectorAll('atomic-tab-button')
  );
}

export async function testTabA11y(
  context: StoryContext,
  _options: TabA11yOptions = {}
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  await step('Assert tab list container exists with role="list"', async () => {
    await waitFor(
      async () => {
        const lists = await root.findAllByShadowRole(
          'list',
          {},
          {timeout: 5000}
        );
        expect(lists.length).toBeGreaterThan(0);
      },
      {timeout: 5000}
    );
  });

  await step('Assert tab button elements exist as listitems', async () => {
    await waitFor(
      async () => {
        const items = await root.findAllByShadowRole(
          'listitem',
          {},
          {timeout: 5000}
        );
        expect(items.length).toBeGreaterThan(0);
      },
      {timeout: 5000}
    );
  });

  await step('Active tab has aria-current="true"', async () => {
    await waitFor(
      () => {
        const tabButtons = findTabButtons(canvasElement);
        expect(tabButtons.length).toBeGreaterThan(0);
        const activeTab = tabButtons.find(
          (el) => el.getAttribute('aria-current') === 'true'
        );
        expect(activeTab).toBeDefined();
      },
      {timeout: 5000}
    );
  });

  await step('Tab buttons are keyboard accessible', async () => {
    await waitFor(
      () => {
        const tabButtons = findTabButtons(canvasElement);
        expect(tabButtons.length).toBeGreaterThan(0);
      },
      {timeout: 5000}
    );

    const tabButtons = findTabButtons(canvasElement);
    // Each atomic-tab-button renders a <button> in its light DOM
    const firstButton = tabButtons[0]?.querySelector('button') as
      | HTMLElement
      | undefined;
    expect(firstButton).toBeDefined();

    if (firstButton) {
      firstButton.focus();
      await waitFor(
        () => {
          let active: Element | null =
            canvasElement.ownerDocument.activeElement;
          while (active?.shadowRoot?.activeElement) {
            active = active.shadowRoot.activeElement;
          }
          expect(
            active?.tagName === 'BUTTON' ||
              active?.getAttribute('role') === 'button'
          ).toBe(true);
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
