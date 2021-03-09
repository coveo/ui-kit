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
import {Controller} from '../../../controller/headless-controller';
import {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request';

export {
  buildNumericRange,
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetValue,
  NumericFacetOptions,
};

export interface NumericFacetProps {
  /**
   * The options for the `NumericFacet` controller.
   */
  options: NumericFacetOptions;
}

/**
 * The `NumericFacet` controller makes it possible to create a facet with numeric ranges.
 */
export interface NumericFacet extends Controller {
  /**
   * Deselects all facet values.
   */
  deselectAll(): void;

  /**
   * Checks whether the facet values are sorted according to the specified criterion.
   *
   * @param criterion - The criterion to compare.
   * @returns Whether the facet values are sorted according to the specified criterion.
   */
  isSortedBy(criterion: RangeFacetSortCriterion): boolean;

  /**
   * Checks whether the specified facet value is selected.
   *
   * @param selection - The facet value to check.
   * @returns Whether the specified facet value is selected.
   */
  isValueSelected(selection: NumericFacetValue): boolean;

  /** Sorts the facet values according to the specified criterion.
   *
   * @param criterion - The criterion to sort values by.
   */
  sortBy(criterion: RangeFacetSortCriterion): void;

  /**
   * Toggles the specified facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: NumericFacetValue): void;

  /**
   * The state of the `NumericFacet` controller
   */
  state: NumericFacetState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `NumericFacet` controller.
 */
export interface NumericFacetState {
  /**
   * The facet ID.
   * */
  facetId: string;

  /**
   * The values of the facet.
   */
  values: NumericFacetValue[];

  /**
   * The active sortCriterion of the facet.
   */
  sortCriterion: RangeFacetSortCriterion;

  /**
   * `true` if a search is in progress and `false` otherwise.
   */
  isLoading: boolean;

  /**
   * `true` if there is at least one non-idle value and `false` otherwise.
   */
  hasActiveValues: boolean;
}

/**
 * Creates a `NumericFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `NumericFacet` properties.
 * @returns A `NumericFacet` controller instance.
 */
export function buildNumericFacet(
  engine: Engine<NumericFacetSection & ConfigurationSection & SearchSection>,
  props: NumericFacetProps
): NumericFacet {
  const dispatch = engine.dispatch;

  const facetId = determineFacetId(engine, props.options);
  const options: NumericFacetOptions = {
    ...props.options,
    facetId,
  };

  validateOptions(
    engine,
    numericFacetOptionsSchema,
    options,
    'buildNumericFacet'
  );

  if (!options.generateAutomaticRanges && options.currentValues === undefined) {
    engine.logger.error(
      'currentValues should be specified for buildNumericFacet when generateAutomaticRanges is false.'
    );
  }

  dispatch(registerNumericFacet(options as NumericFacetRegistrationOptions));

  const rangeFacet = buildRangeFacet<NumericFacetRequest, NumericFacetResponse>(
    engine,
    {
      facetId,
      getRequest: () => engine.state.numericFacetSet[facetId],
    }
  );

  return {
    ...rangeFacet,
    toggleSelect: (selection: NumericFacetValue) =>
      dispatch(executeToggleNumericFacetSelect({facetId, selection})),

    get state() {
      return rangeFacet.state;
    },
  };
}
