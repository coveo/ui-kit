import {buildContext, buildProductListing} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {engine} from '../engine.js';
import {baseStyles, layoutStyles} from '../shared-styles.js';
import './breadcrumbs.js';
import './facet-list.js';
import './pager.js';
import './product-list.js';
import './sort-dropdown.js';

/**
 * Category (product listing) page. Unlike search, there is no query or search
 * box: the listing is driven by the view URL set on the context, and the
 * `ProductListing` controller returns the products, facets, sort, and
 * pagination for that category.
 */
export class ListingPage extends LitElement {
  static styles = [baseStyles, layoutStyles];

  constructor() {
    super();
    buildContext(engine).setView({
      url: 'https://sports.barca.group/browse/promotions/surf-accessories',
    });

    this.listing = buildProductListing(engine);
    this.sortController = this.listing.sort();
    this.paginationController = this.listing.pagination({
      options: {pageSize: 12},
    });
  }

  // See HomePage: trigger the fetch once the child components have mounted and
  // subscribed, so nothing is missed if the response is fast.
  firstUpdated() {
    this.listing.refresh();
  }

  render() {
    return html`
      <div class="interface">
        <div class="toolbar">
          <commerce-sort-dropdown .controller=${this.sortController}></commerce-sort-dropdown>
        </div>
        <aside class="facets">
          <commerce-facet-list .controller=${this.listing}></commerce-facet-list>
        </aside>
        <div class="results">
          <commerce-breadcrumbs .controller=${this.listing}></commerce-breadcrumbs>
          <commerce-product-list
            .controller=${this.listing}
            .cart=${this.cart}
          ></commerce-product-list>
          <commerce-pager .controller=${this.paginationController}></commerce-pager>
        </div>
      </div>
    `;
  }
}

customElements.define('commerce-listing-page', ListingPage);
