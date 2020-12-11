import {sortCriteriaReducer} from './sort-criteria-slice';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';
import {
  getSortCriteriaInitialState,
  SortCriteriaState,
} from './sort-criteria-state';
import {
  buildCriterionExpression,
  buildFieldSortCriterion,
  buildRelevanceSortCriterion,
  SortOrder,
} from './criteria';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

describe('sortCriteria', () => {
  let state: SortCriteriaState;

  beforeEach(() => {
    state = getSortCriteriaInitialState();
  });

  it('initializes the state to relevancy', () => {
    const finalState = sortCriteriaReducer(undefined, {type: ''});
    expect(finalState).toBe('relevancy');
  });

  it('#registerSortCriterion updates the state to the passed criterion expression', () => {
    const criterion = buildFieldSortCriterion('author', SortOrder.Ascending);
    const action = registerSortCriterion(criterion);

    const finalState = sortCriteriaReducer(state, action);
    expect(finalState).toBe(buildCriterionExpression(criterion));
  });

  it('when an updateSortCriterion is received, it updates the state to the passed criterion expression', () => {
    const criterion = buildRelevanceSortCriterion();
    const action = updateSortCriterion(criterion);
    const finalState = sortCriteriaReducer(state, action);

    expect(finalState).toBe(buildCriterionExpression(criterion));
  });

  describe('#restoreSearchParameters', () => {
    it('when the object contains a #sortCriteria key, it sets the value in state', () => {
      state = 'qre';

      const action = restoreSearchParameters({sortCriteria: ''});
      const finalState = sortCriteriaReducer(state, action);

      expect(finalState).toEqual('');
    });

    it('when the object does not contain a #sortCriteria key, it does not update the state', () => {
      state = 'qre';

      const action = restoreSearchParameters({});
      const finalState = sortCriteriaReducer(state, action);

      expect(finalState).toEqual(state);
    });
  });
});
