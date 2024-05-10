import {NumberValue} from '@coveo/bueno';
import {
  Product,
  Recommendations,
  RecommendationsState,
  buildRecommendations,
  loadConfigurationActions,
} from '@coveo/headless/commerce';
import {
  Component,
  Element,
  Fragment,
  Method,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../common/atomic-result-placeholder/placeholders';
import {Carousel} from '../../common/carousel';
import {Heading} from '../../common/heading';
import {DisplayGrid} from '../../common/item-list/display-grid';
import {DisplayWrapper} from '../../common/item-list/display-wrapper';
import {ItemDisplayGuard} from '../../common/item-list/item-display-guard';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../common/item-list/item-list-common';
import {
  ItemDisplayBasicLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemTarget,
  getItemListDisplayClasses,
} from '../../common/layout/display-options';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {ProductTemplateProvider} from '../product-list/product-template-provider';

/**
 * @internal
 * The `atomic-commerce-product-list` component is responsible for displaying products.
 */
@Component({
  tag: 'atomic-commerce-recommendation-carousel',
  styleUrl: 'atomic-commerce-recommendation-carousel.pcss',
  shadow: true,
})
export class AtomicCommerceRecommendationCarousel
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public recommendations!: Recommendations;
  private loadingFlag = randomID('firstRecommendationLoaded-');
  private itemRenderingFunction: ItemRenderingFunction;
  private nextNewResultTarget?: FocusTargetController;
  private productTemplateProvider!: ProductTemplateProvider;
  private itemListCommon!: ItemListCommon;

  @Element() public host!: HTMLDivElement;

  @State() public error!: Error;
  @State() private resultTemplateRegistered = false;
  @State() private templateHasError = false;
  @State() private currentPage = 0;
  @BindStateToController('recommendations')
  @State()
  public recommendationsState!: RecommendationsState;

  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * Make sure to set a different value for each atomic-recs-list in your page.
   */
  @Prop({reflect: true}) public slot = 'Recommendation';

  /**
   * The layout to apply when displaying results themselves. This does not affect the display of the surrounding list itself.
   * To modify the number of recommendations per column, modify the --atomic-recs-number-of-columns CSS variable.
   */
  @Prop({reflect: true}) public display: ItemDisplayBasicLayout = 'list';
  /**
   * The target location to open the result link (see [target](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target)).
   * This property is only leveraged when `display` is `grid`.
   * @defaultValue `_self`
   */
  @Prop() gridCellLinkTarget: ItemTarget = '_self';
  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @Prop({reflect: true}) public density: ItemDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed in the results.
   */
  @Prop({reflect: true})
  public imageSize: ItemDisplayImageSize = 'small';

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

  @Watch('numberOfRecommendationsPerPage')
  public async watchNumberOfRecommendationsPerPage() {
    this.currentPage = 0;
  }

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  @Method() public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  /**
   * Moves to the previous page, when the carousel is activated.
   */
  @Method() public async previousPage() {
    this.currentPage =
      this.currentPage - 1 < 0 ? this.numberOfPages - 1 : this.currentPage - 1;
  }

  /**
   * Moves to the next page, when the carousel is activated.
   */
  @Method() public async nextPage() {
    this.currentPage = (this.currentPage + 1) % this.numberOfPages;
  }

  public initialize() {
    this.validateNumberOfRecommendationsPerPage();
    this.validateRecommendationIdentifier();
    this.updateOriginLevel2();
    this.recommendations = buildRecommendations(this.bindings.engine, {
      options: {
        slotId: this.slot,
      },
    });

    this.productTemplateProvider = new ProductTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-product-template')
      ),
      getResultTemplateRegistered: () => this.resultTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.resultTemplateRegistered = value;
      },
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
    });

    this.itemListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.recommendationsState.products.length,
      getIsLoading: () => this.recommendationsState.isLoading,
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  public get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  private get recommendationListStateWithAugment() {
    return {
      ...this.recommendationsState,
      firstRequestExecuted: this.recommendationsState.responseId !== '',
      hasError: this.recommendationsState.error !== null,
      hasItems: this.recommendationsState.products.length !== 0,
      results: this.subsetRecommendations,
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
      `atomic-recs-list[recommendation="${this.slot}"]`
    );

    if (recListWithRecommendation.length > 1) {
      this.bindings.engine.logger.warn(
        `There are multiple atomic-recs-list in this page with the same recommendation property "${this.slot}". Make sure to set a different recommendation property for each.`
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

  private renderHeading() {
    if (!this.label) {
      return;
    }

    if (this.recommendationListStateWithAugment.hasError) {
      return;
    }

    if (
      this.recommendationListStateWithAugment.firstRequestExecuted &&
      !this.recommendationListStateWithAugment.hasItems
    ) {
      return;
    }

    return (
      <Heading level={this.headingLevel} part="label" class="m-0 mb-2">
        {this.bindings.i18n.t(this.label)}
      </Heading>
    );
  }

  private get currentIndex() {
    return Math.abs(
      (this.currentPage * this.numberOfRecommendationsPerPage!) %
        this.recommendationsState.products.length
    );
  }

  private get subsetRecommendations() {
    if (!this.numberOfRecommendationsPerPage) {
      return this.recommendationsState.products;
    }

    return this.recommendationsState.products.slice(
      this.currentIndex,
      this.currentIndex + this.numberOfRecommendationsPerPage
    );
  }

  private get numberOfPages() {
    return Math.ceil(
      this.recommendationsState.products.length /
        this.numberOfRecommendationsPerPage!
    );
  }

  private get hasPagination() {
    return !!this.numberOfRecommendationsPerPage;
  }

  private get shouldRenderPagination() {
    return (
      this.hasPagination && this.recommendationListStateWithAugment.hasItems
    );
  }

  private getPropsForAtomicRecsResult(recommendation: Product) {
    return {
      interactiveResult: this.recommendations.interactiveProduct({
        options: {
          product: {
            ...recommendation,
            name: recommendation.ec_name ?? '',
            price:
              recommendation.ec_promo_price &&
              recommendation.ec_price &&
              recommendation.ec_promo_price > recommendation.ec_price
                ? recommendation.ec_promo_price
                : recommendation.ec_price ?? 0,
            productId: recommendation.permanentid,
          },
          position: 1, // TODO: add position...
        },
      }),
      result: recommendation,
      renderingFunction: this.itemRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.itemListCommon.getResultId(
        recommendation.permanentid,
        this.recommendationsState.responseId,
        this.density,
        this.imageSize
      ),
      content: this.productTemplateProvider.getTemplateContent(recommendation),
      store: this.bindings.store,
      density: this.density,
      display: this.display,
      imageSize: this.imageSize,
    };
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !this.bindings.store.isAppLoaded();

    return getItemListDisplayClasses(
      'grid',
      this.density,
      this.imageSize,
      this.recommendationsState.isLoading,
      displayPlaceholders
    );
  }

  private renderAsGrid(recommendation: Product, i: number) {
    const propsForAtomicRecsResult =
      this.getPropsForAtomicRecsResult(recommendation);
    return (
      <DisplayGrid
        item={recommendation}
        {...propsForAtomicRecsResult.interactiveResult}
        setRef={(element) =>
          element && this.itemListCommon.setNewResultRef(element, i)
        }
      >
        <atomic-recs-result {...propsForAtomicRecsResult}></atomic-recs-result>
      </DisplayGrid>
    );
  }

  private renderListOfRecommendations() {
    this.itemListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    if (
      !this.resultTemplateRegistered ||
      this.productTemplateProvider.hasError ||
      this.error
    ) {
      return;
    }

    return (
      <DisplayWrapper listClasses={listClasses} display="grid">
        <ResultsPlaceholdersGuard
          density={this.density}
          display={this.display}
          imageSize={this.imageSize}
          displayPlaceholders={!this.bindings.store.isAppLoaded()}
          numberOfPlaceholders={
            this.numberOfRecommendationsPerPage ?? this.numberOfRecommendations
          }
        ></ResultsPlaceholdersGuard>
        <ItemDisplayGuard {...this.recommendationListStateWithAugment}>
          {this.subsetRecommendations.map((recommendation, i) => {
            return this.renderAsGrid(recommendation, i);
          })}
        </ItemDisplayGuard>
      </DisplayWrapper>
    );
  }

  public render() {
    return (
      <Fragment>
        {this.renderHeading()}
        {this.shouldRenderPagination ? (
          <Carousel
            bindings={this.bindings}
            currentPage={this.currentPage}
            nextPage={() => this.nextPage()}
            previousPage={() => this.previousPage()}
            numberOfPages={this.numberOfPages}
          >
            {this.renderListOfRecommendations()}
          </Carousel>
        ) : (
          this.renderListOfRecommendations()
        )}
      </Fragment>
    );
  }
}
