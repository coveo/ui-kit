import {preparePreviewPagination} from '../../features/result-preview/result-preview-actions';
import {logDocumentQuickview} from '../../features/result-preview/result-preview-analytics-actions';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder';
import {searchReducer} from '../../features/search/search-slice';
import {SearchAppState} from '../../state/search-app-state';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockResult} from '../../test/mock-result';
import {createMockState} from '../../test/mock-state';
import {buildCoreQuickview} from '../core/quickview/headless-core-quickview';
import {
  buildQuickview,
  QuickviewOptions,
  Quickview,
} from './headless-quickview';

jest.mock('../core/quickview/headless-core-quickview');
jest.mock('../../features/result-preview/result-preview-actions');
jest.mock('../../features/result-preview/result-preview-analytics-actions');

describe('Quickview', () => {
  const mockedBuildCoreQuickview = jest.mocked(buildCoreQuickview);
  let engine: MockedSearchEngine;
  let state: SearchAppState;
  let options: QuickviewOptions;
  let quickview: Quickview;

  function initEngine(preloadedState = createMockState()) {
    state = preloadedState;
    engine = buildMockSearchEngine(preloadedState);
  }

  function initQuickview() {
    quickview = buildQuickview(engine, {options});
  }

  beforeEach(() => {
    jest.resetAllMocks();
    initEngine();
    options = {
      result: buildMockResult(),
      maximumPreviewSize: 0,
    };

    initQuickview();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      search: searchReducer,
    });
  });

  it('calls #buildCoreQuickview', () => {
    expect(mockedBuildCoreQuickview).toHaveBeenCalledWith(
      engine,
      {options},
      buildResultPreviewRequest,
      '/html',
      expect.any(Function)
    );
  });

  it('dispatches #preparePreviewPagination', () => {
    const mockedPreparePreviewPagination = jest.mocked(
      preparePreviewPagination
    );

    expect(preparePreviewPagination).toHaveBeenCalledWith({
      results: state.search.results,
    });

    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedPreparePreviewPagination.mock.results[0].value
    );
  });

  it('#fetchResultContentCallback logs a document quickview', () => {
    const mockedLogDocumentQuickview = jest.mocked(logDocumentQuickview);
    const coreQuickviewParamsFetchResultContentCallback =
      mockedBuildCoreQuickview.mock.calls[0][4];

    coreQuickviewParamsFetchResultContentCallback?.();

    expect(mockedLogDocumentQuickview).toHaveBeenCalledTimes(1);
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedLogDocumentQuickview.mock.results[0].value
    );
  });

  it('#state.currentResult returns the correct value', () => {
    state.search.results = [
      buildMockResult(),
      buildMockResult({uniqueId: 'theCurrentResult'}),
    ];
    engine = buildMockSearchEngine(state);
    mockedBuildCoreQuickview.mockReturnValueOnce({
      state: {
        currentResultUniqueId: 'theCurrentResult',
      },
    } as unknown as Quickview);

    initQuickview();

    expect(quickview.state.currentResult).toBe(2);
  });

  it('#state.totalResults returns the correct value', () => {
    state.search.results = [buildMockResult(), buildMockResult()];
    engine = buildMockSearchEngine(state);
    mockedBuildCoreQuickview.mockReturnValueOnce({
      state: {
        currentResultUniqueId: 'theCurrentResult',
      },
    } as unknown as Quickview);

    initQuickview();

    expect(quickview.state.totalResults).toBe(2);
  });
});
