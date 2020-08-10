import {
  DateRangeRequest,
  DateFacetRequest,
} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {
  AutomaticRangeFacetOptions,
  ManualRangeFacetOptions,
} from '../../../../features/facets/range-facets/generic/interfaces/options';
import {Engine} from '../../../../app/headless-engine';
import {randomID} from '../../../../utils/utils';
import {DateFacetRegistrationOptions} from '../../../../features/facets/range-facets/date-facet-set/interfaces/options';
import {
  DateFacetResponse,
  DateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {buildRangeFacet} from '../headless-range-facet';

type DateRangeOptions = Pick<DateRangeRequest, 'start' | 'end'> &
  Partial<DateRangeRequest>;

export function buildDateRange(config: DateRangeOptions): DateRangeRequest {
  return {
    endInclusive: false,
    state: 'idle',
    ...config,
  };
}

export type DateFacetProps = {
  options: DateFacetOptions;
};

export type DateFacetOptions = {facetId?: string} & (
  | Omit<AutomaticRangeFacetOptions<DateFacetRequest>, 'facetId'>
  | Omit<ManualRangeFacetOptions<DateFacetRequest>, 'facetId'>
);

/** The `DateFacet` controller makes it possible to create a facet with date ranges.*/
export type DateFacet = ReturnType<typeof buildDateFacet>;
export type DateFacetState = DateFacet['state'];

export function buildDateFacet(engine: Engine, props: DateFacetProps) {
  const dispatch = engine.dispatch;

  const facetId = props.options.facetId || randomID('dateFacet');
  const options: DateFacetRegistrationOptions = {facetId, ...props.options};

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
     * Selects (deselects) the passed value if unselected (selected).
     * @param selection The facet value to select or deselect.
     */
    toggleSelect(selection: DateFacetValue) {
      dispatch(toggleSelectDateFacetValue({facetId, selection}));
      rangeFacet.toggleSelect(selection);
    },

    /** @returns The state of the `DateFacet` controller.*/
    get state() {
      return {...rangeFacet.state, isLoading: engine.state.search.isLoading};
    },
  };
}
