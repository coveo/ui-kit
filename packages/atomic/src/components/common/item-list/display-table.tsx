import {FunctionalComponent, VNode, h} from '@stencil/core';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';
import {AnyItem} from '../interface/item';
import {ItemRenderingFunction} from './item-list-common';

interface TableColumnsProps {
  templateContentForFirstItem: DocumentFragment;
  firstItem: AnyItem;
  itemRenderingFunction?: ItemRenderingFunction;
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
  if (props.itemRenderingFunction) {
    return getFieldTableColumnsFromRenderingFunction(props);
  }
  return getFieldTableColumnsFromHTMLTemplate(props);
};

const getFieldTableColumnsFromRenderingFunction = (
  props: Pick<TableColumnsProps, 'itemRenderingFunction' | 'firstItem'>
): HTMLAtomicTableElementElement[] => {
  const contentOfRenderingFunction = document.createElement('div');

  const contentOfRenderingFunctionAsString = props.itemRenderingFunction!(
    props.firstItem,
    document.createElement('div')
  );
  contentOfRenderingFunction.innerHTML = contentOfRenderingFunctionAsString;

  return Array.from(
    contentOfRenderingFunction.querySelectorAll(tableElementTagName)
  );
};

const getFieldTableColumnsFromHTMLTemplate = (
  props: Pick<DisplayTableProps, 'templateContentForFirstItem'>
): HTMLAtomicTableElementElement[] =>
  Array.from(
    props.templateContentForFirstItem.querySelectorAll(tableElementTagName)
  );

export const DisplayTable: FunctionalComponent<DisplayTableProps> = (
  props,
  children
) => {
  const fieldColumns = getFieldTableColumns(props);

  if (!fieldColumns.length) {
    props.logger.error(
      'atomic-table-element elements missing in the template to display columns.',
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

export const DisplayTableData: FunctionalComponent<
  TableDataProps & {
    renderItem: (content: HTMLAtomicTableElementElement) => VNode;
  }
> = (props) => {
  const fieldColumns = getFieldTableColumns(props);

  return fieldColumns.map((column) => {
    const key = column.getAttribute('label')! + props.key;
    return (
      <td key={key} part="result-table-cell">
        {props.renderItem(column)}
      </td>
    );
  });
};
