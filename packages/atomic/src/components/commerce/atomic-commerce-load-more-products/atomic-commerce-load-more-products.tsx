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
import {Button} from '../../common/button';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-load-more-results` component allows the user to load additional results if more are available.
 *
 * @part container - The container of the component.
 * @part showing-results - The summary displaying which results are shown and how many are available.
 * @part highlight - The highlighted number of results displayed and number of results available.
 * @part progress-bar - The progress bar displaying a percentage of results shown over the total number of results available.
 * @part load-more-results-button - The "Load more results" button.
 *
 * @internal
 */
@Component({
  tag: 'atomic-commerce-load-more-products',
  styleUrl: 'atomic-commerce-load-more-products.pcss',
  shadow: true,
})
export class AtomicLoadMoreProducts {
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

  public initialize() {
    if (this.bindings.interfaceElement.type === 'product-listing') {
      this.listingOrSearch = buildProductListing(this.bindings.engine);
    } else {
      this.listingOrSearch = buildSearch(this.bindings.engine);
    }
    this.pagination = this.listingOrSearch.pagination();
  }

  private wrapHighlight(content: string) {
    return `<span class="font-bold text-on-background" part="highlight">${content}</span>`;
  }

  private renderShowingResults() {
    const locale = this.bindings.i18n.language;
    const content = this.bindings.i18n.t('showing-results-of-load-more', {
      interpolation: {escapeValue: false},
      last: this.wrapHighlight(this.lastProduct.toLocaleString(locale)),
      total: this.wrapHighlight(
        this.paginationState.totalEntries.toLocaleString(locale)
      ),
    });

    return (
      // deepcode ignore ReactSetInnerHtml: This is not React code.
      <div
        class="my-2 text-lg text-neutral-dark"
        part="showing-results"
        innerHTML={content}
      ></div>
    );
  }

  private get lastProduct() {
    return this.productListingOrSearchState.products.length;
  }

  private renderProgressBar() {
    const percentage =
      (this.lastProduct / this.paginationState.totalEntries) * 100;
    const width = `${Math.ceil(percentage)}%`;
    return (
      <div
        part="progress-bar"
        class="relative w-72 h-1 my-2 rounded bg-neutral"
      >
        <div
          class="progress-bar absolute h-full left-0 top-0 z-1 overflow-hidden rounded bg-gradient-to-r"
          style={{width}}
        ></div>
      </div>
    );
  }

  private async onClick() {
    this.bindings.store.state.resultList?.focusOnNextNewResult();
    this.pagination.fetchMoreProducts();
  }

  private renderLoadMoreResults() {
    return (
      <Button
        style="primary"
        text={this.bindings.i18n.t('load-more-results')}
        part="load-more-results-button"
        class="font-bold my-2 p-3"
        onClick={() => this.onClick()}
      ></Button>
    );
  }

  public render() {
    if (
      !this.bindings.store.isAppLoaded() ||
      this.paginationState.totalEntries <= 0
    ) {
      return;
    }

    return (
      <div class="flex flex-col items-center" part="container">
        {this.renderShowingResults()}
        {this.renderProgressBar()}
        {this.paginationState.page < this.paginationState.totalPages &&
          this.renderLoadMoreResults()}
      </div>
    );
  }
}
