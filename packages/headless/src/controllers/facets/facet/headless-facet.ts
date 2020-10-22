import {Schema, StringValue, BooleanValue, NumberValue} from '@coveo/bueno';
import {buildController} from '../../controller/headless-controller';
import {Engine} from '../../../app/headless-engine';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
  updateFacetIsFieldExpanded,
} from '../../../features/facets/facet-set/facet-set-actions';
import {randomID} from '../../../utils/utils';
import {
  baseFacetResponseSelector,
  facetRequestSelector,
} from '../../../features/facets/facet-set/facet-set-selectors';
import {FacetRegistrationOptions} from '../../../features/facets/facet-set/interfaces/options';
import {executeSearch} from '../../../features/search/search-actions';
import {
  FacetSelectionChangeMetadata,
  logFacetDeselect,
  logFacetSelect,
  logFacetClearAll,
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {buildFacetSearch} from '../facet-search/specific/headless-facet-search';
import {
  FacetSearchRequestOptions,
  FacetSearchOptions,
} from '../../../features/facets/facet-search-set/facet-search-request-options';
import {
  FacetValue,
  FacetResponse,
} from '../../../features/facets/facet-set/interfaces/response';
import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';

export type Facet = ReturnType<typeof buildFacet>;
export type FacetState = Facet['state'];

export type FacetProps = {
  options: FacetOptions;
};

const schema = new Schema({
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  facetId: new StringValue({default: () => randomID('facet')}),
  /** The field whose values you want to display in the facet.*/
  field: new StringValue({required: true}),
  delimitingCharacter: new StringValue({default: '>'}),
  filterFacetCount: new BooleanValue({default: true}),
  injectionDepth: new NumberValue({default: 1000}),
  numberOfValues: new NumberValue({default: 8, min: 1}),
});

export type FacetOptions = Omit<FacetRegistrationOptions, 'facetId'> & {
  facetId?: string;
  facetSearch?: Partial<FacetSearchRequestOptions>;
};

export type ValidatedFacetOptions = FacetRegistrationOptions & {
  facetSearch: Partial<FacetSearchRequestOptions>;
};

export function buildFacet(engine: Engine, props: FacetProps) {
  const controller = buildController(engine);
  const options = schema.validate(props.options) as ValidatedFacetOptions;
  const dispatch = engine.dispatch;

  const createFacetSearch = () => {
    const {facetId, facetSearch} = options;
    const facetSearchOptions: FacetSearchOptions = {
      facetId,
      ...facetSearch,
    };

    return buildFacetSearch(engine, {options: facetSearchOptions});
  };

  const getRequest = () => {
    const id = options.facetId;
    const state = engine.state;

    return facetRequestSelector(state, id);
  };

  const getResponse = () => {
    const id = options.facetId;
    const state = engine.state;

    return baseFacetResponseSelector(state, id) as FacetResponse | undefined;
  };

  const getNumberOfActiveValues = () => {
    const {currentValues} = getRequest();
    return currentValues.filter((v) => v.state !== 'idle').length;
  };

  const computeCanShowLessValues = () => {
    const {currentValues} = getRequest();
    const configuredNumber = options.numberOfValues!;
    const hasIdleValues = !!currentValues.find((v) => v.state === 'idle');

    return configuredNumber < currentValues.length && hasIdleValues;
  };

  const isValueSelected = (value: FacetValue) => value.state === 'selected';

  const getAnalyticsActionForToggleSelect = (selection: FacetValue) => {
    const payload: FacetSelectionChangeMetadata = {
      facetId: options.facetId,
      facetValue: selection.value,
    };

    return isValueSelected(selection)
      ? logFacetDeselect(payload)
      : logFacetSelect(payload);
  };

  dispatch(registerFacet(options));

  return {
    ...controller,
    facetSearch: createFacetSearch(),
    /**
     * Selects (deselects) the passed value if unselected (selected).
     * @param selection The facet value to select or deselect.
     */
    toggleSelect(selection: FacetValue) {
      const facetId = options.facetId;
      const analyticsAction = getAnalyticsActionForToggleSelect(selection);

      dispatch(toggleSelectFacetValue({facetId, selection}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(analyticsAction));
    },
    /**
     * Returns `true` if the passed facet value is selected and `false` otherwise.
     * @param {FacetValue} The facet value to check.
     * @returns {boolean}.
     */
    isValueSelected,

    /** Deselects all facet values.*/
    deselectAll() {
      const id = options.facetId;

      dispatch(deselectAllFacetValues(id));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetClearAll(id)));
    },

    /** Sorts the facet values according to the passed criterion.
     * @param {FacetSortCriterion} criterion The criterion to sort values by.
     */
    sortBy(criterion: FacetSortCriterion) {
      const facetId = options.facetId;

      dispatch(updateFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    /**
     * Returns `true` if the facet values are sorted according to the passed criterion and `false` otherwise.
     * @param {FacetSortCriterion} criterion The criterion to compare.
     */
    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    /**
     * Increases the number of values displayed in the facet.
     */
    showMoreValues() {
      const facetId = options.facetId;
      const numberInState = getRequest().numberOfValues;
      const configuredNumber = options.numberOfValues!;
      const numberToNextMultipleOfConfigured =
        configuredNumber - (numberInState % configuredNumber);
      const numberOfValues = numberInState + numberToNextMultipleOfConfigured;

      dispatch(updateFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: true}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetShowMore(facetId)));
    },

    /** Sets the displayed number of values to the originally configured value.*/
    showLessValues() {
      const {facetId, numberOfValues} = options;
      const newNumberOfValues = Math.max(
        numberOfValues!,
        getNumberOfActiveValues()
      );

      dispatch(
        updateFacetNumberOfValues({facetId, numberOfValues: newNumberOfValues})
      );
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: false}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetShowLess(facetId)));
    },

    /** @returns The state of the `Facet` controller. */
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
      };
    },
  };
}
