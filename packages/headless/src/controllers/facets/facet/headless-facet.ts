import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {Engine} from '../../../app/headless-engine';
import {
  registerFacet,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
  updateFacetIsFieldExpanded,
} from '../../../features/facets/facet-set/facet-set-actions';
import {
  facetRequestSelector,
  facetResponseSelector,
} from '../../../features/facets/facet-set/facet-set-selectors';
import {executeSearch} from '../../../features/search/search-actions';
import {
  logFacetClearAll,
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {buildFacetSearch} from '../facet-search/specific/headless-facet-search';
import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {
  ConfigurationSection,
  FacetSearchSection,
  FacetSection,
  SearchSection,
} from '../../../state/state-sections';
import {isFacetValueSelected} from '../../../features/facets/facet-set/facet-set-utils';
import {executeToggleFacetSelect} from '../../../features/facets/facet-set/facet-set-controller-actions';
import {validateOptions} from '../../../utils/validate-payload';
import {defaultFacetOptions} from '../../../features/facets/facet-set/facet-set-slice';
import {defaultFacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-reducer-helpers';
import {
  FacetOptions,
  facetOptionsSchema,
  FacetSearchOptions,
} from './headless-facet-options';
import {determineFacetId} from '../_common/facet-id-determinor';
import {FacetValueState} from '../../../features/facets/facet-api/value';
import {
  BaseFacetSearch,
  BaseFacetSearchResult,
  BaseFacetSearchState,
  BaseFacetState,
  BaseFacetValue,
} from '../_common/base-facet';

export {FacetOptions, FacetSearchOptions, FacetValueState};

export interface FacetProps {
  /** The options for the `Facet` controller. */
  options: FacetOptions;
}

/**
 * The `Facet` headless controller offers a high-level interface for designing a common facet UI controller.
 */
export interface Facet extends Controller {
  facetSearch: FacetSearch;

  /**
   * Toggles the specified facet value.
   * @param selection The facet value to toggle.
   */
  toggleSelect: (selection: FacetValue) => void;

  /**
   * Checks whether the specified facet value is selected.
   * @param value The facet value to check.
   * @returns Whether the specified facet value is selected.
   */
  isValueSelected: (value: FacetValue) => boolean;

  /** Deselects all facet values.*/
  deselectAll: () => void;

  /** Sorts the facet values according to the specified criterion.
   * @param criterion The criterion to sort values by.
   */
  sortBy: (criterion: FacetSortCriterion) => void;

  /**
   * Checks whether the facet values are sorted according to the specified criterion.
   * @param criterion The criterion to compare.
   * @returns Whether the facet values are sorted according to the specified criterion.
   */
  isSortedBy: (criterion: FacetSortCriterion) => boolean;

  /**
   * Increases the number of values displayed in the facet to the next multiple of the originally configured value.
   */
  showMoreValues: () => void;

  /** Sets the displayed number of values to the originally configured value.*/
  showLessValues: () => void;

  /** The state of the `Facet` controller. */
  state: FacetState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Facet` controller.
 */
export interface FacetState extends BaseFacetState {
  /** The facet id. */
  facetId: string;

  /** The values of the facet. */
  values: FacetValue[];

  /** The active sortCriterion of the facet. */
  sortCriterion: FacetSortCriterion;

  /** `true` if there are more values to display and `false` otherwise. */
  canShowMoreValues: boolean;

  /** The state of the facet's searchbox. */
  facetSearch: FacetSearchState;
}

export interface FacetSearch extends BaseFacetSearch {
  /** selects a result */
  select(value: SpecificFacetSearchResult): void;
}

export interface FacetSearchState extends BaseFacetSearchState {
  /** search results */
  values: SpecificFacetSearchResult[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SpecificFacetSearchResult extends BaseFacetSearchResult {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FacetValue extends BaseFacetValue {}

/** Creates a `Facet` controller instance. */
export function buildFacet(
  engine: Engine<
    FacetSection & ConfigurationSection & FacetSearchSection & SearchSection
  >,
  props: FacetProps
): Facet {
  const {dispatch} = engine;
  const controller = buildController(engine);

  const facetId = determineFacetId(engine, props.options);
  const options: Required<FacetOptions> = {
    facetSearch: {...defaultFacetSearchOptions},
    ...defaultFacetOptions,
    ...props.options,
    facetId,
  };

  validateOptions(engine, facetOptionsSchema, options, 'buildFacet');

  const createFacetSearch = () => {
    const {facetId, facetSearch} = options;
    const facetSearchOptions = {facetId, ...facetSearch};

    return buildFacetSearch(engine, {options: facetSearchOptions});
  };

  const getRequest = () => facetRequestSelector(engine.state, facetId);
  const getResponse = () => facetResponseSelector(engine.state, facetId);

  const getNumberOfActiveValues = () => {
    const {currentValues} = getRequest();
    return currentValues.filter((v) => v.state !== 'idle').length;
  };

  const computeCanShowLessValues = () => {
    const {currentValues} = getRequest();
    const initialNumberOfValues = options.numberOfValues;
    const hasIdleValues = !!currentValues.find((v) => v.state === 'idle');

    return initialNumberOfValues < currentValues.length && hasIdleValues;
  };

  dispatch(registerFacet(options));
  const facetSearch = createFacetSearch();
  const {state, ...restOfFacetSearch} = facetSearch;

  return {
    ...controller,

    facetSearch: restOfFacetSearch,

    toggleSelect: (selection: FacetValue) =>
      dispatch(executeToggleFacetSelect({facetId: options.facetId, selection})),

    isValueSelected: isFacetValueSelected,

    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetClearAll(facetId)));
    },

    sortBy(criterion: FacetSortCriterion) {
      dispatch(updateFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    showMoreValues() {
      const numberInState = getRequest().numberOfValues;
      const initialNumberOfValues = options.numberOfValues;
      const numberToNextMultipleOfConfigured =
        initialNumberOfValues - (numberInState % initialNumberOfValues);
      const numberOfValues = numberInState + numberToNextMultipleOfConfigured;

      dispatch(updateFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: true}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetShowMore(facetId)));
    },

    showLessValues() {
      const initialNumberOfValues = options.numberOfValues;
      const newNumberOfValues = Math.max(
        initialNumberOfValues,
        getNumberOfActiveValues()
      );

      dispatch(
        updateFacetNumberOfValues({facetId, numberOfValues: newNumberOfValues})
      );
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: false}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetShowLess(facetId)));
    },

    get state() {
      const request = getRequest();
      const response = getResponse();

      const isLoading = engine.state.search.isLoading;
      const sortCriterion = request.sortCriteria;
      const values = response ? response.values : [];
      const hasActiveValues = values.some(
        (facetValue) => facetValue.state !== 'idle'
      );
      const canShowMoreValues = response ? response.moreValuesAvailable : false;

      return {
        facetId,
        values,
        sortCriterion,
        isLoading,
        hasActiveValues,
        canShowMoreValues,
        canShowLessValues: computeCanShowLessValues(),
        facetSearch: facetSearch.state,
      };
    },
  };
}
