import {
  DateFacet,
  buildDateFacet,
  DateFacetOptions,
  buildDateRange,
} from './headless-date-facet';
import {
  MockEngine,
  buildMockSearchAppEngine,
} from '../../../../test/mock-engine';
import {createMockState} from '../../../../test/mock-state';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildMockDateFacetResponse} from '../../../../test/mock-date-facet-response';
import {SearchAppState} from '../../../../state/search-app-state';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import * as FacetIdGenerator from '../../_common/facet-id-generator';
import * as RangeFacet from '../headless-range-facet';
import {buildMockFacetIdConfig} from '../../../../test/mock-facet-id-config';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request';

describe('date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: SearchAppState;
  let engine: MockEngine<SearchAppState>;
  let dateFacet: DateFacet;

  function initDateFacet() {
    engine = buildMockSearchAppEngine({state});
    dateFacet = buildDateFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = createMockState();
    state.dateFacetSet[facetId] = buildMockDateFacetRequest();

    initDateFacet();
  });

  it('registers a date facet with the passed options', () => {
    const action = registerDateFacet({facetId, ...options});
    expect(engine.actions).toContainEqual(action);
  });

  it('when an option is invalid, it throws an error', () => {
    options.numberOfValues = 0;
    expect(() => initDateFacet()).toThrow(
      'Check the options of buildDateFacet'
    );
  });

  it('when an id is not specified, it calls #generateFacetId with the correct params', () => {
    const original = RangeFacet.buildRangeFacet;
    (RangeFacet as any).buildRangeFacet = () => ({state: {}});

    jest.spyOn(FacetIdGenerator, 'generateFacetId');

    options = {field: 'created', generateAutomaticRanges: true};
    initDateFacet();

    const config = buildMockFacetIdConfig({
      field: 'created',
      state: engine.state,
    });

    expect(FacetIdGenerator.generateFacetId).toHaveBeenCalledWith(
      config,
      engine.logger
    );

    (RangeFacet as any).buildRangeFacet = original;
  });

  describe('#toggleSelect', () => {
    it('dispatches a toggleSelectDateFacetValue with the passed value', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);

      const action = toggleSelectDateFacetValue({facetId, selection: value});
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches a search', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  it('exposes a #state getter property to retrieve the values', () => {
    const values = [buildMockDateFacetValue()];
    state.search.response.facets = [
      buildMockDateFacetResponse({facetId, values}),
    ];

    expect(dateFacet.state.values).toEqual(values);
  });

  it('#buildDateRange generates the correct value for a numeric input', () => {
    const dateRange = buildDateRange({
      start: 721386625000,
      end: 752922625000,
    });

    const expectedValues: DateRangeRequest = {
      start: '1992/11/10@09:10:25',
      end: '1993/11/10@09:10:25',
      endInclusive: false,
      state: 'idle',
    };

    expect(dateRange).toMatchObject(expectedValues);
  });

  it('#buildDateRange generates the correct value for a js date input', () => {
    const dateRange = buildDateRange({
      start: new Date(721386625000),
      end: new Date(752922625000),
    });

    const expectedValues: DateRangeRequest = {
      start: '1992/11/10@09:10:25',
      end: '1993/11/10@09:10:25',
      endInclusive: false,
      state: 'idle',
    };

    expect(dateRange).toMatchObject(expectedValues);
  });

  it('#buildDateRange generates the correct value for an iso 8601 string input', () => {
    const dateRange = buildDateRange({
      start: new Date(721386625000).toISOString(),
      end: new Date(752922625000).toISOString(),
    });

    const expectedValues: DateRangeRequest = {
      start: '1992/11/10@09:10:25',
      end: '1993/11/10@09:10:25',
      endInclusive: false,
      state: 'idle',
    };

    expect(dateRange).toMatchObject(expectedValues);
  });

  it('#buildDateRange throws if the date can not be parsed', () => {
    expect(() =>
      buildDateRange({
        start: 'NOT A DATE',
        end: 'NOT A DATE',
      })
    ).toThrow(
      `Could not parse the provided date, please provide a dateFormat string in the configuration options.\n
       See https://day.js.org/docs/en/parse/string-format for more information.
       `
    );
  });

  it('#buildDateRange uses provided date format string', () => {
    const dateFormat = 'MM-YYYY-DD@HH:mm:ss';
    const dateRange = buildDateRange({
      start: '11-1992-10@09:10:25',
      end: '11-1993-10@09:10:25',
      dateFormat,
      useLocalTime: true,
    });

    const expectedValues: DateRangeRequest = {
      start: '1992/11/10@09:10:25',
      end: '1993/11/10@09:10:25',
      endInclusive: false,
      state: 'idle',
    };
    expect(dateRange).toMatchObject(expectedValues);
  });
});
