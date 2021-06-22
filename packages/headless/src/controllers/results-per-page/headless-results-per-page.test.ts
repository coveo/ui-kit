import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-results-per-page';
import {
  MockSearchEngine,
  buildMockSearchAppEngine,
} from '../../test/mock-engine';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from '../../features/pagination/pagination-actions';
import {executeSearch} from '../../features/search/search-actions';
import {createMockState} from '../../test/mock-state';
import {buildMockPagination} from '../../test/mock-pagination';
import {configuration, pagination} from '../../app/reducers';

describe('ResultsPerPage', () => {
  let engine: MockSearchEngine;
  let props: ResultsPerPageProps;
  let resultsPerPage: ResultsPerPage;

  function initResultsPerPage() {
    resultsPerPage = buildResultsPerPage(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine({});
    props = {
      initialState: {},
    };

    initResultsPerPage();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      pagination,
      configuration,
    });
  });

  it('when the #numberOfResults option is specified to 10, it dispatches a register action with the value', () => {
    const num = 10;
    props.initialState!.numberOfResults = num;
    initResultsPerPage();

    expect(engine.actions).toContainEqual(registerNumberOfResults(num));
  });

  it('when the #numberOfResults option is specified to 0, it dispatches a register action', () => {
    const num = 0;
    props.initialState!.numberOfResults = num;
    initResultsPerPage();

    expect(engine.actions).toContainEqual(registerNumberOfResults(num));
  });

  it('when the #numberOfResults option is not specified, it does not dispatch a register action', () => {
    const action = engine.actions.find(
      (a) => a.type === registerNumberOfResults.type
    );

    expect(action).toBe(undefined);
  });

  it('when #numberOfResults is set to a string, it throws an error with a context message', () => {
    props.initialState!.numberOfResults = ('1' as unknown) as number;

    expect(() => initResultsPerPage()).toThrow(
      'Check the initialState of buildResultsPerPage'
    );
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
      const pagination = buildMockPagination({
        numberOfResults: numOfResultsInState,
      });
      const state = createMockState({pagination});
      engine = buildMockSearchAppEngine({state});
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
