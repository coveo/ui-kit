import {Engine} from '../../../../app/headless-engine';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {NumericFacetRegistrationOptions} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/options';
import {
  NumericFacetResponse,
  NumericFacetValue,
} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {registerNumericFacet} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {buildRangeFacet} from '../headless-range-facet';
import {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {executeToggleNumericFacetSelect} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-controller-actions';
import {validateOptions} from '../../../../utils/validate-payload';
import {
  NumericFacetOptions,
  numericFacetOptionsSchema,
} from './headless-numeric-facet-options';
import {determineFacetId} from '../../_common/facet-id-determinor';

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

export {NumericFacetOptions};
export type NumericFacetProps = {
  options: NumericFacetOptions;
};

/** The `NumericFacet` controller makes it possible to create a facet with numeric ranges.*/
export type NumericFacet = ReturnType<typeof buildNumericFacet>;
export type NumericFacetState = NumericFacet['state'];

export function buildNumericFacet(
  engine: Engine<NumericFacetSection & ConfigurationSection & SearchSection>,
  props: NumericFacetProps
) {
  const dispatch = engine.dispatch;

  const facetId = determineFacetId(engine, props.options);
  const options: NumericFacetRegistrationOptions = {...props.options, facetId};

  validateOptions(
    engine,
    numericFacetOptionsSchema,
    options,
    buildNumericFacet.name
  );

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
    toggleSelect: (selection: NumericFacetValue) =>
      dispatch(executeToggleNumericFacetSelect({facetId, selection})),

    /** @returns The state of the `NumericFacet` controller.*/
    get state() {
      return rangeFacet.state;
    },
  };
}
