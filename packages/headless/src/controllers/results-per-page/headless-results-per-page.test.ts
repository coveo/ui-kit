import {AsyncThunk, UnknownAction} from '@reduxjs/toolkit';
import {ThunkDispatch} from 'redux-thunk';
import {GeneratedAnswerAPIClient} from '../../api/generated-answer/generated-answer-client';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {configuration} from '../../app/common-reducers';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from '../../features/pagination/pagination-actions';
import {paginationReducer as pagination} from '../../features/pagination/pagination-slice';
import {
  ExecuteSearchThunkReturn,
  fetchPage,
  TransitiveSearchAction,
} from '../../features/search/search-actions';
import {StateNeededByExecuteSearch} from '../../features/search/search-actions-thunk-processor';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockPagination} from '../../test/mock-pagination';
import {createMockState} from '../../test/mock-state';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-results-per-page';

jest.mock('../../features/pagination/pagination-actions');
jest.mock('../../features/search/search-actions');

describe('ResultsPerPage', () => {
  let engine: MockedSearchEngine;
  let props: ResultsPerPageProps;
  let resultsPerPage: ResultsPerPage;
  let mockedFetchPage: jest.MockedFunctionDeep<
    AsyncThunk<
      ExecuteSearchThunkReturn,
      TransitiveSearchAction,
      {
        rejectValue: SearchAPIErrorWithStatusCode;
        state: StateNeededByExecuteSearch;
        extra: ClientThunkExtraArguments<
          SearchAPIClient,
          GeneratedAnswerAPIClient
        >;
        dispatch?: ThunkDispatch<unknown, unknown, UnknownAction>;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
      }
    >
  >;
  function initResultsPerPage() {
    resultsPerPage = buildResultsPerPage(engine, props);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
    props = {
      initialState: {},
    };
    mockedFetchPage = jest.mocked(fetchPage);
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

  it('calling #set executes a fetchPage', () => {
    resultsPerPage.set(10);

    expect(fetchPage).toHaveBeenCalled();
  });

  it('calling #set executes a fetchPage with the proper analytics payload', () => {
    resultsPerPage.set(10);

    expect(mockedFetchPage.mock.lastCall).toMatchSnapshot();
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
