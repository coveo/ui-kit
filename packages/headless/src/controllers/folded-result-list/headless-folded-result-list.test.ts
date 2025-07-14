import {loadCollection} from '../../features/folding/folding-actions.js';
import {fetchMoreResults} from '../../features/search/search-actions.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockResult} from '../../test/mock-result.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildFoldedResultList,
  type FoldedResultList,
} from './headless-folded-result-list.js';

vi.mock('../../features/folding/folding-actions');
vi.mock('../../features/search/search-actions');

describe('folded result list', () => {
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let foldedResultList: FoldedResultList;

  function initFoldedResultList() {
    engine = buildMockSearchEngine(state);
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

    expect(loadCollection).toHaveBeenCalled();
  });
  it('#fetchMoreResults dispatches the search #fetchMoreResults action', () => {
    foldedResultList.fetchMoreResults();
    expect(fetchMoreResults).toHaveBeenCalled();
  });
});
