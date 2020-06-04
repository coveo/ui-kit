import {MockEngine, buildMockEngine} from '../../test/mock-engine';
import {Sort, SortOptions} from './headless-sort';
import {
  buildRelevanceSortCriterion,
  buildDateSortCriterion,
  buildEmptySortCriterion,
} from '../../features/sort-criterion/criteria';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../features/sort-criterion/sort-criterion-actions';
import {executeSearch} from '../../features/search/search-actions';
import {createMockState} from '../../test/mock-state';

describe('Sort', () => {
  let engine: MockEngine;
  let options: Partial<SortOptions>;
  let sort: Sort;

  function initSort() {
    sort = new Sort(engine, options);
  }

  beforeEach(() => {
    engine = buildMockEngine();
    options = {};

    initSort();
  });

  it('when the #criterion option is not specified, it dispatches a registration action with an empty criterion', () => {
    const action = registerSortCriterion(buildEmptySortCriterion());

    expect(engine.actions).toContainEqual(action);
    expect(options.criterion).toBe(undefined);
  });

  it('when the #criterion option is specified, it dispatches a registration action', () => {
    options.criterion = buildRelevanceSortCriterion();
    initSort();

    expect(engine.actions).toContainEqual(
      registerSortCriterion(options.criterion)
    );
  });

  describe('when calling #sortBy with a criterion', () => {
    const criterion = buildDateSortCriterion('descending');

    beforeEach(() => {
      sort.sortBy(criterion);
    });

    it('dispatches an updateSortCriterion action with the passed criterion', () => {
      const action = updateSortCriterion(criterion);
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches an executeSearch', () => {
      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  describe('when the store #sortCiteria is set', () => {
    const criterionInState = buildDateSortCriterion('ascending');

    beforeEach(() => {
      const state = createMockState({
        sortCriteria: criterionInState.expression,
      });
      engine = buildMockEngine({state});
      initSort();
    });

    it('calling #state returns the sortCriteria expression', () => {
      expect(sort.state).toEqual({sortCriteria: criterionInState.expression});
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
