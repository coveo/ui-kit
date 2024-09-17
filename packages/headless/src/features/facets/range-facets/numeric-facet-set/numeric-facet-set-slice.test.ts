import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
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
  registerNumericFacet,
  toggleSelectNumericFacetValue,
  updateNumericFacetSortCriterion,
  deselectAllNumericFacetValues,
  RegisterNumericFacetActionCreatorPayload,
  updateNumericFacetValues,
  toggleExcludeNumericFacetValue,
} from './numeric-facet-actions';
import {numericFacetSetReducer} from './numeric-facet-set-slice';
import {
  NumericFacetSetState,
  getNumericFacetSetInitialState,
} from './numeric-facet-set-state';

describe('numeric-facet-set slice', () => {
  let state: NumericFacetSetState;

  beforeEach(() => {
    state = getNumericFacetSetInitialState();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes the set to an empty object', () => {
    const finalState = numericFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerNumericFacet registers a numeric facet', () => {
    const facetId = '1';
    const options: RegisterNumericFacetActionCreatorPayload = {
      facetId,
      field: '',
      generateAutomaticRanges: true,
    };

    const finalState = numericFacetSetReducer(
      state,
      registerNumericFacet(options)
    );

    expect(finalState[facetId]?.request).toEqual({
      ...options,
      currentValues: [],
      filterFacetCount: true,
      generateAutomaticRanges: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      preventAutoSelect: false,
      sortCriteria: 'ascending',
      type: 'numericalRange',
      rangeAlgorithm: 'even',
      resultsMustMatch: 'atLeastOneValue',
    });
  });

  it('it restores the numericFacetSet on history change', () => {
    const numericFacetSet = {'1': buildMockNumericFacetSlice()};
    const payload = {
      ...getHistoryInitialState(),
      numericFacetSet,
    };

    const finalState = numericFacetSetReducer(
      state,
      change.fulfilled(payload, '')
    );

    expect(finalState).toEqual(numericFacetSet);
  });

  it('#restoreSearchParameters restores the #nf payload correctly', () => {
    const spy = jest.spyOn(
      RangeFacetReducers,
      'handleRangeFacetSearchParameterRestoration'
    );

    const facetId = '1';
    state[facetId] = buildMockNumericFacetSlice();

    const value = buildMockNumericFacetValue();
    const nf = {[facetId]: [value]};

    const action = restoreSearchParameters({nf});
    const finalState = numericFacetSetReducer(state, action);

    expect(finalState[facetId]?.request.currentValues).toContainEqual(value);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('#toggleSelectNumericFacetValue calls #toggleSelectRangeValue', () => {
    const facetId = '1';
    const selection = buildMockNumericFacetValue();
    jest.spyOn(RangeFacetReducers, 'toggleSelectRangeValue');

    numericFacetSetReducer(
      state,
      toggleSelectNumericFacetValue({facetId, selection})
    );

    expect(RangeFacetReducers.toggleSelectRangeValue).toHaveBeenCalledTimes(1);
  });

  it('#toggleExcludeNumericFacetValue calls #toggleExcludeRangeValue', () => {
    const facetId = '1';
    const selection = buildMockNumericFacetValue();
    jest.spyOn(RangeFacetReducers, 'toggleExcludeRangeValue');

    numericFacetSetReducer(
      state,
      toggleExcludeNumericFacetValue({facetId, selection})
    );

    expect(RangeFacetReducers.toggleExcludeRangeValue).toHaveBeenCalledTimes(1);
  });

  it('#deselectAllNumericFacetValues calls #handleRangeFacetDeselectAll', () => {
    jest.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll');
    const action = deselectAllNumericFacetValues('1');
    numericFacetSetReducer(state, action);

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(1);
  });

  it('#updateNumericFacetValues calls #updateRangeValues', () => {
    jest.spyOn(RangeFacetReducers, 'updateRangeValues');
    const action = updateNumericFacetValues({facetId: '1', values: []});
    numericFacetSetReducer(state, action);

    expect(RangeFacetReducers.updateRangeValues).toHaveBeenCalledTimes(1);
  });

  it('dispatching #deselectAllBreadcrumbs calls #handleRangeFacetDeselectAll for every numeric facet', () => {
    jest.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll').mockReset();

    state['1'] = buildMockNumericFacetSlice();
    state['2'] = buildMockNumericFacetSlice();
    numericFacetSetReducer(state, deselectAllBreadcrumbs());

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(2);
  });

  it('#updateNumericFacetSortCriterion calls #handleFacetSortCriterionUpdate', () => {
    jest.spyOn(FacetReducers, 'handleFacetSortCriterionUpdate');

    const action = updateNumericFacetSortCriterion({
      facetId: '1',
      criterion: 'descending',
    });
    numericFacetSetReducer(state, action);

    expect(FacetReducers.handleFacetSortCriterionUpdate).toHaveBeenCalledTimes(
      1
    );
  });

  it('#executeSearch.fulfilled calls #onRangeFacetRequestFulfilled', () => {
    jest.spyOn(RangeFacetReducers, 'onRangeFacetRequestFulfilled');

    const search = buildMockSearch();
    numericFacetSetReducer(
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
