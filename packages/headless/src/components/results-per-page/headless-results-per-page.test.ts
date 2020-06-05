import {
  ResultsPerPage,
  ResultsPerPageOptions,
} from './headless-results-per-page';
import {MockEngine, buildMockEngine} from '../../test/mock-engine';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from '../../features/number-of-results/number-of-results-actions';
import {executeSearch} from '../../features/search/search-actions';
import {createMockState} from '../../test/mock-state';

describe('ResultsPerPage', () => {
  let engine: MockEngine;
  let options: Partial<ResultsPerPageOptions>;
  let resultsPerPage: ResultsPerPage;

  function initResultsPerPage() {
    resultsPerPage = new ResultsPerPage(engine, options);
  }

  beforeEach(() => {
    engine = buildMockEngine({});
    options = {};

    initResultsPerPage();
  });

  it('when the #numberOfResults option is specified to 10, it dispatches a register action with the value', () => {
    const num = 10;
    options.numberOfResults = num;
    initResultsPerPage();

    expect(engine.actions).toContainEqual(registerNumberOfResults(num));
  });

  it('when the #numberOfResults option is specified to 0, it dispatches a register action', () => {
    const num = 0;
    options.numberOfResults = num;
    initResultsPerPage();

    expect(engine.actions).toContainEqual(registerNumberOfResults(num));
  });

  it('when the #numberOfResults option is not specified, it does not dispatch a register action', () => {
    const action = engine.actions.find(
      (a) => a.type === registerNumberOfResults.type
    );

    expect(action).toBe(undefined);
    expect(options.numberOfResults).toBe(undefined);
  });

  it('calling #set updates the number of results to the passed value', () => {
    const num = 10;
    resultsPerPage.set(num);

    expect(engine.actions).toContainEqual(updateNumberOfResults(num));
  });

  it('calling #set executes a search', () => {
    resultsPerPage.set(10);

    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(action).toBeTruthy();
  });

  describe('when the state #numberOfResults is set to a value', () => {
    const numOfResultsInState = 10;

    beforeEach(() => {
      const state = createMockState({numberOfResults: numOfResultsInState});
      engine = buildMockEngine({state});
      initResultsPerPage();
    });

    it('calling #isSetTo with the same value returns true', () => {
      expect(resultsPerPage.isSetTo(numOfResultsInState)).toBe(true);
    });

    it('calling #isSetTo with a different value returns false', () => {
      expect(resultsPerPage.isSetTo(numOfResultsInState + 1)).toBe(false);
    });
  });
});
