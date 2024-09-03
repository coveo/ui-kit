import {configuration} from '../../../../app/common-reducers';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {
  registerDateFacet,
  updateDateFacetValues,
  validateManualDateRanges,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {executeSearch} from '../../../../features/search/search-actions';
import {searchReducer as search} from '../../../../features/search/search-slice';
import {SearchAppState} from '../../../../state/search-app-state';
import {buildMockDateFacetResponse} from '../../../../test/mock-date-facet-response';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../../test/mock-engine-v2';
import {createMockState} from '../../../../test/mock-state';
import * as FacetIdDeterminor from '../../../core/facets/_common/facet-id-determinor';
import {buildDateRange} from '../../../core/facets/range-facet/date-facet/date-range';
import {
  buildDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
} from './headless-date-filter';

jest.mock('../../../../features/facet-options/facet-options-actions');
jest.mock(
  '../../../../features/facets/range-facets/date-facet-set/date-facet-actions'
);
jest.mock('../../../../features/search/search-actions');

describe('date filter', () => {
  const facetId = '1';
  let options: DateFilterOptions;
  let initialState: DateFilterInitialState | undefined;
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let dateFacet: DateFilter;

  function initDateFilter() {
    engine = buildMockSearchEngine(state);
    dateFacet = buildDateFilter(engine, {options, initialState});
  }

  beforeEach(() => {
    initialState = undefined;
    (updateDateFacetValues as unknown as jest.Mock).mockReturnValue(() => {});

    options = {
      facetId,
      field: 'created',
    };

    state = createMockState();
    state.dateFacetSet[facetId] = buildMockDateFacetSlice();

    initDateFilter();
  });

  it('#initDateFacet throws an error when an manual range is invalid', () => {
    initialState = {
      range: buildDateRange({start: 1616679091000, end: 1616592691000}),
    };
    initDateFilter();
    expect(validateManualDateRanges).toHaveBeenCalledWith(
      expect.objectContaining({
        currentValues: expect.arrayContaining([
          expect.objectContaining({
            start: '2021/03/25@22:16:31',
            end: '2021/03/24@22:16:31',
          }),
        ]),
      })
    );
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      dateFacetSet,
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
      activeTab: '',
      tabs: {},
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
          {...value, state: 'selected', numberOfResults: 0, endInclusive: true},
        ],
      });
    });

    it('dispatches a search', () => {
      const value = buildMockDateFacetValue();
      dateFacet.setRange(value);
      expect(executeSearch).toHaveBeenCalled();
    });

    it('should return true when range is valid', () => {
      const value = buildMockDateFacetValue(
        buildDateRange({start: 1616592691000, end: 1616592691000})
      );
      expect(dateFacet.setRange(value)).toBe(true);
    });
  });

  describe('#clear', () => {
    beforeEach(() => dateFacet.clear());

    it('dispatches #updateDateFacetValues with the facet id and an empty array', () => {
      expect(updateDateFacetValues).toHaveBeenCalledWith({facetId, values: []});
    });

    it('dispatches a #updateFacetOptions action with #freezeFacetOrder true', () => {
      expect(updateFacetOptions).toHaveBeenCalledWith();
    });

    it('dispatches a search', () => {
      expect(executeSearch).toHaveBeenCalled();
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
