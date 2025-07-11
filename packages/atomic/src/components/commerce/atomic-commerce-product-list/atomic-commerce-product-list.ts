import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  buildProductListing,
  buildSearch,
  type ProductListing,
  type ProductListingState,
  type ProductListingSummaryState,
  type Search,
  type SearchState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, html, LitElement, nothing, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {bindStateToController} from '@/src/decorators/bind-state.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {FocusTargetController} from '@/src/utils/accessibility-utils.js';
import {randomID} from '@/src/utils/utils.js';
import {renderItemPlaceholders} from '../../common/atomic-result-placeholder/item-placeholders.js';
import {createAppLoadedListener} from '../../common/interface/store.js';
import {renderDisplayWrapper} from '../../common/item-list/display-wrapper.js';
import {renderGridLayout} from '../../common/item-list/grid-layout.js';
import {
  ItemListCommon,
  type ItemRenderingFunction,
} from '../../common/item-list/item-list-common.js';
import {
  renderTableData,
  renderTableLayout,
  renderTableRow,
} from '../../common/item-list/table-layout.js';
import {
  getItemListDisplayClasses,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  type ItemDisplayLayout,
} from '../../common/layout/display-options.js';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';
import type {SelectChildProductEventArgs} from '../atomic-product-children/select-child-product-event.js';
import {ProductTemplateProvider} from '../product-list/product-template-provider.js';
import styles from './atomic-commerce-product-list.tw.css';

/**
 * The `atomic-commerce-product-list` component is responsible for displaying products.
 *
 * @part outline - The outline of each product when the display prop is set to "grid" or "list".
 * @part result-list - The element containing all products when the display prop is set to "grid" or "list".
 * @part result-list-grid-clickable-container - The clickable wrapper containing each product when the display prop is set to "grid".
 * @part result-table - The table element when the display prop is set to "table".
 * @part result-table-heading - The thead element when the display prop is set to "table".
 * @part result-table-heading-row - The tr element nested under the thead when the display prop is set to "table".
 * @part result-table-heading-cell - The th elements nested under thead > tr when the display prop is set to "table".
 * @part result-table-body - The tbody element when the display prop is set to "table".
 * @part result-table-row - All tr elements nested under tbody when the display prop is set to "table".
 * @part result-table-row-even - The even tr elements nested under tbody when the display prop is set to "table".
 * @part result-table-row-odd - The odd tr elements nested under tbody when the display prop is set to "table".
 * @part result-table-cell - The td elements nested under each tbody > tr when the display prop is set to "table".
 *
 * @slot default - The default slot where the product templates are defined.
 *
 * @alpha
 */
@customElement('atomic-commerce-product-list')
@bindings()
@withTailwindStyles
export class AtomicCommerceProductList
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  public searchOrListing!: Search | ProductListing;
  public summary!: Summary<ProductListingSummaryState | SearchSummaryState>;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstProductLoaded-');
  private nextNewResultTarget?: FocusTargetController;
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
    this.removeEventListener(
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
            return renderDisplayWrapper({
              props: {listClasses, display: this.display},
            })(html`
              ${when(
                this.isAppLoaded,
                () =>
                  html`${when(
                    this.display === 'grid',
                    () => this.renderGrid(),
                    () =>
                      html`${when(
                        this.display === 'list',
                        () => this.renderList(),
                        () => this.renderTable()
                      )}`
                  )}`,
                () =>
                  renderItemPlaceholders({
                    props: {
                      density: this.density,
                      display: this.display,
                      imageSize: this.imageSize,
                      numberOfPlaceholders: this.numberOfPlaceholders,
                    },
                  })
              )}
            `);
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
        this.querySelectorAll('atomic-product-template')
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

  private renderGrid() {
    return html`${map(this.searchOrListingState.products, (product, index) => {
      return renderGridLayout({
        props: {
          item: {
            ...product,
            title: product.ec_name ?? '',
          },
          selectorForItem: 'atomic-product',
          setRef: (element) => {
            element instanceof HTMLElement &&
              this.productListCommon.setNewResultRef(element, index);
          },
        },
      })(
        html`${keyed(
          this.productListCommon.getResultId(
            product.permanentid,
            this.searchOrListingState.responseId,
            this.density,
            this.imageSize
          ),
          html`<atomic-product
            .content=${this.productTemplateProvider.getTemplateContent(product)}
            .density=${this.density}
            .display=${this.display}
            .imageSize=${this.imageSize}
            .interactiveProduct=${this.searchOrListing.interactiveProduct({
              options: {product},
            })}
            .linkContent=${this.productTemplateProvider.getLinkTemplateContent(
              product
            )}
            .loadingFlag=${this.loadingFlag}
            .product=${product}
            .renderingFunction=${this.itemRenderingFunction}
            .store=${this.bindings.store as never}
          ></atomic-product>`
        )}`
      );
    })}`;
  }

  private renderList() {
    return html`${map(this.searchOrListingState.products, (product, index) => {
      return html`${keyed(
        this.productListCommon.getResultId(
          product.permanentid,
          this.searchOrListingState.responseId,
          this.density,
          this.imageSize
        ),
        html`<atomic-product
          part="outline"
          ${ref(
            (element) =>
              element instanceof HTMLElement &&
              this.productListCommon.setNewResultRef(element, index)
          )}
          .content=${this.productTemplateProvider.getTemplateContent(product)}
          .density=${this.density}
          .display=${this.display}
          .imageSize=${this.imageSize}
          .interactiveProduct=${this.searchOrListing.interactiveProduct({
            options: {product},
          })}
          .linkContent=${this.productTemplateProvider.getEmptyLinkTemplateContent()}
          .loadingFlag=${this.loadingFlag}
          .product=${product}
          .renderingFunction=${this.itemRenderingFunction}
          .store=${this.bindings.store as never}
        ></atomic-product>`
      )}`;
    })}`;
  }

  private renderTable() {
    return html`${when(
      this.summaryState.hasProducts,
      () => {
        const firstItem = this.searchOrListingState.products[0];
        const listClasses = this.computeListDisplayClasses();
        const templateContentForFirstItem =
          this.productTemplateProvider.getTemplateContent(firstItem);
        return renderTableLayout({
          props: {
            firstItem,
            host: this,
            itemRenderingFunction: this.itemRenderingFunction,
            listClasses,
            logger: this.bindings.engine.logger,
            templateContentForFirstItem,
          },
        })(
          html`${map(this.searchOrListingState.products, (product, index) => {
            const key = this.productListCommon.getResultId(
              product.permanentid,
              this.searchOrListingState.responseId,
              this.density,
              this.imageSize
            );
            return renderTableRow({
              props: {
                key,
                rowIndex: index,
                setRef: (element) =>
                  element instanceof HTMLElement &&
                  this.productListCommon.setNewResultRef(element, index),
              },
            })(
              html`${renderTableData({
                props: {
                  firstItem,
                  key,
                  templateContentForFirstItem,
                  renderItem: (content) => {
                    return html`${keyed(
                      key,
                      html`<atomic-product
                        .content=${content}
                        .density=${this.density}
                        .display=${this.display}
                        .imageSize=${this.imageSize}
                        .interactiveProduct=${this.searchOrListing.interactiveProduct(
                          {options: {product}}
                        )}
                        .linkContent=${this.productTemplateProvider.getEmptyLinkTemplateContent()}
                        .loadingFlag=${this.loadingFlag}
                        .product=${product}
                        .renderingFunction=${this.itemRenderingFunction}
                        .store=${this.bindings.store as never}
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

  private get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this, this.bindings);
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
