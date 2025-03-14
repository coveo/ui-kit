import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
  ItemRenderingFunction,
  SelectChildProductEventArgs,
} from '@/src/components.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import {InitializableComponent} from '@/src/decorators/types.js';
import {
  BindingController,
  InitializeBindingsMixin,
} from '@/src/mixins/bindings-mixin';
import {FocusTargetController} from '@/src/utils/accessibility-utils.js';
import {TailwindLitElement} from '@/src/utils/tailwind.element.js';
import {randomID} from '@/src/utils/utils.js';
import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildProductListing,
  buildSearch,
  Product,
  ProductListing,
  ProductListingState,
  ProductListingSummaryState,
  Search,
  SearchState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {CSSResultGroup, html, nothing, PropertyValues, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
import {resultsPlaceholdersGuard} from '../../common/atomic-result-placeholder/placeholders-lit.js';
import {createAppLoadedListener} from '../../common/interface/store.js';
import {displayGrid} from '../../common/item-list/display-grid-lit.js';
import {
  displayTable,
  displayTableData,
  displayTableRow,
} from '../../common/item-list/display-table-lit.js';
import {displayWrapper} from '../../common/item-list/display-wrapper-lit.js';
import {ItemListCommon} from '../../common/item-list/item-list-common-lit.js';
import {itemListGuard} from '../../common/item-list/item-list-guard-lit.js';
import {getItemListDisplayClasses} from '../../common/layout/display-options.js';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';
import {ProductTemplateProvider} from '../product-list/product-template-provider.js';
import styles from './atomic-commerce-product-list.tw.css';

/**
 * The `atomic-commerce-product-list` component is responsible for displaying products.
 *
 * @part result-list - The element containing the list of products.
 *
 * @slot default - The default slot where the product templates are defined.
 *
 * @alpha
 */
@customElement('atomic-commerce-product-list')
export class AtomicCommerceProductList
  extends InitializeBindingsMixin(TailwindLitElement)
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [
    TailwindLitElement.styles,
    unsafeCSS(styles),
  ];

  public searchOrListing!: Search | ProductListing;
  public summary!: Summary<ProductListingSummaryState | SearchSummaryState>;
  public host!: HTMLElement;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstProductLoaded-');
  private nextNewResultTarget?: FocusTargetController;
  private productListCommon!: ItemListCommon;
  private productTemplateProvider!: ProductTemplateProvider;
  private unsubscribeSummary!: () => void;

  constructor() {
    super();
    new BindingController(this);
  }

  @state()
  bindings!: CommerceBindings;
  @state()
  error!: Error;
  @state()
  private isAppLoaded = false;
  @state()
  private resultTemplateRegistered = false;
  @state()
  private templateHasError = false;

  @bindStateToController('searchOrListing')
  @state()
  public searchOrListingState!: SearchState | ProductListingState;
  @state()
  public summaryState!: SearchSummaryState | ProductListingSummaryState;

  /**
   * The spacing of various elements in the product list, including the gap between products, the gap between parts of a
   * product, and the font sizes of different parts in a product.
   */
  @property({reflect: true, type: String})
  density: ItemDisplayDensity = 'normal';

  /**
   * The desired layout to use when displaying products. Layouts affect how many products to display per row and how
   * visually distinct they are from each other.
   */
  @property({reflect: true, type: String})
  display: ItemDisplayLayout = 'grid';

  /**
   * The expected size of the image displayed for products.
   */
  @property({reflect: true, attribute: 'image-size', type: String})
  imageSize: ItemDisplayImageSize = 'small';

  /**
   * The desired number of placeholders to display while the product list is loading.
   */
  @property({reflect: true, attribute: 'number-of-placeholders', type: Number})
  numberOfPlaceholders = 24;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering products.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular,
   * or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param productRenderingFunction
   */
  public async setRenderFunction(
    productRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = productRenderingFunction;
  }

  public initialize() {
    this.validateProps();
    this.host = this;
    this.initSearchOrListing();
    this.initSummary();
    this.initProductTemplateProvider();
    this.initProductListCommon();
    this.createSelectChildProductListener();
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribeSummary && this.unsubscribeSummary();
    this.host.removeEventListener(
      'atomic/selectChildProduct',
      this.selectChildProductCallback
    );
  }

  public get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const listClasses = this.computeListDisplayClasses();

    const {
      firstRequestExecuted,
      hasError,
      hasProducts: hasItems,
    } = this.summaryState;

    return html`${itemListGuard({
      props: {
        hasError,
        hasItems,
        hasTemplate: this.resultTemplateRegistered,
        firstRequestExecuted,
        templateHasError: this.templateHasError,
      },
      children: html` ${displayWrapper({
        props: {display: this.display, listClasses},
        children: [
          html`${resultsPlaceholdersGuard({
            props: {
              density: this.density,
              imageSize: this.imageSize,
              display: this.display,
              numberOfPlaceholders: this.numberOfPlaceholders,
              displayPlaceholders: !this.isAppLoaded,
            },
          })}`,
          this.display === 'grid'
            ? html`${this.renderAsGrid()}`
            : this.display === 'list'
              ? html`${this.renderAsList()}`
              : html`${this.renderAsTable()}`,
        ],
      })}`,
    })}`;
  }

  private validateProps() {
    new Schema({
      density: new StringValue({constrainTo: ['normal', 'compact']}),
      display: new StringValue({constrainTo: ['grid', 'list', 'table']}),
      imageSize: new StringValue({
        constrainTo: ['small', 'large', 'icon', 'none'],
      }),
      numberOfPlaceholders: new NumberValue({min: 0}),
    }).validate({
      density: this.density,
      display: this.display,
      imageSize: this.imageSize,
      numberOfPlaceholders: this.numberOfPlaceholders,
    });
  }

  private initSearchOrListing() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      this.searchOrListing = buildSearch(this.bindings.engine);
    }
  }

  private initSummary() {
    this.summary = this.searchOrListing.summary();
    this.unsubscribeSummary = this.summary.subscribe(() => {
      this.summaryState = this.summary.state;
      if (this.summaryState.firstRequestExecuted) {
        this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      }
    });
  }

  private initProductTemplateProvider() {
    this.productTemplateProvider = new ProductTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host?.querySelectorAll('atomic-product-template')
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
  }

  private initProductListCommon() {
    this.productListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.searchOrListingState.products.length,
      getIsLoading: () => this.searchOrListingState.isLoading,
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  private createSelectChildProductListener() {
    this.host.addEventListener(
      'atomic/selectChildProduct',
      this.selectChildProductCallback
    );
  }

  private selectChildProductCallback(event: Event) {
    event.stopPropagation();
    const child = (event as CustomEvent<SelectChildProductEventArgs>).detail
      .child;
    this.searchOrListing.promoteChildToParent(child);
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !this.isAppLoaded;

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,

      this.searchOrListingState?.isLoading,
      displayPlaceholders
    );
  }

  private renderAsGrid() {
    return html`${map(this.searchOrListingState.products, (product, index) => {
      const props = this.getPropsForAtomicProduct(product);
      return html`${displayGrid({
        props: {
          selectorForItem: 'atomic-product',
          item: {
            ...product,
            title: product.ec_name ?? '',
          },
          ...props.interactiveProduct,
          setRef: (element) => {
            element && this.productListCommon.setNewResultRef(element, index);
          },
          select: () => {
            this.logWarningIfNeeded(props.interactiveProduct.warningMessage);
            props.interactiveProduct.select();
          },
          beginDelayedSelect: () => {
            this.logWarningIfNeeded(props.interactiveProduct.warningMessage);
            props.interactiveProduct.beginDelayedSelect();
          },
          cancelPendingSelect: () => {
            this.logWarningIfNeeded(props.interactiveProduct.warningMessage);
            props.interactiveProduct.cancelPendingSelect();
          },
        },
        children: html`${keyed(
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
            .store=${props.store}
          ></atomic-product>`
        )}`,
      })}`;
    })}`;
  }

  private renderAsList() {
    return html`${map(this.searchOrListingState.products, (product, index) => {
      const props = this.getPropsForAtomicProduct(product);
      return html`${keyed(
        props.key,
        html`<atomic-product
          .content=${props.content}
          .density=${props.density}
          .display=${props.display}
          .imageSize=${props.imageSize}
          .interactiveProduct=${props.interactiveProduct}
          .linkContent=${props.linkContent}
          .loadingFlag=${props.loadingFlag}
          part="outline"
          .product=${props.product}
          .renderingFunction=${props.renderingFunction}
          ${ref(
            (element) =>
              element && this.productListCommon.setNewResultRef(element, index)
          )}
          .store=${props.store}
        ></atomic-product>`
      )}`;
    })}`;
  }

  private renderAsTable() {
    if (this.searchOrListingState.products.length === 0) {
      return nothing;
    }

    const firstItem = this.searchOrListingState.products[0];
    const listClasses = this.computeListDisplayClasses();
    const templateContentForFirstItem =
      this.productTemplateProvider.getTemplateContent(firstItem);

    return html`${displayTable({
      props: {
        firstItem,
        host: this.host,
        itemRenderingFunction: this.itemRenderingFunction,
        listClasses,
        logger: this.bindings.engine.logger,
        templateContentForFirstItem,
      },
      children: html`${map(
        this.searchOrListingState.products,
        (item, index) => {
          const props = this.getPropsForAtomicProduct(item);
          return html`${displayTableRow({
            props: {
              key: props.key,
              rowIndex: index,
              setRef: (element) =>
                element &&
                this.productListCommon.setNewResultRef(element, index),
            },
            children: html`${displayTableData({
              props: {
                firstItem,
                key: props.key,
                templateContentForFirstItem,
                renderItem: (content) => {
                  return html`${keyed(
                    props.key,
                    html`<atomic-product
                      .content=${content}
                      .density=${props.density}
                      .display=${props.display}
                      .imageSize=${props.imageSize}
                      .linkContent=${props.linkContent}
                      .loadingFlag=${props.loadingFlag}
                      .interactiveProduct=${props.interactiveProduct}
                      .product=${props.product}
                      .renderingFunction=${props.renderingFunction}
                      .store=${props.store}
                    ></atomic-product>`
                  )}`;
                },
                itemRenderingFunction: this.itemRenderingFunction,
              },
            })}`,
          })}`;
        }
      )}`,
    })}`;
  }

  private logWarningIfNeeded(message?: string) {
    if (message) {
      this.bindings.engine.logger.warn(message);
    }
  }

  private getInteractiveProduct(product: Product) {
    const parentController = this.searchOrListing;

    return parentController.interactiveProduct({options: {product}});
  }

  private getPropsForAtomicProduct(product: Product) {
    return {
      interactiveProduct: this.getInteractiveProduct(product),
      product,
      renderingFunction: this.itemRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.productListCommon.getResultId(
        product.permanentid,
        this.searchOrListingState.responseId,
        this.density,
        this.imageSize
      ),
      content: this.productTemplateProvider.getTemplateContent(product),
      linkContent:
        this.display === 'grid'
          ? this.productTemplateProvider.getLinkTemplateContent(product)
          : this.productTemplateProvider.getEmptyLinkTemplateContent(),
      store: this.bindings.store,
      density: this.density,
      imageSize: this.imageSize,
      display: this.display,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-product-list': AtomicCommerceProductList;
  }
}
