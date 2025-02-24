import {NumberValue} from '@coveo/bueno';
import {
  Product,
  Recommendations,
  RecommendationsState,
  buildRecommendations,
} from '@coveo/headless/commerce';
import {
  Component,
  Element,
  Fragment,
  Listen,
  Method,
  Prop,
  State,
  Watch,
  h,
} from '@stencil/core';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {FocusTargetController} from '../../../utils/stencil-accessibility-utils';
import {randomID} from '../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../common/atomic-result-placeholder/placeholders';
import {Carousel} from '../../common/carousel';
import {createAppLoadedListener} from '../../common/interface/store';
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
  getItemListDisplayClasses,
} from '../../common/layout/display-options';
import {Heading} from '../../common/stencil-heading';
import {Hidden} from '../../common/stencil-hidden';
import {CommerceBindings} from '../atomic-commerce-recommendation-interface/atomic-commerce-recommendation-interface';
import {ProductTemplateProvider} from '../product-list/product-template-provider';
import {SelectChildProductEventArgs} from '../product-template-components/atomic-product-children/atomic-product-children';

/**
 * The `atomic-commerce-recommendation-list` component displays a list of product recommendations by applying one or more product templates.
 * @alpha
 *
 * @part result-list - The element containing the list of product recommendations.
 * @part result-list-grid-clickable-container - The parent of a recommended product and the clickable link encompassing it.
 * @part result-list-grid-clickable - The clickable link encompassing a recommended product.
 * @part label - The label of the recommendation list.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part indicators - The list of indicators.
 * @part indicator - A single indicator.
 * @part active-indicator - The active indicator.
 *
 * @slot default - The default slot where the product templates are defined.
 */
@Component({
  tag: 'atomic-commerce-recommendation-list',
  styleUrl: 'atomic-commerce-recommendation-list.pcss',
  shadow: true,
})
export class AtomicCommerceRecommendationList
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public recommendations!: Recommendations;
  private loadingFlag = randomID('firstRecommendationLoaded-');
  private itemRenderingFunction: ItemRenderingFunction;
  private nextNewProductTarget?: FocusTargetController;
  private productTemplateProvider!: ProductTemplateProvider;
  private itemListCommon!: ItemListCommon;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('recommendations')
  @State()
  public recommendationsState!: RecommendationsState;
  @State() public error!: Error;
  @State() private isAppLoaded = false;
  @State() private productTemplateRegistered = false;
  @State() private templateHasError = false;
  @State() private currentPage = 0;

  /**
   * The identifier used by the Commerce API to retrieve the desired recommendation list for the component.
   * You can configure recommendation lists and get their respective slot IDs through the Coveo Merchandising Hub (CMH).
   * You can include multiple `atomic-commerce-recommendation-list` components with different slot IDs in the same page to display several recommendation lists.
   */
  @Prop({reflect: true})
  public slotId = 'Recommendation';

  /**
   * The unique identifier of the product to use for seeded recommendations.
   */
  @Prop({reflect: true})
  public productId?: string;

  /**
   * The layout to apply when displaying the products. This does not affect the display of the surrounding list itself.
   * To modify the number of products per column, modify the `--atomic-recs-number-of-columns` CSS variable.
   */
  @Prop({reflect: true}) public display: ItemDisplayBasicLayout = 'list';
  /**
   * The spacing of various elements in the product list, including the gap between products, the gap between parts of a product, and the font sizes of the parts of a product.
   */
  @Prop({reflect: true}) public density: ItemDisplayDensity = 'normal';
  /**
   * The expected size of the image displayed on the recommended products.
   */
  @Prop({reflect: true})
  public imageSize: ItemDisplayImageSize = 'small';

  /**
   * The number of products to display per page.
   * The products will be displayed in a carousel if this property is set.
   * This does not affect the display of the list itself, only the number of recommendation pages.
   * If you want to display the recommendations in a carousel with a single row, set the `--atomic-recs-number-fof-columns` CSS variable to the same value as this property.
   */
  @Prop({reflect: true}) public productsPerPage?: number;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading label, from 1 to 6.
   */
  @Prop({reflect: true}) public headingLevel = 0;

  @Watch('productsPerPage')
  public async watchNumberOfRecommendationsPerPage() {
    this.currentPage = 0;
  }

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism when rendering products.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular, or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML implementation.
   *
   * @param productRenderingFunction
   */
  @Method() public async setRenderFunction(
    productRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = productRenderingFunction;
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
    this.validateProductsPerPage();
    this.validateSlotID();

    this.recommendations = buildRecommendations(this.bindings.engine, {
      options: {
        slotId: this.slotId,
        productId: this.productId,
      },
    });

    this.recommendations.refresh();

    this.productTemplateProvider = new ProductTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-product-template')
      ),
      getResultTemplateRegistered: () => this.productTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.productTemplateRegistered = value;
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
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  @Listen('atomic/selectChildProduct')
  public onSelectChildProduct(event: CustomEvent<SelectChildProductEventArgs>) {
    event.stopPropagation();

    this.recommendations.promoteChildToParent(event.detail.child);
  }

  public get focusTarget() {
    if (!this.nextNewProductTarget) {
      this.nextNewProductTarget = new FocusTargetController(this);
    }
    return this.nextNewProductTarget;
  }

  private get augmentedRecommendationListState() {
    return {
      ...this.recommendationsState,
      firstRequestExecuted: this.recommendationsState.responseId !== '',
      hasError: this.recommendationsState.error !== null,
      hasItems: this.recommendationsState.products.length > 0,
      products: this.subsetRecommendations,
    };
  }

  private validateProductsPerPage() {
    const msg = new NumberValue({
      min: 1,
    }).validate(this.productsPerPage!);

    if (msg) {
      this.error = new Error(`The "productsPerPage" is invalid: ${msg}`);
    }
  }

  private validateSlotID() {
    const recListWithRecommendation = document.querySelectorAll(
      `atomic-commerce-recommendation-list[slot-id="${this.slotId}"]`
    );

    if (recListWithRecommendation.length > 1) {
      this.bindings.engine.logger.warn(
        `There are multiple atomic-commerce-recommendation-list in this page with the same slot-id property "${this.slotId}". Make sure to set a different recommendation property for each.`
      );
    }
  }

  private renderHeading() {
    if (!this.augmentedRecommendationListState.headline) {
      return;
    }
    if (this.augmentedRecommendationListState.hasError) {
      return;
    }

    return (
      <Heading level={this.headingLevel} part="label" class="m-0 mb-2">
        {this.bindings.i18n.t(this.recommendationsState.headline)}
      </Heading>
    );
  }

  private get currentIndex() {
    return Math.abs(
      (this.currentPage * this.productsPerPage!) %
        this.recommendationsState.products.length
    );
  }

  private get subsetRecommendations() {
    if (!this.productsPerPage) {
      return this.recommendationsState.products;
    }

    return this.recommendationsState.products.slice(
      this.currentIndex,
      this.currentIndex + this.productsPerPage
    );
  }

  private get numberOfPages() {
    return Math.ceil(
      this.recommendationsState.products.length / this.productsPerPage!
    );
  }

  private get hasPagination() {
    return this.numberOfPages > 1;
  }

  private get shouldRenderPagination() {
    return this.hasPagination && this.augmentedRecommendationListState.hasItems;
  }

  private get hasNoProducts() {
    return (
      !this.recommendationsState.isLoading &&
      this.augmentedRecommendationListState.products.length === 0
    );
  }

  private logWarningIfNeeded(message?: string) {
    if (message) {
      this.bindings.engine.logger.warn(message);
    }
  }

  private getAtomicProductProps(product: Product) {
    const linkContent =
      this.productTemplateProvider.getLinkTemplateContent(product);

    return {
      interactiveProduct: this.recommendations.interactiveProduct({
        options: {product},
      }),
      product: product,
      renderingFunction: this.itemRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.itemListCommon.getResultId(
        product.permanentid,
        this.recommendationsState.responseId,
        this.density,
        this.imageSize
      ),
      content: this.productTemplateProvider.getTemplateContent(product),
      linkContent,
      stopPropagation: !!linkContent,
      store: this.bindings.store,
      density: this.density,
      display: this.display,
      imageSize: this.imageSize,
    };
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !this.isAppLoaded;

    return getItemListDisplayClasses(
      'grid',
      this.density,
      this.imageSize,
      this.recommendationsState.isLoading,
      displayPlaceholders
    );
  }

  private renderAsGrid(product: Product, i: number) {
    const propsForAtomicProduct = this.getAtomicProductProps(product);
    const {interactiveProduct} = propsForAtomicProduct;
    return (
      <DisplayGrid
        selectorForItem="atomic-product"
        item={{
          ...product,
          clickUri: product.clickUri,
          title: product.ec_name ?? '',
        }}
        select={() => {
          this.logWarningIfNeeded(interactiveProduct.warningMessage);
          interactiveProduct.select();
        }}
        beginDelayedSelect={() => {
          this.logWarningIfNeeded(interactiveProduct.warningMessage);
          interactiveProduct.beginDelayedSelect();
        }}
        cancelPendingSelect={() => {
          this.logWarningIfNeeded(interactiveProduct.warningMessage);
          interactiveProduct.cancelPendingSelect();
        }}
        setRef={(element) =>
          element && this.itemListCommon.setNewResultRef(element, i)
        }
      >
        <atomic-product {...propsForAtomicProduct}></atomic-product>
      </DisplayGrid>
    );
  }

  private renderRecommendationList() {
    this.itemListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    if (
      !this.productTemplateRegistered ||
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
          displayPlaceholders={!this.isAppLoaded}
          numberOfPlaceholders={
            this.productsPerPage ?? this.recommendationsState.products.length
          }
        ></ResultsPlaceholdersGuard>
        <ItemDisplayGuard {...this.augmentedRecommendationListState}>
          {this.subsetRecommendations.map((recommendation, i) => {
            return this.renderAsGrid(recommendation, i);
          })}
        </ItemDisplayGuard>
      </DisplayWrapper>
    );
  }

  public render() {
    if (this.hasNoProducts) {
      this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      return <Hidden></Hidden>;
    }
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
            <div class="px-3">{this.renderRecommendationList()}</div>
          </Carousel>
        ) : (
          this.renderRecommendationList()
        )}
      </Fragment>
    );
  }
}
