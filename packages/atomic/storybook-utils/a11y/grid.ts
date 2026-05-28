import type {StoryContext} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {expect, waitFor} from 'storybook/test';

/**
 * WCAG 2.2 AA criteria covered by grid interaction tests.
 *
 * - 2.1.1 Keyboard: Arrow keys and navigation keys move within the grid
 * - 4.1.2 Name, Role, Value: the grid exposes expected ARIA semantics
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/ — WAI-ARIA Grid Pattern
 * @see https://www.w3.org/TR/WCAG22/#keyboard — WCAG 2.2 SC 2.1.1 Keyboard (Level A)
 * @see https://www.w3.org/TR/WCAG22/#name-role-value — WCAG 2.2 SC 4.1.2 Name, Role, Value (Level A)
 */
export const COVERED_CRITERIA = ['2.1.1', '4.1.2'] as const;

const cellSelector =
  '[role="gridcell"], [role="columnheader"], [role="rowheader"]';

export interface GridA11yOptions {
  /** Matches the accessible name of the grid. If omitted, uses the first grid found. */
  gridName?: string | RegExp;
}

async function findGrid(
  root: ReturnType<typeof within>,
  options?: GridA11yOptions
): Promise<HTMLElement> {
  const queryOptions: Record<string, unknown> = {};
  if (options?.gridName !== undefined) {
    queryOptions.name = options.gridName;
  }

  let elements: HTMLElement[];
  try {
    elements = await root.findAllByShadowRole('grid', queryOptions, {
      timeout: 5000,
    });
  } catch {
    elements = [];
  }

  if (elements.length === 0) {
    const criteria =
      options?.gridName !== undefined
        ? `role="grid" with name matching "${String(options.gridName)}"`
        : 'role="grid"';

    throw new Error(
      `[testGridA11y] No grid found matching {${criteria}}.\n\n` +
        `Either this component does not implement the WAI-ARIA grid pattern, ` +
        `or the gridName option needs to be adjusted.\n` +
        `If this component does not use an interactive grid, remove the testGridA11y call from its story.`
    );
  }

  return elements[0];
}

function getRows(grid: HTMLElement): HTMLElement[] {
  const rows = Array.from(grid.querySelectorAll<HTMLElement>('[role="row"]'));

  if (rows.length === 0) {
    throw new Error(
      '[testGridA11y] No rows found inside the grid.\nExpected descendants with role="row".'
    );
  }

  return rows;
}

function getCells(row: HTMLElement): HTMLElement[] {
  return Array.from(row.querySelectorAll<HTMLElement>(cellSelector)).filter(
    (cell) => cell.closest('[role="row"]') === row
  );
}

function getCellMatrix(grid: HTMLElement): HTMLElement[][] {
  const matrix = getRows(grid)
    .map(getCells)
    .filter((cells) => cells.length > 0);

  if (matrix.length === 0) {
    throw new Error(
      '[testGridA11y] No grid cells found inside the grid rows.\nExpected descendants with role="gridcell", "columnheader", or "rowheader".'
    );
  }

  return matrix;
}

function getAllCells(matrix: HTMLElement[][]): HTMLElement[] {
  return matrix.flat();
}

function getActiveElementDeep(doc: Document): Element | null {
  let active: Element | null = doc.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

function expectRovingTabindex(cells: HTMLElement[]) {
  const activeCells = cells.filter(
    (cell) => cell.getAttribute('tabindex') === '0'
  );
  const inactiveCells = cells.filter(
    (cell) => cell.getAttribute('tabindex') === '-1'
  );

  expect(
    activeCells.length,
    'Exactly one grid cell should have tabindex="0"'
  ).toBe(1);
  expect(
    inactiveCells.length,
    'All non-active grid cells should have tabindex="-1"'
  ).toBe(cells.length - 1);
}

function pressKey(
  target: HTMLElement,
  key: string,
  options?: Pick<KeyboardEventInit, 'ctrlKey'>
) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      composed: true,
      ...options,
    })
  );
}

async function expectFocusOnCell(doc: Document, cell: HTMLElement) {
  await waitFor(
    () => {
      expect(getActiveElementDeep(doc)).toBe(cell);
      expect(cell).toHaveAttribute('tabindex', '0');
    },
    {timeout: 3000}
  );
}

/**
 * Tests the WAI-ARIA grid pattern.
 *
 * Verifies that:
 * 1. A labeled grid with rows and cells exists
 * 2. Cells use roving tabindex
 * 3. Arrow keys move focus between cells
 * 4. Home/End move within the current row
 * 5. Ctrl+Home/Ctrl+End move to the first/last cell in the grid
 */
export async function testGridA11y(
  context: StoryContext,
  options?: GridA11yOptions
): Promise<void> {
  const {canvasElement, step} = context;
  const root = within(canvasElement);
  const doc = canvasElement.ownerDocument;

  let status: 'passed' | 'failed' = 'passed';

  try {
    let grid!: HTMLElement;
    let cellMatrix!: HTMLElement[][];
    let allCells!: HTMLElement[];

    await step('Find labeled grid with rows and cells', async () => {
      grid = await findGrid(root, options);
      expect(
        grid.hasAttribute('aria-label') || grid.hasAttribute('aria-labelledby'),
        'Grid should have an accessible name via aria-label or aria-labelledby'
      ).toBe(true);

      cellMatrix = getCellMatrix(grid);
      expect(
        cellMatrix.length,
        'Grid should contain at least two populated rows to test vertical navigation'
      ).toBeGreaterThanOrEqual(2);
      expect(
        cellMatrix[0].length,
        'Grid should contain at least two cells in the first row to test horizontal navigation'
      ).toBeGreaterThanOrEqual(2);

      const ariaRowCount = grid.getAttribute('aria-rowcount');
      if (ariaRowCount !== null) {
        expect(
          Number(ariaRowCount),
          'aria-rowcount should be a positive integer when provided'
        ).toBeGreaterThanOrEqual(cellMatrix.length);
      }

      const ariaColCount = grid.getAttribute('aria-colcount');
      if (ariaColCount !== null) {
        expect(
          Number(ariaColCount),
          'aria-colcount should be a positive integer when provided'
        ).toBeGreaterThanOrEqual(
          Math.max(...cellMatrix.map((row) => row.length))
        );
      }

      allCells = getAllCells(cellMatrix);
      expectRovingTabindex(allCells);
    });

    await step('ArrowRight moves focus to the next cell', async () => {
      const firstCell = cellMatrix[0][0];
      const secondCell = cellMatrix[0][1];

      firstCell.focus();
      await expectFocusOnCell(doc, firstCell);

      pressKey(firstCell, 'ArrowRight');

      await expectFocusOnCell(doc, secondCell);
      expect(firstCell).toHaveAttribute('tabindex', '-1');
    });

    await step('ArrowLeft moves focus to the previous cell', async () => {
      const firstCell = cellMatrix[0][0];
      const secondCell = cellMatrix[0][1];

      await expectFocusOnCell(doc, secondCell);

      pressKey(secondCell, 'ArrowLeft');

      await expectFocusOnCell(doc, firstCell);
      expect(secondCell).toHaveAttribute('tabindex', '-1');
    });

    await step('ArrowDown moves focus to the cell below', async () => {
      const firstCell = cellMatrix[0][0];
      const belowCell = cellMatrix[1][0];

      firstCell.focus();
      await expectFocusOnCell(doc, firstCell);

      pressKey(firstCell, 'ArrowDown');

      await expectFocusOnCell(doc, belowCell);
      expect(firstCell).toHaveAttribute('tabindex', '-1');
    });

    await step('ArrowUp moves focus to the cell above', async () => {
      const firstCell = cellMatrix[0][0];
      const belowCell = cellMatrix[1][0];

      await expectFocusOnCell(doc, belowCell);

      pressKey(belowCell, 'ArrowUp');

      await expectFocusOnCell(doc, firstCell);
      expect(belowCell).toHaveAttribute('tabindex', '-1');
    });

    await step('End moves focus to the last cell in the row', async () => {
      const firstCell = cellMatrix[0][0];
      const lastCellInRow = cellMatrix[0][cellMatrix[0].length - 1];

      await expectFocusOnCell(doc, firstCell);

      pressKey(firstCell, 'End');

      await expectFocusOnCell(doc, lastCellInRow);
      expect(firstCell).toHaveAttribute('tabindex', '-1');
    });

    await step('Home moves focus to the first cell in the row', async () => {
      const firstCell = cellMatrix[0][0];
      const lastCellInRow = cellMatrix[0][cellMatrix[0].length - 1];

      await expectFocusOnCell(doc, lastCellInRow);

      pressKey(lastCellInRow, 'Home');

      await expectFocusOnCell(doc, firstCell);
      expect(lastCellInRow).toHaveAttribute('tabindex', '-1');
    });

    await step(
      'Ctrl+End moves focus to the last cell in the grid',
      async () => {
        const firstCell = cellMatrix[0][0];
        const lastRow = cellMatrix[cellMatrix.length - 1];
        const lastCell = lastRow[lastRow.length - 1];

        await expectFocusOnCell(doc, firstCell);

        pressKey(firstCell, 'End', {ctrlKey: true});

        await expectFocusOnCell(doc, lastCell);
        expect(firstCell).toHaveAttribute('tabindex', '-1');
      }
    );

    await step(
      'Ctrl+Home moves focus to the first cell in the grid',
      async () => {
        const firstCell = cellMatrix[0][0];
        const lastRow = cellMatrix[cellMatrix.length - 1];
        const lastCell = lastRow[lastRow.length - 1];

        await expectFocusOnCell(doc, lastCell);

        pressKey(lastCell, 'Home', {ctrlKey: true});

        await expectFocusOnCell(doc, firstCell);
        expect(lastCell).toHaveAttribute('tabindex', '-1');
      }
    );
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
