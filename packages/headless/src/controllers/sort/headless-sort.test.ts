import {executeSearch} from '../../features/search/search-actions.js';
import {
  buildDateSortCriterion,
  SortOrder,
} from '../../features/sort-criteria/criteria.js';
import {updateSortCriterion} from '../../features/sort-criteria/sort-criteria-actions.js';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {Sort, SortProps, buildSort} from './headless-sort.js';

jest.mock('../../features/sort-criteria/sort-criteria-actions');
jest.mock('../../features/search/search-actions');

describe('Sort', () => {
  let engine: MockedSearchEngine;
  let props: SortProps;
  let sort: Sort;

  function initSort() {
    sort = buildSort(engine, props);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
    props = {
      initialState: {},
    };

    initSort();
  });

  describe('when calling #sortBy with a criterion', () => {
    const criterion = buildDateSortCriterion(SortOrder.Descending);

    beforeEach(() => {
      sort.sortBy(criterion);
    });

    it('dispatches an updateSortCriterion action with the passed criterion', () => {
      expect(updateSortCriterion).toHaveBeenCalledWith(criterion);
    });

    it('dispatches an executeSearch', () => {
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
