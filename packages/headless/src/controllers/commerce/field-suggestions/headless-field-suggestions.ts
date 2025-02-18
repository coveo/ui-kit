import {createSelector} from '@reduxjs/toolkit';
import {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response.js';
import {SpecificFacetSearchResult} from '../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {clearAllCoreFacets} from '../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {getFacetIdWithCommerceFieldSuggestionNamespace} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import {searchSerializer} from '../../../features/commerce/parameters/parameters-serializer.js';
import {updateQuery} from '../../../features/commerce/query/query-actions.js';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice.js';
import {selectFacetSearchResult} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {
  CommerceFacetSetSection,
  CommerceQuerySection,
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

/**
 * The state of the `FieldSuggestions` controller.
 *
 * @group Buildable controllers
 * @category FieldSuggestions
 */
export type FieldSuggestionsState = RegularFacetSearchState &
  Pick<FieldSuggestionsFacet, 'facetId' | 'displayName' | 'field'>;

/**
 * The `FieldSuggestions` controller provides query suggestions based on a particular facet field.
 *
 * For example, you could use this controller to provide auto-completion suggestions while the end user is typing an item title.
 *
 * This controller is a wrapper around the basic facet controller search functionality, and thus exposes similar options and properties.
 *
 * @group Buildable controllers
 * @category FieldSuggestions
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
   * Filters the search using the specified value.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   */
  select(value: SpecificFacetSearchResult): void;

  /**
   * Returns a serialized query for the specified value.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   * @returns A serialized query for the specified value.
   */
  getRedirectionParameters(value: SpecificFacetSearchResult): string;

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
 *
 * @group Buildable controllers
 * @category FieldSuggestions
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
    select: () => {},
    exclude: () => {},
    isForFieldSuggestions: true,
  });

  const getState = () => engine[stateKey];

  const controller = buildController(engine);

  const facetForFieldSuggestionsSelector = createSelector(
    (state: CommerceEngineState) => state.fieldSuggestionsOrder,
    (facets) => facets.find((facet) => facet.facetId === options.facetId)!
  );

  const facetSearchStateSelector = createSelector(
    (state: CommerceEngineState) => state.facetSearchSet[namespacedFacetId],
    (facetSearch) => ({
      isLoading: facetSearch.isLoading,
      moreValuesAvailable: facetSearch.response.moreValuesAvailable,
      query: facetSearch.options.query,
      values: facetSearch.response.values,
    })
  );

  const {clear} = facetSearch;

  return {
    ...controller,

    clear,

    getRedirectionParameters: function (
      value: SpecificFacetSearchResult
    ): string {
      return searchSerializer.serialize({
        q: facetSearchStateSelector(getState()).query,
        f: {[options.facetId]: [value.rawValue]},
      });
    },

    select: function (value: SpecificFacetSearchResult) {
      dispatch(clearAllCoreFacets());
      dispatch(selectFacetSearchResult({facetId: options.facetId, value}));
      dispatch(
        updateQuery({
          query:
            engine[stateKey].facetSearchSet[namespacedFacetId].options.query,
        })
      );
      dispatch(options.fetchProductsActionCreator());
    },

    updateText: function (text: string) {
      facetSearch.updateText(text);
      facetSearch.search();
    },

    get state() {
      const {displayName, field, facetId} =
        facetForFieldSuggestionsSelector(getState());
      return {
        displayName,
        field,
        facetId,
        ...facetSearchStateSelector(getState()),
      };
    },

    type: 'regular',
  };
}

function loadFieldSuggestionsReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  CommerceFacetSetSection &
    CommerceQuerySection &
    FacetSearchSection &
    FieldSuggestionsOrderSection
> {
  engine.addReducers({
    commerceFacetSet,
    commerceQuery,
    facetSearchSet,
    fieldSuggestionsOrder,
  });
  return true;
}
