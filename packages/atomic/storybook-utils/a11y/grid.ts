import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by grid/table interaction tests.
 *
 * - 1.3.1 Info and Relationships: data grids use proper table semantics
 * - 4.1.2 Name, Role, Value: grid container has accessible name
 *
 * NOTE: The WAI-ARIA Grid pattern (role="grid") is intended for interactive
 * tabular data with keyboard navigation (arrow keys between cells).
 * Atomic result/product lists displayed as tables are **static** and do NOT
 * require the grid pattern. They should use the simpler Table pattern instead
 * (native <table> with aria-label).
 *
 * This helper is provided for future use if an interactive data grid component
 * is added to Atomic. For now, use `testTableA11y` for table displays.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/ — WAI-ARIA Grid Pattern
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/table/ — WAI-ARIA Table Pattern (preferred for static data)
 * @see https://www.w3.org/TR/WCAG22/#info-and-relationships — WCAG 2.2 SC 1.3.1
 * @see https://www.w3.org/TR/WCAG22/#name-role-value — WCAG 2.2 SC 4.1.2
 */
export const COVERED_CRITERIA = ['1.3.1', '4.1.2'] as const;

export interface GridA11yOptions {
  /** Expected aria-label of the grid. If omitted, just checks presence. */
  expectedLabel?: string | RegExp;
}

/**
 * Tests the WAI-ARIA Grid pattern.
 *
 * Verifies that:
 * 1. An element with `role="grid"` exists
 * 2. Grid has an accessible label
 * 3. Grid contains rows with `role="row"`
 * 4. Rows contain cells with `role="gridcell"` or `role="columnheader"`
 *
 * NOTE: Only use this helper for truly interactive grid components.
 * For static table displays, use `testTableA11y` instead.
 */
export async function testGridA11y(
  context: StoryContext,
  options?: GridA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';

  try {
    const root = within(canvasElement);
    let grid!: HTMLElement;

    await step('Find element with role="grid"', async () => {
      const grids = await root.findAllByShadowRole('grid', {}, {timeout: 5000});
      expect(grids.length).toBeGreaterThanOrEqual(1);
      grid = grids[0];
    });

    await step('Grid has accessible label', async () => {
      const label =
        grid.getAttribute('aria-label') ||
        grid.getAttribute('aria-labelledby');
      expect(label).toBeTruthy();

      if (options?.expectedLabel) {
        const ariaLabel = grid.getAttribute('aria-label') ?? '';
        if (typeof options.expectedLabel === 'string') {
          expect(ariaLabel).toBe(options.expectedLabel);
        } else {
          expect(ariaLabel).toMatch(options.expectedLabel);
        }
      }
    });

    await step('Grid contains rows', async () => {
      const rows = grid.querySelectorAll('[role="row"]');
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });

    await step('Rows contain grid cells or column headers', async () => {
      const firstRow = grid.querySelector('[role="row"]');
      expect(firstRow).not.toBeNull();
      const cells = firstRow!.querySelectorAll(
        '[role="gridcell"], [role="columnheader"]'
      );
      expect(cells.length).toBeGreaterThanOrEqual(1);
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
