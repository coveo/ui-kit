import {createSelector} from '@reduxjs/toolkit';
import type {FacetSearchType} from '../../../api/commerce/facet-search/facet-search-request.js';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import type {FieldSuggestionsFacet} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-state.js';
import {executeSearch} from '../../../features/commerce/search/search-actions.js';
import type {FieldSuggestionsOrderSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from '../search/facets/headless-search-facet-options.js';
import {
  buildCategoryFilterSuggestions,
  type CategoryFilterSuggestions,
} from './headless-category-filter-suggestions.js';
import {
  buildFilterSuggestions,
  type FilterSuggestions,
} from './headless-filter-suggestions.js';

export type GeneratedFilterSuggestionsControllers = Array<
  FilterSuggestions | CategoryFilterSuggestions
>;

/**
 * The `FilterSuggestionsGenerator` controller is responsible for generating filter suggestions controllers for a given
 * commerce engine.
 *
 * @alpha  This controller relies on a Commerce API functionality that is not yet generally available. If you wish to use this
 * feature in an implementation, please contact your Coveo representative.
 *
 * @group Buildable controllers
 * @category FilterSuggestionsGenerator
 */
export interface FilterSuggestionsGenerator extends Controller {
  /**
   * The filter suggestions controllers created by the filter suggestions generator.
   */
  filterSuggestions: GeneratedFilterSuggestionsControllers;

  /**
   * The state of the filter suggestions generator.
   */
  state: FieldSuggestionsFacet[];
}

/**
 * Builds a filter suggestions generator controller for a given commerce engine.
 * @param engine - The commerce engine.
 * @returns The filter suggestions generator controller.
 *
 * @alpha  This controller relies on a Commerce API functionality that is not yet generally available. If you wish to
 * use this feature in an implementation, please contact your Coveo representative.
 *
 * @group Buildable controllers
 * @category FilterSuggestionsGenerator
 */
export function buildFilterSuggestionsGenerator(
  engine: CommerceEngine
): FilterSuggestionsGenerator {
  if (!loadFilterSuggestionsGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const commonOptions = {
    fetchProductsActionCreator: executeSearch,
    facetResponseSelector,
    isFacetLoadingResponseSelector,
    facetSearch: {type: 'SEARCH' as FacetSearchType},
  };

  const controller = buildController(engine);

  const createFacetedSearchControllers = createSelector(
    (state: CommerceEngineState) => state.fieldSuggestionsOrder,
    (facetOrder) =>
      facetOrder.map(({type, facetId}) => {
        switch (type) {
          case 'hierarchical':
            return buildCategoryFilterSuggestions(engine, {
              facetId,
              ...commonOptions,
            });
          default:
            return buildFilterSuggestions(engine, {facetId, ...commonOptions});
        }
      })
  );

  return {
    ...controller,

    get filterSuggestions() {
      return createFacetedSearchControllers(engine[stateKey]);
    },

    get state() {
      return engine[stateKey].fieldSuggestionsOrder;
    },
  };
}

function loadFilterSuggestionsGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FieldSuggestionsOrderSection> {
  engine.addReducers({
    fieldSuggestionsOrder,
  });
  return true;
}
