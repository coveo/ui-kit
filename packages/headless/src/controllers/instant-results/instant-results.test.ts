import {registerInstantResults} from '../../features/instant-results/instant-results-actions.js';
import {instantResultsReducer as instantResults} from '../../features/instant-results/instant-results-slice.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildInstantResults} from './instant-results.js';

vi.mock('../../features/instant-results/instant-results-actions');

describe('instant results', () => {
  let engine: MockedSearchEngine;
  let state: SearchAppState;

  beforeEach(() => {
    vi.useFakeTimers();
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
