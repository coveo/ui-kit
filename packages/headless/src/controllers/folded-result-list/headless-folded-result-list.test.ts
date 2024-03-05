import {loadCollection} from '../../features/folding/folding-actions';
import {fetchMoreResults} from '../../features/search/search-actions';
import {SearchAppState} from '../../state/search-app-state';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockResult} from '../../test/mock-result';
import {createMockState} from '../../test/mock-state';
import {
  FoldedResultList,
  buildFoldedResultList,
} from './headless-folded-result-list';

jest.mock('../../features/folding/folding-actions');
jest.mock('../../features/search/search-actions');

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
