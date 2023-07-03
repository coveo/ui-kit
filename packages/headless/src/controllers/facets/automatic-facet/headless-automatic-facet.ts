// Toggle
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {toggleSelectAutomaticFacetValue} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {automaticFacetSelector} from '../../../features/facets/automatic-facet-set/automatic-facet-set-selectors';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {getAnalyticsActionForToggleFacetSelect} from '../../../features/facets/facet-set/facet-set-utils';
import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';
import {FacetValue} from '../../../features/facets/facet-set/interfaces/response';
import {executeSearch} from '../../../features/search/search-actions';
import {CoreEngine} from '../../../product-listing.index';
import {
  ConfigurationSection,
  FacetSearchSection,
  FacetSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {buildController} from '../../controller/headless-controller';
import {buildFacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search';
import {Facet, FacetSearchOptions, FacetState} from '../facet/headless-facet';

export interface AutomaticFacetState extends FacetState {}
export interface AutomaticFacetProps {
  field: string;
  facetSearch?: FacetSearchOptions;
}
export interface AutomaticFacet extends Facet {
  state: AutomaticFacetState;
}
/**
 * Creates a `Facet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Facet` properties.
 * @returns A `Facet` controller instance.
 * */
export function buildAutomaticFacet(
  engine: SearchEngine,
  props: AutomaticFacetProps
): AutomaticFacet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }
  const {dispatch} = engine;
  const controller = buildController(engine);

  const {field} = props;

  const getFacetResponse = () =>
    automaticFacetSelector(engine.state.automaticFacetSet, field);
  const getIsLoading = () => engine.state.search.isLoading;

  const createFacetSearch = () => {
    const {facetSearch} = props;

    return buildFacetSearch(engine, {
      options: {facetId: field, ...facetSearch},
      select: () => {
        //?
      },
      exclude: () => {
        //?
      },
      isForFieldSuggestions: false,
    });
  };
  const facetSearch = createFacetSearch();
  const {state, ...restOfFacetSearch} = facetSearch;

  return {
    ...controller,

    facetSearch: restOfFacetSearch,

    toggleSelect(selection: FacetValue) {
      console.log(selection);
      dispatch(toggleSelectAutomaticFacetValue({field, selection}));
      dispatch(
        executeSearch(getAnalyticsActionForToggleFacetSelect(field, selection))
      );
    },
    toggleExclude(selection: FacetValue) {
      console.log(selection);
    },
    toggleSingleSelect(selection: FacetValue) {
      console.log(selection);
    },
    toggleSingleExclude(selection: FacetValue) {
      console.log(selection);
    },
    isValueSelected(value: FacetValue) {
      console.log(value);
      return true;
    },
    isValueExcluded(value: FacetValue) {
      console.log(value);
      return true;
    },
    deselectAll() {},
    sortBy(criterion: FacetSortCriterion) {
      console.log(criterion);
    },
    isSortedBy(criterion: FacetSortCriterion) {
      console.log(criterion);
      return true;
    },
    showMoreValues() {},
    showLessValues() {},
    enable() {},
    disable() {},

    get state() {
      const response = getFacetResponse();
      const isLoading = getIsLoading();
      const facetId = response ? response.field : '';
      const values = response ? response.values : [];
      const hasActiveValues = values.some(
        (facetValue) => facetValue.state !== 'idle'
      );
      const sortCriterion: FacetSortCriterion = 'automatic';
      const canShowLessValues = false;
      const canShowMoreValues = false;
      const enabled = true;

      return {
        facetId,
        values,
        sortCriterion,
        isLoading,
        hasActiveValues,
        canShowMoreValues,
        canShowLessValues,
        enabled,
        facetSearch: facetSearch.state,
      };
    },
  };
}

function loadFacetReducers(
  engine: CoreEngine
): engine is CoreEngine<
  FacetSection & ConfigurationSection & FacetSearchSection & SearchSection,
  SearchThunkExtraArguments
> {
  engine.addReducers({
    facetSearchSet,
  });
  return true;
}
