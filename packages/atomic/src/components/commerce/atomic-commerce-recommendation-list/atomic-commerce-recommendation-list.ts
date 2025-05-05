import {SelectChildProductEventArgs} from '@/src/components';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import {NumberValue} from '@coveo/bueno';
import {
  Product,
  Recommendations,
  RecommendationsState,
  RecommendationsSummaryState,
  Summary,
  buildRecommendations,
} from '@coveo/headless/commerce';
import {ContextRoot} from '@lit/context';
import {CSSResultGroup, html, LitElement, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {InitializeBindingsMixin} from '../../../mixins/bindings-mixin';
import {renderResultPlaceholders} from '../../common/atomic-result-placeholder/placeholders-lit';
import {carousel} from '../../common/carousel';
import {heading} from '../../common/heading';
import {createAppLoadedListener} from '../../common/interface/store';
import {
  renderListWrapper,
  renderListRoot,
} from '../../common/item-list/display-wrapper-lit';
import {renderGridLayout} from '../../common/item-list/grid-layout';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../common/item-list/item-list-common-lit';
import {
  ItemDisplayBasicLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
  getItemListDisplayClasses,
} from '../../common/layout/display-options';
// TODO: change to atomic-commerce-recommendation-interface when merged
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {ProductTemplateProvider} from '../product-list/product-template-provider';
import styles from './atomic-commerce-recommendation-list.tw.css';

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
@customElement('atomic-commerce-recommendation-list')
@bindings()
@withTailwindStyles
export class AtomicCommerceRecommendationList
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  public recommendations!: Recommendations;
  public summary!: Summary<RecommendationsSummaryState>;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstRecommendationLoaded-');
  private nextNewProductTarget?: FocusTargetController;
  private productListCommon!: ItemListCommon;
  private productTemplateProvider!: ProductTemplateProvider;
  private unsubscribeSummary!: () => void;

  @state()
  bindings!: CommerceBindings;
  @state()
  error!: Error;
  @state()
  private isAppLoaded = false;
  @state()
  private productTemplateRegistered = false;
  @state()
  private templateHasError = false;

  @bindStateToController('recommendations')
  @state()
  public recommendationsState!: RecommendationsState;
  @state()
  public summaryState!: RecommendationsSummaryState;

  @state() private currentPage = 0;

  /**
   * The identifier used by the Commerce API to retrieve the desired recommendation list for the component.
   * You can configure recommendation lists and get their respective slot IDs through the Coveo Merchandising Hub (CMH).
   * You can include multiple `atomic-commerce-recommendation-list` components with different slot IDs in the same page to display several recommendation lists.
   */
  @property({reflect: true, attribute: 'slot-id', type: String})
  public slotId = 'Recommendation';

  /**
   * The unique identifier of the product to use for seeded recommendations.
   */
  @property({reflect: true, attribute: 'product-id', type: String})
  public productId?: string;

  /**
   * The layout to apply when displaying the products. This does not affect the display of the surrounding list itself.
   * To modify the number of products per column, modify the `--atomic-recs-number-of-columns` CSS variable.
   */
  @property({reflect: true, type: String})
  public display: ItemDisplayBasicLayout = 'list';
  /**
   * The spacing of various elements in the product list, including the gap between products, the gap between parts of a product, and the font sizes of the parts of a product.
   */
  @property({reflect: true, type: String}) public density: ItemDisplayDensity =
    'normal';
  /**
   * The expected size of the image displayed on the recommended products.
   */
  @property({reflect: true, attribute: 'image-size', type: String})
  public imageSize: ItemDisplayImageSize = 'small';

  /**
   * The number of products to display per page.
   * The products will be displayed in a carousel if this property is set.
   * This does not affect the display of the list itself, only the number of recommendation pages.
   * If you want to display the recommendations in a carousel with a single row, set the `--atomic-recs-number-fof-columns` CSS variable to the same value as this property.
   */
  @property({reflect: true, attribute: 'products-per-page', type: Number})
  public productsPerPage?: number;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading label, from 1 to 6.
   */
  @property({reflect: true, attribute: 'heading-level', type: Number})
  public headingLevel = 0;

  @watch('productsPerPage')
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

  public async setRenderFunction(
    productRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = productRenderingFunction;
  }

  /**
   * Moves to the previous page, when the carousel is activated.
   */
  public async previousPage() {
    this.currentPage =
      this.currentPage - 1 < 0 ? this.numberOfPages - 1 : this.currentPage - 1;
  }

  /**
   * Moves to the next page, when the carousel is activated.
   */
  public async nextPage() {
    this.currentPage = (this.currentPage + 1) % this.numberOfPages;
  }

  public initialize() {
    this.validateProductsPerPage();
    this.validateSlotID();
    this.initRecommendations();
    this.initSummary();
    this.initProductTemplateProvider();
    this.initProductListCommon();
    this.createSelectChildProductListener();
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeSummary && this.unsubscribeSummary();
    this.removeEventListener(
      'atomic/selectChildProduct',
      this.selectChildProductCallback
    );
  }

  constructor() {
    super();
    const contextRoot = new ContextRoot();
    contextRoot.attach(document.body);
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

    return html`${heading({
      props: {
        level: this.headingLevel,
        part: 'label',
        class: 'm-0 mb-2',
      },
    })(html`${this.bindings.i18n.t(this.recommendationsState.headline)}`)}`;
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

  private get shouldRenderWithCarousel() {
    return this.hasPagination && this.augmentedRecommendationListState.hasItems;
  }

  private get hasNoProducts() {
    return (
      !this.recommendationsState.isLoading &&
      this.augmentedRecommendationListState.products.length === 0
    );
  }

  private initRecommendations() {
    this.recommendations = buildRecommendations(this.bindings.engine, {
      options: {
        slotId: this.slotId,
        productId: this.productId,
      },
    });
    this.recommendations.refresh();
  }

  // TODO: Remove once atomic-commerce-recommendation-interface is merged
  private initSummary() {
    this.summary = this.recommendations.summary();
    this.unsubscribeSummary = this.summary.subscribe(() => {
      this.summaryState = this.summary.state;
      if (this.summaryState.firstRequestExecuted) {
        this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      }
    });
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
      key: this.productListCommon.getResultId(
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

  private initProductTemplateProvider() {
    this.productTemplateProvider = new ProductTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.querySelectorAll('atomic-product-template')
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
  }

  private initProductListCommon() {
    this.productListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.recommendationsState.products.length,
      getIsLoading: () => this.recommendationsState.isLoading,
      host: this,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  private createSelectChildProductListener() {
    this.addEventListener(
      'atomic/selectChildProduct',
      this.selectChildProductCallback
    );
  }

  private selectChildProductCallback(event: Event) {
    event.stopPropagation();
    const child = (event as CustomEvent<SelectChildProductEventArgs>).detail
      .child;
    this.recommendations.promoteChildToParent(child);
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

  @bindingGuard()
  @errorGuard()
  render() {
    return html` ${when(
      this.shouldRender,
      () =>
        html`${when(
          this.templateHasError,
          () => html`<slot></slot>`,
          () =>
            html`${this.renderHeading()}
            ${this.shouldRenderWithCarousel
              ? carousel({
                  props: {
                    bindings: this.bindings,
                    previousPage: () => this.previousPage(),
                    nextPage: () => this.nextPage(),
                    numberOfPages: this.numberOfPages,
                    currentPage: this.currentPage,
                  },
                })(
                  html`<div class="px-3">
                    ${this.renderRecommendationList()}
                  </div>`
                )
              : this.renderRecommendationList()}`
        )}`,
      () => nothing
    )}`;
  }

  private renderAsGrid() {
    return html`${map(this.subsetRecommendations, (product, index) => {
      const props = this.getAtomicProductProps(product);
      return renderGridLayout({
        props: {
          selectorForItem: 'atomic-product',
          item: {
            ...product,
            clickUri: product.clickUri,
            title: product.ec_name ?? '',
          },
          ...props.interactiveProduct,
          setRef: (element) => {
            element &&
              this.productListCommon.setNewResultRef(
                element as HTMLElement,
                index
              );
          },
        },
      })(
        html`${keyed(
          props.key,
          html`<atomic-product
            .content=${props.content}
            .density=${props.density}
            .display=${props.display}
            .imageSize=${props.imageSize}
            .linkContent=${props.linkContent}
            .loadingFlag=${props.loadingFlag}
            .interactiveProduct=${props.interactiveProduct}
            .product=${props.product}
            .renderingFunction=${props.renderingFunction}
            .store=${props.store as never}
          ></atomic-product>`
        )}`
      );
    })}`;
  }

  private renderRecommendationList() {
    this.productListCommon.updateBreakpoints();
    const listClasses = this.computeListDisplayClasses();

    if (
      !this.productTemplateRegistered ||
      this.productTemplateProvider.hasError ||
      this.error
    ) {
      return;
    }
    return renderListWrapper({
      props: {listClasses},
    })(
      renderListRoot({
        props: {listClasses},
      })(html`
        ${when(
          this.isAppLoaded,
          () => html`${this.renderAsGrid()}`,
          () =>
            renderResultPlaceholders({
              props: {
                density: this.density,
                display: this.display,
                imageSize: this.imageSize,
                numberOfPlaceholders:
                  this.productsPerPage ??
                  this.recommendationsState.products.length,
              },
            })
        )}
      `)
    );
  }

  private get shouldRender() {
    if (this.hasNoProducts) {
      this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      return false;
    }
    return true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-recommendation-list': AtomicCommerceRecommendationList;
  }
}
