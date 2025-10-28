import {
  buildProductListing,
  buildSearch,
  type Pagination,
  type PaginationState,
  type ProductListing,
  type ProductListingState,
  type Search,
  type SearchState,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderLoadMoreButton} from '@/src/components/common/load-more/button';
import {renderLoadMoreContainer} from '@/src/components/common/load-more/container';
import {renderLoadMoreProgressBar} from '@/src/components/common/load-more/progress-bar';
import {renderLoadMoreSummary} from '@/src/components/common/load-more/summary';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * The `atomic-commerce-load-more-products` component allows the user to load additional products if more are available.
 *
 * @part container - The container of the component.
 * @part showing-results - The summary displaying which products are shown and how many are available.
 * @part highlight - The highlighted number of products displayed and number of products available.
 * @part progress-bar - The progress bar displaying a percentage of products shown over the total number of products available.
 * @part load-more-results-button - The "Load more products" button.
 *
 * @cssprop --atomic-more-results-progress-bar-color-from - Color of the start of the gradient for the load more products progress bar.
 * @cssprop --atomic-more-results-progress-bar-color-to - Color of the end of the gradient for the load more products progress bar.
 */
@customElement('atomic-commerce-load-more-products')
@bindings()
@withTailwindStyles
export class AtomicCommerceLoadMoreProducts
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  @state()
  public error!: Error;

  public pagination!: Pagination;
  public listingOrSearch!: ProductListing | Search;

  @state()
  private isAppLoaded = false;

  @bindStateToController('pagination')
  @state()
  private paginationState!: PaginationState;

  @bindStateToController('listingOrSearch')
  @state()
  private productListingOrSearchState!: ProductListingState | SearchState;

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

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.shouldRender, () =>
      renderLoadMoreContainer()(html`
        ${renderLoadMoreSummary({
          props: {
            from: this.lastProduct,
            to: this.paginationState.totalEntries,
            i18n: this.bindings.i18n,
            label: 'showing-products-of-load-more',
          },
        })}
        ${renderLoadMoreProgressBar({
          props: {
            from: this.lastProduct,
            to: this.paginationState.totalEntries,
          },
        })}
        ${renderLoadMoreButton({
          props: {
            i18n: this.bindings.i18n,
            label: 'load-more-products',
            moreAvailable: this.lastProduct < this.paginationState.totalEntries,
            onClick: () => this.onClick(),
          },
        })}
      `)
    )}`;
  }

  private get lastProduct() {
    return this.productListingOrSearchState.products.length;
  }

  private async onClick() {
    this.bindings.store.state.resultList?.focusOnNextNewResult();
    this.pagination.fetchMoreProducts();
  }

  private get shouldRender() {
    return this.isAppLoaded && this.paginationState.totalEntries > 0;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-load-more-products': AtomicCommerceLoadMoreProducts;
  }
}
