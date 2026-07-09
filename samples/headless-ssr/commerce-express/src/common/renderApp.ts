import type {
  FacetGenerator as FacetGeneratorController,
  Pagination as PaginationController,
  ProductList,
  SearchBox,
  Sort as SortController,
  Summary,
} from '@coveo/headless/ssr-commerce';
import {ErrorMessage} from '../components/ErrorMessage.js';
import {renderFacets, selectFacets} from '../components/Facets.js';
import {renderHeader} from '../components/Header.js';
import {renderPagination, selectPagination} from '../components/Pagination.js';
import {renderProductGrid, selectProducts} from '../components/ProductGrid.js';
import {formatQuerySummary, selectSummary} from '../components/QuerySummary.js';
import {selectSearchValue} from '../components/Search.js';
import {renderSort, selectSort} from '../components/Sort.js';
import type {AppStaticState} from './types.js';
import {escapeHtml} from './utils.js';

export const renderApp = (
  staticState: AppStaticState,
  activePath = '/search'
) => {
  const {controllers} = staticState;

  // The search box only exists in the search solution; listing pages omit it.
  const searchBox =
    'searchBox' in controllers
      ? (controllers.searchBox as SearchBox)
      : undefined;
  const searchValue = searchBox ? selectSearchValue(searchBox) : '';

  const products = selectProducts(controllers.productList as ProductList);
  const summary = selectSummary(controllers.summary as Summary);
  const pagination = selectPagination(
    controllers.pagination as PaginationController
  );
  const hasPages = pagination.totalPages > 1;
  const sort = selectSort(controllers.sort as SortController);
  const hasSorts = sort.availableSorts.length > 0;
  const facets = selectFacets(
    controllers.facetGenerator as FacetGeneratorController
  );
  const facetsHtml = renderFacets(facets);

  return `
    <div class="Layout">
      ${renderHeader(activePath)}

      <main class="Page">
        <form class="SearchBox" method="GET" action="/search" role="search">
          <div class="SearchBoxField">
            <input
              type="search"
              id="search-input"
              class="SearchBoxInput"
              name="q"
              placeholder="Search for products..."
              value="${escapeHtml(searchValue)}"
              aria-label="Search for products"
            />
          </div>
          <button id="search-button" class="SearchBoxSubmit" type="submit">Search</button>
        </form>

        <div class="PageLayout">
          <aside class="Sidebar">
            <nav id="facets" class="Facets" aria-label="Filters" style="display: ${facetsHtml ? 'flex' : 'none'};">
              ${facetsHtml}
            </nav>
          </aside>

          <section class="Results">
            <div class="Toolbar">
              <div id="query-summary" class="Summary">
                ${formatQuerySummary(summary)}
              </div>
              <div id="sort" class="Sort" style="display: ${hasSorts ? 'flex' : 'none'};">
                ${hasSorts ? renderSort(sort) : ''}
              </div>
            </div>

            <ul id="product-grid" class="ProductList" aria-label="Product List">
              ${renderProductGrid(products)}
            </ul>

            <div id="no-products" class="NoProducts" style="display: ${products.length === 0 ? 'block' : 'none'};">
              No products found. Try adjusting your search.
            </div>

            <nav id="pagination" class="Pagination" aria-label="Pagination" style="display: ${hasPages ? 'flex' : 'none'};">
              ${hasPages ? renderPagination(pagination) : ''}
            </nav>

            ${ErrorMessage()}
          </section>
        </div>
      </main>
    </div>
  `;
};
