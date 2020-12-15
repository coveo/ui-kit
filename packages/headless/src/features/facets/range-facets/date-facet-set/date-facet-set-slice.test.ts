import {dateFacetSetReducer} from './date-facet-set-slice';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
  updateDateFacetSortCriterion,
  deselectAllDateFacetValues,
} from './date-facet-actions';
import {DateFacetRegistrationOptions} from './interfaces/options';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request';
import {change} from '../../../history/history-actions';
import * as RangeFacetReducers from '../generic/range-facet-reducers';
import * as FacetReducers from '../../generic/facet-reducer-helpers';
import {executeSearch} from '../../../search/search-actions';
import {buildMockSearch} from '../../../../test/mock-search';
import {logSearchEvent} from '../../../analytics/analytics-actions';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {
  DateFacetSetState,
  getDateFacetSetInitialState,
} from './date-facet-set-state';
import {deselectAllFacets} from '../../generic/facet-actions';
import {getHistoryInitialState} from '../../../history/history-state';

describe('date-facet-set slice', () => {
  let state: DateFacetSetState;

  beforeEach(() => {
    state = getDateFacetSetInitialState();
  });

  it('initializes the set to an empty object', () => {
    const finalState = dateFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerDateFacet registers a date facet', () => {
    const facetId = '1';
    const options: DateFacetRegistrationOptions = {
      facetId,
      field: '',
      generateAutomaticRanges: true,
    };

    const finalState = dateFacetSetReducer(state, registerDateFacet(options));

    expect(finalState[facetId]).toEqual({
      ...options,
      currentValues: [],
      filterFacetCount: true,
      generateAutomaticRanges: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      preventAutoSelect: false,
      sortCriteria: 'ascending',
      type: 'dateRange',
    });
  });

  it('it restores the dateFacetSet on history change', () => {
    const dateFacetSet = {'1': buildMockDateFacetRequest()};
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

  it('#deselectAllDateFacetValues calls #handleRangeFacetDeselectAll', () => {
    jest.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll');
    const action = deselectAllDateFacetValues('1');
    dateFacetSetReducer(state, action);

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(1);
  });

  it('dispatching #deselectAllFacets calls #handleFacetDeselectAll for every date facet', () => {
    jest.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll');

    state['1'] = buildMockDateFacetRequest();
    state['2'] = buildMockDateFacetRequest();
    state['3'] = buildMockDateFacetRequest();
    dateFacetSetReducer(state, deselectAllFacets);

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(4);
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
      executeSearch.fulfilled(search, '', logSearchEvent({evt: 'foo'}))
    );

    expect(
      RangeFacetReducers.onRangeFacetRequestFulfilled
    ).toHaveBeenCalledTimes(1);
  });
});
