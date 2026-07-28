import {
  buildContext,
  buildInstantProducts,
  buildSearch,
  buildSearchBox,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {engine} from '../engine.js';
import {baseStyles, layoutStyles} from '../shared-styles.js';
import './breadcrumbs.js';
import './facet-list.js';
import './pager.js';
import './product-list.js';
import './search-box.js';
import './sort-dropdown.js';

/**
 * Full-text search page: search box with suggestions, facets, sort, product
 * results, and pagination.
 *
 * The page owns the buildable `Search` controller and its sort/pagination
 * sub-controllers, then hands each one to a component that subscribes to it and
 * renders itself. The page's only job at runtime is to trigger the first query.
 */
export class SearchPage extends LitElement {
  static styles = [baseStyles, layoutStyles];

  constructor() {
    super();
    buildContext(engine).setView({url: 'https://sports.barca.group/search'});

    this.search = buildSearch(engine);
    this.searchBox = buildSearchBox(engine, {
      options: {id: 'search-box'},
    });
    this.instantProducts = buildInstantProducts(engine, {
      options: {searchBoxId: 'search-box'},
    });
    this.sortController = this.search.sort();
    this.paginationController = this.search.pagination({
      options: {pageSize: 12},
    });
  }

  // See HomePage: trigger the first query once the child components have
  // mounted and subscribed, so nothing is missed if the response is fast.
  firstUpdated() {
    this.search.executeFirstSearch();
  }

  render() {
    return html`
      <commerce-search-box
        .controller=${this.searchBox}
        .instantProducts=${this.instantProducts}
      ></commerce-search-box>
      <div class="interface">
        <div class="toolbar">
          <commerce-sort-dropdown .controller=${this.sortController}></commerce-sort-dropdown>
        </div>
        <aside class="facets">
          <commerce-facet-list .controller=${this.search}></commerce-facet-list>
        </aside>
        <div class="results">
          <commerce-breadcrumbs .controller=${this.search}></commerce-breadcrumbs>
          <commerce-product-list
            .controller=${this.search}
            .cart=${this.cart}
          ></commerce-product-list>
          <commerce-pager .controller=${this.paginationController}></commerce-pager>
        </div>
      </div>
    `;
  }
}

customElements.define('commerce-search-page', SearchPage);
