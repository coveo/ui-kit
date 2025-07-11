import {preparePreviewPagination} from '../../features/result-preview/result-preview-actions.js';
import {logDocumentQuickview} from '../../features/result-preview/result-preview-analytics-actions.js';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder.js';
import {searchReducer} from '../../features/search/search-slice.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockResult} from '../../test/mock-result.js';
import {createMockState} from '../../test/mock-state.js';
import {buildCoreQuickview} from '../core/quickview/headless-core-quickview.js';
import {
  buildQuickview,
  type Quickview,
  type QuickviewOptions,
} from './headless-quickview.js';

vi.mock('../core/quickview/headless-core-quickview');
vi.mock('../../features/result-preview/result-preview-actions');
vi.mock('../../features/result-preview/result-preview-analytics-actions');

describe('Quickview', () => {
  const mockedBuildCoreQuickview = vi.mocked(buildCoreQuickview);
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
    vi.resetAllMocks();
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
    const mockedPreparePreviewPagination = vi.mocked(preparePreviewPagination);

    expect(preparePreviewPagination).toHaveBeenCalledWith({
      results: state.search.results,
    });

    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedPreparePreviewPagination.mock.results[0].value
    );
  });

  it('#fetchResultContentCallback logs a document quickview', () => {
    const mockedLogDocumentQuickview = vi.mocked(logDocumentQuickview);
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
