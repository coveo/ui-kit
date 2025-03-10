import {ItemRenderingFunction} from '@/src/components';
import {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {html, TemplateResult} from 'lit';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';
import {AnyItem} from '../interface/item';

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
  const {firstItem, itemRenderingFunction} = props;

  const contentOfRenderingFunction = document.createElement('div');

  const contentOfRenderingFunctionAsString = itemRenderingFunction!(
    firstItem,
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

export const displayTable: FunctionalComponentWithChildren<
  DisplayTableProps
> = ({props, children}) => {
  const {host, listClasses, logger} = props;

  const fieldColumns = getFieldTableColumns(props);

  if (!fieldColumns.length) {
    logger.error(
      'atomic-table-element elements missing in the template to display columns.',
      host
    );
  }

  return html`<table class="list-root ${listClasses}" part="result-table">
    <thead part="result-table-heading">
      <tr part="result-table-heading-row">
        ${fieldColumns.map((column) => {
          return html`<th part="result-table-heading-cell">
            <atomic-text value=${column.getAttribute('label')!}></atomic-text>
          </th>`;
        })}
      </tr>
    </thead>
    <tbody part="result-table-body">
      ${children}
    </tbody>
  </table>`;
};

export const displayTableRow: FunctionalComponentWithChildren<
  DisplayTableRowProps
> = ({props, children}) => {
  const {key, rowIndex, setRef} = props;

  return html`<tr
    key=${key}
    part="result-table-row ${rowIndex % 2 ===
    1} ? 'result-table-row-even' : 'result-table-row-odd'"
    ref=${(element: HTMLElement) => setRef(element)}
  >
    ${children}
  </tr>`;
};

export const displayTableData: FunctionalComponent<
  TableDataProps & {
    renderItem: (content: HTMLAtomicTableElementElement) => TemplateResult;
  }
> = ({props}) => {
  const {renderItem} = props;
  const fieldColumns = getFieldTableColumns(props);

  return fieldColumns.map((column) => {
    const key = column.getAttribute('label')! + props.key;
    return html`<tb key=${key} part="result-table-cell">${renderItem(column)}</td>`;
  });
};
