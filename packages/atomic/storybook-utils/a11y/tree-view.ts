import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, userEvent, waitFor} from 'storybook/test';

export const COVERED_CRITERIA = ['1.3.1', '2.1.1', '4.1.2'] as const;

function getDeepActiveElement(element: Element | null): Element | null {
  while (element?.shadowRoot?.activeElement) {
    element = element.shadowRoot.activeElement;
  }
  return element;
}

function getActiveTreeItem(
  treeItems: HTMLElement[],
  canvasElement: HTMLElement
): HTMLElement | null {
  const activeElement = getDeepActiveElement(
    canvasElement.ownerDocument.activeElement
  );

  return treeItems.find((item) => item === activeElement) ?? null;
}

/**
 * Tests the WAI-ARIA tree view pattern.
 *
 * Verifies that:
 * 1. A tree with treeitems is rendered and named
 * 2. Up/Down/Home/End keyboard navigation moves focus between visible nodes
 * 3. Right Arrow expands a collapsed node and then moves to its first child
 * 4. Left Arrow moves focus to the parent and then collapses the expanded node
 * 5. Enter activates the focused node
 */
export async function testTreeViewA11y(context: StoryContext): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);

  let status: 'passed' | 'failed' = 'passed';

  try {
    let tree!: HTMLElement;
    let treeItems!: HTMLElement[];

    const refreshTreeItems = async () => {
      treeItems = await within(tree).findAllByShadowRole(
        'treeitem',
        undefined,
        {
          timeout: 5000,
        }
      );
    };

    await step('Find tree and treeitems', async () => {
      tree = await root.findByShadowRole('tree', undefined, {timeout: 5000});
      expect(tree).toHaveAccessibleName();
      await refreshTreeItems();
      expect(treeItems.length).toBeGreaterThanOrEqual(2);
    });

    await step(
      'ArrowDown and ArrowUp move focus between visible nodes',
      async () => {
        treeItems[0].focus();

        await waitFor(() => {
          expect(getActiveTreeItem(treeItems, canvasElement)).toBe(
            treeItems[0]
          );
        });

        await userEvent.keyboard('{ArrowDown}');

        await waitFor(() => {
          expect(getActiveTreeItem(treeItems, canvasElement)).toBe(
            treeItems[1]
          );
        });

        await userEvent.keyboard('{ArrowUp}');

        await waitFor(() => {
          expect(getActiveTreeItem(treeItems, canvasElement)).toBe(
            treeItems[0]
          );
        });
      }
    );

    await step(
      'Home and End move focus to the first and last visible nodes',
      async () => {
        treeItems[0].focus();
        await userEvent.keyboard('{End}');

        await waitFor(() => {
          expect(getActiveTreeItem(treeItems, canvasElement)).toBe(
            treeItems[treeItems.length - 1]
          );
        });

        await userEvent.keyboard('{Home}');

        await waitFor(() => {
          expect(getActiveTreeItem(treeItems, canvasElement)).toBe(
            treeItems[0]
          );
        });
      }
    );

    await step(
      'Right Arrow expands a collapsed node and toggles aria-expanded',
      async () => {
        const expandableTreeItem =
          treeItems.find(
            (item) => item.getAttribute('aria-expanded') === 'false'
          ) ?? null;

        expect(expandableTreeItem).not.toBeNull();
        expandableTreeItem!.focus();

        await userEvent.keyboard('{ArrowRight}');

        await waitFor(async () => {
          await refreshTreeItems();
          const expandedTreeItem = treeItems.find(
            (item) =>
              item.textContent === expandableTreeItem!.textContent &&
              item.getAttribute('aria-expanded') === 'true'
          );

          expect(expandedTreeItem).toBeDefined();
        });
      }
    );

    await step(
      'Right Arrow on an open node moves focus to its first child',
      async () => {
        const expandedTreeItem =
          treeItems.find(
            (item) => item.getAttribute('aria-expanded') === 'true'
          ) ?? null;

        expect(expandedTreeItem).not.toBeNull();
        expandedTreeItem!.focus();

        const expandedLevel = Number(
          expandedTreeItem!.getAttribute('aria-level') ?? '1'
        );

        await userEvent.keyboard('{ArrowRight}');

        await waitFor(async () => {
          await refreshTreeItems();
          const activeTreeItem = getActiveTreeItem(treeItems, canvasElement);
          expect(activeTreeItem).not.toBeNull();
          expect(activeTreeItem).not.toBe(expandedTreeItem);
          expect(
            Number(activeTreeItem!.getAttribute('aria-level') ?? '1')
          ).toBe(expandedLevel + 1);
        });
      }
    );

    await step(
      'Left Arrow moves focus to the parent of a child node',
      async () => {
        const activeTreeItem = getActiveTreeItem(treeItems, canvasElement);

        expect(activeTreeItem).not.toBeNull();
        await userEvent.keyboard('{ArrowLeft}');

        await waitFor(() => {
          const parentTreeItem = getActiveTreeItem(treeItems, canvasElement);
          expect(parentTreeItem?.getAttribute('aria-expanded')).toBe('true');
        });
      }
    );

    await step(
      'Left Arrow on an open node collapses it and toggles aria-expanded',
      async () => {
        const expandedTreeItem = getActiveTreeItem(treeItems, canvasElement);

        expect(expandedTreeItem).not.toBeNull();
        await userEvent.keyboard('{ArrowLeft}');

        await waitFor(async () => {
          await refreshTreeItems();
          const collapsedTreeItem = treeItems.find(
            (item) =>
              item.textContent === expandedTreeItem!.textContent &&
              item.getAttribute('aria-expanded') === 'false'
          );

          expect(collapsedTreeItem).toBeDefined();
        });
      }
    );

    await step('Enter activates the focused node', async () => {
      const collapsedTreeItem =
        treeItems.find(
          (item) => item.getAttribute('aria-expanded') === 'false'
        ) ?? null;

      expect(collapsedTreeItem).not.toBeNull();
      collapsedTreeItem!.focus();

      await userEvent.keyboard('{Enter}');

      await waitFor(async () => {
        await refreshTreeItems();
        const expandedTreeItem = treeItems.find(
          (item) =>
            item.textContent === collapsedTreeItem!.textContent &&
            item.getAttribute('aria-expanded') === 'true'
        );

        expect(expandedTreeItem).toBeDefined();
      });
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
