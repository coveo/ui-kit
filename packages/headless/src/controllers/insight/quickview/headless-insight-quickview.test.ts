import {HtmlRequestOptions} from '../../../api/search/html/html-request';
import {configuration} from '../../../app/common-reducers';
import {insightInterfaceReducer as insightInterface} from '../../../features/insight-interface/insight-interface-slice';
import {buildInsightResultPreviewRequest} from '../../../features/insight-search/insight-result-preview-request-builder';
import {logDocumentQuickview} from '../../../features/result-preview/result-preview-insight-analytics-actions';
import {resultPreviewReducer as resultPreview} from '../../../features/result-preview/result-preview-slice';
import {InsightAppState} from '../../../state/insight-app-state';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {buildMockResult} from '../../../test/mock-result';
import {buildCoreQuickview} from '../../core/quickview/headless-core-quickview';
import {
  buildQuickview,
  QuickviewOptions,
  Quickview,
} from './headless-insight-quickview';

jest.mock('../../core/quickview/headless-core-quickview');
jest.mock(
  '../../../features/result-preview/result-preview-insight-analytics-actions'
);
jest.mock(
  '../../../features/insight-search/insight-result-preview-request-builder'
);

describe('Insight Quickview', () => {
  let engine: MockedInsightEngine;
  let state: InsightAppState;
  let options: QuickviewOptions;
  let quickview: Quickview;
  const mockedBuildCoreQuickview = jest.mocked(buildCoreQuickview);
  function initEngine(preloadedState = buildMockInsightState()) {
    state = preloadedState;
    engine = buildMockInsightEngine(preloadedState);
  }

  function initQuickview() {
    quickview = buildQuickview(engine, {options});
  }

  beforeEach(() => {
    jest.resetAllMocks();
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
    const mockedBuildInsightResultPreviewRequest = jest.mocked(
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
    const mockedLogDocumentQuickview = jest.mocked(logDocumentQuickview);
    const coreQuickviewParamsFetchResultContentCallback =
      mockedBuildCoreQuickview.mock.calls[0][4];

    coreQuickviewParamsFetchResultContentCallback?.();

    expect(mockedLogDocumentQuickview).toHaveBeenCalledTimes(1);
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedLogDocumentQuickview.mock.results[0].value
    );
  });
});
