import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../../test/mock-engine';
import {Sort, SortProps, buildSort} from './headless-insight-sort';
import {
  buildDateSortCriterion,
  SortOrder,
} from '../../../features/sort-criteria/criteria';
import {updateSortCriterion} from '../../../features/sort-criteria/sort-criteria-actions';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {updatePage} from '../../../features/pagination/pagination-actions';
import {configuration, sortCriteria} from '../../../app/reducers';

describe('InsightSort', () => {
  let engine: MockInsightEngine;
  let props: SortProps;
  let sort: Sort;

  function initSort() {
    sort = buildSort(engine, props);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine();
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
});
