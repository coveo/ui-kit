import {configuration} from '../../../app/common-reducers.js';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from '../../../features/pagination/pagination-actions.js';
import {paginationReducer as pagination} from '../../../features/pagination/pagination-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockPagination} from '../../../test/mock-pagination.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCoreResultsPerPage,
  type ResultsPerPage,
  type ResultsPerPageProps,
} from './headless-core-results-per-page.js';

vi.mock('../../../features/pagination/pagination-actions');

describe('ResultsPerPage', () => {
  let engine: MockedSearchEngine;
  let props: ResultsPerPageProps;
  let resultsPerPage: ResultsPerPage;

  function initResultsPerPage() {
    resultsPerPage = buildCoreResultsPerPage(engine, props);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    const state = createMockState();
    engine = buildMockSearchEngine(state);
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
    expect(registerNumberOfResults).toHaveBeenCalledWith(num);
  });

  it('when the #numberOfResults option is specified to 0, it dispatches a register action', () => {
    const num = 0;
    props.initialState!.numberOfResults = num;
    initResultsPerPage();

    expect(registerNumberOfResults).toHaveBeenCalledWith(num);
  });

  it('when the #numberOfResults option is not specified, it does not dispatch a register action', () => {
    expect(registerNumberOfResults).not.toHaveBeenCalled();
  });

  it('when #numberOfResults is set to a string, it throws an error with a context message', () => {
    props.initialState!.numberOfResults = '1' as unknown as number;

    expect(() => initResultsPerPage()).toThrow(
      'Check the initialState of buildResultsPerPage'
    );
  });

  it('calling #set updates the number of results to the passed value', () => {
    const num = 10;
    resultsPerPage.set(num);

    expect(updateNumberOfResults).toHaveBeenCalledWith(num);
  });

  describe('when the state #numberOfResults is set to a value', () => {
    const numOfResultsInState = 10;

    beforeEach(() => {
      const pagination = buildMockPagination({
        numberOfResults: numOfResultsInState,
      });
      const state = createMockState({pagination});
      engine = buildMockSearchEngine(state);
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
