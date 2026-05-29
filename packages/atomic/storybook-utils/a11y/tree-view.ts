import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by tree view semantic tests.
 *
 * - 4.1.2 Name, Role, Value: tree/treeitem roles and aria-expanded present
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/treeview/ — WAI-ARIA Tree View Pattern
 * @see https://www.w3.org/TR/WCAG22/#name-role-value — WCAG 2.2 SC 4.1.2 (Level A)
 */
export const COVERED_CRITERIA = ['4.1.2'] as const;

export async function testTreeViewA11y(context: StoryContext): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';
  try {
    await step('Tree container with role="tree" is present', async () => {
      const tree = await waitFor(
        () => {
          const el = root.queryByShadowRole('tree');
          expect(el, 'Expected an element with role="tree"').not.toBeNull();
          return el!;
        },
        {timeout: 5000}
      );

      expect(
        tree.getAttribute('aria-label') || tree.getAttribute('aria-labelledby'),
        'Tree should have an accessible label (aria-label or aria-labelledby)'
      ).toBeTruthy();
    });

    await step('Tree items with role="treeitem" are present', async () => {
      const items = await waitFor(
        () => {
          const els = root.queryAllByShadowRole('treeitem');
          expect(
            els.length,
            'Expected at least one element with role="treeitem"'
          ).toBeGreaterThanOrEqual(1);
          return els;
        },
        {timeout: 5000}
      );

      const expandableItems = items.filter(
        (item) => item.getAttribute('aria-expanded') !== null
      );

      if (expandableItems.length > 0) {
        for (const item of expandableItems) {
          const expanded = item.getAttribute('aria-expanded');
          expect(
            expanded === 'true' || expanded === 'false',
            `aria-expanded should be "true" or "false", got "${expanded}"`
          ).toBe(true);
        }
      }
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
