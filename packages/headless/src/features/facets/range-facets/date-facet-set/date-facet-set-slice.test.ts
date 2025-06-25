import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value.js';
import {buildMockSearch} from '../../../../test/mock-search.js';
import {logSearchEvent} from '../../../analytics/analytics-actions.js';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions.js';
import {change} from '../../../history/history-actions.js';
import {getHistoryInitialState} from '../../../history/history-state.js';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions.js';
import {executeSearch} from '../../../search/search-actions.js';
import * as FacetReducers from '../../generic/facet-reducer-helpers.js';
import * as RangeFacetReducers from '../generic/range-facet-reducers.js';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
  updateDateFacetSortCriterion,
  deselectAllDateFacetValues,
  RegisterDateFacetActionCreatorPayload,
  updateDateFacetValues,
} from './date-facet-actions.js';
import {
  dateFacetSetReducer,
  convertToDateRangeRequests,
} from './date-facet-set-slice.js';
import {
  DateFacetSetState,
  getDateFacetSetInitialState,
} from './date-facet-set-state.js';

describe('date-facet-set slice', () => {
  let state: DateFacetSetState;

  beforeEach(() => {
    state = getDateFacetSetInitialState();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes the set to an empty object', () => {
    const finalState = dateFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerDateFacet registers a date facet', () => {
    const facetId = '1';
    const options: RegisterDateFacetActionCreatorPayload = {
      facetId,
      field: '',
      generateAutomaticRanges: true,
    };

    const finalState = dateFacetSetReducer(state, registerDateFacet(options));

    expect(finalState[facetId]?.request).toEqual({
      ...options,
      currentValues: [],
      filterFacetCount: true,
      generateAutomaticRanges: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      preventAutoSelect: false,
      sortCriteria: 'ascending',
      resultsMustMatch: 'atLeastOneValue',
      type: 'dateRange',
      rangeAlgorithm: 'even',
    });
  });

  it('it restores the dateFacetSet on history change', () => {
    const dateFacetSet = {'1': buildMockDateFacetSlice()};
    const payload = {
      ...getHistoryInitialState(),
      dateFacetSet,
    };

    const finalState = dateFacetSetReducer(
      state,
      change.fulfilled(payload, '')
    );

    expect(finalState).toEqual(dateFacetSet);
  });

  it('#restoreSearchParameters restores the #nf payload correctly', () => {
    const spy = vi.spyOn(
      RangeFacetReducers,
      'handleRangeFacetSearchParameterRestoration'
    );

    const facetId = '1';
    state[facetId] = buildMockDateFacetSlice();

    const value = buildMockDateFacetValue();
    const df = {[facetId]: [value]};

    const action = restoreSearchParameters({df});
    const finalState = dateFacetSetReducer(state, action);

    expect(finalState[facetId]?.request.currentValues).toContainEqual(value);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('#toggleSelectDateFacetValue calls #toggleSelectRangeValue', () => {
    const facetId = '1';
    const selection = buildMockDateFacetValue();
    vi.spyOn(RangeFacetReducers, 'toggleSelectRangeValue');

    dateFacetSetReducer(
      state,
      toggleSelectDateFacetValue({facetId, selection})
    );

    expect(RangeFacetReducers.toggleSelectRangeValue).toHaveBeenCalledTimes(1);
  });

  it('#updateDateFacetValues calls #updateRangeValues', () => {
    vi.spyOn(RangeFacetReducers, 'updateRangeValues');
    const action = updateDateFacetValues({facetId: '1', values: []});
    dateFacetSetReducer(state, action);

    expect(RangeFacetReducers.updateRangeValues).toHaveBeenCalledTimes(1);
  });

  it('#deselectAllDateFacetValues calls #handleRangeFacetDeselectAll', () => {
    vi.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll');
    const action = deselectAllDateFacetValues('1');
    dateFacetSetReducer(state, action);

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(1);
  });

  it('dispatching #deselectAllBreadcrumbs calls #handleRangeFacetDeselectAll for every date facet', () => {
    vi.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll').mockReset();

    state['1'] = buildMockDateFacetSlice();
    state['2'] = buildMockDateFacetSlice();
    dateFacetSetReducer(state, deselectAllBreadcrumbs());

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(2);
  });

  it('#updateDateFacetSortCriterion calls #handleFacetSortCriterionUpdate', () => {
    vi.spyOn(FacetReducers, 'handleFacetSortCriterionUpdate');

    const action = updateDateFacetSortCriterion({
      facetId: '1',
      criterion: 'descending',
    });
    dateFacetSetReducer(state, action);

    expect(FacetReducers.handleFacetSortCriterionUpdate).toHaveBeenCalledTimes(
      1
    );
  });

  it('#executeSearch.fulfilled calls #onRangeFacetRequestFulfilled', () => {
    vi.spyOn(RangeFacetReducers, 'onRangeFacetRequestFulfilled');

    const search = buildMockSearch();
    dateFacetSetReducer(
      state,
      executeSearch.fulfilled(search, '', {
        legacy: logSearchEvent({evt: 'foo'}),
      })
    );

    expect(
      RangeFacetReducers.onRangeFacetRequestFulfilled
    ).toHaveBeenCalledTimes(1);
  });

  describe('#convertToDateRangeRequests', () => {
    it('converts date facet values to date range requests', () => {
      const values = [
        buildMockDateFacetValue({
          start: '2023-01-01',
          end: '2023-01-31',
          state: 'selected',
        }),
        buildMockDateFacetValue({
          start: '2023-02-01',
          end: '2023-02-28',
          state: 'idle',
        }),
      ];

      const result = convertToDateRangeRequests(values);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        start: '2023-01-01',
        end: '2023-01-31',
        endInclusive: false,
        state: 'selected',
        previousState: 'selected',
      });
      expect(result[1]).toEqual({
        start: '2023-02-01',
        end: '2023-02-28',
        endInclusive: false,
        state: 'idle',
      });
    });

    it('sets previousState when value state is selected', () => {
      const values = [
        buildMockDateFacetValue({
          start: '2023-01-01',
          end: '2023-01-31',
          state: 'selected',
        }),
      ];

      const result = convertToDateRangeRequests(values);

      expect(result[0].previousState).toBe('selected');
    });

    it('sets previousState when value state is excluded', () => {
      const values = [
        buildMockDateFacetValue({
          start: '2023-01-01',
          end: '2023-01-31',
          state: 'excluded',
        }),
      ];

      const result = convertToDateRangeRequests(values);

      expect(result[0].previousState).toBe('excluded');
    });

    it('does not set previousState when value state is idle', () => {
      const values = [
        buildMockDateFacetValue({
          start: '2023-01-01',
          end: '2023-01-31',
          state: 'idle',
        }),
      ];

      const result = convertToDateRangeRequests(values);

      expect(result[0].previousState).toBeUndefined();
    });

    it('removes numberOfResults property from date facet values', () => {
      const values = [
        buildMockDateFacetValue({
          start: '2023-01-01',
          end: '2023-01-31',
          state: 'selected',
          numberOfResults: 42,
        }),
      ];

      const result = convertToDateRangeRequests(values);

      expect(result[0]).not.toHaveProperty('numberOfResults');
    });

    it('handles mixed states correctly', () => {
      const values = [
        buildMockDateFacetValue({
          start: '2023-01-01',
          end: '2023-01-31',
          state: 'selected',
        }),
        buildMockDateFacetValue({
          start: '2023-02-01',
          end: '2023-02-28',
          state: 'excluded',
        }),
        buildMockDateFacetValue({
          start: '2023-03-01',
          end: '2023-03-31',
          state: 'idle',
        }),
      ];

      const result = convertToDateRangeRequests(values);

      expect(result[0].previousState).toBe('selected');
      expect(result[1].previousState).toBe('excluded');
      expect(result[2].previousState).toBeUndefined();
    });
  });
});
