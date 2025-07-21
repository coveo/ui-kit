import type {HtmlRequestOptions} from '../../../api/search/html/html-request.js';
import {configuration} from '../../../app/common-reducers.js';
import {insightInterfaceReducer as insightInterface} from '../../../features/insight-interface/insight-interface-slice.js';
import {buildInsightResultPreviewRequest} from '../../../features/insight-search/insight-result-preview-request-builder.js';
import {logDocumentQuickview} from '../../../features/result-preview/result-preview-insight-analytics-actions.js';
import {resultPreviewReducer as resultPreview} from '../../../features/result-preview/result-preview-slice.js';
import type {InsightAppState} from '../../../state/insight-app-state.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {buildMockResult} from '../../../test/mock-result.js';
import {buildCoreQuickview} from '../../core/quickview/headless-core-quickview.js';
import {
  buildQuickview,
  type Quickview,
  type QuickviewOptions,
} from './headless-insight-quickview.js';

vi.mock('../../core/quickview/headless-core-quickview');
vi.mock(
  '../../../features/result-preview/result-preview-insight-analytics-actions'
);
vi.mock(
  '../../../features/insight-search/insight-result-preview-request-builder'
);

describe('Insight Quickview', () => {
  let engine: MockedInsightEngine;
  let state: InsightAppState;
  let options: QuickviewOptions;
  let quickview: Quickview;
  const mockedBuildCoreQuickview = vi.mocked(buildCoreQuickview);
  function initEngine(preloadedState = buildMockInsightState()) {
    state = preloadedState;
    engine = buildMockInsightEngine(preloadedState);
  }

  function initQuickview() {
    quickview = buildQuickview(engine, {options});
  }

  beforeEach(() => {
    vi.resetAllMocks();
    options = {
      result: buildMockResult(),
      maximumPreviewSize: 0,
    };
    initEngine();
    initQuickview();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      resultPreview,
      insightInterface,
    });
  });

  it('calls #buildCoreQuickview and returns its results', () => {
    expect(mockedBuildCoreQuickview).toHaveBeenCalledWith(
      engine,
      {options: {...options, onlyContentURL: true}},
      expect.any(Function),
      '/quickview',
      expect.any(Function)
    );
    expect(mockedBuildCoreQuickview).toHaveLastReturnedWith(quickview);
  });

  it('#buildResultPreviewRequest calls #buildInsightResultPreviewRequest and returns its results', () => {
    const mockedBuildInsightResultPreviewRequest = vi.mocked(
      buildInsightResultPreviewRequest
    );

    const someHtmlRequestOptions: HtmlRequestOptions = {
      uniqueId: 'some-id',
      requestedOutputSize: 0,
    };

    const coreQuickviewParamsBuildResultPreviewRequest =
      mockedBuildCoreQuickview.mock.calls[0][2];
    coreQuickviewParamsBuildResultPreviewRequest(state, someHtmlRequestOptions);

    expect(mockedBuildInsightResultPreviewRequest).toHaveBeenCalledTimes(1);
    expect(mockedBuildInsightResultPreviewRequest).toHaveBeenCalledWith(
      state,
      someHtmlRequestOptions
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
});
