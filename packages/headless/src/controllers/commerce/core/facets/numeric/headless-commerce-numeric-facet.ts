import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../../app/state-key';
import {ensureNumericFacetRequest} from '../../../../../features/commerce/facets/facet-set/facet-set-slice';
import {NumericFacetResponse} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {deselectAllFacetValues} from '../../../../../features/facets/facet-set/facet-set-actions';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateNumericFacetValues,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {NumericFilterRange} from '../../../../core/facets/range-facet/numeric-facet/headless-core-numeric-filter';
import {
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  FacetControllerType,
  NumericFacetValue,
  NumericRangeRequest,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

export type {NumericFilterRange};

export type NumericFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
>;

export type NumericFacetState = CoreCommerceFacetState<NumericFacetValue> & {
  /**
   * The domain of the numeric facet.
   */
  domain?: NumericFacetDomain;
  /**
   * The last range set by setRanges method // TODO: better doc
   * undefined if the range has been defined by selecting facet values
   */
  range?: NumericFilterRange;
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
 * The `NumericFacet` controller offers a high-level programming interface for implementing numeric commerce
 * facet UI component.
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
   * The state of the `NumericFacet` controller.
   */
  state: NumericFacetState;
} & FacetControllerType<'numericalRange'>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `NumericFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `NumericFacet` options used internally.
 * @returns A `NumericFacet` controller instance.
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

  const {dispatch} = engine;
  const getRequest = () => engine[stateKey].commerceFacetSet[facetId].request;

  const {facetId, fetchProductsActionCreator: fetchProductsActionCreator} =
    options;

  const extractRange = () => {
    const request = getRequest();
    if (!ensureNumericFacetRequest(request)) {
      return;
    }

    const range = request.values.find((value) => value.isCustomRange);

    if (!range) {
      return;
    }

    return {
      range,
    };
  };

  const extractDomain = (
    response: NumericFacetResponse
  ): Pick<NumericFacetState, 'domain'> | undefined => {
    if (response.domain === undefined) {
      return;
    }
    const {min, max} = response.domain;
    return {
      domain: {
        min,
        max,
      },
    };
  };

  return {
    ...coreController,

    setRanges(ranges: NumericRangeRequest[]) {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(
        updateNumericFacetValues({
          facetId,
          values: ranges.map((range) => ({...range, numberOfResults: 0})),
        })
      );
      dispatch(fetchProductsActionCreator());
    },

    get state(): NumericFacetState {
      const response = options.facetResponseSelector(engine[stateKey], facetId);
      if (response?.type === 'numericalRange') {
        return {
          ...coreController.state,
          ...extractDomain(response),
          ...extractRange(),
        };
      }

      return {
        ...coreController.state,
      };
    },

    type: 'numericalRange',
  };
}
