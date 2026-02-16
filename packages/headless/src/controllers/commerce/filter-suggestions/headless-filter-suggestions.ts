import {createSelector} from '@reduxjs/toolkit';
import type {FieldSuggestionsFacet} from '../../../api/commerce/search/query-suggest/query-suggest-response.js';
import type {SpecificFacetSearchResult} from '../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import type {
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
import type {
  CommerceFacetSetSection,
  CommerceQuerySection,
  FacetSearchSection,
  FieldSuggestionsOrderSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import type {FacetControllerType} from '../core/facets/headless-core-commerce-facet.js';
import type {RegularFacetOptions} from '../core/facets/regular/headless-commerce-regular-facet.js';
import {
  buildRegularFacetSearch,
  type RegularFacetSearchState,
} from '../core/facets/regular/headless-commerce-regular-facet-search.js';

/**
 * The state of the `FilterSuggestions` controller.
 *
 * @group Buildable controllers
 * @category FilterSuggestions
 */
export type FilterSuggestionsState = RegularFacetSearchState &
  Pick<FieldSuggestionsFacet, 'facetId' | 'displayName' | 'field'>;

/**
 * The `FilterSuggestions` controller provides methods to request and interact with facet suggestions based on a
 * specific field for a given search query.
 *
 * @alpha  This controller relies on a Commerce API functionality that is not yet generally available. If you wish to
 * use this feature in an implementation, please contact your Coveo representative.
 *
 * @group Buildable controllers
 * @category FilterSuggestions
 */
export interface FilterSuggestions
  extends Controller,
    FacetControllerType<'regular'> {
  /**
   * Resets the query in the controller state and clears the filter suggestions.
   */
  clear(): void;

  /**
   * Returns the serialized search parameters for the current search query and specified filter suggestion.
   *
   * For example, `q=jeans&f-cat_color=Blue`.
   *
   * In a typical scenario, this method should be called when the user selects a filter suggestion from a standalone
   * search box. The returned string is then used to pass the correct URL query parametes or fragment when redirecting
   * the browser to the search page.
   *
   * When the user selects a filter suggestion from the main search box on the search page, use the `select` method
   * instead.
   *
   * @param value - The filter suggestion to serialize.
   * @returns The serialized search parameters for the current search query and specified filter suggestion.
   */
  getSearchParameters(value: SpecificFacetSearchResult): string;

  /**
   * Clears all facet values, selects the specified filter suggestion, updates the query, and executes a new search
   * request.
   *
   * In a typical scenario, this method should be called when the user selects a filter suggestion from the main search
   * box on the search page.
   *
   * When the user selects a filter suggestion from a standalone search box, use the `getSearchParameters` method
   * instead.
   *
   * @param value - The filter suggestion to select.
   */
  select(value: SpecificFacetSearchResult): void;

  /**
   * Sets the query in the controller state to the specified value and requests filter suggestions based on the updated
   * query.
   *
   * For example, if this method is called with `jeans` as an argument, it will request values from the controller's
   * field (for example, `ec_brand`) that would return results if selected when the search query is `jeans` (such as
   * `Calvin Klein`, `Columbia`, and `Nautica`).
   *
   * @param query - The search query to use as context to request the category filter suggestions. In a typical
   * scenario, this should set to the current value of the search box input.
   */
  updateQuery(query: string): void;

  state: FilterSuggestionsState;
}

/**
 * The `FilterSuggestions` controller provides methods to request and interact with facet suggestions based on a
 * specific field for a given search query.
 *
 * @alpha  This controller relies on a Commerce API functionality that is not yet generally available. If you wish to use this
 * feature in an implementation, please contact your Coveo representative.
 *
 * @param engine - The headless commerce engine.
 * @param options - The options for the `FilterSuggestions` controller.
 * @returns A `FilterSuggestions` controller instance.
 *
 * @group Buildable controllers
 * @category FilterSuggestions
 */
export function buildFilterSuggestions(
  engine: CommerceEngine,
  options: RegularFacetOptions
): FilterSuggestions {
  if (!loadFilterSuggestionsReducers(engine)) {
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

    updateQuery: (text: string) => {
      facetSearch.updateText(text);
      facetSearch.search();
    },

    getSearchParameters: (value: SpecificFacetSearchResult): string =>
      searchSerializer.serialize({
        q: facetSearchStateSelector(getState()).query,
        f: {[options.facetId]: [value.rawValue]},
      }),

    select: (value: SpecificFacetSearchResult) => {
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

    get state() {
      const {displayName, field, facetId} = facetForFieldSuggestionsSelector(
        getState()
      );
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

function loadFilterSuggestionsReducers(
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
