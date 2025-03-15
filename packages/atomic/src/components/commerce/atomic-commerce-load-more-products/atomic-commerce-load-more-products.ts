import {bindStateToController} from '@/src/decorators/bind-state';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {TailwindLitElement} from '@/src/utils/tailwind.element';
import {
  Pagination,
  PaginationState,
  ProductListing,
  ProductListingState,
  Search,
  SearchState,
  buildProductListing,
  buildSearch,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createAppLoadedListener} from '../../common/interface/store';
import {loadMoreButton} from '../../common/load-more/button';
import {loadMoreContainer} from '../../common/load-more/container';
import {loadMoreProgressBar} from '../../common/load-more/progress-bar';
import {loadMoreSummary} from '../../common/load-more/summary';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-load-more-products` component allows the user to load additional products if more are available.
 *
 * @part container - The container of the component.
 * @part summary - The summary displaying which products are shown and how many are available.
 * @part highlight - The highlighted number of products displayed and number of products available.
 * @part progress-bar - The progress bar displaying a percentage of results shown over the total number of products available.
 * @part button - The "Load more products" button.
 * @cssproperty --atomic-more-items-progress-bar-color-from: Color of the start of the gradient for the load more items progress bar.
 * @cssproperty --atomic-more-items-progress-bar-color-to: Color of the end of the gradient for the load more items progress bar.
 *
 * Deprecated APIs:
 *
 * @part load-more-results-button - The "Load more products" button. Deprecated in favor of `button`.
 * @part showing-results - The summary displaying which products are shown and how many are available. Deprecated in favor of `summary`.
 * @cssproperty --atomic-more-results-progress-bar-color-from: Color of the start of the gradient for the load more results progress bar. Deprecated in favor of `--atomic-more-items-progress-bar-color-from` and `--atomic-more-items-progress-bar-color-to`.
 * @cssproperty --atomic-more-results-progress-bar-color-to: Color of the end of the gradient for the load more results progress bar. Deprecated in favor of `--atomic-more-items-progress-bar-color-from` and `--atomic-more-items-progress-bar-color-to`.
 *
 * @alpha
 */
@customElement('atomic-commerce-load-more-products')
export class AtomicCommerceLoadMoreProducts extends InitializeBindingsMixin(
  TailwindLitElement
) {
  static styles = [TailwindLitElement.styles];

  @state()
  bindings!: CommerceBindings;

  @state()
  pagination!: Pagination;

  @state()
  listingOrSearch!: ProductListing | Search;

  @state()
  error!: Error;

  @state()
  isAppLoaded = false;

  @state()
  @bindStateToController('listingOrSearch')
  productListingOrSearchState!: ProductListingState | SearchState;

  @state()
  @bindStateToController('pagination')
  paginationState!: PaginationState;

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
    return this.productListingOrSearchState?.products?.length ?? 0;
  }

  private async onClick() {
    this.bindings.store.state.resultList?.focusOnNextNewResult();
    this.pagination.fetchMoreProducts();
  }

  render() {
    return html`${when(this.isAppLoaded && this.lastProduct > 0, () =>
      loadMoreContainer(html`
        ${loadMoreSummary({
          i18n: this.bindings.i18n,
          from: this.lastProduct,
          to: this.paginationState.totalEntries,
          label: 'showing-products-of-load-more',
        })}
        ${loadMoreProgressBar({
          from: this.lastProduct,
          to: this.paginationState.totalEntries,
        })}
        ${loadMoreButton({
          i18n: this.bindings.i18n,
          moreAvailable: this.lastProduct < this.paginationState.totalEntries,
          label: 'load-more-products',
          onClick: () => this.onClick(),
        })}
      `)
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-load-more-products': AtomicCommerceLoadMoreProducts;
  }
}
