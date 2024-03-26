import {FunctionalComponent, h} from '@stencil/core';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';

interface TableColumnsProps {
  templateContentForFirstResult: DocumentFragment;
  firstResult: unknown;
  resultRenderingFunction?: (result: unknown, element: HTMLElement) => string;
}

export interface DisplayTableProps extends TableColumnsProps {
  logger: Pick<Console, 'error'>;
  host: HTMLElement;
  listClasses: string;
}

export interface TableDataProps extends TableColumnsProps {
  key: string;
}

export interface DisplayTableRowProps {
  key: string;
  rowIndex: number;
  setRef: (element?: HTMLElement) => void;
}

const getFieldTableColumns = (props: TableColumnsProps) => {
  if (props.resultRenderingFunction) {
    return getFieldTableColumnsFromRenderingFunction(props);
  }
  return getFieldTableColumnsFromHTMLTemplate(props);
};

const getFieldTableColumnsFromRenderingFunction = (
  props: Pick<TableColumnsProps, 'resultRenderingFunction' | 'firstResult'>
): HTMLAtomicTableElementElement[] => {
  const contentOfRenderingFunction = document.createElement('div');

  const contentOfRenderingFunctionAsString = props.resultRenderingFunction!(
    props.firstResult,
    document.createElement('div')
  );
  contentOfRenderingFunction.innerHTML = contentOfRenderingFunctionAsString;

  return Array.from(
    contentOfRenderingFunction.querySelectorAll(tableElementTagName)
  );
};

const getFieldTableColumnsFromHTMLTemplate = (
  props: Pick<DisplayTableProps, 'templateContentForFirstResult'>
): HTMLAtomicTableElementElement[] =>
  Array.from(
    props.templateContentForFirstResult.querySelectorAll(tableElementTagName)
  );

export const DisplayTable: FunctionalComponent<DisplayTableProps> = (
  props,
  children
) => {
  const fieldColumns = getFieldTableColumns(props);

  if (!fieldColumns.length) {
    props.logger.error(
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
      <tbody part="result-table-body">{...children}</tbody>
    </table>
  );
};

export const DisplayTableRow: FunctionalComponent<DisplayTableRowProps> = (
  {key, rowIndex, setRef},
  children
) => {
  return (
    <tr
      key={key}
      part={
        'result-table-row ' +
        (rowIndex % 2 === 1 ? 'result-table-row-even' : 'result-table-row-odd')
      }
      ref={(element) => setRef(element)}
    >
      {...children}
    </tr>
  );
};

export const DisplayTableData: FunctionalComponent<TableDataProps> = (
  props,
  children
) => {
  const fieldColumns = getFieldTableColumns(props);

  return fieldColumns.map((column) => {
    const key = column.getAttribute('label')! + props.key;
    return (
      <td key={key} part="result-table-cell">
        {...children}
      </td>
    );
  });
};
