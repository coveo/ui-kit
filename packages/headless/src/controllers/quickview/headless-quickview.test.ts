import {configuration, resultPreview} from '../../app/reducers';
import {fetchResultContent} from '../../features/result-preview/result-preview-actions';
import {buildDocumentQuickviewThunk} from '../../features/result-preview/result-preview-analytics-actions';
import {SearchAppState} from '../../state/search-app-state';
import {
  buildMockResult,
  buildMockSearchAppEngine,
  MockEngine,
} from '../../test';
import {buildMockResultPreviewState} from '../../test/mock-result-preview-state';
import {
  buildQuickview,
  QuickviewOptions,
  Quickview,
} from './headless-quickview';

describe('Quickview', () => {
  let engine: MockEngine<SearchAppState>;
  let options: QuickviewOptions;
  let quickview: Quickview;

  function initQuickview() {
    quickview = buildQuickview(engine, {options});
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    options = {
      result: buildMockResult(),
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

    beforeEach(() => {
      options.result = buildMockResult({uniqueId});
      initQuickview();

      quickview.fetchResultContent();
    });

    it('dispatches a #fetchResultContent action with the result uniqueId', () => {
      const action = engine.findAsyncAction(fetchResultContent.pending);
      expect(action?.meta.arg).toEqual({uniqueId});
    });

    it('dispatches a document quickview click event', () => {
      const result = buildMockResult();
      const thunk = buildDocumentQuickviewThunk(result);
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

  it(`when the result #hasHtmlVersion is true,
  #state.resultHasPreview is true`, () => {
    options.result = buildMockResult({hasHtmlVersion: true});
    initQuickview();

    expect(quickview.state.resultHasPreview).toBe(true);
  });

  it(`when the result #hasHtmlVersion is false,
  #state.resultHasPreview is false`, () => {
    options.result = buildMockResult({hasHtmlVersion: false});
    initQuickview();

    expect(quickview.state.resultHasPreview).toBe(false);
  });

  it(`when the resultPreview state #isLoading is true,
  #state.isLoading is true`, () => {
    engine.state.resultPreview = buildMockResultPreviewState({isLoading: true});
    initQuickview();

    expect(quickview.state.isLoading).toBe(true);
  });

  it(`when the resultPreview state #isLoading is false,
  #state.isLoading is false`, () => {
    engine.state.resultPreview = buildMockResultPreviewState({
      isLoading: false,
    });
    initQuickview();

    expect(quickview.state.isLoading).toBe(false);
  });

  it(`when the resultPreview state #maximumFileSize is 100,
  #state.maximumFileSize is 100`, () => {
    engine.state.resultPreview = buildMockResultPreviewState({
      maximumFileSize: 100,
    });
    initQuickview();

    expect(quickview.state.maximumFileSize).toBe(100);
  });
});
