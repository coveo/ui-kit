import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {
  type Product,
  type ProductListing,
  type ProductListingState,
  type ProductListingSummaryState,
  type Search,
  type SearchState,
  type SearchSummaryState,
  type SpotlightContent,
  type Summary,
} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {
  buildSearchOrListing,
  shouldEnableResults,
} from '@/src/components/commerce/atomic-commerce-interface/search-or-listing';
import type {SelectChildProductEventArgs} from '@/src/components/commerce/atomic-product-children/select-child-product-event';
import {ProductTemplateProvider} from '@/src/components/commerce/product-list/product-template-provider';
import {isSpotlightContent} from '@/src/components/commerce/product-template-component-utils/product-utils';
import {SpotlightContentTemplateProvider} from '@/src/components/commerce/product-list/spotlight-content-template-provider';
import {renderItemPlaceholders} from '@/src/components/common/atomic-result-placeholder/item-placeholders';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderDisplayWrapper} from '@/src/components/common/item-list/display-wrapper';
import {renderGridLayout} from '@/src/components/common/item-list/grid-layout';
import {renderItemList} from '@/src/components/common/item-list/item-list';
import {
  ItemListCommon,
  type ItemRenderingFunction,
} from '@/src/components/common/item-list/item-list-common';
import gridDisplayStyles from '@/src/components/common/item-list/styles/grid-display.tw.css';
import listDisplayStyles from '@/src/components/common/item-list/styles/list-display.tw.css';
import placeholderStyles from '@/src/components/common/item-list/styles/placeholders.tw.css';
import tableDisplayStyles from '@/src/components/common/item-list/styles/table-display.tw.css';
import {
  renderTableData,
  renderTableLayout,
  renderTableRow,
} from '@/src/components/common/item-list/table-layout';
import {
  getItemListDisplayClasses,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  type ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import '@/src/components/commerce/atomic-product/atomic-product';
import '@/src/components/commerce/atomic-product-template/atomic-product-template';
import '@/src/components/commerce/atomic-spotlight-content/atomic-spotlight-content';
import '@/src/components/commerce/atomic-spotlight-content-template/atomic-spotlight-content-template';

/**
 * The `atomic-commerce-product-list` component is responsible for displaying products.
 *
 * When the `enable-spotlight-content` property of the `atomic-commerce-interface` is set, the component also displays
 * the Spotlight Content returned by the Commerce API, at the position it was returned in, when the display prop is set
 * to "grid" or "list". Spotlight Content is not a product: it is rendered with `atomic-spotlight-content-template`
 * templates rather than product templates, and is not displayed when the display prop is set to "table".
 *
 * @part outline - The outline of each item (product or Spotlight Content) when the display prop is set to "grid" or "list".
 * @part result-list - The element containing all items (products and Spotlight Content) when the display prop is set to "grid" or "list".
 * @part result-list-grid-clickable-container - The clickable wrapper containing each item (product or Spotlight Content) when the display prop is set to "grid".
 * @part result-table - The table element when the display prop is set to "table".
 * @part result-table-heading - The thead element when the display prop is set to "table".
 * @part result-table-heading-row - The tr element nested under the thead when the display prop is set to "table".
 * @part result-table-heading-cell - The `th` elements nested under `thead` > `tr` when the display prop is set to "table".
 * @part result-table-body - The tbody element when the display prop is set to "table".
 * @part result-table-row - All tr elements nested under tbody when the display prop is set to "table".
 * @part result-table-row-even - The even tr elements nested under tbody when the display prop is set to "table".
 * @part result-table-row-odd - The odd tr elements nested under tbody when the display prop is set to "table".
 * @part result-table-cell - The `td` elements nested under each `tbody` > `tr` when the display prop is set to "table".
 * @part spotlight-content - Each `atomic-spotlight-content` element. Use it to style Spotlight Content separately from products.
 *
 * @slot default - The default slot where the product templates and the Spotlight Content templates are defined.
 */
@customElement('atomic-commerce-product-list')
@bindings()
@withTailwindStyles
export class AtomicCommerceProductList
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [
    placeholderStyles,
    tableDisplayStyles,
    listDisplayStyles,
    gridDisplayStyles,
    css`
      @reference '../../../utils/tailwind.global.tw.css';
      :host {
        .result-link {
          @apply link-style;
        }

        .result-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
          justify-items: center;

          & a {
            justify-content: center;
          }
        }

        .result-list {
          display: flex;
          flex-direction: column;

          & .result-item {
            width: 100%;
            max-width: 600px;
            display: flex;
            flex-wrap: wrap;

            & .result-details {
              align-content: center;
            }
          }
        }

        .list-root atomic-spotlight-content[part~='outline']:not(:first-child)::before {
          display: block;
        }
      }

      @media (width >= theme(--breakpoint-desktop)) {
        :host .result-grid {
          display: grid;
        }
      }

      @media not all and (width >= theme(--breakpoint-desktop)) {
        :host .result-grid {
          display: flex;
          flex-direction: column;
        }
      }
    `,
  ];

  public searchOrListing!: Search | ProductListing;
  public summary!: Summary<ProductListingSummaryState | SearchSummaryState>;

  private static readonly propsSchema = new Schema({
    density: new StringValue({
      constrainTo: ['normal', 'comfortable', 'compact'],
    }),
    display: new StringValue({constrainTo: ['grid', 'list', 'table']}),
    imageSize: new StringValue({
      constrainTo: ['small', 'large', 'icon', 'none'],
    }),
    numberOfPlaceholders: new NumberValue({min: 0}),
  });

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstProductLoaded-');
  private nextNewResultTarget?: FocusTargetController;
  private productListCommon!: ItemListCommon;
  private productTemplateProvider!: ProductTemplateProvider;
  private spotlightContentRenderingFunction: ItemRenderingFunction;
  private spotlightContentTemplateProvider!: SpotlightContentTemplateProvider;
  private unsubscribeSummary!: () => void;

  @state()
  bindings!: CommerceBindings;
  @state()
  error!: Error;
  @state()
  private isAppLoaded = false;
  @state()
  private isEveryProductReady = false;
  @state()
  private resultTemplateRegistered = false;
  @state()
  private spotlightContentTemplateRegistered = false;
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
  public density: ItemDisplayDensity = 'normal';

  /**
   * The desired layout to use when displaying products. Layouts affect how many products to display per row and how
   * visually distinct they are from each other.
   */
  @property({reflect: true, type: String})
  public display: ItemDisplayLayout = 'grid';

  /**
   * The expected size of the image displayed for products.
   */
  @property({reflect: true, attribute: 'image-size', type: String})
  public imageSize: ItemDisplayImageSize = 'small';

  /**
   * The desired number of placeholders to display while the product list is loading.
   */
  @property({reflect: true, attribute: 'number-of-placeholders', type: Number})
  numberOfPlaceholders = 24;

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering products.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular,
   * or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param productRenderingFunction
   */
  public async setRenderFunction(productRenderingFunction: ItemRenderingFunction) {
    this.itemRenderingFunction = productRenderingFunction;
  }

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering Spotlight Content.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular,
   * or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param spotlightContentRenderingFunction
   */
  public async setSpotlightContentRenderFunction(
    spotlightContentRenderingFunction: ItemRenderingFunction
  ) {
    this.spotlightContentRenderingFunction = spotlightContentRenderingFunction;
  }

  public initialize() {
    this.validateProps();
    this.initSearchOrListing();
    this.initSummary();
    this.initProductTemplateProvider();
    this.initSpotlightContentTemplateProvider();
    this.initProductListCommon();
    this.createSelectChildProductListener();
    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribeSummary?.();
    this.removeEventListener('atomic/selectChildProduct', this.selectChildProductCallback);
  }
  public async updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('searchOrListingState')) {
      const oldState = changedProperties.get('searchOrListingState') as
        | ProductListingState
        | SearchState;

      if (!oldState?.isLoading && this.searchOrListingState.isLoading) {
        this.isEveryProductReady = false;
      }
    }
    await this.updateProductsReadyState();
  }

  private async updateProductsReadyState() {
    if (
      this.isAppLoaded &&
      !this.isEveryProductReady &&
      this.summaryState?.firstRequestExecuted &&
      this.items.length > 0
    ) {
      await this.getUpdateComplete();
      this.isEveryProductReady = true;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${renderItemList({
      props: {
        hasError: this.summaryState.hasError,
        hasItems: this.summaryState.hasProducts,
        hasTemplate: this.resultTemplateRegistered,
        firstRequestExecuted: this.summaryState.firstRequestExecuted,
        templateHasError: this.templateHasError,
      },
    })(
      html`${when(
        this.templateHasError,
        () => html`<slot></slot>`,
        () => {
          const listClasses = this.computeListDisplayClasses();
          const productClasses = `${listClasses} ${!this.isEveryProductReady && 'hidden'}`;

          // Products must be rendered immediately (though hidden) to start their initialization and loading processes.
          // If we wait to render products until placeholders are removed, the components won't begin loading until then,
          // causing a longer delay. The `isEveryProductsReady` flag hides products while preserving placeholders,
          // then removes placeholders once products are fully loaded to prevent content flash.
          return html`
            ${when(this.isAppLoaded, () =>
              renderDisplayWrapper({
                props: {listClasses: productClasses, display: this.display},
              })(
                html`${when(
                  this.display === 'grid',
                  () => this.renderGrid(),
                  () =>
                    html`${when(
                      this.display === 'list',
                      () => this.renderList(),
                      () => this.renderTable()
                    )}`
                )}`
              )
            )}
            ${when(!this.isEveryProductReady, () =>
              renderDisplayWrapper({
                props: {listClasses, display: this.display},
              })(
                renderItemPlaceholders({
                  props: {
                    density: this.density,
                    display: this.display,
                    imageSize: this.imageSize,
                    numberOfPlaceholders: this.numberOfPlaceholders,
                  },
                })
              )
            )}
          `;
        }
      )}`
    )}`;
  }

  private validateProps() {
    AtomicCommerceProductList.propsSchema.validate({
      density: this.density,
      display: this.display,
      imageSize: this.imageSize,
      numberOfPlaceholders: this.numberOfPlaceholders,
    });
  }

  private initSearchOrListing() {
    this.searchOrListing = buildSearchOrListing(
      this.bindings.engine,
      this.bindings.interfaceElement
    );
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
      templateElements: Array.from(this.querySelectorAll('atomic-product-template')),
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

  private initSpotlightContentTemplateProvider() {
    this.spotlightContentTemplateProvider = new SpotlightContentTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(this.querySelectorAll('atomic-spotlight-content-template')),
      getResultTemplateRegistered: () => this.spotlightContentTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.spotlightContentTemplateRegistered = value;
      },
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
    });
  }

  private initProductListCommon() {
    this.productListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.items.length,
      getIsLoading: () => this.searchOrListingState.isLoading,
      host: this,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  private createSelectChildProductListener() {
    this.addEventListener('atomic/selectChildProduct', this.selectChildProductCallback);
  }

  private selectChildProductCallback(event: Event) {
    event.stopPropagation();
    const child = (event as CustomEvent<SelectChildProductEventArgs>).detail.child;
    this.searchOrListing.promoteChildToParent(child);
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !(this.isAppLoaded && this.isEveryProductReady);

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,
      this.searchOrListingState?.isLoading,
      displayPlaceholders
    );
  }

  private get items(): (Product | SpotlightContent)[] {
    if (!this.searchOrListingState) {
      return [];
    }
    if (shouldEnableResults(this.bindings.interfaceElement)) {
      return this.searchOrListingState.results ?? [];
    }
    return this.searchOrListingState.products ?? [];
  }

  private get products(): Product[] {
    return this.items.filter((item): item is Product => !isSpotlightContent(item));
  }

  private getItemKey(item: Product | SpotlightContent) {
    return this.productListCommon.getResultId(
      isSpotlightContent(item) ? item.id : item.permanentid,
      item.responseId ?? this.searchOrListingState.responseId,
      this.density,
      this.imageSize
    );
  }

  private setItemRef(element: Element | undefined, index: number) {
    element instanceof HTMLElement && this.productListCommon.setNewResultRef(element, index);
  }

  private renderGrid() {
    return html`${map(this.items, (item, index) =>
      isSpotlightContent(item)
        ? when(this.spotlightContentTemplateRegistered, () =>
            this.renderSpotlightContentInGrid(item, index)
          )
        : this.renderProductInGrid(item, index)
    )}`;
  }

  private renderList() {
    return html`${map(this.items, (item, index) =>
      isSpotlightContent(item)
        ? when(this.spotlightContentTemplateRegistered, () =>
            this.renderSpotlightContentInList(item, index)
          )
        : this.renderProductInList(item, index)
    )}`;
  }

  private renderProductInGrid(product: Product, index: number) {
    return renderGridLayout({
      props: {
        item: {
          ...product,
          title: product.ec_name ?? '',
        },
        selectorForItem: 'atomic-product',
        setRef: (element) => this.setItemRef(element, index),
      },
    })(
      html`${keyed(
        this.getItemKey(product),
        html`<atomic-product
          .content=${this.productTemplateProvider.getTemplateContent(product)}
          .density=${this.density}
          .display=${this.display}
          .imageSize=${this.imageSize}
          .interactiveProduct=${this.searchOrListing.interactiveProduct({
            options: {product},
          })}
          .linkContent=${this.productTemplateProvider.getLinkTemplateContent(product)}
          .loadingFlag=${this.loadingFlag}
          .product=${product}
          .renderingFunction=${this.itemRenderingFunction}
          .store=${this.bindings.store as never}
        ></atomic-product>`
      )}`
    );
  }

  private renderProductInList(product: Product, index: number) {
    return html`${keyed(
      this.getItemKey(product),
      html`<atomic-product
        part="outline"
        ${ref((element) => this.setItemRef(element, index))}
        .content=${this.productTemplateProvider.getTemplateContent(product)}
        .density=${this.density}
        .display=${this.display}
        .imageSize=${this.imageSize}
        .interactiveProduct=${this.searchOrListing.interactiveProduct({
          options: {product},
        })}
        .linkContent=${this.productTemplateProvider.getLinkTemplateContent(product)}
        .loadingFlag=${this.loadingFlag}
        .product=${product}
        .renderingFunction=${this.itemRenderingFunction}
        .store=${this.bindings.store as never}
      ></atomic-product>`
    )}`;
  }

  private renderSpotlightContentInGrid(spotlightContent: SpotlightContent, index: number) {
    return renderGridLayout({
      props: {
        item: {
          clickUri: spotlightContent.clickUri,
          title: spotlightContent.name ?? '',
        },
        selectorForItem: 'atomic-spotlight-content',
        setRef: (element) => this.setItemRef(element, index),
      },
    })(
      html`${keyed(
        this.getItemKey(spotlightContent),
        html`<atomic-spotlight-content
          part="spotlight-content"
          .content=${this.spotlightContentTemplateProvider.getTemplateContent(spotlightContent)}
          .density=${this.density}
          .display=${this.display}
          .imageSize=${this.imageSize}
          .interactiveSpotlightContent=${this.searchOrListing.interactiveSpotlightContent({
            options: {spotlightContent},
          })}
          .linkContent=${this.spotlightContentTemplateProvider.getLinkTemplateContent(
            spotlightContent
          )}
          .loadingFlag=${this.loadingFlag}
          .renderingFunction=${this.spotlightContentRenderingFunction}
          .spotlightContent=${spotlightContent}
          .store=${this.bindings.store}
        ></atomic-spotlight-content>`
      )}`
    );
  }

  private renderSpotlightContentInList(spotlightContent: SpotlightContent, index: number) {
    return html`${keyed(
      this.getItemKey(spotlightContent),
      html`<atomic-spotlight-content
        part="outline spotlight-content"
        ${ref((element) => this.setItemRef(element, index))}
        .content=${this.spotlightContentTemplateProvider.getTemplateContent(spotlightContent)}
        .density=${this.density}
        .display=${this.display}
        .imageSize=${this.imageSize}
        .interactiveSpotlightContent=${this.searchOrListing.interactiveSpotlightContent({
          options: {spotlightContent},
        })}
        .linkContent=${this.spotlightContentTemplateProvider.getLinkTemplateContent(
          spotlightContent
        )}
        .loadingFlag=${this.loadingFlag}
        .renderingFunction=${this.spotlightContentRenderingFunction}
        .spotlightContent=${spotlightContent}
        .store=${this.bindings.store}
      ></atomic-spotlight-content>`
    )}`;
  }

  private renderTable() {
    const products = this.products;
    return html`${when(
      this.summaryState.hasProducts && products.length > 0,
      () => {
        const firstItem = products[0];
        const listClasses = this.computeListDisplayClasses();
        const templateContentForFirstItem =
          this.productTemplateProvider.getTemplateContent(firstItem);
        return renderTableLayout({
          props: {
            firstItem,
            host: this,
            itemRenderingFunction: this.itemRenderingFunction,
            label: this.bindings.i18n.t('view-products'),
            listClasses,
            logger: this.bindings.engine.logger,
            templateContentForFirstItem,
          },
        })(
          html`${map(products, (product, index) => {
            const key = this.getItemKey(product);
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
                  itemRenderingFunction: this.itemRenderingFunction,
                  templateContentForFirstItem,
                  renderItem: (content) => {
                    return html`${keyed(
                      key,
                      html`<atomic-product
                        .content=${content}
                        .density=${this.density}
                        .display=${this.display}
                        .imageSize=${this.imageSize}
                        .interactiveProduct=${this.searchOrListing.interactiveProduct({
                          options: {product},
                        })}
                        .linkContent=${this.productTemplateProvider.getLinkTemplateContent(product)}
                        .loadingFlag=${this.loadingFlag}
                        .product=${product}
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
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-product-list': AtomicCommerceProductList;
  }
}
