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

    toggleSelect: (selection: RangeFacetValue) =>
      dispatch(executeToggleRangeFacetSelect({facetId, selection})),

    isValueSelected: isRangeFacetValueSelected,

    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetClearAll(facetId)));
    },

    sortBy(criterion: RangeFacetSortCriterion) {
      dispatch(updateRangeFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    isSortedBy(criterion: RangeFacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

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

interface AssertRangeFacetOptions {
  generateAutomaticRanges: boolean;
  currentValues?: unknown[];
}

export function assertRangeFacetOptions(
  options: AssertRangeFacetOptions,
  controllerName: 'buildNumericFacet' | 'buildDateFacet'
) {
  if (!options.generateAutomaticRanges && options.currentValues === undefined) {
    const message = `currentValues should be specified for ${controllerName} when generateAutomaticRanges is false.`;
    throw new Error(message);
  }
}
