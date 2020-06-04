import {
  sortCriteriaReducer,
  SortCriteriaState,
  getSortCriteriaInitialState,
} from './sort-criterion-slice';
import {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criterion-actions';
import {buildFieldSortCriterion, buildRelevanceSortCriterion} from './criteria';

describe('sortCriteria', () => {
  let initialState: SortCriteriaState;

  beforeEach(() => {
    initialState = getSortCriteriaInitialState();
  });

  it('initializes the state to an empty string', () => {
    const finalState = sortCriteriaReducer(undefined, {type: ''});
    expect(finalState).toBe('');
  });

  it(`when the state is an empty string and a registerSortCriterion is received,
  it updates the state to the passed criterion expression`, () => {
    const criterion = buildFieldSortCriterion('author', 'ascending');
    const action = registerSortCriterion(criterion);
    const finalState = sortCriteriaReducer(initialState, action);

    expect(finalState).toBe(criterion.expression);
  });

  it(`when the state is not an empty string and a registerSortCriterion is received,
  it updates the state to the passed expression`, () => {
    initialState = 'relevancy';

    const criterion = buildFieldSortCriterion('author', 'ascending');
    const action = registerSortCriterion(criterion);
    const finalState = sortCriteriaReducer(initialState, action);

    expect(finalState).toBe(initialState);
  });

  it('when an updateSortCriterion is received, it updates the state to the passed criterion expression', () => {
    const criterion = buildRelevanceSortCriterion();
    const action = updateSortCriterion(criterion);
    const finalState = sortCriteriaReducer(initialState, action);

    expect(finalState).toBe(criterion.expression);
  });
});
