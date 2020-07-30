import {Engine} from '../../../app/headless-engine';
import {buildController} from '../../controller/headless-controller';
import {facetSelector} from '../../../features/facets/facet-set/facet-set-selectors';
import {randomID} from '../../../utils/utils';
import {executeSearch} from '../../../features/search/search-actions';
import {
  FacetSelectionChangeMetadata,
  logFacetDeselect,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {
  AutomaticRangeFacetOptions,
  ManualRangeFacetOptions,
} from '../../../features/facets/range-facets/generic/interfaces/options';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {NumericFacetRegistrationOptions} from '../../../features/facets/range-facets/numeric-facet-set/interfaces/options';
import {
  NumericFacetResponse,
  NumericFacetValue,
} from '../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  registerNumericFacet,
  toggleSelectNumericFacetValue,
} from '../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';

type NumericRangeOptions = Pick<NumericRangeRequest, 'start' | 'end'> &
  Partial<NumericRangeRequest>;

export function buildNumericRange(
  config: NumericRangeOptions
): NumericRangeRequest {
  return {
    endInclusive: false,
    state: 'idle',
    ...config,
  };
}

export type NumericFacetProps = {
  options: NumericFacetOptions;
};

export type NumericFacetOptions = {facetId?: string} & (
  | Omit<AutomaticRangeFacetOptions<NumericFacetRequest>, 'facetId'>
  | Omit<ManualRangeFacetOptions<NumericFacetRequest>, 'facetId'>
);

export type NumericFacet = ReturnType<typeof buildNumericFacet>;
export type NumericFacetState = NumericFacet['state'];

export function buildNumericFacet(engine: Engine, props: NumericFacetProps) {
  const controller = buildController(engine);
  const dispatch = engine.dispatch;

  const facetId = props.options.facetId || randomID('numericFacet');
  const options: NumericFacetRegistrationOptions = {facetId, ...props.options};

  const getResponse = () => {
    return facetSelector(engine.state, facetId) as
      | NumericFacetResponse
      | undefined;
  };

  const isValueSelected = (selection: NumericFacetValue) => {
    return selection.state === 'selected';
  };

  const getAnalyticsActionForToggleSelect = (selection: NumericFacetValue) => {
    const {start, end} = selection;
    const facetValue = `${start}..${end}`;
    const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

    return isValueSelected(selection)
      ? logFacetDeselect(payload)
      : logFacetSelect(payload);
  };

  dispatch(registerNumericFacet(options));

  return {
    ...controller,
    /**
     * Selects (deselects) the passed value if unselected (selected).
     * @param selection The facet value to select or deselect.
     */
    toggleSelect(selection: NumericFacetValue) {
      const analyticsAction = getAnalyticsActionForToggleSelect(selection);

      dispatch(toggleSelectNumericFacetValue({facetId, selection}));
      dispatch(executeSearch(analyticsAction));
    },
    /** Returns `true` if the passed facet value is selected and `false` otherwise.
     * @param {RangeFacetValue}
     * @returns {boolean}
     * */
    isValueSelected,
    /** @returns The state of the `RangeFacet` controller.*/
    get state() {
      const response = getResponse();
      const values = response ? response.values : [];

      return {values};
    },
  };
}
