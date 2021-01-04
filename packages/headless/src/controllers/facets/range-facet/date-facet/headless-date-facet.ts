import {DateFacetRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {Engine} from '../../../../app/headless-engine';
import {DateFacetRegistrationOptions} from '../../../../features/facets/range-facets/date-facet-set/interfaces/options';
import {
  DateFacetResponse,
  DateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {registerDateFacet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {buildRangeFacet} from '../headless-range-facet';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {executeToggleDateFacetSelect} from '../../../../features/facets/range-facets/date-facet-set/date-facet-controller-actions';
import {validateOptions} from '../../../../utils/validate-payload';
import {
  DateFacetOptions,
  dateFacetOptionsSchema,
} from './headless-date-facet-options';
import {determineFacetId} from '../../_common/facet-id-determinor';
import {buildDateRange} from './date-range';

export {buildDateRange};
export {DateFacetOptions};
export type DateFacetProps = {
  /** The options for the `DateFacet` controller. */
  options: DateFacetOptions;
};

/** The `DateFacet` controller makes it possible to create a facet with date ranges. */
export type DateFacet = ReturnType<typeof buildDateFacet>;
/**
 * A scoped and simplified part of the headless state that is relevant to the `DateFacet` controller.
 */
export type DateFacetState = DateFacet['state'];

export function buildDateFacet(
  engine: Engine<ConfigurationSection & SearchSection & DateFacetSection>,
  props: DateFacetProps
) {
  const dispatch = engine.dispatch;

  const facetId = determineFacetId(engine, props.options);
  const options: DateFacetRegistrationOptions = {...props.options, facetId};

  validateOptions(engine, dateFacetOptionsSchema, options, buildDateFacet.name);

  dispatch(registerDateFacet(options));

  const rangeFacet = buildRangeFacet<DateFacetRequest, DateFacetResponse>(
    engine,
    {
      facetId,
      getRequest: () => engine.state.dateFacetSet[facetId],
    }
  );

  return {
    ...rangeFacet,
    /**
     * Toggles the specified facet value.
     * @param selection The facet value to toggle.
     */
    toggleSelect: (selection: DateFacetValue) =>
      dispatch(executeToggleDateFacetSelect({facetId, selection})),

    /** The state of the `DateFacet` controller.*/
    get state() {
      return {
        ...rangeFacet.state,
        /** `true` if a search is in progress and `false` otherwise. */
        isLoading: engine.state.search.isLoading,
      };
    },
  };
}
