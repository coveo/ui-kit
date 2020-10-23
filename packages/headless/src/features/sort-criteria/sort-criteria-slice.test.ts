import {sortCriteriaReducer} from './sort-criteria-slice';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria-actions';
import {buildFieldSortCriterion, buildRelevanceSortCriterion} from './criteria';
import {
  getSortCriteriaInitialState,
  SortCriteriaState,
} from './sort-criteria-state';

describe('sortCriteria', () => {
  let initialState: SortCriteriaState;

  beforeEach(() => {
    initialState = getSortCriteriaInitialState();
  });

  it('initializes the state to relevancy', () => {
    const finalState = sortCriteriaReducer(undefined, {type: ''});
    expect(finalState).toBe('relevancy');
  });

  it('#registerSortCriterion updates the state to the passed criterion expression', () => {
    const criterion = buildFieldSortCriterion('author', 'ascending');
    const action = registerSortCriterion(criterion);
    const finalState = sortCriteriaReducer(initialState, action);

    expect(finalState).toBe(criterion.expression);
  });

  it('when an updateSortCriterion is received, it updates the state to the passed criterion expression', () => {
    const criterion = buildRelevanceSortCriterion();
    const action = updateSortCriterion(criterion);
    const finalState = sortCriteriaReducer(initialState, action);

    expect(finalState).toBe(criterion.expression);
  });
});
