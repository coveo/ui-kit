import {SelectChildProductEventArgs} from '@/src/components.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {
  BindingController,
  InitializeBindingsMixin,
} from '@/src/mixins/bindings-mixin.js';
import {FocusTargetController} from '@/src/utils/accessibility-utils.js';
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
import {ContextRoot} from '@lit/context';
import {CSSResultGroup, html, LitElement, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {
  renderResultPlaceholders,
  renderTableResultPlaceholders,
} from '../../common/atomic-result-placeholder/placeholders-lit.js';
import {createAppLoadedListener} from '../../common/interface/store.js';
import {
  DisplayTable,
  DisplayTableData,
  DisplayTableRow,
} from '../../common/item-list/display-table-lit.js';
import {
  renderListWrapper,
  renderListRoot,
} from '../../common/item-list/display-wrapper-lit.js';
import {renderGridLayout} from '../../common/item-list/grid-layout.js';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../common/item-list/item-list-common-lit.js';
import {
  getItemListDisplayClasses,
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../../common/layout/display-options.js';
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
@bindings()
@withTailwindStyles
export class AtomicCommerceProductList
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  public searchOrListing!: Search | ProductListing;
  public summary!: Summary<ProductListingSummaryState | SearchSummaryState>;
  public host!: HTMLElement;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstProductLoaded-');
  private nextNewResultTarget?: FocusTargetController;
  private productListCommon!: ItemListCommon;
  private productTemplateProvider!: ProductTemplateProvider;
  private unsubscribeSummary!: () => void;

  public constructor() {
    super();
    new BindingController(this);
    const contextRoot = new ContextRoot();
    contextRoot.attach(document.body);
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

  @bindStateToController('summary')
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

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribeSummary?.();
    this.host?.removeEventListener(
      'atomic/selectChildProduct',
      this.selectChildProductCallback
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
          () => {
            const listClasses = this.computeListDisplayClasses();
            return html`${when(
              this.display === 'table',
              () => this.renderTable(listClasses),
              () => this.renderGridOrList(listClasses)
            )}`;
          }
        )}`,
      () => nothing
    )}`;
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

  private renderTable(listClasses: string) {
    return renderListWrapper({props: {listClasses}})(
      html`${when(
        this.isAppLoaded,
        () => this.renderAsTable(),
        () =>
          renderTableResultPlaceholders({
            props: {
              density: this.density,
              imageSize: this.imageSize,
              numberOfPlaceholders: this.numberOfPlaceholders,
            },
          })
      )}`
    );
  }

  private renderGridOrList(listClasses: string) {
    return renderListWrapper({props: {listClasses}})(
      renderListRoot({
        props: {listClasses},
      })(html`
        ${when(
          this.isAppLoaded,
          () =>
            html`${when(
              this.display === 'grid',
              () => this.renderAsGrid(),
              () => this.renderAsList()
            )}`,
          () =>
            renderResultPlaceholders({
              props: {
                density: this.density,
                display: this.display,
                imageSize: this.imageSize,
                numberOfPlaceholders: this.numberOfPlaceholders,
              },
            })
        )}
      `)
    );
  }

  private renderAsGrid() {
    return html`${map(this.searchOrListingState.products, (product, index) => {
      const props = this.getPropsForAtomicProduct(product);
      return renderGridLayout({
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
      })(
        html`${keyed(
          props.key,
          html`<atomic-product
            .content=${props.content}
            .density=${props.density}
            .display=${props.display}
            .imageSize=${props.imageSize}
            .interactiveProduct=${props.interactiveProduct}
            .linkContent=${props.linkContent}
            .loadingFlag=${props.loadingFlag}
            .product=${props.product}
            .renderingFunction=${props.renderingFunction}
            .store=${props.store as never}
          ></atomic-product>`
        )}`
      );
    })}`;
  }

  private renderAsList() {
    return html`${map(this.searchOrListingState.products, (product, index) => {
      const props = this.getPropsForAtomicProduct(product);
      return html`${keyed(
        props.key,
        html`<atomic-product
          part="outline"
          ${ref(
            (element) =>
              element && this.productListCommon.setNewResultRef(element, index)
          )}
          .content=${props.content}
          .density=${props.density}
          .display=${props.display}
          .imageSize=${props.imageSize}
          .interactiveProduct=${props.interactiveProduct}
          .linkContent=${props.linkContent}
          .loadingFlag=${props.loadingFlag}
          .product=${props.product}
          .renderingFunction=${props.renderingFunction}
          .store=${props.store as never}
        ></atomic-product>`
      )}`;
    })}`;
  }

  private renderAsTable() {
    return html`${when(
      this.summaryState.hasProducts,
      () => {
        const firstItem = this.searchOrListingState.products[0];
        const listClasses = this.computeListDisplayClasses();
        const templateContentForFirstItem =
          this.productTemplateProvider.getTemplateContent(firstItem);

        return DisplayTable({
          props: {
            firstItem,
            host: this.host,
            itemRenderingFunction: this.itemRenderingFunction,
            listClasses,
            logger: this.bindings.engine.logger,
            templateContentForFirstItem,
          },
        })(
          html`${map(this.searchOrListingState.products, (item, index) => {
            const props = this.getPropsForAtomicProduct(item);

            return DisplayTableRow({
              props: {
                key: props.key,
                rowIndex: index,
                setRef: (element) =>
                  element &&
                  this.productListCommon.setNewResultRef(element, index),
              },
            })(
              html`${DisplayTableData({
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
                        .interactiveProduct=${props.interactiveProduct}
                        .linkContent=${props.linkContent}
                        .loadingFlag=${props.loadingFlag}
                        .product=${props.product}
                        .renderingFunction=${props.renderingFunction}
                        .store=${props.store as never}
                      ></atomic-product>`
                    )}`;
                  },
                },
              })}`
            );
          })}`
        );
      },
      () => nothing
    )}`;
  }

  private logWarningIfNeeded(message?: string) {
    if (message) {
      this.bindings.engine.logger.warn(message);
    }
  }

  private getPropsForAtomicProduct(product: Product) {
    return {
      interactiveProduct: this.searchOrListing.interactiveProduct({
        options: {product},
      }),
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

  private get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this);
    }
    return this.nextNewResultTarget;
  }

  private get shouldRender() {
    return (
      !this.summaryState.hasError &&
      this.resultTemplateRegistered &&
      (!this.summaryState.firstRequestExecuted || this.summaryState.hasProducts)
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-product-list': AtomicCommerceProductList;
  }
}
