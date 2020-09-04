import {QuerySuggestCompletion} from './api/search/query-suggest/query-suggest-response';
import {SearchState} from './features/search/search-slice';
import {SearchParametersState} from './search-parameters-state';
import {StateWithHistory} from './app/undoable';
import {DidYouMeanState} from './features/did-you-mean/did-you-mean-slice';
import {SearchAPIErrorWithStatusCode} from './api/search/search-api-error-response';
import {FieldsState} from './features/fields/fields-slice';
import {ConfigurationState} from './features/configuration/configuration-slice';
import {SpecificFacetSearchSetState} from './features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {CategoryFacetSearchSetState} from './features/facets/facet-search-set/category/category-facet-search-set-slice';

export interface SearchPageState extends SearchParametersState {
  /**
   * The global headless engine configuration.
   */
  configuration: ConfigurationState;
  /**
   * The set of facet searches.
   */
  facetSearchSet: SpecificFacetSearchSetState;
  /**
   * The set of category facet searches.
   */
  categoryFacetSearchSet: CategoryFacetSearchSetState;
  /**
   * The URL redirection triggered by the preprocessed query.
   */
  redirection: RedirectionState;
  /**
   * The query suggestions returned by Coveo ML.
   */
  querySuggest: QuerySuggestSet;
  /**
   * The information related to the search endpoint.
   */
  search: SearchState;
  /**
   * DidYouMean allows to retrieve query corrections from the index related to end user mispelling.
   */
  didYouMean: DidYouMeanState;
  /**
   * The information related to the history navigation.
   */
  history: StateWithHistory<SearchParametersState>;
  /**
   * The information related to fields used in the engine.
   */
  fields: FieldsState;
}

export interface QueryState {
  /**
   * The basic query expression (e.g., `acme tornado seeds`).
   */
  q: string;
}

export interface RedirectionState {
  /**
   * The URL to redirect the user to.
   */
  redirectTo: string | null;
}

export type QuerySuggestSet = Record<string, QuerySuggestState | undefined>;

export interface QuerySuggestState {
  /**
   * The unique identifier of the query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  id: string;
  /**
   * The current list of query suggestions.
   */
  completions: QuerySuggestCompletion[];
  /**
   * The partial basic query expression for which query suggestions were requested (e.g., `cov`).
   */
  q: string;
  /**
   * The number of query suggestions requested from Coveo ML (e.g., `3`).
   */
  count: number;
  /**
   * The unique identifier of the current query suggestion request.
   */
  currentRequestId: string;
  error: SearchAPIErrorWithStatusCode | null;
}
