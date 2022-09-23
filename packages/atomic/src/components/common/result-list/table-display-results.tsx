import {FunctionalComponent, h} from '@stencil/core';
import {ResultListDisplayProps} from './result-list-common-interface';

export const TableDisplayResults: FunctionalComponent<
  ResultListDisplayProps
> = (props) => {
  const fieldColumns = getFieldTableColumns(props);

  if (fieldColumns.length === 0) {
    props.bindings.engine.logger.error(
      'atomic-table-element elements missing in the result template to display columns.',
      props.host
    );
  }

  return (
    <table class={`list-root ${props.listClasses}`} part="result-table">
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
        {props.getResultListState().results.map((result, rowIndex) => (
          <tr
            key={props.getResultId(result)}
            part={
              'result-table-row ' +
              (rowIndex % 2 === 1
                ? 'result-table-row-even'
                : 'result-table-row-odd') /* Offset by 1 since the index starts at 0 */
            }
            ref={(element) => props.setNewResultRef(element!, rowIndex)}
          >
            {fieldColumns.map((column) => {
              <td
                key={column.getAttribute('label')! + props.getResultId(result)}
                part="result-table-cell"
              >
                <atomic-result
                  store={props.bindings.store}
                  result={result}
                  display={props.getDisplay()}
                  density={props.getDensity()}
                  image-size={props.getImageSize()}
                  content={column}
                  loadingFlag={props.loadingFlag}
                ></atomic-result>
              </td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const getFieldTableColumns = (props: ResultListDisplayProps) => {
  // if (props.renderingFunction) {
  //   return getFieldTableColumnsFromRenderingFunction(props);
  // }
  return getFieldTableColumnsFromHTMLTemplate(props);
};

// TODO: enable render func
// const getFieldTableColumnsFromRenderingFunction = (
//   props: ResultListDisplayProps
// ): HTMLAtomicTableElementElement[] => {
//   const contentOfRenderingFunction = document.createElement('div');

//   const contentOfRenderingFunctionAsString = props.renderingFunction!(
//     props.resultListState.results[0],
//     document.createElement('div')
//   );
//   contentOfRenderingFunction.innerHTML = contentOfRenderingFunctionAsString;

//   return Array.from(
//     contentOfRenderingFunction.querySelectorAll('atomic-table-element')
//   );
// };

const getFieldTableColumnsFromHTMLTemplate = (
  props: ResultListDisplayProps
): HTMLAtomicTableElementElement[] =>
  Array.from(
    props
      .getTemplateContent(props.getResultListState().results[0])
      .querySelectorAll('atomic-table-element')
  );
