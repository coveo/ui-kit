import {Engine} from '../../../../app/headless-engine';
import {randomID} from '../../../../utils/utils';
import {
  AutomaticRangeFacetOptions,
  ManualRangeFacetOptions,
} from '../../../../features/facets/range-facets/generic/interfaces/options';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {NumericFacetRegistrationOptions} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/options';
import {
  NumericFacetResponse,
  NumericFacetValue,
} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  registerNumericFacet,
  toggleSelectNumericFacetValue,
} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {buildRangeFacet} from '../headless-range-facet';

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

/** The `NumericFacet` controller makes it possible to create a facet with numeric ranges.*/
export type NumericFacet = ReturnType<typeof buildNumericFacet>;
export type NumericFacetState = NumericFacet['state'];

export function buildNumericFacet(engine: Engine, props: NumericFacetProps) {
  const dispatch = engine.dispatch;

  const facetId = props.options.facetId || randomID('numericFacet');
  const options: NumericFacetRegistrationOptions = {facetId, ...props.options};

  dispatch(registerNumericFacet(options));

  const rangeFacet = buildRangeFacet<NumericFacetRequest, NumericFacetResponse>(
    engine,
    {
      facetId,
      getRequest: () => engine.state.numericFacetSet[facetId],
    }
  );

  return {
    ...rangeFacet,
    /**
     * Selects (deselects) the passed value if unselected (selected).
     * @param selection The facet value to select or deselect.
     */
    toggleSelect(selection: NumericFacetValue) {
      dispatch(toggleSelectNumericFacetValue({facetId, selection}));
      rangeFacet.toggleSelect(selection);
    },

    /** @returns The state of the `NumericFacet` controller.*/
    get state() {
      return rangeFacet.state;
    },
  };
}
