import {AsyncThunkAction} from '@reduxjs/toolkit';
import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {AsyncThunkOptions} from '../../../../../app/async-thunk-options';
import {CoreEngine, CoreEngineNext} from '../../../../../app/engine';
import {stateKey} from '../../../../../app/state-key';
import {ThunkExtraArguments} from '../../../../../app/thunk-extra-arguments';
import {FacetSearchOptions} from '../../../../../features/facets/facet-search-set/facet-search-request-options';
import {
  excludeFacetSearchResult,
  registerFacetSearch,
  selectFacetSearchResult,
} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {
  ConfigurationSection,
  FacetSearchSection,
} from '../../../../../state/state-sections';
import {buildGenericFacetSearch} from '../facet-search';

export interface FacetSearchProps {
  options: FacetSearchOptions;
  select: (value: SpecificFacetSearchResult) => void;
  exclude: (value: SpecificFacetSearchResult) => void;
  isForFieldSuggestions: boolean;
  executeFacetSearchActionCreator: (
    facetId: string
  ) => AsyncThunkAction<
    unknown,
    unknown,
    AsyncThunkOptions<unknown, ThunkExtraArguments>
  >;
  executeFieldSuggestActionCreator: (
    facetId: string
  ) => AsyncThunkAction<
    unknown,
    unknown,
    AsyncThunkOptions<unknown, ThunkExtraArguments>
  >;
}

export type FacetSearch = ReturnType<typeof buildFacetSearch>;

export function buildFacetSearch(
  engine:
    | CoreEngine<FacetSearchSection & ConfigurationSection>
    | CoreEngineNext<FacetSearchSection & ConfigurationSection>,
  props: FacetSearchProps
) {
  const {dispatch} = engine;
  const {
    options,
    select: propsSelect,
    exclude: propsExclude,
    isForFieldSuggestions,
    executeFacetSearchActionCreator,
    executeFieldSuggestActionCreator,
  } = props;
  const {facetId} = options;
  const getFacetSearch = () =>
    'state' in engine
      ? engine.state.facetSearchSet[facetId]
      : engine[stateKey].facetSearchSet[facetId];

  dispatch(registerFacetSearch(options));

  const genericFacetSearch = buildGenericFacetSearch(engine, {
    options,
    getFacetSearch,
    isForFieldSuggestions,
    executeFacetSearchActionCreator: executeFacetSearchActionCreator,
    executeFieldSuggestActionCreator: executeFieldSuggestActionCreator,
  });

  return {
    ...genericFacetSearch,

    /**
     * Selects the provided value.
     * @param result A single specificFacetSearchResult object
     */
    select(value: SpecificFacetSearchResult) {
      dispatch(selectFacetSearchResult({facetId, value}));
      propsSelect(value);
    },

    /**
     * Excludes the provided value.
     * @param result A single specificFacetSearchResult object
     */
    exclude(value: SpecificFacetSearchResult) {
      dispatch(excludeFacetSearchResult({facetId, value}));
      propsExclude(value);
    },

    /**
     * Selects the provided value, and deselects other values.
     * @param result A single specificFacetSearchResult object
     */
    singleSelect(value: SpecificFacetSearchResult) {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(selectFacetSearchResult({facetId, value}));
      propsSelect(value);
    },

    /**
     * Excludes the provided value, and deselects other values.
     * @param result A single specificFacetSearchResult object
     */
    singleExclude(value: SpecificFacetSearchResult) {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(excludeFacetSearchResult({facetId, value}));
      propsExclude(value);
    },

    get state() {
      const {values} = genericFacetSearch.state;
      return {
        ...genericFacetSearch.state,
        values: values.map(({count, displayValue, rawValue}) => ({
          count,
          displayValue,
          rawValue,
        })),
      };
    },
  };
}
