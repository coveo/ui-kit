import {
  NumericFacetSetState,
  getNumericFacetSetInitialState,
} from './numeric-facet-set-state';
import {
  registerNumericFacet,
  toggleSelectNumericFacetValue,
  updateNumericFacetSortCriterion,
  deselectAllNumericFacetValues,
  NumericFacetRegistrationOptions,
} from './numeric-facet-actions';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request';
import {change} from '../../../history/history-actions';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import * as RangeFacetReducers from '../generic/range-facet-reducers';
import * as FacetReducers from '../../generic/facet-reducer-helpers';
import {executeSearch} from '../../../search/search-actions';
import {buildMockSearch} from '../../../../test/mock-search';
import {logSearchEvent} from '../../../analytics/analytics-actions';
import {numericFacetSetReducer} from './numeric-facet-set-slice';
import {deselectAllFacets} from '../../generic/facet-actions';
import {getHistoryInitialState} from '../../../history/history-state';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions';

describe('numeric-facet-set slice', () => {
  let state: NumericFacetSetState;

  beforeEach(() => {
    state = getNumericFacetSetInitialState();
  });

  it('initializes the set to an empty object', () => {
    const finalState = numericFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerNumericFacet registers a numeric facet', () => {
    const facetId = '1';
    const options: NumericFacetRegistrationOptions = {
      facetId,
      field: '',
      generateAutomaticRanges: true,
    };

    const finalState = numericFacetSetReducer(
      state,
      registerNumericFacet(options)
    );

    expect(finalState[facetId]).toEqual({
      ...options,
      currentValues: [],
      filterFacetCount: true,
      generateAutomaticRanges: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      preventAutoSelect: false,
      sortCriteria: 'ascending',
      type: 'numericalRange',
    });
  });

  it('it restores the numericFacetSet on history change', () => {
    const numericFacetSet = {'1': buildMockNumericFacetRequest()};
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
    state[facetId] = buildMockNumericFacetRequest();

    const value = buildMockNumericFacetValue();
    const nf = {[facetId]: [value]};

    const action = restoreSearchParameters({nf});
    const finalState = numericFacetSetReducer(state, action);

    expect(finalState[facetId].currentValues).toContainEqual(value);
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

  it('#deselectAllNumericFacetValues calls #handleRangeFacetDeselectAll', () => {
    jest.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll');
    const action = deselectAllNumericFacetValues('1');
    numericFacetSetReducer(state, action);

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(1);
  });

  it('dispatching #deselectAllFacets calls #handleFacetDeselectAll for every numeric facet', () => {
    jest.spyOn(RangeFacetReducers, 'handleRangeFacetDeselectAll');

    state['1'] = buildMockNumericFacetRequest();
    state['2'] = buildMockNumericFacetRequest();
    state['3'] = buildMockNumericFacetRequest();
    numericFacetSetReducer(state, deselectAllFacets);

    expect(
      RangeFacetReducers.handleRangeFacetDeselectAll
    ).toHaveBeenCalledTimes(4);
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
      executeSearch.fulfilled(search, '', logSearchEvent({evt: 'foo'}))
    );

    expect(
      RangeFacetReducers.onRangeFacetRequestFulfilled
    ).toHaveBeenCalledTimes(1);
  });
});
