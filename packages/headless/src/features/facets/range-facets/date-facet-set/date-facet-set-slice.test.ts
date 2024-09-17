import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildMockSearch} from '../../../../test/mock-search';
import {logSearchEvent} from '../../../analytics/analytics-actions';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions';
import {change} from '../../../history/history-actions';
import {getHistoryInitialState} from '../../../history/history-state';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions';
import {executeSearch} from '../../../search/search-actions';
import * as FacetReducers from '../../generic/facet-reducer-helpers';
import * as RangeFacetReducers from '../generic/range-facet-reducers';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
  updateDateFacetSortCriterion,
  deselectAllDateFacetValues,
  RegisterDateFacetActionCreatorPayload,
  updateDateFacetValues,
} from './date-facet-actions';
import {dateFacetSetReducer} from './date-facet-set-slice';
import {
  DateFacetSetState,
  getDateFacetSetInitialState,
} from './date-facet-set-state';

describe('date-facet-set slice', () => {
  let state: DateFacetSetState;

  beforeEach(() => {
    state = getDateFacetSetInitialState();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    const spy = jest.spyOn(
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
    jest.spyOn(RangeFacetReducers, 'toggleSelectRangeValue');

    dateFacetSetReducer(
      state,
      toggleSelectDateFacetValue({facetId, selection})
    );

    expect(RangeFacetReducers.toggleSelectRangeValue).toHaveBeenCalledTimes(1);
  });

  it('#updateDateFacetValues calls #updateRangeValues', () => {
    jest.spyOn(RangeFacetReducers, 'updateRangeValues');
    const action = updateDateFacetValues({facetId: '1', values: []});
    dateFacetSetReducer(state, action);

    expect(RangeFacetReducers.updateRangeValues).toHaveBeenCalledTimes(1);
  });

  it('#deselectAllDateFacetValues calls #handleRangeFacetDeselectAll', () => {
    jest.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll');
    const action = deselectAllDateFacetValues('1');
    dateFacetSetReducer(state, action);

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(1);
  });

  it('dispatching #deselectAllBreadcrumbs calls #handleRangeFacetDeselectAll for every date facet', () => {
    jest.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll').mockReset();

    state['1'] = buildMockDateFacetSlice();
    state['2'] = buildMockDateFacetSlice();
    dateFacetSetReducer(state, deselectAllBreadcrumbs());

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(2);
  });

  it('#updateDateFacetSortCriterion calls #handleFacetSortCriterionUpdate', () => {
    jest.spyOn(FacetReducers, 'handleFacetSortCriterionUpdate');

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
    jest.spyOn(RangeFacetReducers, 'onRangeFacetRequestFulfilled');

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
});
