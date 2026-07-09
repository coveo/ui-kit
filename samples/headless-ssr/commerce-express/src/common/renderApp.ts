import {ErrorMessage} from '../components/ErrorMessage.js';
import {renderFacets} from '../components/Facets.js';
import {renderHeader} from '../components/Header.js';
import {renderPagination} from '../components/Pagination.js';
import {renderSummary} from '../components/QuerySummary.js';
import {renderProductGrid} from '../components/ProductGrid.js';
import {renderSearch} from '../components/Search.js';
import {renderSort} from '../components/Sort.js';
import type {AppStaticState} from './types.js';

/**
 * Assembles the page from the server-fetched static state: header, search box,
 * and the results area (facets rail + toolbar + product grid + pagination).
 *
 * Each concern renders its own fragment — wrapper element, ids, and initial
 * visibility included — so this module owns only layout and placement. The
 * matching client-side behavior lives in each `components/*.ts` hydrate
 * function (see client.ts).
 */
export const renderApp = (
  staticState: AppStaticState,
  activePath = '/search'
) => {
  const {controllers} = staticState;

  // The search box is search-only, but the form renders on every page (it GETs
  // to /search); listing pages just have no initial query to show.
  const searchValue =
    'searchBox' in controllers ? controllers.searchBox.state.value : '';

  return `
    <div class="Layout">
      ${renderHeader(activePath)}

      <main class="Page">
        ${renderSearch(searchValue)}

        <div class="PageLayout">
          <aside class="Sidebar">
            ${renderFacets(controllers.facetGenerator.state)}
          </aside>

          <section class="Results">
            <div class="Toolbar">
              ${renderSummary(controllers.summary.state)}
              ${renderSort(controllers.sort.state)}
            </div>

            ${renderProductGrid(controllers.productList.state)}

            ${renderPagination(controllers.pagination.state)}

            ${ErrorMessage()}
          </section>
        </div>
      </main>
    </div>
  `;
};
