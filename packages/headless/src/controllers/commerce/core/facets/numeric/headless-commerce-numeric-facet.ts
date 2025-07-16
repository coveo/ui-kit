import type {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../../app/state-key.js';
import type {NumericFacetResponse} from '../../../../../features/commerce/facets/facet-set/interfaces/response.js';
import {manualNumericFacetSelector} from '../../../../../features/commerce/facets/numeric-facet/manual-numeric-facet-selectors.js';
import {manualNumericFacetReducer as manualNumericFacetSet} from '../../../../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateManualNumericFacetRange,
} from '../../../../../features/commerce/facets/numeric-facet/numeric-facet-actions.js';
import type {ManualRangeSection} from '../../../../../state/state-sections.js';
import {loadReducerError} from '../../../../../utils/errors.js';
import {
  buildCoreCommerceFacet,
  type CoreCommerceFacet,
  type CoreCommerceFacetOptions,
  type CoreCommerceFacetState,
  type FacetControllerType,
  type NumericFacetValue,
  type NumericRangeRequest,
} from '../headless-core-commerce-facet.js';

export type {NumericFacetValue};

export type NumericFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
>;

/**
 * The state of the `NumericFacet` sub-controller.
 *
 * @group Sub-controllers
 * @category NumericFacet
 */
export type NumericFacetState = Omit<
  CoreCommerceFacetState<NumericFacetValue>,
  'type'
> & {
  /**
   * The domain of the numeric facet.
   */
  domain?: NumericFacetDomain;
  manualRange?: NumericRangeRequest;
  type: 'numericalRange';
};

type NumericFacetDomain = {
  /**
   * The minimum value that the continuous range can have.
   *
   * No products will be returned if the `start` property of a selected range is set to a value lower than this.
   */
  min: number;
  /**
   * The maximum value that the continuous range can have.
   *
   * No products will be returned if the `end` property of a selected range is set to a value higher than this.
   */
  max: number;
};

/**
 * The `NumericFacet` sub-controller offers a high-level programming interface for implementing numeric commerce
 * facet UI component.
 *
 * @group Sub-controllers
 * @category NumericFacet
 */
export type NumericFacet = CoreCommerceFacet<
  NumericRangeRequest,
  NumericFacetValue
> & {
  /**
   * Replaces the current range values with the specified ones.
   *
   * @param ranges - The new ranges to set.
   */
  setRanges: (ranges: NumericRangeRequest[]) => void;
  /**
   * The state of the `NumericFacet` sub-controller.
   */
  state: NumericFacetState;
} & FacetControllerType<'numericalRange'>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `NumericFacet` sub-controller instances through the state of a `FacetGenerator`
 * sub-controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `NumericFacet` options used internally.
 * @returns A `NumericFacet` sub-controller instance.
 */
export function buildCommerceNumericFacet(
  engine: CommerceEngine,
  options: NumericFacetOptions
): NumericFacet {
  const coreController = buildCoreCommerceFacet<
    NumericRangeRequest,
    NumericFacetValue
  >(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectNumericFacetValue,
      toggleExcludeActionCreator: toggleExcludeNumericFacetValue,
    },
  });

  if (!loadCommerceNumericFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const {facetId, fetchProductsActionCreator} = options;

  return {
    ...coreController,

    // Only one range stored, so last will override the previous ones
    setRanges(ranges: NumericRangeRequest[]) {
      ranges.forEach((range) => {
        dispatch(updateManualNumericFacetRange({facetId, ...range}));
      });
      dispatch(fetchProductsActionCreator());
    },

    get state(): NumericFacetState {
      const response = options.facetResponseSelector(engine[stateKey], facetId);

      return getNumericFacetState(
        coreController.state,
        response?.type === 'numericalRange' ? response : undefined,
        manualNumericFacetSelector(engine[stateKey], facetId)
      );
    },

    type: 'numericalRange',
  };
}

function loadCommerceNumericFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<ManualRangeSection> {
  engine.addReducers({manualNumericFacetSet});
  return true;
}

export const getNumericFacetState = (
  coreState: CoreCommerceFacetState<NumericFacetValue>,
  facetResponseSelector: NumericFacetResponse | undefined,
  manualFacetRangeSelector: NumericRangeRequest | undefined
): NumericFacetState => {
  const response =
    facetResponseSelector?.type === 'numericalRange'
      ? facetResponseSelector
      : undefined;
  return {
    ...coreState,
    ...(response?.domain && {
      domain: {
        min: response.domain.min,
        max: response.domain.max,
      },
    }),
    ...(manualFacetRangeSelector && {manualRange: manualFacetRangeSelector}),
    type: 'numericalRange',
  };
};
