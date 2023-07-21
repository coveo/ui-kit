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
  ResultDisplayLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../common/layout/display-options';
import {LinkWithResultAnalytics} from '../../common/result-link/result-link';
import {ProductRecommendationRenderingFunction} from '../../common/result-list/result-list-common-interface';
import {ProductListingBindings} from '../atomic-product-listing-interface/atomic-product-listing-interface';
import {ProductRecommendationTemplateProvider} from './product-recommendation-template-provider';

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

export interface ProductListingGridProps {
  bindings: ProductListingBindings;
  host: HTMLElement;
  listClasses: string;
  productListingState: ProductListingState;
  getLayoutDisplay(): ResultDisplayLayout;
  getResultDisplay(): ResultDisplayLayout;
  getDensity(): ResultDisplayDensity;
  getImageSize(): ResultDisplayImageSize;
  renderResult(props: ProductRecommendationRendererProps): VNode;
  productRecommendationTemplateProvider: ProductRecommendationTemplateProvider;
  loadingFlag: string;
  getInteractiveResult(product: ProductRecommendation): InteractiveResult;
  getResultRenderingFunction(): ProductRecommendationRenderingFunction;
}

export const ProductListingGrid: FunctionalComponent<
  ProductListingGridProps
> = (props) =>
  props.productListingState.products.map((product) => {
    // const unfoldedResult = extractUnfoldedResult(product);
    const interactiveResult = props.getInteractiveResult(product);
    return (
      <div
        part="result-list-grid-clickable-container outline"
        // ref={(element) => props.setNewResultRef(element!, index)}
      >
        <LinkWithResultAnalytics
          part="result-list-grid-clickable"
          onSelect={() => interactiveResult.select()}
          onBeginDelayedSelect={() => interactiveResult.beginDelayedSelect()}
          onCancelPendingSelect={() => interactiveResult.cancelPendingSelect()}
          href={product.clickUri}
          title={product.ec_name}
          tabIndex={-1}
          ariaHidden={true}
        />
        {props.renderResult({
          key: product.permanentid,
          result: product,
          interactiveResult: props.getInteractiveResult(product),
          store: props.bindings.store,
          content:
            props.productRecommendationTemplateProvider.getTemplateContent(
              product
            ),
          loadingFlag: props.loadingFlag,
          display: props.getResultDisplay(),
          density: props.getDensity(),
          imageSize: props.getImageSize(),
          renderingFunction: props.getResultRenderingFunction(),
        })}
      </div>
    );
  });
