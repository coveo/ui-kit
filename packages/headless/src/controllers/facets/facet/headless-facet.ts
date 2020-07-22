import {Schema, StringValue, BooleanValue, NumberValue} from '@coveo/bueno';
import {buildController} from '../../controller/headless-controller';
import {Engine} from '../../../app/headless-engine';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  FacetRegistrationOptions,
  updateFacetNumberOfValues,
} from '../../../features/facets/facet-set/facet-set-actions';
import {randomID} from '../../../utils/utils';
import {
  facetSelector,
  facetRequestSelector,
} from '../../../features/facets/facet-set/facet-set-selectors';
import {
  FacetValue,
  FacetSortCriterion,
  FacetRequestOptions,
} from '../../../features/facets/facet-set/facet-set-interfaces';
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
import {buildFacetSearch} from '../facet-search/headless-facet-search';
import {FacetSearchRequestOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';
import {FacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-actions';

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

export type FacetOptions = FacetRequestOptions & {
  field: string;
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

    return facetSelector(state, id);
  };

  const getNumberOfActiveValues = () => {
    const {currentValues} = getRequest();
    return currentValues.filter((v) => v.state !== 'idle').length;
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
      dispatch(executeSearch(analyticsAction));
    },
    /**
     * Returns `true` is the passed facet value is selected and `false` otherwise.
     * @param facetValue The facet value to check.
     * @returns {boolean}.
     */
    isValueSelected,
    /** Deselects all facet values.*/
    deselectAll() {
      const id = options.facetId;

      dispatch(deselectAllFacetValues(id));
      dispatch(executeSearch(logFacetClearAll(id)));
    },
    /**
     * Returns `true` if the facet has selected values and `false` otherwise.
     * @returns {boolean}.
     */
    get hasActiveValues(): boolean {
      return this.state.values.some(
        (facetValue) => facetValue.state !== 'idle'
      );
    },

    /** Sorts the facet values according to the passed criterion.
     * @param {FacetSortCriterion} criterion The criterion to sort values by.
     */
    sortBy(criterion: FacetSortCriterion) {
      const facetId = options.facetId;

      dispatch(updateFacetSortCriterion({facetId, criterion}));
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
      dispatch(updateFacetSortCriterion({facetId, criterion: 'alphanumeric'}));
      dispatch(executeSearch(logFacetShowMore(facetId)));
    },

    /** Returns `true` if there are more values to display and `false` otherwise.*/
    get canShowMoreValues() {
      const res = getResponse();
      return res ? res.moreValuesAvailable : false;
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
      dispatch(updateFacetSortCriterion({facetId, criterion: 'score'}));
      dispatch(executeSearch(logFacetShowLess(facetId)));
    },

    /** Returns `true` if fewer values can be displayed and `false` otherwise.*/
    get canShowLessValues() {
      const {currentValues} = getRequest();
      const configuredNumber = options.numberOfValues!;
      const hasIdleValues = !!currentValues.find((v) => v.state === 'idle');

      return configuredNumber < currentValues.length && hasIdleValues;
    },
    /**
     * @returns The state of the `Facet` controller.
     */
    get state() {
      const request = getRequest();
      const response = getResponse();

      const sortCriterion = request.sortCriteria;
      const values = response ? response.values : [];

      return {
        values,
        sortCriterion,
      };
    },
  };
}
