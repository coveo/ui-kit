import {createSelector} from '@reduxjs/toolkit';
import {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response.js';
import {SpecificFacetSearchResult} from '../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {getFacetIdWithCommerceFieldSuggestionNamespace} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {
  CommerceFacetSetSection,
  FacetSearchSection,
  FieldSuggestionsOrderSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller.js';
import {FacetControllerType} from '../core/facets/headless-core-commerce-facet.js';
import {
  buildRegularFacetSearch,
  RegularFacetSearchState,
} from '../core/facets/regular/headless-commerce-regular-facet-search.js';
import {RegularFacetOptions} from '../core/facets/regular/headless-commerce-regular-facet.js';

export type {SpecificFacetSearchResult};

export type FieldSuggestionsState = RegularFacetSearchState &
  Pick<FieldSuggestionsFacet, 'facetId' | 'displayName' | 'field'>;

/**
 * The `FieldSuggestions` controller provides query suggestions based on a particular facet field.
 *
 * For example, you could use this controller to provide auto-completion suggestions while the end user is typing an item title.
 *
 * This controller is a wrapper around the basic facet controller search functionality, and thus exposes similar options and properties.
 */
export interface FieldSuggestions
  extends Controller,
    FacetControllerType<'regular'> {
  /**
   * Requests field suggestions based on a query.
   *
   * @param text - The query to search.
   */
  updateText(text: string): void;

  /**
   * Requests field suggestions based on a query.
   */
  search(): void;

  /**
   * Filters the search using the specified value.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   */
  select(value: SpecificFacetSearchResult): void;

  /**
   * Filters the search using the specified value, deselecting others.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value while deselecting other facet values.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   */
  singleSelect(value: SpecificFacetSearchResult): void;

  /**
   * Resets the query and empties the suggestions.
   */
  clear(): void;

  state: FieldSuggestionsState;
}

/**
 * Creates a `FieldSuggestions` controller instance.
 *
 * This controller initializes a facet under the hood, but exposes state and methods that are relevant for suggesting field values based on a query.
 * It's important not to initialize a facet with the same `facetId` but different options, because only the options of the controller which is built first will be taken into account.
 *
 * @param engine The headless engine.
 * @param options The `FieldSuggestions` options used internally.
 * @returns A `FieldSuggestions` controller instance.
 */
export function buildFieldSuggestions(
  engine: CommerceEngine,
  options: RegularFacetOptions
): FieldSuggestions {
  if (!loadFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;

  const namespacedFacetId = getFacetIdWithCommerceFieldSuggestionNamespace(
    options.facetId
  );
  const facetSearch = buildRegularFacetSearch(engine, {
    options: {facetId: namespacedFacetId, ...options.facetSearch},
    select: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    exclude: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    isForFieldSuggestions: true,
  });

  const getState = () => engine[stateKey];

  const getFacetForFieldSuggestions = (facetId: string) => {
    return getState().fieldSuggestionsOrder.find(
      (facet) => facet.facetId === facetId
    )!;
  };

  const controller = buildController(engine);

  const facetSearchStateSelector = createSelector(
    (state: CommerceEngineState) => state.facetSearchSet[namespacedFacetId],
    (facetSearch) => ({
      isLoading: facetSearch.isLoading,
      moreValuesAvailable: facetSearch.response.moreValuesAvailable,
      query: facetSearch.options.query,
      values: facetSearch.response.values,
    })
  );

  return {
    ...controller,
    ...facetSearch,

    updateText: function (text: string) {
      facetSearch.updateText(text);
      facetSearch.search();
    },

    get state() {
      const facet = getFacetForFieldSuggestions(options.facetId);
      return {
        displayName: facet.displayName,
        field: facet.field,
        facetId: facet.facetId,
        ...facetSearchStateSelector(getState()),
      };
    },

    type: 'regular',
  };
}

function loadFieldSuggestionsReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  FieldSuggestionsOrderSection & CommerceFacetSetSection & FacetSearchSection
> {
  engine.addReducers({fieldSuggestionsOrder, commerceFacetSet, facetSearchSet});
  return true;
}
