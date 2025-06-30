import {
  Pagination,
  PaginationState,
  buildSearch,
  buildProductListing,
  ProductListing,
  Search,
  ProductListingState,
  SearchState,
} from '@coveo/headless/commerce';
import {Component, h, State} from '@stencil/core';
import {
  BindStateToController,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {createAppLoadedListener} from '../../common/interface/store';
import {LoadMoreGuard} from '../../common/load-more/guard';
import {LoadMoreButton} from '../../common/load-more/stencil-button';
import {LoadMoreContainer} from '../../common/load-more/stencil-container';
import {LoadMoreProgressBar} from '../../common/load-more/stencil-progress-bar';
import {LoadMoreSummary} from '../../common/load-more/stencil-summary';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-load-more-products` component allows the user to load additional products if more are available.
 *
 * @part container - The container of the component.
 * @part showing-results - The summary displaying which products are shown and how many are available.
 * @part highlight - The highlighted number of products displayed and number of products available.
 * @part progress-bar - The progress bar displaying a percentage of results shown over the total number of products available.
 * @part load-more-results-button - The "Load more products" button.
 *
 * @alpha
 */
@Component({
  tag: 'atomic-commerce-load-more-products',
  styleUrl: 'atomic-commerce-load-more-products.pcss',
  shadow: true,
})
export class AtomicCommerceLoadMoreProducts {
  @InitializeBindings() public bindings!: CommerceBindings;
  public pagination!: Pagination;
  public listingOrSearch!: ProductListing | Search;

  @BindStateToController('pagination')
  @State()
  private paginationState!: PaginationState;
  @BindStateToController('listingOrSearch')
  @State()
  private productListingOrSearchState!: ProductListingState | SearchState;

  @State() public error!: Error;
  @State() private isAppLoaded = false;

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.listingOrSearch = buildProductListing(this.bindings.engine);
    } else {
      this.listingOrSearch = buildSearch(this.bindings.engine);
    }
    this.pagination = this.listingOrSearch.pagination();

    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  private get lastProduct() {
    return this.productListingOrSearchState.products.length;
  }

  private async onClick() {
    // TODO KIT-4227: Once the focus mess is resolved, ensure that:
    // The focus is set on the next new result after loading more results **without scrolling**.
    //this.bindings.store.state.resultList?.focusOnNextNewResult();
    (document.activeElement as HTMLElement)?.blur(); // Blur the active element to avoid focus issues, remove when focus mess is resolved.
    this.pagination.fetchMoreProducts();
  }

  public render() {
    const {i18n} = this.bindings;
    return (
      <LoadMoreGuard
        hasResults={this.paginationState.totalEntries > 0}
        isLoaded={this.isAppLoaded}
      >
        <LoadMoreContainer>
          <LoadMoreSummary
            from={this.lastProduct}
            to={this.paginationState.totalEntries}
            i18n={i18n}
            label="showing-products-of-load-more"
          />
          <LoadMoreProgressBar
            from={this.lastProduct}
            to={this.paginationState.totalEntries}
          />
          <LoadMoreButton
            i18n={i18n}
            label={'load-more-products'}
            moreAvailable={this.lastProduct < this.paginationState.totalEntries}
            onClick={() => this.onClick()}
          />
        </LoadMoreContainer>
      </LoadMoreGuard>
    );
  }
}
