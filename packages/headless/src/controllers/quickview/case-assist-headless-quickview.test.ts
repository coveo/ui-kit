import {configuration} from '../../app/common-reducers';
import {DocumentSuggestionResponse} from '../../case-assist.index';
import {logQuickviewDocumentSuggestionClick} from '../../features/case-assist/case-assist-analytics-actions';
import {documentSuggestionReducer as documentSuggestion} from '../../features/document-suggestion/document-suggestion-slice';
import {
  fetchResultContent,
  preparePreviewPagination,
} from '../../features/result-preview/result-preview-actions';
import {resultPreviewReducer as resultPreview} from '../../features/result-preview/result-preview-slice';
import {buildMockResult} from '../../test';
import {
  buildMockCaseAssistEngine,
  MockCaseAssistEngine,
} from '../../test/mock-engine';
import {buildMockResultPreviewState} from '../../test/mock-result-preview-state';
import {
  buildCaseAssistQuickview,
  CaseAssistQuickviewOptions,
  CaseAssistQuickview,
} from './case-assist-headless-quickview';

describe('CaseAssistQuickview', () => {
  let engine: MockCaseAssistEngine;
  let options: CaseAssistQuickviewOptions;
  let quickview: CaseAssistQuickview;

  function initQuickview() {
    quickview = buildCaseAssistQuickview(engine, {options});
  }

  beforeEach(() => {
    engine = buildMockCaseAssistEngine();
    options = {
      result: buildMockResult(),
      maximumPreviewSize: 0,
    };

    initQuickview();
  });

  it('initializes', () => {
    expect(quickview).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenNthCalledWith(1, {
      documentSuggestion,
    });

    expect(engine.addReducers).toHaveBeenNthCalledWith(2, {
      configuration,
      resultPreview,
    });
  });

  it('exposes a subscribe method', () => {
    expect(quickview.subscribe).toBeTruthy();
  });

  describe('#fetchResultContent', () => {
    const uniqueId = '1';
    const requestedOutputSize = 0;

    beforeEach(() => {
      options.result = buildMockResult({uniqueId});
      initQuickview();

      quickview.fetchResultContent();
    });

    it('dispatches a #fetchResultContent action with the result uniqueId', () => {
      const action = engine.findAsyncAction(fetchResultContent.pending);
      expect(action?.meta.arg).toEqual({uniqueId, requestedOutputSize});
    });

    it('dispatches a quickview document suggestion click event', () => {
      const result = buildMockResult();
      const thunk = logQuickviewDocumentSuggestionClick(result.uniqueId);
      const action = engine.findAsyncAction(thunk.pending);
      expect(action).toBeTruthy();
    });
  });

  it(`when configured result uniqueId matches the uniqueId in state,
  #state.content returns the content in state`, () => {
    const uniqueId = '1';
    const content = '<div></div>';

    engine.state.resultPreview = buildMockResultPreviewState({
      uniqueId,
      content,
    });
    options.result = buildMockResult({uniqueId});
    initQuickview();

    expect(quickview.state.content).toEqual(content);
  });

  it(`when configured result uniqueId matches the uniqueId in state,
  #state.content returns an empty string`, () => {
    engine.state.resultPreview = buildMockResultPreviewState({
      uniqueId: '1',
      content: '<div></div>',
    });
    options.result = buildMockResult({uniqueId: '2'});
    initQuickview();

    expect(quickview.state.content).toEqual('');
  });

  [true, false].forEach((testValue) => {
    it(`when the result #hasHtmlVersion is ${testValue} #state.resultHasPreview should be ${testValue}`, () => {
      options.result = buildMockResult({hasHtmlVersion: testValue});
      initQuickview();

      expect(quickview.state.resultHasPreview).toBe(testValue);
    });
  });

  [true, false].forEach((testValue) => {
    it(`when the resultPreview state #isLoading is ${testValue} #state.isLoading should be ${testValue}`, () => {
      engine.state.resultPreview = buildMockResultPreviewState({
        isLoading: testValue,
      });
      initQuickview();

      expect(quickview.state.isLoading).toBe(testValue);
    });
  });

  it(`when the resultPreview is initialized,
  #options.maximumPreviewSize is 0`, () => {
    engine.state.resultPreview = buildMockResultPreviewState();
    initQuickview();

    expect(options.maximumPreviewSize).toBe(0);
  });

  it('#preparePreviewPagination on initialization', () => {
    initQuickview();
    expect(engine.actions).toContainEqual(
      preparePreviewPagination({
        results: engine.state.documentSuggestion.documents,
      })
    );
  });

  describe('pagination', () => {
    beforeEach(() => {
      engine = buildMockCaseAssistEngine();
      engine.state.documentSuggestion.documents = [
        {hasHtmlVersion: true, uniqueId: 'first'},
        {hasHtmlVersion: true, uniqueId: 'second'},
        {hasHtmlVersion: true, uniqueId: 'third'},
      ] as DocumentSuggestionResponse[];
      engine.state.resultPreview.resultsWithPreview = [
        'first',
        'second',
        'third',
      ];
      engine.state.resultPreview.position = 0;
      initQuickview();
    });

    it('returns the proper current and total results for pagination purpose', () => {
      expect(quickview.state.currentDocument).toBe(1);
      expect(quickview.state.totalDocuments).toBe(3);
    });
  });
});
