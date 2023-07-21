import {
  buildProductListing,
  ProductListing,
  ProductListingState,
  ResultsPerPage,
  buildResultsPerPage,
  ResultsPerPageState,
  ProductRecommendation,
  buildInteractiveResult,
} from '@coveo/headless/product-listing';
import {
  Component,
  State,
  Element,
  Prop,
  Method,
  h,
  Fragment,
  FunctionalComponent,
} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayBasicLayout,
  getResultDisplayClasses,
  ResultDisplayLayout,
} from '../../common/layout/display-options';
import {ProductRecommendationRenderingFunction} from '../../common/result-list/result-list-common-interface';
import {ProductListingBindings} from '../atomic-product-listing-interface/atomic-product-listing-interface';
import {
  ProductListingGrid,
  ProductListingGridProps,
  ProductRecommendationRendererProps,
} from './product-listing-grid';
import {ProductRecommendationTemplateProvider} from './product-recommendation-template-provider';

/**
 * The `atomic-product-listing` component displays products by applying one or more result templates.
 *
 * @internal
 */
@Component({
  tag: 'atomic-product-listing',
  styleUrl: 'atomic-product-listing.pcss',
  shadow: true,
})
export class AtomicProductListing
  implements InitializableComponent<ProductListingBindings>
{
  @InitializeBindings() public bindings!: ProductListingBindings;
  public productListing!: ProductListing;
  public resultsPerPage!: ResultsPerPage;
  private productRecommendationTemplateProvider!: ProductRecommendationTemplateProvider;

  // private loadingFlag = randomID('firstProductListingLoaded-');
  private resultRenderingFunction: ProductRecommendationRenderingFunction;
  @Element() public host!: HTMLDivElement;

  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  @BindStateToController('resultsPerPage')
  @State()
  public resultsPerPageState!: ResultsPerPageState;
  @BindStateToController('productListing')
  @State()
  public productListingState!: ProductListingState;

  // @FocusTarget()
  // private nextNewResultTarget!: FocusTargetController;
  /**
   * The layout to apply when displaying results themselves. This does not affect the display of the surrounding list itself.
   */
  @Prop({reflect: true}) public display: ResultDisplayBasicLayout = 'grid';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) public density: ResultDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true})
  public imageSize: ResultDisplayImageSize = 'small';

  /**
   * The total number of products to display.
   */
  @Prop({reflect: true}) public numberOfProducts = 30;
  /**
   * The non-localized label for the list of products.
   */

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ProductRecommendationRenderingFunction
  ) {
    this.resultRenderingFunction = resultRenderingFunction;
  }

  public initialize() {
    // this.updateOriginLevel2();
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.numberOfProducts},
    });
    this.productListing = buildProductListing(this.bindings.engine, {
      options: {
        url: this.bindings.engine.state.productListing.url,
        additionalFields: this.bindings.store.getFieldsToInclude(),
      },
    });

    this.productRecommendationTemplateProvider =
      new ProductRecommendationTemplateProvider({
        includeDefaultTemplate: true,
        templateElements: Array.from(
          this.host.querySelectorAll('atomic-product-listing-result-template')
        ),
        getProductRecommendationTemplateRegistered: () =>
          this.resultTemplateRegistered,
        getTemplateHasError: () => this.templateHasError,
        setProductRecommendationTemplateRegistered: (value: boolean) => {
          this.resultTemplateRegistered = value;
        },
        setTemplateHasError: (value: boolean) => {
          this.templateHasError = value;
        },
        bindings: this.bindings,
      });
  }

  // private updateOriginLevel2() {
  //   if (this.label) {
  //     const action = loadConfigurationActions(
  //       this.bindings.engine
  //     ).setOriginLevel2({
  //       originLevel2: this.label,
  //     });

  //     this.bindings.engine.dispatch(action);
  //   }
  // }

  public get listClasses() {
    const classes = getResultDisplayClasses(
      this.display,
      this.density,
      this.imageSize
    );

    if (
      this.productListingState.responseId &&
      this.productListingState.isLoading
    ) {
      classes.push('loading');
    }

    // if (this.displayPlaceholders) {
    //   classes.push('placeholder');
    // }

    return classes.join(' ');
  }

  public render() {
    // this.updateBreakpoints?.(this.host);

    if (!this.productRecommendationTemplateProvider.templatesRegistered) {
      return;
    }

    if (this.productListingState.error) {
      return;
    }

    if (
      this.productListingState.responseId &&
      !this.productListingState.products.length
    ) {
      return;
    }

    return (
      <Fragment>
        {/* {this.resultTemplateProvider.hasError && <slot></slot>} */}
        <div class={`list-wrapper ${this.listClasses}`}>
          <ResultDisplayWrapper
            listClasses={this.listClasses}
            display={this.display}
          >
            {/* {this.displayPlaceholders && (
              <DisplayResultsPlaceholder
                numberOfPlaceholders={this.getNumberOfPlaceholders()}
                density={this.density}
                display={this.display}
                imageSize={this.imageSize}
              />
            )} */}
            {this.productListingState.responseId && (
              <ResultListDisplay
                productRecommendationTemplateProvider={
                  this.productRecommendationTemplateProvider
                }
                listClasses={this.listClasses}
                bindings={this.bindings}
                host={this.host}
                productListingState={this.productListingState}
                getDensity={() => this.density}
                getImageSize={() => this.imageSize}
                getLayoutDisplay={() => this.display}
                getResultDisplay={() => this.display}
                renderResult={(props: ProductRecommendationRendererProps) => {
                  return (
                    <atomic-product-listing-result
                      {...props}
                    ></atomic-product-listing-result>
                  );
                }}
                loadingFlag={''}
                getInteractiveResult={(product: ProductRecommendation) => {
                  return buildInteractiveResult(this.bindings.engine, {
                    options: {result: product},
                  });
                }}
                getResultRenderingFunction={() => this.resultRenderingFunction}
              />
            )}
          </ResultDisplayWrapper>
        </div>
      </Fragment>
    );
  }
}

const ResultDisplayWrapper: FunctionalComponent<{
  display?: ResultDisplayLayout;
  listClasses: string;
}> = (props, children) => {
  if (props.display === 'table') {
    return children;
  }

  return (
    <div class={`list-root ${props.listClasses}`} part="result-list">
      {children}
    </div>
  );
};

const ResultListDisplay: FunctionalComponent<ProductListingGridProps> = (
  props
) => {
  if (!props.productListingState.products.length) {
    return null;
  }
  console.log(props);
  return <ProductListingGrid {...props} />;
};
