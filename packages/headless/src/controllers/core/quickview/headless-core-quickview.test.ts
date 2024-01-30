import {configuration} from '../../../app/common-reducers';
import {
  fetchResultContent,
  nextPreview,
  previousPreview,
  updateContentURL,
} from '../../../features/result-preview/result-preview-actions';
import {resultPreviewReducer as resultPreview} from '../../../features/result-preview/result-preview-slice';
import {buildMockSearchAppEngine, MockSearchEngine} from '../../../test';
import {buildMockResult} from '../../../test/mock-result';
import {buildMockResultPreviewRequest} from '../../../test/mock-result-preview-request-builder';
import {buildMockResultPreviewState} from '../../../test/mock-result-preview-state';
import {
  buildCoreQuickview,
  QuickviewOptions,
  Quickview,
} from './headless-core-quickview';

describe('QuickviewCore', () => {
  let engine: MockSearchEngine;
  let defaultOptions: QuickviewOptions;
  let quickview: Quickview;

  const path = '/html';

  function initQuickview(options = defaultOptions) {
    quickview = buildCoreQuickview(
      engine,
      {options},
      buildMockResultPreviewRequest,
      path
    );
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    defaultOptions = {
      result: buildMockResult(),
      maximumPreviewSize: 0,
    };

    initQuickview();
  });

  it('initializes', () => {
    expect(quickview).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
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

    describe('when #onlyContentURL is true', () => {
      beforeEach(() => {
        defaultOptions.result = buildMockResult({uniqueId});
        initQuickview({...defaultOptions, onlyContentURL: true});

        quickview.fetchResultContent();
      });

      it('dispatches a #updateContentURL action with the result uniqueId', () => {
        const action = engine.findAsyncAction(updateContentURL.pending);
        expect(action?.meta.arg).toEqual({
          uniqueId,
          requestedOutputSize,
          buildResultPreviewRequest: buildMockResultPreviewRequest,
          path,
        });
      });
    });

    describe('when #onlyContentURL is falsy', () => {
      beforeEach(() => {
        defaultOptions.result = buildMockResult({uniqueId});
        initQuickview();

        quickview.fetchResultContent();
      });

      it('dispatches a #fetchResultContent action with the result uniqueId', () => {
        const action = engine.findAsyncAction(fetchResultContent.pending);
        expect(action?.meta.arg).toEqual({uniqueId, requestedOutputSize});
      });
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
    defaultOptions.result = buildMockResult({uniqueId});
    initQuickview();

    expect(quickview.state.content).toEqual(content);
  });

  it(`when configured result uniqueId matches the uniqueId in state,
  #state.content returns an empty string`, () => {
    engine.state.resultPreview = buildMockResultPreviewState({
      uniqueId: '1',
      content: '<div></div>',
    });
    defaultOptions.result = buildMockResult({uniqueId: '2'});
    initQuickview();

    expect(quickview.state.content).toEqual('');
  });

  [true, false].forEach((testValue) => {
    it(`when the result #hasHtmlVersion is ${testValue} #state.resultHasPreview should be ${testValue}`, () => {
      defaultOptions.result = buildMockResult({hasHtmlVersion: testValue});
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

    expect(defaultOptions.maximumPreviewSize).toBe(0);
  });

  it('when going to #next preview, it dispatches the proper actions', () => {
    initQuickview();
    quickview.next();
    expect(engine.actions).toContainEqual(nextPreview());
    expect(engine.findAsyncAction(fetchResultContent.pending)).toBeDefined();
  });

  it('when going to #previous preview, it dispatches the proper actions', () => {
    initQuickview();
    quickview.previous();
    expect(engine.actions).toContainEqual(previousPreview());
    expect(engine.findAsyncAction(fetchResultContent.pending)).toBeDefined();
  });
});
