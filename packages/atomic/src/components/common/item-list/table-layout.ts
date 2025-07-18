import {html, type TemplateResult} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
import type {ItemRenderingFunction} from '@/src/components';
import type {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';
import type {AnyItem} from '../interface/item';

interface TableColumnsProps {
  firstItem: AnyItem;
  itemRenderingFunction?: ItemRenderingFunction;
  templateContentForFirstItem: DocumentFragment;
}

export interface TableLayoutProps extends TableColumnsProps {
  host: HTMLElement;
  listClasses: string;
  logger: Pick<Console, 'error'>;
}

export interface TableDataProps extends TableColumnsProps {
  key: string;
  renderItem: (content: Element) => TemplateResult;
}

export interface TableRowProps {
  key: string;
  rowIndex: number;
  setRef: (element?: Element) => void;
}

export const renderTableLayout: FunctionalComponentWithChildren<
  TableLayoutProps
> = ({props}) => {
  const {host, listClasses, logger} = props;

  const fieldColumns = getFieldTableColumns(props);

  if (!fieldColumns.length) {
    logger.error(
      'atomic-table-element elements missing in the template to display columns.',
      host
    );
  }

  return (children) =>
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

export const renderTableRow: FunctionalComponentWithChildren<TableRowProps> = ({
  props,
}) => {
  const {key, rowIndex, setRef} = props;

  return (children) =>
    html`${keyed(
      key,
      html`<tr
        .part="result-table-row${
          rowIndex % 2 === 1
            ? ' result-table-row-even'
            : ' result-table-row-odd'
        }"
        ${ref((element?: Element) => setRef(element))}
      >
        ${children}
      </tr>`
    )}`;
};

export const renderTableData: FunctionalComponent<TableDataProps> = ({
  props,
}) => {
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

const getFieldTableColumns = (props: TableColumnsProps) => {
  if (props.itemRenderingFunction) {
    return getFieldTableColumnsFromRenderingFunction(props);
  }
  return getFieldTableColumnsFromHTMLTemplate(props);
};

const getFieldTableColumnsFromRenderingFunction = (
  props: Pick<TableColumnsProps, 'itemRenderingFunction' | 'firstItem'>
): Element[] => {
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
  props: Pick<TableLayoutProps, 'templateContentForFirstItem'>
): Element[] =>
  Array.from(
    props.templateContentForFirstItem.querySelectorAll(tableElementTagName)
  );
