import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {
  buildDateSortCriterion,
  SortOrder,
} from '../../../features/sort-criteria/criteria';
import {updateSortCriterion} from '../../../features/sort-criteria/sort-criteria-actions';
import {
  MockedInsightEngine,
  buildMockInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {Sort, SortProps, buildSort} from './headless-insight-sort';

jest.mock('../../../features/sort-criteria/sort-criteria-actions');
jest.mock('../../../features/insight-search/insight-search-actions');

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
