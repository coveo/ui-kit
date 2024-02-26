import {loadCollection} from '../../../features/folding/insight-folding-actions';
import {fetchMoreResults} from '../../../features/insight-search/insight-search-actions';
import {InsightAppState} from '../../../state/insight-app-state';
import {
  MockedInsightEngine,
  buildMockInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {buildMockResult} from '../../../test/mock-result';
import {
  FoldedResultList,
  buildFoldedResultList,
} from './headless-insight-folded-result-list';

jest.mock('../../../features/folding/insight-folding-actions');
jest.mock('../../../features/insight-search/insight-search-actions');

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
