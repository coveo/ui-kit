/**
 * Client-side hydration for the Coveo Headless Commerce SSR sample.
 *
 * On load it:
 * 1. Reads the SSR payload the server injected (`window.__SSR_STATE__`).
 * 2. Hydrates the matching engine (search or listing), passing the same
 *    fetch-time props (context, parameter manager) the server used so the
 *    hydrated state matches the server render.
 * 3. Wires each UI concern to its hydrated controller (the search box only
 *    exists on the search page).
 *
 * See server.ts for the server side, and each components/*.ts for the render
 * function paired with these hydrate functions.
 */
import {hydrateCart} from './components/Cart.js';
import {ErrorMessage} from './components/ErrorMessage.js';
import {hydrateFacets} from './components/Facets.js';
import {hydratePagination} from './components/Pagination.js';
import {hydrateParameterManager} from './components/ParameterManager.js';
import {hydrateProductGrid} from './components/ProductGrid.js';
import {hydrateSummary} from './components/QuerySummary.js';
import {hydrateSearch} from './components/Search.js';
import {hydrateSort} from './components/Sort.js';
import {
  listingEngineDefinition,
  searchEngineDefinition,
} from './lib/engine-definition.js';
import type {AppControllers} from './common/types.js';

function wireControllers(controllers: AppControllers) {
  const currency = controllers.context.state.currency ?? 'USD';
  // The search box (and its query suggestions / instant products) only exists
  // on the search page.
  if ('searchBox' in controllers) {
    hydrateSearch(controllers.searchBox, controllers.instantProducts, currency);
  }
  hydrateProductGrid(controllers.productList, controllers.cart);
  hydrateSummary(controllers.summary);
  hydrateFacets(controllers.facetGenerator);
  hydrateSort(controllers.sort);
  hydratePagination(controllers.pagination);
  hydrateParameterManager(controllers.parameterManager);
  hydrateCart(controllers.cart, currency);
}

async function initApp() {
  const ssr = window.__SSR_STATE__;
  if (!ssr) return;

  try {
    const {navigatorContext} = ssr;
    let controllers: AppControllers;

    // Set the navigator context provider on the client (matching the server)
    // before hydrating, so client-side requests carry the same context.
    if (ssr.type === 'listing') {
      const {staticState} = ssr;
      listingEngineDefinition.setNavigatorContextProvider(
        () => navigatorContext
      );
      ({controllers} = await listingEngineDefinition.hydrateStaticState({
        searchActions: staticState.searchActions,
        controllers: {
          cart: {
            initialState: {items: staticState.controllers.cart.state.items},
          },
          context: staticState.controllers.context.state,
          parameterManager: {
            initialState: {
              parameters:
                staticState.controllers.parameterManager.state.parameters,
            },
          },
        },
      }));
    } else {
      const {staticState} = ssr;
      searchEngineDefinition.setNavigatorContextProvider(
        () => navigatorContext
      );
      ({controllers} = await searchEngineDefinition.hydrateStaticState({
        searchActions: staticState.searchActions,
        controllers: {
          cart: {
            initialState: {items: staticState.controllers.cart.state.items},
          },
          context: staticState.controllers.context.state,
          parameterManager: {
            initialState: {
              parameters:
                staticState.controllers.parameterManager.state.parameters,
            },
          },
        },
      }));
    }

    wireControllers(controllers);
  } catch (_error) {
    showError();
  }
}

/** Injects a generic error banner if hydration fails and none is shown yet. */
function showError() {
  if (document.getElementById('query-error')) return;
  const container = document.createElement('div');
  container.innerHTML = ErrorMessage('Something went wrong. Please try again.');
  const node = container.firstElementChild;
  if (node) {
    document.body.appendChild(node);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
