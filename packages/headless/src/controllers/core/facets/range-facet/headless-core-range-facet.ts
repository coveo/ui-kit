import {CoreEngine} from '../../../../app/engine';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from '../../../../features/facet-options/facet-options-actions';
import {isFacetEnabledSelector} from '../../../../features/facet-options/facet-options-selectors';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions';
import {
  baseFacetResponseSelector,
  isFacetLoadingResponseSelector,
} from '../../../../features/facets/facet-set/facet-set-selectors';
import {
  RangeFacetResponse,
  RangeFacetRequest,
} from '../../../../features/facets/range-facets/generic/interfaces/range-facet';
import {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {updateRangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/range-facet-actions';
import {
  isRangeFacetValueExcluded,
  isRangeFacetValueSelected,
} from '../../../../features/facets/range-facets/generic/range-facet-utils';
import {
  ConfigurationSection,
  FacetOptionsSection,
  SearchSection,
} from '../../../../state/state-sections';
import {buildController} from '../../../controller/headless-controller';

export type RangeFacet = ReturnType<typeof buildCoreRangeFacet>;

export type RangeFacetProps<T extends RangeFacetRequest> = {
  facetId: string;
  getRequest: () => T;
};

export function buildCoreRangeFacet<
  T extends RangeFacetRequest,
  R extends RangeFacetResponse,
>(
  engine: CoreEngine<
    ConfigurationSection & SearchSection & FacetOptionsSection
  >,
  props: RangeFacetProps<T>
) {
  type RangeFacetValue = R['values'][0];

  const {facetId, getRequest} = props;
  const controller = buildController(engine);
  const dispatch = engine.dispatch;

  const getIsEnabled = () => isFacetEnabledSelector(engine.state, facetId);

  return {
    ...controller,

    isValueSelected: isRangeFacetValueSelected,

    isValueExcluded: isRangeFacetValueExcluded,

    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(updateFacetOptions());
    },

    sortBy(criterion: RangeFacetSortCriterion) {
      dispatch(updateRangeFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions());
    },

    isSortedBy(criterion: RangeFacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    enable() {
      dispatch(enableFacet(facetId));
    },

    disable() {
      dispatch(disableFacet(facetId));
    },

    get state() {
      const request = getRequest();
      const response = baseFacetResponseSelector(engine.state, facetId) as
        | R
        | undefined;

      const sortCriterion = request.sortCriteria;
      const resultsMustMatch = request.resultsMustMatch;
      const values: R['values'] = response ? response.values : [];
      const isLoading = isFacetLoadingResponseSelector(engine.state);
      const enabled = getIsEnabled();
      const hasActiveValues = values.some(
        (facetValue: RangeFacetValue) => facetValue.state !== 'idle'
      );

      return {
        facetId,
        values,
        sortCriterion,
        resultsMustMatch,
        hasActiveValues,
        isLoading,
        enabled,
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
