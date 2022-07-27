import {FunctionalComponent, h} from '@stencil/core';
import {AnyBindings} from '../interface/bindings';
import {ResultsProps} from './result-list-common';

export const TableDisplayResults: FunctionalComponent<
  ResultsProps<AnyBindings>
> = (props) => {
  const fieldColumns = getFieldTableColumns(props);

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
            key={props.resultListCommon.getResultId(
              result,
              props.resultListState
            )}
            part={
              'result-table-row ' +
              (rowIndex % 2 === 1
                ? 'result-table-row-even'
                : 'result-table-row-odd') /* Offset by 1 since the index starts at 0 */
            }
            ref={(element) =>
              element &&
              props.indexOfResultToFocus === rowIndex &&
              props.newResultRef?.(element)
            }
          >
            {fieldColumns.map((column) => {
              return (
                <td
                  key={
                    column.getAttribute('label')! +
                    props.resultListCommon.getResultId(
                      result,
                      props.resultListState
                    )
                  }
                  part="result-table-cell"
                >
                  TODO
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const getFieldTableColumns = (props: ResultsProps<AnyBindings>) => {
  if (props.renderingFunction) {
    return getFieldTableColumnsFromRenderingFunction(props);
  }
  return getFieldTableColumnsFromHTMLTemplate(props);
};

const getFieldTableColumnsFromRenderingFunction = (
  props: ResultsProps<AnyBindings>
): HTMLAtomicTableElementElement[] => {
  const contentOfRenderingFunction = document.createElement('div');

  const contentOfRenderingFunctionAsString = props.renderingFunction!(
    props.resultListState.results[0],
    document.createElement('div')
  );
  contentOfRenderingFunction.innerHTML = contentOfRenderingFunctionAsString;

  return Array.from(
    contentOfRenderingFunction.querySelectorAll('atomic-table-element')
  );
};

const getFieldTableColumnsFromHTMLTemplate = (
  props: ResultsProps<AnyBindings>
): HTMLAtomicTableElementElement[] => {
  return Array.from(
    props
      .getContentOfResultTemplate(props.resultListState.results[0])
      .querySelectorAll('atomic-table-element')
  );
};
