import {
  buildProductListing,
  ProductListingState,
  ProductListing,
  buildSearch,
  SearchState,
  Search,
  Product,
} from '@coveo/headless/commerce';
import {Component, Element, Prop, State, h} from '@stencil/core';
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
import {ItemTemplateProvider} from '../../common/item-list/item-template-provider';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
  getItemListDisplayClasses,
} from '../../common/layout/display-options';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

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
  private resultListCommon!: ItemListCommon;
  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstResultLoaded-');
  private itemTemplateProvider!: ItemTemplateProvider;
  private nextNewResultTarget?: FocusTargetController;

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

    this.itemTemplateProvider = new ItemTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.host.querySelectorAll('atomic-result-template')
      ),
      getResultTemplateRegistered: () => this.resultTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.resultTemplateRegistered = value;
      },
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
      bindings: this.bindings,
    });

    this.resultListCommon = new ItemListCommon({
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

  // TODO: Refactor to support result templates
  // TODO: Refactor to use guards/wrappers as in atomic-result-list
  public render() {
    if (
      this.productState.products.length === 0 &&
      !this.productState?.isLoading
    ) {
      return <div>No products found.</div>;
    }

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

  private getPropsForAtomicResult(result: Product) {
    return {
      // TODO: add back once the interactive result is implemented
      /* interactiveResult: buildInteractiveResult(this.bindings.engine, {
        options: {result},
      }), */
      result,
      renderingFunction: this.itemRenderingFunction,
      loadingFlag: this.loadingFlag,
      key: this.resultListCommon.getResultId(
        result.permanentid,
        this.productState.responseId,
        this.density,
        this.imageSize
      ),
      content: this.itemTemplateProvider.getTemplateContent(result),
      store: this.bindings.store,
      density: this.density,
      imageSize: this.imageSize,
      display: this.display,
    };
  }

  private renderAsGrid() {
    return this.productState.products.map((result, i) => {
      const propsForAtomicResult = this.getPropsForAtomicResult(result);
      return (
        <DisplayGrid
          item={{
            ...result,
            clickUri: result.clickUri,
            title: result.ec_name ?? 'temp',
          }}
          // TODO: add back once the interactive result is implemented
          //{...propsForAtomicResult?.interactiveResult}
          // TODO: Remove these back once the interactive result is implemented
          setRef={(element) =>
            element && this.resultListCommon.setNewResultRef(element, i)
          }
          select={function (): void {
            throw new Error('Function not implemented.');
          }}
          beginDelayedSelect={function (): void {
            throw new Error('Function not implemented.');
          }}
          cancelPendingSelect={function (): void {
            throw new Error('Function not implemented.');
          }}
        >
          <atomic-result {...this} {...propsForAtomicResult}></atomic-result>
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
        this.itemTemplateProvider.getTemplateContent(firstItem),
    };

    return (
      <DisplayTable
        {...propsForTableColumns}
        listClasses={listClasses}
        logger={this.bindings.engine.logger}
        itemRenderingFunction={this.itemRenderingFunction}
        host={this.host}
      >
        {this.productState.products.map((result, i) => {
          const propsForAtomicResult = this.getPropsForAtomicResult(result);
          return (
            <DisplayTableRow
              {...propsForAtomicResult}
              rowIndex={i}
              setRef={(element) =>
                element && this.resultListCommon.setNewResultRef(element, i)
              }
            >
              <DisplayTableData
                {...propsForTableColumns}
                {...propsForAtomicResult}
                renderItem={(content) => {
                  return (
                    <atomic-result
                      {...this}
                      {...propsForAtomicResult}
                      content={content}
                    ></atomic-result>
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
    return this.productState.products.map((result, i) => {
      const propsForAtomicResult = this.getPropsForAtomicResult(result);
      return (
        <atomic-result
          {...this}
          {...propsForAtomicResult}
          ref={(element) =>
            element && this.resultListCommon.setNewResultRef(element, i)
          }
          part="outline"
        ></atomic-result>
      );
    });
  }
}
