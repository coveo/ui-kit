import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by table interaction tests.
 *
 * - 1.3.1 Info and Relationships: native table elements preserve semantic structure
 * - 4.1.2 Name, Role, Value: table has accessible label
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/table/ — WAI-ARIA Table Pattern
 * @see https://www.w3.org/TR/WCAG22/#info-and-relationships — WCAG 2.2 SC 1.3.1 Info and Relationships
 * @see https://www.w3.org/TR/WCAG22/#name-role-value — WCAG 2.2 SC 4.1.2 Name, Role, Value (Level A)
 */
export const COVERED_CRITERIA = ['1.3.1', '4.1.2'] as const;

export interface TableA11yOptions {
  /** Expected aria-label of the table. If omitted, just checks presence of a label. */
  expectedLabel?: string | RegExp;
}

/**
 * Tests the WAI-ARIA Table pattern.
 *
 * Verifies that:
 * 1. A native `<table>` element with role="table" (implicit) exists
 * 2. Table has an accessible label (aria-label or aria-labelledby)
 * 3. Table has `<thead>` with column headers (`<th>` elements)
 * 4. Table has `<tbody>` with data rows
 */
export async function testTableA11y(
  context: StoryContext,
  options?: TableA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;

  let status: 'passed' | 'failed' = 'passed';

  try {
    const root = within(canvasElement);
    let table!: HTMLElement;

    await step('Find table element', async () => {
      const tables = await root.findAllByShadowRole(
        'table',
        {},
        {timeout: 5000}
      );
      expect(tables.length).toBeGreaterThanOrEqual(1);
      table = tables[0];
    });

    await step('Table has accessible label', async () => {
      const label =
        table.getAttribute('aria-label') ||
        table.getAttribute('aria-labelledby');
      expect(label).toBeTruthy();

      if (options?.expectedLabel) {
        const ariaLabel = table.getAttribute('aria-label') ?? '';
        if (typeof options.expectedLabel === 'string') {
          expect(ariaLabel).toBe(options.expectedLabel);
        } else {
          expect(ariaLabel).toMatch(options.expectedLabel);
        }
      }
    });

    await step('Table has column headers in <thead>', async () => {
      const thead = table.querySelector('thead');
      expect(thead).not.toBeNull();
      const ths = thead!.querySelectorAll('th');
      expect(ths.length).toBeGreaterThanOrEqual(1);
    });

    await step('Table has data rows in <tbody>', async () => {
      const tbody = table.querySelector('tbody');
      expect(tbody).not.toBeNull();
      const rows = tbody!.querySelectorAll('tr');
      expect(rows.length).toBeGreaterThanOrEqual(1);
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
