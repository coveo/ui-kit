import {configuration} from '../../../app/common-reducers';
import {insightInterfaceReducer as insightInterface} from '../../../features/insight-interface/insight-interface-slice';
import {updateContentURL} from '../../../features/result-preview/result-preview-actions';
import {logDocumentQuickview} from '../../../features/result-preview/result-preview-analytics-actions';
import {resultPreviewReducer as resultPreview} from '../../../features/result-preview/result-preview-slice';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {buildMockResult} from '../../../test/mock-result';
import {buildMockResultPreviewState} from '../../../test/mock-result-preview-state';
import {
  buildQuickview,
  QuickviewOptions,
  Quickview,
} from './headless-insight-quickview';

describe('Insight Quickview', () => {
  let engine: MockInsightEngine;
  let options: QuickviewOptions;
  let quickview: Quickview;

  function initQuickview() {
    quickview = buildQuickview(engine, {options});
  }

  beforeEach(() => {
    engine = buildMockInsightEngine();
    options = {
      result: buildMockResult(),
      maximumPreviewSize: 0,
    };

    initQuickview();
  });

  it('initializes', () => {
    expect(quickview).toBeTruthy();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      resultPreview,
      insightInterface,
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

    it('dispatches a #updateContentURL action with the result uniqueId', () => {
      const action = engine.findAsyncAction(updateContentURL.pending);

      expect(action?.meta.arg.uniqueId).toBe(uniqueId);
      expect(action?.meta.arg.requestedOutputSize).toBe(requestedOutputSize);
      expect(action?.meta.arg.path).toBe('/quickview');
    });

    it('dispatches a document quickview click event', () => {
      const result = buildMockResult();
      const thunk = logDocumentQuickview(result);
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
});
