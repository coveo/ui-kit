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
  buildCategoryFieldSuggestions,
  type CategoryFieldSuggestions,
} from './headless-category-field-suggestions.js';

/**
 * @alpha
 * @deprecated
 */
export type GeneratedFieldSuggestionsControllers =
  Array<CategoryFieldSuggestions>;

/**
 * The `FieldSuggestionsGenerator` controller is responsible for generating field suggestions controllers for a given commerce engine.
 *
 * @group Buildable controllers
 * @category FieldSuggestionsGenerator
 * @alpha
 * @deprecated
 */
export interface FieldSuggestionsGenerator extends Controller {
  /**
   * The facet controllers created by the facet generator.
   */
  fieldSuggestions: GeneratedFieldSuggestionsControllers;

  /**
   * The state of the field suggestions generator.
   */
  state: FieldSuggestionsFacet[];
}

/**
 * Builds a field suggestions generator controller for a given commerce engine.
 * @param engine The commerce engine.
 * @returns The field suggestions generator controller.
 *
 * @group Buildable controllers
 * @category FieldSuggestionsGenerator
 * @alpha
 * @deprecated
 */
export function buildFieldSuggestionsGenerator(
  engine: CommerceEngine
): FieldSuggestionsGenerator {
  if (!loadFieldSuggestionsGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const commonOptions = {
    fetchProductsActionCreator: executeSearch,
    facetResponseSelector,
    isFacetLoadingResponseSelector,
    facetSearch: {type: 'SEARCH' as FacetSearchType},
  };

  const controller = buildController(engine);

  const createFieldSuggestionsControllers = createSelector(
    (state: CommerceEngineState) => state.fieldSuggestionsOrder,
    (facetOrder) =>
      facetOrder.map(({type, facetId}) => {
        if (type !== 'hierarchical') {
          return;
        }
        return buildCategoryFieldSuggestions(engine, {
          facetId,
          ...commonOptions,
        });
      })
  );

  return {
    ...controller,

    get fieldSuggestions() {
      return createFieldSuggestionsControllers(engine[stateKey]).filter(
        (v) => v !== undefined
      );
    },

    get state() {
      return engine[stateKey].fieldSuggestionsOrder;
    },
  };
}

function loadFieldSuggestionsGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FieldSuggestionsOrderSection> {
  engine.addReducers({
    fieldSuggestionsOrder,
  });
  return true;
}
