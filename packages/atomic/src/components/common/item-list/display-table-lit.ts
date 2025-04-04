import {ItemRenderingFunction} from '@/src/components';
import {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {html, TemplateResult} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
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
  setRef: (element?: Element) => void;
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

export const DisplayTable: FunctionalComponentWithChildren<
  DisplayTableProps
> = ({props}) => {
  const {host, listClasses, logger} = props;

  const fieldColumns = getFieldTableColumns(props);

  if (!fieldColumns.length) {
    logger.error(
      'atomic-table-element elements missing in the template to display columns.',
      host
    );
  }

  return (children: TemplateResult) =>
    html`<table class="list-root ${listClasses}" part="result-table">
      <thead part="result-table-heading">
        <tr part="result-table-heading-row">
          ${map(fieldColumns, (column) => {
            return html`<th part="result-table-heading-cell">
              <atomic-text
                .value=${column.getAttribute('label')!}
              ></atomic-text>
            </th>`;
          })}
        </tr>
      </thead>
      <tbody part="result-table-body">
        ${children}
      </tbody>
    </table>`;
};

export const DisplayTableRow: FunctionalComponentWithChildren<
  DisplayTableRowProps
> = ({props}) => {
  const {key, rowIndex, setRef} = props;

  return (children: TemplateResult) =>
    html`${keyed(
      key,
      html`<tr
        part="result-table-row ${rowIndex % 2 ===
        1} ? 'result-table-row-even' : 'result-table-row-odd'"
        ${ref((element?: Element) => setRef(element))}
      >
        ${children}
      </tr>`
    )}`;
};

export const DisplayTableData: FunctionalComponent<
  TableDataProps & {
    renderItem: (content: HTMLAtomicTableElementElement) => TemplateResult;
  }
> = ({props}) => {
  const {renderItem} = props;
  const fieldColumns = getFieldTableColumns(props);

  return html`${map(
    fieldColumns,
    (column) =>
      html`${keyed(
        `${column.getAttribute('label')!}${props.key}`,
        html`<td part="result-table-cell">${renderItem(column)}</td>`
      )}`
  )}`;
};
