import {buildResultList, ResultList} from './headless-result-list';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {fetchMoreResults} from '../../features/search/search-actions';

describe('ResultList', () => {
  let engine: MockEngine<SearchAppState>;
  let resultList: ResultList;
  beforeEach(() => {
    resultList = buildResultList((engine = buildMockSearchAppEngine()));
  });

  it('initializes correctly', () => {
    expect(resultList).toBeTruthy();
  });

  it('fetchMoreResults should dispatch a fetchMoreResults action', () => {
    resultList.fetchMoreResults();
    expect(
      engine.actions.find(
        (action) => action.type === fetchMoreResults.pending.type
      )
    ).toBeTruthy();
  });
});
