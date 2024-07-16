import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice';
import {FieldSuggestionsFacet} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-state';
import {executeSearch} from '../../../features/commerce/search/search-actions';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from '../search/facets/headless-search-facet-options';
import {
  buildCategoryFieldSuggestions,
  CategoryFieldSuggestions,
} from './headless-category-field-suggestions';
import {
  buildFieldSuggestions,
  FieldSuggestions,
} from './headless-field-suggestions';

export type GeneratedFieldSuggestionsControllers = Array<
  FieldSuggestions | CategoryFieldSuggestions
>;

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
  };

  const controller = buildController(engine);

  const createFieldSuggestionsControllers = createSelector(
    (state: CommerceEngineState) => state.fieldSuggestionsOrder!,
    (state: CommerceEngineState) => state.commerceFacetSet,
    (state: CommerceEngineState) => state.facetSearchSet,
    (state: CommerceEngineState) => state.categoryFacetSearchSet,
    (facetOrder, _commerceFacetSet, _facetSearchSet, _categoryFacetSearchSet) =>
      facetOrder.map(({type, facetId}) => {
        switch (type) {
          case 'hierarchical':
            return buildCategoryFieldSuggestions(engine, {
              facetId,
              ...commonOptions,
            });
          default:
          case 'regular':
            return buildFieldSuggestions(engine, {facetId, ...commonOptions});
        }
      })
  );

  return {
    ...controller,

    get fieldSuggestions() {
      return createFieldSuggestionsControllers(engine[stateKey]);
    },

    get state() {
      return engine[stateKey].fieldSuggestionsOrder!;
    },
  };
}

function loadFieldSuggestionsGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({
    fieldSuggestionsOrder,
    commerceFacetSet,
    facetSearchSet,
    categoryFacetSearchSet,
  });
  return true;
}
