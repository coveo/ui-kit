import {buildInstantResults} from '..';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../test';
import {instantResults} from '../../app/reducers';
import {SearchAppState} from '../..';
import {registerInstantResults} from '../../features/instant-results/instant-results-actions';

describe('instant results', () => {
  let engine: MockSearchEngine;
  let state: SearchAppState;

  beforeEach(() => {
    jest.useFakeTimers();
    state = createMockState();
    engine = buildMockSearchAppEngine({state});
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

    expect(engine.actions.pop()).toEqual(
      registerInstantResults({id: searchBoxId})
    );
  });
});
