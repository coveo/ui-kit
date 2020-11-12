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
    const criterion = buildFieldSortCriterion('author', SortOrder.Ascending);
    const action = registerSortCriterion(criterion);

    const finalState = sortCriteriaReducer(initialState, action);
    expect(finalState).toBe(buildCriterionExpression(criterion));
  });

  it('when an updateSortCriterion is received, it updates the state to the passed criterion expression', () => {
    const criterion = buildRelevanceSortCriterion();
    const action = updateSortCriterion(criterion);
    const finalState = sortCriteriaReducer(initialState, action);

    expect(finalState).toBe(buildCriterionExpression(criterion));
  });
});
