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
import {CSSResultGroup, html, PropertyValues, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
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
 * The `atomic-commerce-product-list-stencil` component is responsible for displaying products.
 *
 * @part result-list - The element containing the list of products.
 *
 * @slot default - The default slot where the product templates are defined.
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

  public host!: HTMLElement;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstProductLoaded-');
  private nextNewResultTarget?: FocusTargetController;
  private productListCommon!: ItemListCommon;
  private productTemplateProvider!: ProductTemplateProvider;

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
  private templateHasError = false;
  @state()
  private resultTemplateRegistered = false;

  @bindStateToController('searchOrListing')
  @state()
  private searchOrListingState!: SearchState | ProductListingState;
  public summary!: Summary<ProductListingSummaryState | SearchSummaryState>;
  @state()
  private summaryState!: SearchSummaryState | ProductListingSummaryState;
  private unsubscribeSummary!: () => void;

  /**
   * The desired number of placeholders to display while the product list is loading.
   */
  @property({reflect: true})
  numberOfPlaceholders = 24;

  /**
   * The desired layout to use when displaying products. Layouts affect how many products to display per row and how visually distinct they are from each other.
   */
  @property({reflect: true})
  display: ItemDisplayLayout = 'grid'; // TODO KIT-3640 - Support 'table', or use ItemDisplayBasicLayout type.

  /**
   * The spacing of various elements in the product list, including the gap between products, the gap between parts of a product, and the font sizes of different parts in a product.
   */
  @property({reflect: true})
  density: ItemDisplayDensity = 'normal';

  /**
   * The expected size of the image displayed for products.
   */
  @property({reflect: true})
  imageSize: ItemDisplayImageSize = 'small';

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering products.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
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

  public get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  public initialize() {
    this.host = this;
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      this.searchOrListing = buildSearch(this.bindings.engine);
    }
    this.initSummary();
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

    this.host.addEventListener('atomic/selectChildProduct', (event) => {
      event.stopPropagation();
      const child = (event as CustomEvent<SelectChildProductEventArgs>).detail
        .child;

      if (this.bindings.interfaceElement.type === 'product-listing') {
        this.searchOrListing.promoteChildToParent(child);
      } else if (this.bindings.interfaceElement.type === 'search') {
        this.searchOrListing.promoteChildToParent(child);
      }
    });

    this.productListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.searchOrListingState.products.length,
      getIsLoading: () => this.searchOrListingState.isLoading,
      host: this.host,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);
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

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribeSummary();
    this.host.removeEventListener('atomic/selectChildProduct', () => {});
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

  private renderAsGrid() {
    return html`${map(this.searchOrListingState.products, (product, i) => {
      const props = this.getPropsForAtomicProduct(product);
      return html`${displayGrid({
        props: {
          selectorForItem: 'atomic-product',
          item: {
            ...product,
            title: product.ec_name ?? 'temp',
          },
          ...props.interactiveProduct,
          setRef: (element) => {
            element && this.productListCommon.setNewResultRef(element, i);
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
            key=${props.key}
            .content=${props.content}
            density=${props.density}
            display=${props.display}
            image-size=${props.imageSize}
            .interactiveProduct=${props.interactiveProduct}
            .linkContent=${props.linkContent}
            loadingFlag=${props.loadingFlag}
            part="outline"
            .product=${props.product}
            .renderingFunction=${props.renderingFunction}
            .store=${props.store}
          ></atomic-product>`
        )}`,
      })}`;
    })}`;
  }

  private renderAsList() {
    return html`${map(this.searchOrListingState.products, (product, i) => {
      const propsForAtomicProduct = this.getPropsForAtomicProduct(product);
      return html`<atomic-product
        key=${propsForAtomicProduct.key}
        .content=${propsForAtomicProduct.content}
        density=${propsForAtomicProduct.density}
        display=${propsForAtomicProduct.display}
        image-size=${propsForAtomicProduct.imageSize}
        .interactiveProduct=${propsForAtomicProduct.interactiveProduct}
        .linkContent=${propsForAtomicProduct.linkContent}
        loadingFlag=${propsForAtomicProduct.loadingFlag}
        part="outline"
        .product=${propsForAtomicProduct.product}
        .renderingFunction=${propsForAtomicProduct.renderingFunction}
        .store=${propsForAtomicProduct.store}
        .ref=${(element: HTMLElement) =>
          element && this.productListCommon.setNewResultRef(element, i)}
      ></atomic-product>`;
    })}`;
  }

  private renderAsTable() {
    if (this.searchOrListingState.products.length > 0) {
      return;
    }
    const listClasses = this.computeListDisplayClasses();
    const firstItem = this.searchOrListingState.products[0];

    const propsForTableColumns = {
      firstItem,
      templateContentForFirstItem:
        this.productTemplateProvider.getTemplateContent(firstItem),
    };

    return html`${displayTable({
      props: {
        firstItem: propsForTableColumns.firstItem,
        host: this.host,
        itemRenderingFunction: this.itemRenderingFunction,
        listClasses,
        logger: this.bindings.engine.logger,
        templateContentForFirstItem:
          propsForTableColumns.templateContentForFirstItem,
      },
      children: html`${this.searchOrListingState.products.map((product, i) => {
        const propsForAtomicProduct = this.getPropsForAtomicProduct(product);
        return html`${displayTableRow({
          props: {
            key: propsForAtomicProduct.key,
            rowIndex: i,
            setRef: (element) =>
              element && this.productListCommon.setNewResultRef(element, i),
          },
          children: html`${displayTableData({
            props: {
              firstItem: propsForTableColumns.firstItem,
              key: propsForAtomicProduct.key,
              templateContentForFirstItem:
                propsForTableColumns.templateContentForFirstItem,
              renderItem: (content) => {
                return html`<atomic-product
                  key=${propsForAtomicProduct.key}
                  .content=${propsForAtomicProduct.content}
                  density=${propsForAtomicProduct.density}
                  display=${propsForAtomicProduct.display}
                  image-size=${propsForAtomicProduct.imageSize}
                  .interactiveProduct=${propsForAtomicProduct.interactiveProduct}
                  .linkContent=${propsForAtomicProduct.linkContent}
                  loadingFlag=${propsForAtomicProduct.loadingFlag}
                  .product=${propsForAtomicProduct.product}
                  .renderingFunction=${propsForAtomicProduct.renderingFunction}
                  .store=${propsForAtomicProduct.store}
                  .content=${content}
                ></atomic-product>`;
              },
              itemRenderingFunction: this.itemRenderingFunction,
            },
          })}`,
        })}`;
      })}`,
    })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-product-list': AtomicCommerceProductList;
  }
}
