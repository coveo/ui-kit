import {
  buildProductListing,
  ProductListingState,
  ProductListing,
  buildSearch,
  SearchState,
  Search,
  Product,
} from '@coveo/headless/commerce';
import {Component, Element, Method, Prop, State, h} from '@stencil/core';
import {FocusTargetController} from '../../../utils/accessibility-utils';
import {
  BindStateToController,
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {randomID} from '../../../utils/utils';
import {ResultsPlaceholdersGuard} from '../../common/atomic-result-placeholder/placeholders';
import {DisplayGrid} from '../../common/item-list/display-grid';
import {
  DisplayTable,
  DisplayTableData,
  DisplayTableRow,
} from '../../common/item-list/display-table';
import {DisplayWrapper} from '../../common/item-list/display-wrapper';
import {ItemDisplayGuard} from '../../common/item-list/item-display-guard';
import {
  ItemListCommon,
  ItemRenderingFunction,
} from '../../common/item-list/item-list-common';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
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
  @State() private resultTemplateRegistered = false;
  @State() public error!: Error;
  @State() private templateHasError = false;

  /**
   * The desired layout to use when displaying products. Layouts affect how many products to display per row and how visually distinct they are from each other.
   */
  @Prop({reflect: true}) display: ItemDisplayLayout = 'grid';

  /**
   * The spacing of various elements in the product list, including the gap between products, the gap between parts of a product, and the font sizes of different parts in a product.
   */
  @Prop({reflect: true}) density: ItemDisplayDensity = 'normal';

  /**
   * The expected size of the image displayed for products.
   */
  @Prop({reflect: true}) imageSize: ItemDisplayImageSize = 'small';

  /**
   * The target location to open the product link (see [target](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target)).
   * This property is only leveraged when `display` is `grid`.
   * @defaultValue `_self`
   */
  @Prop() gridCellLinkTarget: ItemTarget = '_self';

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
      this.productListing.refresh();
    } else if (this.bindings.interfaceElement.type === 'search') {
      this.search = buildSearch(this.bindings.engine);
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
  }

  get productState() {
    return this.bindings.interfaceElement.type === 'product-listing'
      ? this.productListingState
      : this.searchState;
  }

  public render() {
    const listClasses = this.computeListDisplayClasses();

    return (
      <DisplayWrapper display={this.display} listClasses={listClasses}>
        <ResultsPlaceholdersGuard
          density={this.density}
          display={this.display}
          imageSize={this.imageSize}
          displayPlaceholders={!this.bindings.store.isAppLoaded()}
          numberOfPlaceholders={this.productState.products.length}
        ></ResultsPlaceholdersGuard>
        <ItemDisplayGuard
          firstRequestExecuted={!this.productState.isLoading}
          hasItems={this.productState.products.length > 0}
        >
          {this.display === 'table'
            ? this.renderAsTable()
            : this.display === 'grid'
              ? this.renderAsGrid()
              : this.renderAsList()}
        </ItemDisplayGuard>
      </DisplayWrapper>
    );
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !this.bindings.store.isAppLoaded();

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,

      this.productState?.isLoading,
      displayPlaceholders
    );
  }

  private getPropsForAtomicProduct(product: Product) {
    return {
      // TODO: add back once interactive result is implemented for products in KIT-3149
      /* interactiveResult: buildInteractiveResult(this.bindings.engine, {
        options: {result},
      }), */
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
      store: this.bindings.store,
      density: this.density,
      imageSize: this.imageSize,
      display: this.display,
    };
  }

  private renderAsGrid() {
    return this.productState.products.map((product, i) => {
      const propsForAtomicProduct = this.getPropsForAtomicProduct(product);
      return (
        <DisplayGrid
          item={{
            ...product,
            clickUri: product.clickUri,
            title: product.ec_name ?? 'temp',
          }}
          // TODO KIT-3149: add back once the interactive result is implemented
          //{...propsForAtomicProduct.interactiveResult}
          // TODO KIT-3149: Remove these back once the interactive result is implemented
          setRef={(element) =>
            element && this.productListCommon.setNewResultRef(element, i)
          }
          select={function (): void {
            throw new Error('Function not implemented. TODO KIT-3149');
          }}
          beginDelayedSelect={function (): void {
            throw new Error('Function not implemented. TODO KIT-3149');
          }}
          cancelPendingSelect={function (): void {
            throw new Error('Function not implemented. TODO KIT-3149');
          }}
        >
          <atomic-product {...this} {...propsForAtomicProduct}></atomic-product>
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
          {...this}
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
