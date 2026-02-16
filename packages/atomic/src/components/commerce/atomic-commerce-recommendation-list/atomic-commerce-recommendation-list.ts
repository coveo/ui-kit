import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildRecommendations,
  type Product,
  type Recommendations,
  type RecommendationsState,
  type RecommendationsSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {ProductTemplateProvider} from '@/src/components/commerce/product-list/product-template-provider';
import {renderItemPlaceholders} from '@/src/components/common/atomic-result-placeholder/item-placeholders';
import {renderCarousel} from '@/src/components/common/carousel';
import {renderHeading} from '@/src/components/common/heading';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderDisplayWrapper} from '@/src/components/common/item-list/display-wrapper';
import {renderGridLayout} from '@/src/components/common/item-list/grid-layout';
import {
  ItemListCommon,
  type ItemRenderingFunction,
} from '@/src/components/common/item-list/item-list-common';
import {
  getItemListDisplayClasses,
  type ItemDisplayBasicLayout,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import placeholderStyles from '../../common/item-list/styles/placeholders.tw.css';
import type {CommerceBindings} from '../atomic-commerce-recommendation-interface/atomic-commerce-recommendation-interface';
import type {SelectChildProductEventArgs} from '../atomic-product-children/select-child-product-event';

/**
 * The `atomic-commerce-recommendation-list` component displays a list of product recommendations by applying one or more product templates.
 *
 * @part result-list - The element containing the list of product recommendations.
 * @part result-list-grid-clickable-container - The parent of a recommended product and the clickable link encompassing it.
 * @part result-list-grid-clickable - The clickable link encompassing a recommended product.
 * @part outline - The outline of a recommended product.
 * @part label - The label of the recommendation list.
 * @part previous-button - The previous button.
 * @part next-button - The next button.
 * @part indicators - The list of indicators.
 * @part indicator - A single indicator.
 * @part active-indicator - The active indicator.
 *
 * @slot default - The default slot where the product templates are defined.
 *
 * @cssprop --atomic-recs-number-of-columns - The number of columns in the grid.
 * @cssprop --atomic-recs-number-of-rows - The number of rows in the grid.
 */
@customElement('atomic-commerce-recommendation-list')
@bindings()
@withTailwindStyles
export class AtomicCommerceRecommendationList
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [
    placeholderStyles,
    css`@reference "../../common/item-list/styles/mixins.pcss";
  
  :host {
    @apply atomic-grid-clickable-elements;
    @apply atomic-grid-display-common;
  
    /**
     * @prop --atomic-recs-number-of-columns: Number of columns for the recommendation list.
     * @prop --atomic-recs-number-of-rows: Number of rows for the recommendation list.
     */
    .list-root {
      @apply atomic-grid-with-cards;
      grid-template-columns: repeat(
          var(--atomic-recs-number-of-columns, 1),
          minmax(0, 1fr)
        );
      grid-template-rows: repeat(
        var(--atomic-recs-number-of-rows, 1),
        minmax(0, 1fr)
      );
    }
  
    [part="label"] {
      @apply font-sans text-2xl font-bold;
    }
  }
  `,
  ];

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
  @state()
  private isEveryProductReady = false;

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
  public slotId?: string;

  /**
   * The unique identifier of the product to use for seeded recommendations.
   */
  @property({reflect: true, attribute: 'product-id', type: String})
  public productId?: string;

  /**
   * The layout to apply when displaying the products. This does not affect the display of the surrounding list itself.
   * To modify the number of products per column and row, modify the `--atomic-recs-number-of-columns` and `--atomic-recs-number-of-rows` CSS variables.
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
   * If you want to display the recommendations in a carousel with a single row, set the `--atomic-recs-number-of-columns` CSS variable to the same value as this property.
   */
  @property({reflect: true, attribute: 'products-per-page', type: Number})
  public productsPerPage?: number;

  /**
   * The [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements) to use for the heading label, from 1 to 6.
   * When set to 0, a `div` will be used instead of an Heading Element.
   */
  @property({reflect: true, attribute: 'heading-level', type: Number})
  public headingLevel = 0;

  @watch('productsPerPage')
  public async watchNumberOfRecommendationsPerPage() {
    this.currentPage = 0;
  }

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism when rendering products.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular, or Vue.
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
    this.validateProps();
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
    this.unsubscribeSummary?.();
    this.removeEventListener(
      'atomic/selectChildProduct',
      this.selectChildProductCallback
    );
  }

  public async updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (
      changedProperties.has('recommendationsState') &&
      this.isEveryProductReady
    ) {
      this.isEveryProductReady = false;
    }
    await this.updateProductsReadyState();
  }

  private async updateProductsReadyState() {
    if (
      this.isAppLoaded &&
      !this.isEveryProductReady &&
      this.summaryState?.firstRequestExecuted &&
      this.recommendationsState?.products?.length > 0
    ) {
      await this.getUpdateComplete();
      this.isEveryProductReady = true;
    }
  }

  private get focusTarget() {
    if (!this.nextNewProductTarget) {
      this.nextNewProductTarget = new FocusTargetController(
        this,
        this.bindings
      );
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

  private validateProps() {
    new Schema({
      density: new StringValue({
        constrainTo: ['normal', 'comfortable', 'compact'],
      }),
      display: new StringValue({constrainTo: ['grid', 'list', 'table']}),
      imageSize: new StringValue({
        constrainTo: ['small', 'large', 'icon', 'none'],
      }),
      productsPerPage: new NumberValue({min: 0}),
      slotId: new StringValue({emptyAllowed: false}),
    }).validate({
      density: this.density,
      display: this.display,
      imageSize: this.imageSize,
      productsPerPage: this.productsPerPage,
      slotId: this.slotId,
    });
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

  private renderListHeading() {
    if (!this.augmentedRecommendationListState.headline) {
      return;
    }
    if (this.augmentedRecommendationListState.hasError) {
      return;
    }

    if (!this.isEveryProductReady && this.isAppLoaded) {
      return html`
        <div
          aria-hidden="true"
          class="bg-neutral my-2 h-8 w-60 animate-pulse rounded"
        ></div>
      `;
    }

    return html`${renderHeading({
      props: {
        level: this.headingLevel,
        part: 'label',
        class: 'm-0 mb-2',
      },
    })(html`${this.bindings.i18n.t(this.recommendationsState.headline)}`)}`;
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

  private get currentIndex() {
    return Math.abs(
      (this.currentPage * this.productsPerPage!) %
        this.recommendationsState.products.length
    );
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
        slotId: this.slotId!,
        productId: this.productId,
      },
    });
    this.recommendations.refresh();
  }

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
    const displayPlaceholders = !(this.isAppLoaded && this.isEveryProductReady);

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
    return html`${when(
      this.shouldRender,
      () =>
        html`${when(
          this.templateHasError,
          () => html`<slot></slot>`,
          () =>
            html`${this.renderListHeading()}
            ${renderCarousel({
              props: {
                bindings: this.bindings,
                previousPage: () => this.previousPage(),
                nextPage: () => this.nextPage(),
                numberOfPages: this.numberOfPages,
                currentPage: this.currentPage,
                ariaLabel: this.bindings.i18n.t(
                  this.recommendationsState.headline
                ),
              },
            })(
              html`<div class="px-3">${this.renderRecommendationList()}</div>`
            )}`
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
            .content=${this.productTemplateProvider.getTemplateContent(product)}
            .density=${props.density}
            .display=${props.display}
            .imageSize=${props.imageSize}
            .linkContent=${
              props.display === 'grid'
                ? this.productTemplateProvider.getLinkTemplateContent(product)
                : this.productTemplateProvider.getEmptyLinkTemplateContent()
            }
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

    if (!this.productTemplateRegistered || this.error) {
      return;
    }

    const productClasses = `${listClasses} ${!this.isEveryProductReady && 'hidden'}`;

    // Products must be rendered immediately (though hidden) to start their initialization and loading processes.
    // If we wait to render products until placeholders are removed, the components won't begin loading until then,
    // causing a longer delay. The `isEveryProductsReady` flag hides products while preserving placeholders,
    // then removes placeholders once products are fully loaded to prevent content flash.
    return html`
      ${when(this.isAppLoaded, () =>
        renderDisplayWrapper({
          props: {listClasses: productClasses, display: 'list'},
        })(html`${this.renderAsGrid()}`)
      )}
      ${when(!this.isEveryProductReady, () =>
        renderDisplayWrapper({
          props: {listClasses, display: 'list'},
        })(
          renderItemPlaceholders({
            props: {
              density: this.density,
              display: this.display,
              imageSize: this.imageSize,
              numberOfPlaceholders:
                this.productsPerPage ??
                this.recommendationsState.products.length,
            },
          })
        )
      )}
    `;
  }

  private get shouldRender() {
    if (!this.productTemplateRegistered || this.error) {
      return false;
    }
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
