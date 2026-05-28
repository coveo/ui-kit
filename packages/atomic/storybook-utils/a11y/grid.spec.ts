// @vitest-environment jsdom
import type {StoryContext} from '@storybook/web-components-vite';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {testGridA11y} from './grid.js';

function createGridFixture() {
  const canvasElement = document.createElement('div');
  const grid = document.createElement('div');
  grid.setAttribute('role', 'grid');
  grid.setAttribute('aria-label', 'Sample grid');

  const cells: HTMLElement[][] = [];
  let activePosition = {row: 0, column: 0};

  const updateFocus = (row: number, column: number) => {
    activePosition = {row, column};
    cells.forEach((cellRow, rowIndex) =>
      cellRow.forEach((cell, columnIndex) => {
        cell.setAttribute(
          'tabindex',
          rowIndex === row && columnIndex === column ? '0' : '-1'
        );
      })
    );
    cells[row][column].focus();
  };

  const maxColumnIndexForRow = (row: number) => cells[row].length - 1;

  grid.addEventListener('keydown', (event) => {
    const {key, ctrlKey} = event;
    let {row, column} = activePosition;

    switch (key) {
      case 'ArrowRight':
        column = Math.min(column + 1, maxColumnIndexForRow(row));
        break;
      case 'ArrowLeft':
        column = Math.max(column - 1, 0);
        break;
      case 'ArrowDown':
        row = Math.min(row + 1, cells.length - 1);
        column = Math.min(column, maxColumnIndexForRow(row));
        break;
      case 'ArrowUp':
        row = Math.max(row - 1, 0);
        column = Math.min(column, maxColumnIndexForRow(row));
        break;
      case 'Home':
        if (ctrlKey) {
          row = 0;
          column = 0;
        } else {
          column = 0;
        }
        break;
      case 'End':
        if (ctrlKey) {
          row = cells.length - 1;
          column = maxColumnIndexForRow(row);
        } else {
          column = maxColumnIndexForRow(row);
        }
        break;
      default:
        return;
    }

    event.preventDefault();
    updateFocus(row, column);
  });

  for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
    const row = document.createElement('div');
    row.setAttribute('role', 'row');

    const rowCells: HTMLElement[] = [];
    for (let columnIndex = 0; columnIndex < 2; columnIndex++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.textContent = `Cell ${rowIndex + 1}-${columnIndex + 1}`;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute(
        'tabindex',
        rowIndex === 0 && columnIndex === 0 ? '0' : '-1'
      );
      row.appendChild(cell);
      rowCells.push(cell);
    }

    cells.push(rowCells);
    grid.appendChild(row);
  }

  canvasElement.appendChild(grid);
  document.body.appendChild(canvasElement);

  return {canvasElement};
}

function buildContext(
  canvasElement: HTMLElement,
  addReport = vi.fn()
): StoryContext {
  return {
    canvasElement,
    step: async (_label: string, action: () => Promise<void> | void) => {
      await action();
    },
    reporting: {
      addReport,
    },
  } as unknown as StoryContext;
}

describe('testGridA11y', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('passes for a valid interactive grid', async () => {
    const {canvasElement} = createGridFixture();
    const addReport = vi.fn();

    await expect(
      testGridA11y(buildContext(canvasElement, addReport))
    ).resolves.toBeUndefined();

    expect(addReport).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'passed',
        result: {criteriaCovered: ['2.1.1', '4.1.2']},
      })
    );
  });

  it('throws a helpful error when no grid is present', async () => {
    const canvasElement = document.createElement('div');
    document.body.appendChild(canvasElement);
    const addReport = vi.fn();

    await expect(
      testGridA11y(buildContext(canvasElement, addReport))
    ).rejects.toThrow('[testGridA11y] No grid found matching {role="grid"}');

    expect(addReport).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
      })
    );
  }, 10000);
});
