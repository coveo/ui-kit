import type {Mock} from 'vitest';
import {logQuickviewDocumentSuggestionClick} from '../../features/case-assist/case-assist-analytics-actions.js';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice.js';
import {preparePreviewPagination} from '../../features/result-preview/result-preview-actions.js';
import {buildResultPreviewRequest} from '../../features/result-preview/result-preview-request-builder.js';
import type {CaseAssistAppState} from '../../state/case-assist-app-state.js';
import {buildMockDocumentSuggestion} from '../../test/mock-case-assist-document-suggestion.js';
import {buildMockCaseAssistState} from '../../test/mock-case-assist-state.js';
import {
  buildMockCaseAssistEngine,
  type MockedCaseAssistEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildCoreQuickview} from '../core/quickview/headless-core-quickview.js';
import {
  buildCaseAssistQuickview,
  type CaseAssistQuickview,
  type CaseAssistQuickviewOptions,
} from './case-assist-headless-quickview.js';
import type {CoreQuickviewState} from './headless-quickview.js';

vi.mock('../core/quickview/headless-core-quickview');
vi.mock('../../features/result-preview/result-preview-actions');
vi.mock('../../features/case-assist/case-assist-analytics-actions');

describe('CaseAssistQuickview', () => {
  let engine: MockedCaseAssistEngine;
  let options: CaseAssistQuickviewOptions;
  let quickview: CaseAssistQuickview;
  let engineState: CaseAssistAppState;
  let mockedBuildCoreQuickview: Mock;
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
    vi.resetAllMocks();
    mockedBuildCoreQuickview = vi.mocked(buildCoreQuickview);
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

  it('dispatches a #preparePreviewPagination on initialization', () => {
    const mockedPreparePreviewPagination = vi.mocked(preparePreviewPagination);

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

    it('#state.currentDocument returns the 1-based position of the document suggestion being quick viewed', () => {
      engineState.documentSuggestion.documents = [
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion({uniqueId: testUniqueId}),
        buildMockDocumentSuggestion(),
      ];
      coreQuickviewState.currentResultUniqueId = testUniqueId;

      expect(quickview.state.currentDocument).toBe(3);
    });

    it('#state.totalDocuments returns the total number of document suggestions', () => {
      engineState.documentSuggestion.documents = [
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion(),
        buildMockDocumentSuggestion(),
      ];

      expect(quickview.state.totalDocuments).toBe(4);
    });
  });

  it('#fetchResultContentCallback dispatches a #logQuickviewDocumentSuggestionClick with the proper uniqueId', () => {
    const mockedLogQuickviewDocumentSuggestionClick = vi.mocked(
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
