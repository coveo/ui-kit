import {loadCollection} from '../../features/folding/folding-actions';
import {fetchMoreResults} from '../../features/search/search-actions';
import {SearchAppState} from '../../state/search-app-state';
import {MockSearchEngine, buildMockSearchAppEngine} from '../../test';
import {buildMockResult} from '../../test/mock-result';
import {createMockState} from '../../test/mock-state';
import {
  FoldedResultList,
  buildFoldedResultList,
} from './headless-folded-result-list';

describe('folded result list', () => {
  let state: SearchAppState;
  let engine: MockSearchEngine;
  let foldedResultList: FoldedResultList;

  function initFoldedResultList() {
    engine = buildMockSearchAppEngine({state});
    foldedResultList = buildFoldedResultList(engine);
  }

  beforeEach(() => {
    state = createMockState();
    state.search.response.totalCountFiltered = 100;
    initFoldedResultList();
  });

  it('#loadCollection dispatches the folding #loadCollection action', () => {
    foldedResultList.loadCollection({
      children: [],
      isLoadingMoreResults: false,
      moreResultsAvailable: false,
      result: buildMockResult(),
    });

    expect(engine.findAsyncAction(loadCollection.pending)).toBeTruthy();
  });
  it('#fetchMoreResults dispatches the search #fetchMoreResults action', () => {
    foldedResultList.fetchMoreResults();

    expect(engine.findAsyncAction(fetchMoreResults.pending)).toBeTruthy();
  });
});
