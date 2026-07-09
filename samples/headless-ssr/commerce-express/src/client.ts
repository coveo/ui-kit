/**
 * Client-side hydration for Coveo Headless Commerce SSR sample.
 *
 * Client-side lifecycle:
 * 1. On page load, reads the SSR envelope injected by the server (see server.ts):
 *    `window.__SSR_STATE__ = {type, staticState}`.
 * 2. Hydrates the matching engine (search or listing). Controllers that require
 *    props at fetch time (context, parameterManager) receive the same props on
 *    the client so the hydrated state matches the server render.
 * 3. Initializes UI components with the hydrated controllers (the search box
 *    only exists on the search page).
 * 4. Handles errors gracefully if hydration fails.
 */
import type {
  CommerceSearchParameters,
  FacetGenerator as FacetGeneratorController,
  Pagination as PaginationController,
  ParameterManager as ParameterManagerController,
  ProductList,
  SearchBox,
  Sort as SortController,
  Summary,
} from '@coveo/headless/ssr-commerce';
import {ErrorMessage} from './components/ErrorMessage.js';
import {Facets} from './components/Facets.js';
import {Pagination} from './components/Pagination.js';
import {ParameterManager} from './components/ParameterManager.js';
import {ProductGrid} from './components/ProductGrid.js';
import {QuerySummary} from './components/QuerySummary.js';
import {Search} from './components/Search.js';
import {Sort} from './components/Sort.js';
import {
  listingEngineDefinition,
  searchEngineDefinition,
} from './lib/engine-definition.js';

// The controllers shared by the search and listing pages (the search box is
// search-only).
interface AppControllers {
  searchBox?: SearchBox;
  productList: ProductList;
  summary: Summary;
  facetGenerator: FacetGeneratorController;
  sort: SortController;
  pagination: PaginationController;
  parameterManager: ParameterManagerController<CommerceSearchParameters>;
}

function wireControllers(controllers: AppControllers) {
  if (controllers.searchBox) {
    Search(controllers.searchBox);
  }
  ProductGrid(controllers.productList);
  QuerySummary(controllers.summary);
  Facets(controllers.facetGenerator);
  Sort(controllers.sort);
  Pagination(controllers.pagination);
  ParameterManager(controllers.parameterManager);
}

async function initApp() {
  try {
    const ssr = window.__SSR_STATE__!;
    const {staticState, navigatorContext} = ssr;

    const hydrateOptions = {
      searchActions: staticState.searchActions,
      controllers: {
        context: staticState.controllers.context.state,
        parameterManager: {
          initialState: {
            parameters:
              staticState.controllers.parameterManager.state.parameters,
          },
        },
      },
    };

    // Set the navigator context provider on the client (matching the server)
    // before hydrating, so client-side requests carry the same context.
    let controllers;
    if (ssr.type === 'listing') {
      listingEngineDefinition.setNavigatorContextProvider(
        () => navigatorContext
      );
      ({controllers} = await listingEngineDefinition.hydrateStaticState(
        hydrateOptions as Parameters<
          typeof listingEngineDefinition.hydrateStaticState
        >[0]
      ));
    } else {
      searchEngineDefinition.setNavigatorContextProvider(
        () => navigatorContext
      );
      ({controllers} = await searchEngineDefinition.hydrateStaticState(
        hydrateOptions as Parameters<
          typeof searchEngineDefinition.hydrateStaticState
        >[0]
      ));
    }

    wireControllers(controllers as unknown as AppControllers);
  } catch (_error) {
    const err = document.getElementById('query-error');
    if (!err) {
      const container = document.createElement('div');
      container.innerHTML = ErrorMessage(
        'Something went wrong. Please try again.'
      );
      document.body.appendChild(container.firstElementChild!);
    }
  }
}

// ===== Boot =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
