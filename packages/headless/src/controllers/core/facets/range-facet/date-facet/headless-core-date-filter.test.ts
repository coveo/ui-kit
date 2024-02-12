import {configuration} from '../../../../../app/common-reducers';
import {updateFacetOptions} from '../../../../../features/facet-options/facet-options-actions';
import {facetOptionsReducer as facetOptions} from '../../../../../features/facet-options/facet-options-slice';
import {
  registerDateFacet,
  updateDateFacetValues,
  validateManualDateRanges,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {searchReducer as search} from '../../../../../features/search/search-slice';
import {SearchAppState} from '../../../../../state/search-app-state';
import {buildMockDateFacetResponse} from '../../../../../test/mock-date-facet-response';
import {buildMockDateFacetSlice} from '../../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../../test/mock-date-facet-value';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../../../test/mock-engine-v2';
import {createMockState} from '../../../../../test/mock-state';
import * as FacetIdDeterminor from '../../_common/facet-id-determinor';
import {buildDateRange} from './date-range';
import {
  buildCoreDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
} from './headless-core-date-filter';

jest.mock(
  '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions'
);

jest.mock('../../../../../features/facet-options/facet-options-actions');

describe('date filter', () => {
  const facetId = '1';
  let options: DateFilterOptions;
  let initialState: DateFilterInitialState | undefined;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let dateFacet: DateFilter;

  function initDateFilter() {
    engine = buildMockSearchEngine(state);
    dateFacet = buildCoreDateFilter(engine, {options, initialState});
  }

  beforeEach(() => {
    (updateDateFacetValues as unknown as jest.Mock).mockImplementation(
      () => () => {}
    );
    initialState = undefined;

    options = {
      facetId,
      field: 'created',
    };

    state = createMockState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();

    initDateFilter();
  });

  it('#initDateFacet validates manual range', () => {
    initialState = {
      range: buildDateRange({start: 1616679091000, end: 1616592691000}),
    };
    initDateFilter();
    expect(validateManualDateRanges).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValues: [
          {
            end: '2021/03/24@22:16:31',
            endInclusive: true,
            start: '2021/03/25@22:16:31',
            state: 'selected',
          },
        ],
      })
    );
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      dateFacetSet,
      facetOptions,
      configuration,
      search,
    });
  });

  it('calls #determineFacetId with the correct params', () => {
    jest.spyOn(FacetIdDeterminor, 'determineFacetId');

    initDateFilter();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a date facet with the passed options', () => {
    expect(registerDateFacet).toHaveBeenCalledWith({
      facetId,
      generateAutomaticRanges: false,
      currentValues: initialState?.range
        ? [{...initialState.range, endInclusive: true, state: 'selected'}]
        : [],
      ...options,
    });
  });

  it('when an option is invalid, it throws an error', () => {
    options.field = 0 as unknown as string;
    expect(() => initDateFilter()).toThrow(
      'Check the options of buildDateFacet'
    );
  });

  describe('#setRange', () => {
    it('dispatches a updateDateFacetValues with the passed value', () => {
      const value = buildMockDateFacetValue({});
      dateFacet.setRange(value);

      expect(updateDateFacetValues).toHaveBeenCalledWith({
        facetId,
        values: [
          {
            ...value,
            state: 'selected',
            numberOfResults: 0,
            endInclusive: true,
          },
        ],
      });
    });

    it('should return true when range is valid', () => {
      const value = buildMockDateFacetValue(
        buildDateRange({start: 1616592691000, end: 1616592691000})
      );
      expect(dateFacet.setRange(value)).toBe(true);
    });

    it('should return false when range start value is greater than range end value', () => {
      (updateDateFacetValues as unknown as jest.Mock).mockImplementationOnce(
        () => {
          return {
            error: 'oh no',
          };
        }
      );
      const value = buildMockDateFacetValue(
        buildDateRange({start: 1616679091000, end: 1616592691000})
      );
      expect(dateFacet.setRange(value)).toBe(false);
    });
  });

  describe('#clear', () => {
    beforeEach(() => dateFacet.clear());

    it('dispatches #updateDateFacetValues with the facet id and an empty array', () => {
      expect(updateDateFacetValues).toHaveBeenCalledWith({facetId, values: []});
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalled();
    });
  });

  it('the state #range property should return the range if it is selected', () => {
    const value = buildMockDateFacetValue({state: 'selected'});
    state.search.response.facets = [
      buildMockDateFacetResponse({facetId, values: [value]}),
    ];

    expect(dateFacet.state.range).toEqual(value);
  });

  it('the state #range property should not return the range if it is not selected', () => {
    const value = buildMockDateFacetValue({state: 'idle'});
    state.search.response.facets = [
      buildMockDateFacetResponse({facetId, values: [value]}),
    ];

    expect(dateFacet.state.range).toBeUndefined();
  });

  it('#state.facetId exposes the facet id', () => {
    expect(dateFacet.state.facetId).toBe(facetId);
  });
});
