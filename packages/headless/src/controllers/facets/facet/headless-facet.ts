import {buildController} from '../../controller/headless-controller';
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
import {FacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';
import {FacetValue} from '../../../features/facets/facet-set/interfaces/response';
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
import {FacetOptions, facetOptionsSchema} from './headless-facet-options';
import {determineFacetId} from '../_common/facet-id-determinor';

export {FacetOptions};
export type FacetProps = {
  /** The options for the `Facet` controller. */
  options: FacetOptions;
};

/**
 * The `Facet` headless controller offers a high-level interface for designing a common facet UI controller.
 */
export type Facet = ReturnType<typeof buildFacet>;
/**
 * A scoped and simplified part of the headless state that is relevant to the `Facet` controller.
 */
export type FacetState = Facet['state'];

export function buildFacet(
  engine: Engine<
    FacetSection & ConfigurationSection & FacetSearchSection & SearchSection
  >,
  props: FacetProps
) {
  const {dispatch} = engine;
  const controller = buildController(engine);

  const facetId = determineFacetId(engine, props.options);
  const options: Required<FacetOptions> = {
    facetSearch: {...defaultFacetSearchOptions},
    ...defaultFacetOptions,
    ...props.options,
    facetId,
  };

  validateOptions(engine, facetOptionsSchema, options, buildFacet.name);

  const createFacetSearch = () => {
    const {facetId, facetSearch} = options;
    const facetSearchOptions: FacetSearchOptions = {
      facetId,
      ...facetSearch,
    };

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
    /**
     * Toggles the specified facet value.
     * @param selection (FacetValue) The facet value to toggle.
     */
    toggleSelect: (selection: FacetValue) =>
      dispatch(executeToggleFacetSelect({facetId: options.facetId, selection})),
    /**
     * Checks whether the specified facet value is selected.
     * @param value (FacetValue) The facet value to check.
     * @returns (boolean) Whether the specified facet value is selected.
     */
    isValueSelected: isFacetValueSelected,

    /** Deselects all facet values.*/
    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetClearAll(facetId)));
    },

    /** Sorts the facet values according to the specified criterion.
     * @param criterion (FacetSortCriterion) The criterion to sort values by.
     */
    sortBy(criterion: FacetSortCriterion) {
      dispatch(updateFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    /**
     * Checks whether the facet values are sorted according to the specified criterion.
     * @param criterion (FacetSortCriterion) The criterion to compare.
     * @returns (boolean) Whether the facet values are sorted according to the specified criterion.
     */
    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    /**
     * Increases the number of values displayed in the facet to the next multiple of the originally configured value.
     */
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

    /** Sets the displayed number of values to the originally configured value.*/
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

    /** @returns (FacetState) The state of the `Facet` controller. */
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
        /** @returns the facet id */
        facetId,

        /** @returns the values of the facet */
        values,

        /** @returns the active sortCriterion of the facet */
        sortCriterion,

        /** @returns `true` if a search is in progress and `false` otherwise. */
        isLoading,

        /** @returns `true` if there is at least one non-idle value and `false` otherwise. */
        hasActiveValues,

        /** @returns `true` if there are more values to display and `false` otherwise.*/
        canShowMoreValues,

        /** @returns `true` if fewer values can be displayed and `false` otherwise.*/
        canShowLessValues: computeCanShowLessValues(),
        facetSearch: facetSearch.state,
      };
    },
  };
}
