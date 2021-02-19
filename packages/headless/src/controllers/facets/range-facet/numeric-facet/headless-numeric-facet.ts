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
import {buildNumericRange, NumericRangeOptions} from './numeric-range';

export {
  buildNumericRange,
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetOptions,
};

export type NumericFacetProps = {
  /** The options for the `NumericFacet` controller. */
  options: NumericFacetOptions;
};

/** The `NumericFacet` controller makes it possible to create a facet with numeric ranges. */
export type NumericFacet = ReturnType<typeof buildNumericFacet>;
/**
 * A scoped and simplified part of the headless state that is relevant to the `NumericFacet` controller.
 */
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
    'buildNumericFacet'
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
     * Toggles the specified facet value.
     * @param selection The facet value to toggle.
     */
    toggleSelect: (selection: NumericFacetValue) =>
      dispatch(executeToggleNumericFacetSelect({facetId, selection})),

    /** The state of the `NumericFacet` controller.*/
    get state() {
      return rangeFacet.state;
    },
  };
}
