import {registerInstantResults} from '../../features/instant-results/instant-results-actions';
import {instantResultsReducer as instantResults} from '../../features/instant-results/instant-results-slice';
import {SearchAppState} from '../../state/search-app-state';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {buildInstantResults} from './instant-results';

jest.mock('../../features/instant-results/instant-results-actions');

describe('instant results', () => {
  let engine: MockedSearchEngine;
  let state: SearchAppState;

  beforeEach(() => {
    jest.useFakeTimers();
    state = createMockState();
    engine = buildMockSearchEngine(state);
  });

  it('it adds the correct reducers to engine', () => {
    const searchBoxId = 'search_box_1';
    buildInstantResults(engine, {
      options: {searchBoxId, maxResultsPerQuery: 2},
    });

    expect(engine.addReducers).toHaveBeenCalledWith({instantResults});
  });

  it('it registers search box', () => {
    const searchBoxId = 'search_box_1';
    buildInstantResults(engine, {
      options: {searchBoxId, maxResultsPerQuery: 2},
    });
    expect(registerInstantResults).toHaveBeenCalledWith({id: searchBoxId});
  });
});
