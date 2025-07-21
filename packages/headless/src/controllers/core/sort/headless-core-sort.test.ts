import {configuration} from '../../../app/common-reducers.js';
import {updatePage} from '../../../features/pagination/pagination-actions.js';
import {
  buildCriterionExpression,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildRelevanceSortCriterion,
  type SortCriterion,
  SortOrder,
} from '../../../features/sort-criteria/criteria.js';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../../features/sort-criteria/sort-criteria-actions.js';
import {sortCriteriaReducer as sortCriteria} from '../../../features/sort-criteria/sort-criteria-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCoreSort,
  type Sort,
  type SortProps,
} from './headless-core-sort.js';

vi.mock('../../../features/sort-criteria/sort-criteria-actions');
vi.mock('../../../features/pagination/pagination-actions');

describe('Sort', () => {
  let engine: MockedSearchEngine;
  let props: SortProps;
  let sort: Sort;

  function initSort() {
    sort = buildCoreSort(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    props = {
      initialState: {},
    };

    initSort();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      sortCriteria,
    });
  });

  it('when the #criterion option is not specified, it does not dispatch a registration action', () => {
    expect(registerSortCriterion).not.toHaveBeenCalled();
  });

  it('when #criterion is an invalid value, it throws an error', () => {
    props.initialState!.criterion = '1' as unknown as SortCriterion;
    expect(() => initSort()).toThrow('Check the initialState of buildSort');
  });

  it('when the #criterion option is specified, it dispatches a registration action', () => {
    props.initialState!.criterion = buildRelevanceSortCriterion();
    initSort();
    expect(registerSortCriterion).toHaveBeenCalledWith(
      props.initialState!.criterion
    );
  });

  it('when the #criterion is an array, it dispatches a registration action', () => {
    props.initialState!.criterion = [
      buildFieldSortCriterion('author', SortOrder.Ascending),
      buildDateSortCriterion(SortOrder.Descending),
    ];
    initSort();

    expect(registerSortCriterion).toHaveBeenCalledWith(
      props.initialState!.criterion
    );
  });

  describe('when calling #sortBy with a criterion', () => {
    const criterion = buildDateSortCriterion(SortOrder.Descending);

    beforeEach(() => {
      sort.sortBy(criterion);
    });

    it('dispatches an updateSortCriterion action with the passed criterion', () => {
      expect(updateSortCriterion).toHaveBeenCalledWith(criterion);
    });

    it('updates the page to the first one', () => {
      expect(updatePage).toHaveBeenCalledWith(1);
    });
  });

  describe('when the store #sortCiteria is set', () => {
    const criterionInState = buildDateSortCriterion(SortOrder.Descending);
    const criterionInStateExpression =
      buildCriterionExpression(criterionInState);

    beforeEach(() => {
      const state = createMockState({
        sortCriteria: criterionInStateExpression,
      });

      engine = buildMockSearchEngine(state);
      initSort();
    });

    it('calling #state returns the sortCriteria expression', () => {
      expect(sort.state).toEqual({sortCriteria: criterionInStateExpression});
    });

    it('calling #isSortedBy with a criterion equal to the one in state returns true', () => {
      expect(sort.isSortedBy(criterionInState)).toBe(true);
    });

    it('calling #isSortedBy with a criterion not equal to the one in state returns false', () => {
      const criterionNotInState = buildRelevanceSortCriterion();
      expect(sort.isSortedBy(criterionNotInState)).toBe(false);
    });
  });
});
