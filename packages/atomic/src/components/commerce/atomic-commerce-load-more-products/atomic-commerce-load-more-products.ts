import {bindStateToController} from '@/src/decorators/bind-state';
import {bindings} from '@/src/decorators/bindings';
import {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
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
import {CSSResultGroup, html, unsafeCSS, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {createAppLoadedListener} from '../../common/interface/store';
import {renderLoadMoreButton} from '../../common/load-more/button';
import {renderLoadMoreContainer} from '../../common/load-more/container';
import {renderLoadMoreProgressBar} from '../../common/load-more/progress-bar';
import {renderLoadMoreSummary} from '../../common/load-more/summary';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-commerce-load-more-products.tw.css';

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
@customElement('atomic-commerce-load-more-products')
@bindings()
@withTailwindStyles
export class AtomicCommerceLoadMoreProducts
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  @state()
  bindings!: CommerceBindings;

  public pagination!: Pagination;
  public listingOrSearch!: ProductListing | Search;

  @bindStateToController('pagination')
  @state()
  private paginationState!: PaginationState;

  @bindStateToController('listingOrSearch')
  @state()
  private productListingOrSearchState!: ProductListingState | SearchState;

  @state() public error!: Error;
  @state() private isAppLoaded = false;

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
    this.bindings.store.state.resultList?.focusOnNextNewResult();
    this.pagination.fetchMoreProducts();
  }

  private renderLoadMoreGuard() {
    if (!this.isAppLoaded || this.paginationState.totalEntries <= 0) {
      return nothing;
    }

    const {i18n} = this.bindings;
    return renderLoadMoreContainer()(html`
      ${renderLoadMoreSummary({
        props: {
          from: this.lastProduct,
          to: this.paginationState.totalEntries,
          i18n,
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
          i18n,
          label: 'load-more-products',
          moreAvailable: this.lastProduct < this.paginationState.totalEntries,
          onClick: () => this.onClick(),
        },
      })}
    `);
  }

  render() {
    return this.renderLoadMoreGuard();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-load-more-products': AtomicCommerceLoadMoreProducts;
  }
}
