import {
  InteractiveResult,
  ProductListingState,
  ProductRecommendation,
} from '@coveo/headless/product-listing';
import {FunctionalComponent, VNode, h} from '@stencil/core';
import {
  AtomicCommonStore,
  AtomicCommonStoreData,
} from '../../common/interface/store';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayLayout,
} from '../../common/layout/display-options';
import {ProductRecommendationRenderingFunction} from '../../common/result-list/result-list-common-interface';
import {tableElementTagName} from '../../search/atomic-table-result/table-element-utils';
import {ProductListingBindings} from '../atomic-product-listing-interface/atomic-product-listing-interface';

export interface ProductRecommendationRendererProps {
  key?: string;
  part?: string;
  result: ProductRecommendation;
  interactiveResult: InteractiveResult;
  content?: ParentNode;
  loadingFlag?: string;
  store: AtomicCommonStore<AtomicCommonStoreData>;
  display?: ResultDisplayLayout;
  density?: ResultDisplayDensity;
  imageSize?: ResultDisplayImageSize;
  ref?: (elm?: HTMLElement | undefined) => void;
  renderingFunction?: ProductRecommendationRenderingFunction;
}

export interface ProductListingTableProps {
  bindings: ProductListingBindings;
  host: HTMLElement;
  listClasses: string;
  productListingState: ProductListingState;
  density: ResultDisplayDensity;
  imageSize: ResultDisplayImageSize;
  display: ResultDisplayLayout;
  renderResult(props: ProductRecommendationRendererProps): VNode;
  loadingFlag: string;
  getInteractiveResult(product: ProductRecommendation): InteractiveResult;
  getResultRenderingFunction(): ProductRecommendationRenderingFunction;
}

export const ProductListingTable: FunctionalComponent<
  ProductListingTableProps
> = (props) => {
  const fieldColumns = getFieldTableColumns(props);

  if (!fieldColumns.length) {
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
        {props.productListingState.products.map((product, rowIndex) => (
          <tr
            key={props.productListingState.responseId}
            part={
              'result-table-row ' +
              (rowIndex % 2 === 1
                ? 'result-table-row-even'
                : 'result-table-row-odd') /* Offset by 1 since the index starts at 0 */
            }
            // ref={(element) => props.setNewResultRef(element!, rowIndex)}
          >
            {fieldColumns.map((column) => {
              const key =
                column.getAttribute('label')! +
                props.productListingState.responseId;
              return (
                <td key={key} part="result-table-cell">
                  {props.renderResult({
                    result: product,
                    interactiveResult: props.getInteractiveResult(product),
                    store: props.bindings.store,
                    content: column,
                    loadingFlag: props.loadingFlag,
                    display: props.display,
                    density: props.density,
                    imageSize: props.imageSize,
                  })}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const getFieldTableColumns = (props: ProductListingTableProps) => {
  console.log(props);
  return getFieldTableColumnsFromRenderingFunction(props);
};

const getFieldTableColumnsFromRenderingFunction = (
  props: ProductListingTableProps
): HTMLAtomicTableElementElement[] => {
  const contentOfRenderingFunction = document.createElement('div');
  const resultRenderingFunction = props.getResultRenderingFunction()!;

  const contentOfRenderingFunctionAsString = resultRenderingFunction(
    props.productListingState.products[0],
    document.createElement('div')
  );
  contentOfRenderingFunction.innerHTML = contentOfRenderingFunctionAsString;

  return Array.from(
    contentOfRenderingFunction.querySelectorAll(tableElementTagName)
  );
};
