import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import {
  DateRangeRequest,
  DateFacetRequest,
} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
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

dayjs.extend(utc);
dayjs.extend(customParseFormat);

type DateRangeOptions = Partial<Omit<DateRangeRequest, 'start' | 'end'>> & {
  start: string | number | Date;
  end: string | number | Date;
  useLocalTime?: boolean;
  dateFormat?: string;
};

/** Creates a `DateRangeRequest`.
 * @param config The options with which to create a `DateRangeRequest`.
 * @returns A new `DateRangeRequest`.
 */
export function buildDateRange(config: DateRangeOptions): DateRangeRequest {
  const DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';
  const start = config.useLocalTime
    ? dayjs(config.start, config.dateFormat).format(DATE_FORMAT)
    : dayjs(config.start, config.dateFormat).utc().format(DATE_FORMAT);
  const end = config.useLocalTime
    ? dayjs(config.end, config.dateFormat).format(DATE_FORMAT)
    : dayjs(config.end, config.dateFormat).utc().format(DATE_FORMAT);

  if (start === 'Invalid Date' || end === 'Invalid Date') {
    throw new Error(
      `Could not parse the provided date, please provide a dateFormat string in the configuration options.\n
       See https://day.js.org/docs/en/parse/string-format for more information.
       `
    );
  }
  return {
    endInclusive: false,
    state: 'idle',
    ...config,
    start,
    end,
  };
}

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
