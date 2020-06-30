import {MockEngine, buildMockEngine} from '../../test/mock-engine';
import {Sort, SortProps} from './headless-sort';
import {
  buildRelevanceSortCriterion,
  buildDateSortCriterion,
} from '../../features/sort-criteria/criteria';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../features/sort-criteria/sort-criteria-actions';
import {executeSearch} from '../../features/search/search-actions';
import {createMockState} from '../../test/mock-state';
import {updatePage} from '../../features/pagination/pagination-actions';

describe('Sort', () => {
  let engine: MockEngine;
  let props: SortProps;
  let sort: Sort;

  function initSort() {
    sort = new Sort(engine, props);
  }

  beforeEach(() => {
    engine = buildMockEngine();
    props = {
      initialState: {},
    };

    initSort();
  });

  it('when the #criterion option is not specified, it does not dispatch a registration action', () => {
    const action = engine.actions.find(
      (a) => a.type === registerSortCriterion.type
    );
    expect(action).toBe(undefined);
  });

  it('when the #criterion option is specified, it dispatches a registration action', () => {
    props.initialState.criterion = buildRelevanceSortCriterion();
    initSort();

    expect(engine.actions).toContainEqual(
      registerSortCriterion(props.initialState.criterion)
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

    it('updates the page to the first one', () => {
      expect(engine.actions).toContainEqual(updatePage(1));
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
