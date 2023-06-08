import {
  buildProductListing,
  ProductListing,
  ProductListingState,
  loadConfigurationActions,
  ResultsPerPage,
  buildResultsPerPage,
  ResultsPerPageState,
} from '@coveo/headless/product-listing';
import {Component, State, Element, Prop, Method, h} from '@stencil/core';
import {buildProductListingInteractiveResult, ProductListingResult} from '..';
import {
  FocusTarget,
  FocusTargetController,
} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  ResultDisplayBasicLayout,
} from '../../common/layout/display-options';
import {ResultListCommon} from '../../common/result-list/result-list-common';
import {
  ResultListCommonState,
  ResultRenderingFunction,
} from '../../common/result-list/result-list-common-interface';
import {ResultTemplateProvider} from '../../common/result-list/result-template-provider';
import {ProductListingBindings} from '../atomic-product-listing-interface/atomic-product-listing-interface';

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
  private resultListCommon!: ResultListCommon;
  private loadingFlag = randomID('firstProductListingLoaded-');
  private resultRenderingFunction: ResultRenderingFunction;

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

  @FocusTarget()
  private nextNewResultTarget!: FocusTargetController;
  /**
   * The layout to apply when displaying results themselves. This does not affect the display of the surrounding list itself.
   */
  @Prop({reflect: true}) public display: ResultDisplayBasicLayout = 'list';
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
  @Prop({reflect: true}) public label?: string;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ResultRenderingFunction
  ) {
    this.resultRenderingFunction = resultRenderingFunction;
  }

  public initialize() {
    this.updateOriginLevel2();
    this.resultsPerPage = buildResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.numberOfProducts},
    });
    this.productListing = buildProductListing(this.bindings.engine, {
      options: {
        url: this.bindings.engine.state.productListing.url,
        additionalFields: this.bindings.store.getFieldsToInclude(),
      },
    });
    const resultTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-product-listing-result-template')
      ),
      getResultTemplateRegistered: () => this.resultTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.resultTemplateRegistered = value;
      },
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
      bindings: this.bindings,
    });

    this.resultListCommon = new ResultListCommon({
      resultTemplateProvider,
      getNumberOfPlaceholders: () => this.numberOfProducts,
      host: this.host,
      bindings: this.bindings,
      getDensity: () => this.density,
      getLayoutDisplay: () => 'grid',
      getResultDisplay: () => this.display,
      getImageSize: () => this.imageSize,
      nextNewResultTarget: this.nextNewResultTarget,
      loadingFlag: this.loadingFlag,
      getResultListState: () => this.resultListCommonState,
      getResultRenderingFunction: () => this.resultRenderingFunction,
      renderResult: (props) => (
        <atomic-product-listing-result
          {...props}
        ></atomic-product-listing-result>
      ),
      getInteractiveResult: (result: ProductListingResult) =>
        buildProductListingInteractiveResult(this.bindings.engine, {
          options: {result},
        }),
    });
  }

  private get resultListCommonState(): ResultListCommonState<ProductListingResult> {
    return {
      firstSearchExecuted: this.productListingState.responseId !== '',
      isLoading: this.productListingState.isLoading,
      hasError: this.productListingState.error !== null,
      hasResults: this.productListingState.products.length !== 0,
      results: this.productRecommendationsAsResuls,
      searchResponseId: this.productListingState.responseId,
    };
  }

  private updateOriginLevel2() {
    if (this.label) {
      const action = loadConfigurationActions(
        this.bindings.engine
      ).setOriginLevel2({
        originLevel2: this.label,
      });

      this.bindings.engine.dispatch(action);
    }
  }

  private get productRecommendationsAsResuls(): ProductListingResult[] {
    const resultList: ProductListingResult[] = [];
    this.productListingState.products.forEach((product) => {
      resultList.push({
        title: product.ec_name || '',
        uri: product.documentUri,

        printableUri: '',

        clickUri: product.clickUri,

        uniqueId: product.permanentid,

        excerpt: '',

        firstSentences: '',

        summary: null,

        flags: '',

        hasHtmlVersion: false,

        score: 0,

        percentScore: 0,

        rankingInfo: null,

        isTopResult: false,

        isRecommendation: false,

        titleHighlights: [],

        firstSentencesHighlights: [],

        excerptHighlights: [],

        printableUriHighlights: [],

        summaryHighlights: [],

        absentTerms: [],

        raw: {
          urihash: '',
          ec_images: product.ec_images,
          ec_brand: product.ec_brand,
          ec_category: product.ec_category,
          ec_description: product.ec_item_group_id,
          ec_price: product.ec_price,
          ec_promo_price: product.ec_promo_price,
          ec_rating: product.ec_rating,
          childResults: product.childResults,
          totalNumberOfChildResults: product.totalNumberOfChildResults,
        },
      });
    });
    return resultList;
  }
  public render() {
    return this.resultListCommon.render();
  }
}
