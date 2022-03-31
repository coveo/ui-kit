import {FunctionalComponent, h} from '@stencil/core';
import {getId, ResultsProps} from './result-list-common';

export const TableDisplayResults: FunctionalComponent<ResultsProps> = (
  props
) => {
  const fieldColumns = Array.from(
    props
      .getContentOfResultTemplate(props.resultListState.results[0])
      .querySelectorAll('atomic-table-element')
  );

  if (fieldColumns.length === 0) {
    props.bindings.engine.logger.error(
      'atomic-table-element elements missing in the result template to display columns.',
      props.host
    );
  }

  return (
    <table class={`list-root ${props.classes}`} part="result-table">
      <thead part="result-table-heading">
        <tr part="result-table-heading-row">
          {fieldColumns.map((column) => (
            <th part="result-table-heading-cell">
              <atomic-text value={column.getAttribute('label')!}></atomic-text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody part="result-table-body">
        {props.resultListState.results.map((result, rowIndex) => (
          <tr
            key={getId(result, props.resultListState)}
            part={
              'result-table-row ' +
              (rowIndex % 2 === 1
                ? 'result-table-row-even'
                : 'result-table-row-odd') /* Offset by 1 since the index starts at 0 */
            }
          >
            {fieldColumns.map((column) => {
              return (
                <td
                  key={
                    column.getAttribute('label')! +
                    getId(result, props.resultListState)
                  }
                  part="result-table-cell"
                >
                  <atomic-result
                    engine={props.bindings.engine}
                    result={result}
                    display={props.display}
                    density={props.density}
                    image-size={props.imageSize ?? props.image}
                    content={column}
                  ></atomic-result>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
