import {ResultListSelectors} from './result-list-selectors';

export const ResultTableSelectors = {
  shadow: ResultListSelectors.shadow,
  placeholder: () =>
    ResultTableSelectors.shadow().find('atomic-result-table-placeholder'),
  headers: () => ResultTableSelectors.shadow().find('th'),
  rows: () => ResultTableSelectors.shadow().find('tbody tr'),
  firstRow: () => ResultTableSelectors.rows().first(),
  firstRowCells: () =>
    ResultTableSelectors.rows().first().find('atomic-table-cell'),
  firstRowCellsContent: () =>
    ResultTableSelectors.firstRowCells().then((cells) =>
      Array.from(cells).map(
        (cell) => cell.shadowRoot!.querySelector('.cell-root')!
      )
    ),
};
