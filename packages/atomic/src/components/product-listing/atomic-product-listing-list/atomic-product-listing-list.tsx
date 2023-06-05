import {NumberValue} from '@coveo/bueno';
import {Result} from '@coveo/headless';
import {
  buildProductListing,
  ProductListing,
  ProductListingState,
  loadConfigurationActions,
} from '@coveo/headless/product-listing';
import {Component, State, Element, Prop, Method, h} from '@stencil/core';
import {buildProductListingInteractiveResult} from '..';
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
 * The `atomic-product-listing-list` component displays recommendations by applying one or more result templates.
 *
 * @part result-list - The element containing the list of results.
 * @part result-list-grid-clickable-container - The parent of the result & the clickable link encompassing it.
 * @part result-list-grid-clickable - The clickable link encompassing the result.
 * @part label - The label of the result list.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part indicators - The list of indicators.
 * @part indicator - A single indicator.
 * @part active-indicator - The active indicator.
 */
@Component({
  tag: 'atomic-product-listing-list',
  styleUrl: 'atomic-product-listing-list.pcss',
  shadow: true,
})
export class AtomicProductListingList
  implements InitializableComponent<ProductListingBindings>
{
  @InitializeBindings() public bindings!: ProductListingBindings;
  public productListing!: ProductListing;
  private resultListCommon!: ResultListCommon;
  private loadingFlag = randomID('firstProductListingLoaded-');
  private resultRenderingFunction: ResultRenderingFunction;

  @Element() public host!: HTMLDivElement;

  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  // @State() private currentPage = 0;
  @BindStateToController('productListing')
  @State()
  public productListingState!: ProductListingState;

  @FocusTarget()
  private nextNewResultTarget!: FocusTargetController;

  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * Make sure to set a different value for each atomic-recs-list in your page.
   */
  @Prop({reflect: true}) public product = 'ProductListing';

  /**
   * The layout to apply when displaying results themselves. This does not affect the display of the surrounding list itself.
   * To modify the number of recommendations per column, modify the --atomic-recs-number-of-columns CSS variable.
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
   * The total number of recommendations to display.
   * This does not modify the number of recommendations per column. To do so, modify the --atomic-recs-number-of-columns CSS variable.
   */
  @Prop({reflect: true}) public numberOfRecommendations = 10;

  /**
   * The number of recommendations to display, per page.
   * Setting a value greater than and lower than the numberOfRecommendations value activates the carousel.
   * This does not affect the display of the list itself, only the number of recommendation pages.
   */
  @Prop({reflect: true}) public numberOfRecommendationsPerPage?: number;

  /**
   * The non-localized label for the list of recommendations.
   */
  @Prop({reflect: true}) public label?: string;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading label, from 1 to 6.
   */
  @Prop({reflect: true}) public headingLevel = 0;

  // @Watch('numberOfProductssPerPage')
  // public async watchNumberOfRecommendationsPerPage() {
  //   this.currentPage = 0;
  // }

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

  /**
   * Moves to the previous page.
   */
  // @Method() public async previousPage() {
  //   this.currentPage =
  //     this.currentPage - 1 < 0 ? this.numberOfPages - 1 : this.currentPage - 1;
  // }

  /**
   * Moves to the next page.
   */
  // @Method() public async nextPage() {
  //   this.currentPage = (this.currentPage + 1) % this.numberOfPages;
  // }

  public initialize() {
    this.validateNumberOfRecommendationsPerPage();
    this.validateRecommendationIdentifier();
    this.updateOriginLevel2();
    this.productListing = buildProductListing(this.bindings.engine, {
      options: {
        url: 'https://fashion.coveodemo.com/browse/women/hats',
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
      getNumberOfPlaceholders: () =>
        this.numberOfRecommendationsPerPage ?? this.numberOfRecommendations,
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
      getInteractiveResult: (result: Result) =>
        buildProductListingInteractiveResult(this.bindings.engine, {
          options: {result},
        }),
    });
  }

  private get resultListCommonState(): ResultListCommonState<Result> {
    return {
      firstSearchExecuted: this.productListingState.responseId !== '',
      isLoading: this.productListingState.isLoading,
      hasError: this.productListingState.error !== null,
      hasResults: this.productListingState.products.length !== 0,
      results: this.productRecommendationsAsResuls,
      searchResponseId: this.productListingState.responseId,
    };
  }

  private validateNumberOfRecommendationsPerPage() {
    const msg = new NumberValue({
      min: 1,
      max: this.numberOfRecommendations - 1,
    }).validate(this.numberOfRecommendationsPerPage!);

    if (msg) {
      this.error = new Error(
        `The "numberOfRecommendationsPerPage" is invalid: ${msg}`
      );
    }
  }

  private validateRecommendationIdentifier() {
    const recListWithRecommendation = document.querySelectorAll(
      `atomic-recs-list[recommendation="${this.productListing}"]`
    );

    if (recListWithRecommendation.length > 1) {
      this.bindings.engine.logger.warn(
        `There are multiple atomic-recs-list in this page with the same recommendation property "${this.productListing}". Make sure to set a different recommendation property for each.`
      );
    }
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

  // private get subsetRecommendations() {
  //   if (!this.numberOfRecommendationsPerPage) {
  //     return this.productListingState.products;
  //   }

  //   return this.productListingState.products.slice(
  //     this.currentIndex,
  //     this.currentIndex + this.numberOfRecommendationsPerPage
  //   );
  // }

  private get productRecommendationsAsResuls(): Result[] {
    const resultList: Result[] = [];
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
        },
      });
    });
    return resultList;
  }
  public render() {
    return this.resultListCommon.render();
  }
}
