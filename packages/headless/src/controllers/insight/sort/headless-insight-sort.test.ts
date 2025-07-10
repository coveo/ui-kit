import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildDateSortCriterion,
  SortOrder,
} from '../../../features/sort-criteria/criteria.js';
import {updateSortCriterion} from '../../../features/sort-criteria/sort-criteria-actions.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {buildSort, type Sort, type SortProps} from './headless-insight-sort.js';

vi.mock('../../../features/sort-criteria/sort-criteria-actions');
vi.mock('../../../features/insight-search/insight-search-actions');

describe('InsightSort', () => {
  let engine: MockedInsightEngine;
  let props: SortProps;
  let sort: Sort;

  function initSort() {
    sort = buildSort(engine, props);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
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
