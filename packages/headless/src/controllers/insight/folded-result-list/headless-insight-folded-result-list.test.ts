import {loadCollection} from '../../../features/folding/insight-folding-actions';
import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions';
import {InsightAppState} from '../../../state/insight-app-state';
import {buildMockResult} from '../../../test';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../../test/mock-engine';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  FoldedResultList,
  buildFoldedResultList,
} from './headless-insight-folded-result-list';

describe('InsightFoldedResultList', () => {
  let state: InsightAppState;
  let engine: MockInsightEngine;
  let foldedResultList: FoldedResultList;

  function initFoldedResultList() {
    engine = buildMockInsightEngine({state});
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

    expect(engine.findAsyncAction(loadCollection.pending)).toBeTruthy();
  });
  it('#fetchMoreResults dispatches the insight search #fetchMoreResults action', () => {
    foldedResultList.fetchMoreResults();

    expect(engine.findAsyncAction(fetchMoreResults.pending)).toBeTruthy();
  });
});
