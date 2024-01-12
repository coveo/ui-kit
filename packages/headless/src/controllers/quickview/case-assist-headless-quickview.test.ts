import {logQuickviewDocumentSuggestionClick} from '../../features/case-assist/case-assist-analytics-actions';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice';
import {preparePreviewPagination} from '../../features/result-preview/result-preview-actions';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {buildMockResult} from '../../test';
import {buildMockDocumentSuggestion} from '../../test/mock-case-assist-document-suggestion';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state';
import {
  buildMockCaseAssistEngine,
  MockedCaseAssistEngine,
} from '../../test/mock-engine-v2';
import {buildCoreQuickview} from '../core/quickview/headless-core-quickview';
import {
  buildCaseAssistQuickview,
  CaseAssistQuickviewOptions,
  CaseAssistQuickview,
} from './case-assist-headless-quickview';
import {CoreQuickviewState} from './headless-quickview';

jest.mock('../core/quickview/headless-core-quickview');
jest.mock('../../features/result-preview/result-preview-actions');
jest.mock('../../features/case-assist/case-assist-analytics-actions');

describe('CaseAssistQuickview', () => {
  let engine: MockedCaseAssistEngine;
  let options: CaseAssistQuickviewOptions;
  let quickview: CaseAssistQuickview;
  let engineState: CaseAssistAppState;
  let mockedBuildCoreQuickview: jest.Mock;
  let coreQuickviewState: Partial<CoreQuickviewState>;

  const testUniqueId = 'testUniqueId';

  function initQuickview() {
    quickview = buildCaseAssistQuickview(engine, {options});
  }

  function initEngine(preloadedState = buildMockCaseAssistState()) {
    engineState = preloadedState;
    engine = buildMockCaseAssistEngine(preloadedState);
  }

  beforeEach(() => {
    coreQuickviewState = {};
    jest.resetAllMocks();
    mockedBuildCoreQuickview = jest.mocked(buildCoreQuickview);
    mockedBuildCoreQuickview.mockImplementation(() => ({
      state: coreQuickviewState,
    }));
    initEngine();
    options = {
      result: buildMockResult(),
      maximumPreviewSize: 0,
    };
    initQuickview();
  });

  it('initializes a core quickview with the correct options', () => {
    expect(mockedBuildCoreQuickview).toHaveBeenCalledWith(
      engine,
      {options},
      buildResultPreviewRequest,
      '/html',
      expect.any(Function)
    );
  });

  it('it adds the case-assist specific reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenNthCalledWith(1, {
      documentSuggestion,
    });
  });

  it('dispatches a preparePreviewPagination action on initialization', () => {
    const mockedPreparePreviewPagination = jest.mocked(
      preparePreviewPagination
    );

    expect(mockedPreparePreviewPagination).toHaveBeenCalledWith({
      results: engineState.documentSuggestion.documents,
    });
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedPreparePreviewPagination.mock.results[0].value
    );
  });

  describe('state', () => {
    it('exposes the core quickview state', () => {
      coreQuickviewState.content = '🥔';

      expect(quickview.state.content).toBe('🥔');
    });

    it('exposes `currentDocument` in the state ', () => {
      engineState.documentSuggestion.documents = [
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion({uniqueId: testUniqueId}),
        buildMockDocumentSuggestion(),
      ];
      coreQuickviewState.currentResultUniqueId = testUniqueId;

      expect(quickview.state.currentDocument).toBe(3);
    });

    it('exposes `totalDocuments` in the state ', () => {
      engineState.documentSuggestion.documents = [
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion(),
      ];

      expect(quickview.state.totalDocuments).toBe(4);
    });
  });

  it('when the core quickview calls fetchResultContentCallback, it dispatch a logQuickviewDocumentSuggestionClick with the proper uniqueId', () => {
    const mockedLogQuickviewDocumentSuggestionClick = jest.mocked(
      logQuickviewDocumentSuggestionClick
    );

    mockedBuildCoreQuickview.mock.calls[0][4]();

    expect(mockedLogQuickviewDocumentSuggestionClick).toHaveBeenCalledWith(
      options.result.uniqueId
    );
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedLogQuickviewDocumentSuggestionClick.mock.results[0].value
    );
  });
});
