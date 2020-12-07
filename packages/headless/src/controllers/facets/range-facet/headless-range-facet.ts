import {Engine} from '../../../app/headless-engine';
import {buildController} from '../../controller/headless-controller';
import {
  RangeFacetResponse,
  RangeFacetRequest,
} from '../../../features/facets/range-facets/generic/interfaces/range-facet';
import {
  logFacetUpdateSort,
  logFacetClearAll,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {baseFacetResponseSelector} from '../../../features/facets/facet-set/facet-set-selectors';
import {RangeFacetSortCriterion} from '../../../features/facets/range-facets/generic/interfaces/request';
import {updateRangeFacetSortCriterion} from '../../../features/facets/range-facets/generic/range-facet-actions';
import {deselectAllFacetValues} from '../../../features/facets/facet-set/facet-set-actions';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections';
import {isRangeFacetValueSelected} from '../../../features/facets/range-facets/generic/range-facet-utils';
import {executeToggleRangeFacetSelect} from '../../../features/facets/range-facets/generic/range-facet-controller-actions';

export type RangeFacet = ReturnType<typeof buildRangeFacet>;

export type RangeFacetProps<T extends RangeFacetRequest> = {
  facetId: string;
  getRequest: () => T;
};

export function buildRangeFacet<
  T extends RangeFacetRequest,
  R extends RangeFacetResponse
>(
  engine: Engine<ConfigurationSection & SearchSection>,
  props: RangeFacetProps<T>
) {
  type RangeFacetValue = R['values'][0];

  const {facetId, getRequest} = props;
  const controller = buildController(engine);
  const dispatch = engine.dispatch;

  return {
    ...controller,
    /** Logs a deselect (select) value event when the passed value is active (idle), and executes a search.*/
    toggleSelect: (selection: RangeFacetValue) =>
      dispatch(executeToggleRangeFacetSelect({facetId, selection})),

    /** Returns `true` if the passed value is selected, and `false` otherwise.
     * @param facetValue The facet value to check.
     * @returns boolean.
     */
    isValueSelected: isRangeFacetValueSelected,

    /** Deselects all facet values.*/
    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetClearAll(facetId)));
    },

    /** Sorts the facet values according to the passed criterion.
     * @param {RangeFacetSortCriterion} criterion The criterion to sort values by.
     */
    sortBy(criterion: RangeFacetSortCriterion) {
      dispatch(updateRangeFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    /**
     * Returns `true` if the facet values are sorted according to the passed criterion and `false` otherwise.
     * @param {FacetSortCriterion} criterion The criterion to compare.
     */
    isSortedBy(criterion: RangeFacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    /** @returns The state of the `RangeFacet` controller.*/
    get state() {
      const request = getRequest();
      const response = baseFacetResponseSelector(engine.state, facetId) as
        | R
        | undefined;

      const sortCriterion = request.sortCriteria;
      const values: R['values'] = response ? response.values : [];
      const isLoading = engine.state.search.isLoading;
      const hasActiveValues = values.some(
        (facetValue: RangeFacetValue) => facetValue.state !== 'idle'
      );

      return {
        facetId,
        values,
        sortCriterion,
        hasActiveValues,
        isLoading,
      };
    },
  };
}
