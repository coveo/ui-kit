import {loadCollection} from '../../../features/folding/insight-folding-actions.js';
import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions.js';
import type {InsightAppState} from '../../../state/insight-app-state.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {
  buildFoldedResultList,
  type FoldedResultList,
} from './headless-insight-folded-result-list.js';

vi.mock('../../../features/folding/insight-folding-actions');
vi.mock('../../../features/insight-search/insight-search-actions');

describe('insight folded result list', () => {
  let state: InsightAppState;
  let engine: MockedInsightEngine;
  let foldedResultList: FoldedResultList;

  function initFoldedResultList() {
    engine = buildMockInsightEngine(state);
    foldedResultList = buildFoldedResultList(engine);
  }

  beforeEach(() => {
    state = buildMockInsightState();
    state.search.response.totalCountFiltered = 100;
    initFoldedResultList();
  });

  it('#loadCollection dispatches the insight folding #loadCollection action', () => {
    foldedResultList.loadCollection({
      children: [],
      isLoadingMoreResults: false,
      moreResultsAvailable: false,
      result: buildMockResult(),
    });

    expect(loadCollection).toHaveBeenCalled();
  });

  it('#fetchMoreResults dispatches the insight search #fetchMoreResults action', () => {
    foldedResultList.fetchMoreResults();
    expect(fetchMoreResults).toHaveBeenCalled();
  });
});
