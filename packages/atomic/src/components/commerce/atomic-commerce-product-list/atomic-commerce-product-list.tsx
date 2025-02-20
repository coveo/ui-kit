import {
  buildProductListing,
  ProductListingState,
  ProductListing,
  buildSearch,
  SearchState,
  Search,
  Product,
  Summary,
  ProductListingSummaryState,
  SearchSummaryState,
} from '@coveo/headless/commerce';
import {
  Component,
  Element,
  Listen,
  Method,
  Prop,
  State,
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
import {createAppLoadedListener} from '../../common/interface/store';
import {DisplayGrid} from '../../common/item-list/display-grid';
import {
  DisplayTable,
  DisplayTableData,
  DisplayTableRow,
} from '../../common/item-list/display-table';
import {DisplayWrapper} from '../../common/item-list/display-wrapper';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../common/item-list/item-list-common';
import {ItemListGuard} from '../../common/item-list/item-list-guard';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
  getItemListDisplayClasses,
} from '../../common/layout/display-options';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {ProductTemplateProvider} from '../product-list/product-template-provider';
import {SelectChildProductEventArgs} from '../product-template-components/atomic-product-children/atomic-product-children';

/**
 * @alpha
 * The `atomic-commerce-product-list` component is responsible for displaying products.
 *
 * @part result-list - The element containing the list of products.
 *
 * @slot default - The default slot where the product templates are defined.
 */
@Component({
  tag: 'atomic-commerce-product-list',
  styleUrl: 'atomic-commerce-product-list.pcss',
  shadow: true,
})
export class AtomicCommerceProductList
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;
  public productListing!: ProductListing;
  public search!: Search;
  private loadingFlag = randomID('firstProductLoaded-');
  private itemRenderingFunction: ItemRenderingFunction;
  private nextNewResultTarget?: FocusTargetController;
  private productTemplateProvider!: ProductTemplateProvider;
  private productListCommon!: ItemListCommon;

  @Element() public host!: HTMLDivElement;

  @BindStateToController('productListing')
  @State()
  private productListingState!: ProductListingState;
  @BindStateToController('search')
  @State()
  private searchState!: SearchState;
  public summary!: Summary<ProductListingSummaryState | SearchSummaryState>;
  @BindStateToController('summary')
  @State()
  private summaryState!: SearchSummaryState | ProductListingSummaryState;
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;
  @State() private templateHasError = false;
  @State() private isAppLoaded = false;

  /**
   * The desired number of placeholders to display while the product list is loading.
   */
  @Prop({reflect: true}) numberOfPlaceholders = 24;

  /**
   * The desired layout to use when displaying products. Layouts affect how many products to display per row and how visually distinct they are from each other.
   */
  @Prop({reflect: true}) display: ItemDisplayLayout = 'grid'; // TODO KIT-3640 - Support 'table', or use ItemDisplayBasicLayout type.

  /**
   * The spacing of various elements in the product list, including the gap between products, the gap between parts of a product, and the font sizes of different parts in a product.
   */
  @Prop({reflect: true}) density: ItemDisplayDensity = 'normal';

  /**
   * The expected size of the image displayed for products.
   */
  @Prop({reflect: true}) imageSize: ItemDisplayImageSize = 'small';

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering products.
   * You can use this function while working with web frameworks that don't use plain HTML syntax, e.g., React, Angular or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param productRenderingFunction
   */
  @Method() public async setRenderFunction(
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
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.productListing = buildProductListing(this.bindings.engine);
      this.summary = this.productListing.summary();
    } else {
      this.search = buildSearch(this.bindings.engine);
      this.summary = this.search.summary();
    }

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

    this.productListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.productState.products.length,
      getIsLoading: () => this.productState.isLoading,
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
    const child = event.detail.child;

    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.productListing.promoteChildToParent(child);
    } else if (this.bindings.interfaceElement.type === 'search') {
      this.search.promoteChildToParent(child);
    }
  }

  get productState() {
    return this.bindings.interfaceElement.type === 'product-listing'
      ? this.productListingState
      : this.searchState;
  }

  public render() {
    const listClasses = this.computeListDisplayClasses();

    const {firstRequestExecuted, hasError, hasProducts} = this.summaryState;
    return (
      <ItemListGuard
        hasError={hasError}
        hasTemplate={this.resultTemplateRegistered}
        templateHasError={this.productTemplateProvider.hasError}
        firstRequestExecuted={firstRequestExecuted}
        hasItems={hasProducts}
      >
        <DisplayWrapper display={this.display} listClasses={listClasses}>
          <ResultsPlaceholdersGuard
            density={this.density}
            display={this.display}
            imageSize={this.imageSize}
            displayPlaceholders={!this.isAppLoaded}
            numberOfPlaceholders={this.numberOfPlaceholders}
          ></ResultsPlaceholdersGuard>
          {this.display === 'table'
            ? this.renderAsTable()
            : this.display === 'grid'
              ? this.renderAsGrid()
              : this.renderAsList()}
        </DisplayWrapper>
      </ItemListGuard>
    );
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !this.isAppLoaded;

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,

      this.productState?.isLoading,
      displayPlaceholders
    );
  }

  private logWarningIfNeeded(message?: string) {
    if (message) {
      this.bindings.engine.logger.warn(message);
    }
  }

  private getInteractiveProduct(product: Product) {
    const parentController =
      this.bindings.interfaceElement.type === 'product-listing'
        ? this.productListing
        : this.search;

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
        this.productState.responseId,
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
    return this.productState.products.map((product, i) => {
      const propsForAtomicProduct = this.getPropsForAtomicProduct(product);
      const {interactiveProduct} = propsForAtomicProduct;
      return (
        <DisplayGrid
          selectorForItem="atomic-product"
          item={{
            ...product,
            clickUri: product.clickUri,
            title: product.ec_name ?? 'temp',
          }}
          {...propsForAtomicProduct.interactiveProduct}
          setRef={(element) =>
            element && this.productListCommon.setNewResultRef(element, i)
          }
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
        >
          <atomic-product {...propsForAtomicProduct}></atomic-product>
        </DisplayGrid>
      );
    });
  }

  private renderAsTable() {
    if (this.productState.products.length > 0) {
      return;
    }
    const listClasses = this.computeListDisplayClasses();
    const firstItem = this.productState.products[0];

    const propsForTableColumns = {
      firstItem,
      templateContentForFirstItem:
        this.productTemplateProvider.getTemplateContent(firstItem),
    };

    return (
      <DisplayTable
        {...propsForTableColumns}
        listClasses={listClasses}
        logger={this.bindings.engine.logger}
        itemRenderingFunction={this.itemRenderingFunction}
        host={this.host}
      >
        {this.productState.products.map((product, i) => {
          const propsForAtomicProduct = this.getPropsForAtomicProduct(product);
          return (
            <DisplayTableRow
              {...propsForAtomicProduct}
              rowIndex={i}
              setRef={(element) =>
                element && this.productListCommon.setNewResultRef(element, i)
              }
            >
              <DisplayTableData
                {...propsForTableColumns}
                {...propsForAtomicProduct}
                renderItem={(content) => {
                  return (
                    <atomic-product
                      {...this}
                      {...propsForAtomicProduct}
                      content={content}
                    ></atomic-product>
                  );
                }}
              ></DisplayTableData>
            </DisplayTableRow>
          );
        })}
      </DisplayTable>
    );
  }

  private renderAsList() {
    return this.productState.products.map((product, i) => {
      const propsForAtomicProduct = this.getPropsForAtomicProduct(product);
      return (
        <atomic-product
          {...propsForAtomicProduct}
          ref={(element) =>
            element && this.productListCommon.setNewResultRef(element, i)
          }
          part="outline"
        ></atomic-product>
      );
    });
  }
}
