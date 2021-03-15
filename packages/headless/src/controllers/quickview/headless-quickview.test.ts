import {fetchResultContent} from '../../features/result-preview/result-preview-actions';
import {SearchAppState} from '../../state/search-app-state';
import {
  buildMockResult,
  buildMockSearchAppEngine,
  MockEngine,
} from '../../test';
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

  it('exposes a subscribe method', () => {
    expect(quickview.subscribe).toBeTruthy();
  });

  it('#fetchResultContent dispatches a #fetchResultContent action with the result uniqueId', () => {
    const uniqueId = '1';
    options.result = buildMockResult({uniqueId});
    initQuickview();

    quickview.fetchResultContent();

    const action = engine.findAsyncAction(fetchResultContent.pending);

    expect(action?.meta.arg).toEqual({uniqueId});
  });

  it(`when configured result uniqueId matches the uniqueId in state,
  #state.resultContent returns the content in state`, () => {
    const uniqueId = '1';
    const content = '<div></div>';

    engine.state.resultPreview = {uniqueId, content};
    options.result = buildMockResult({uniqueId});
    initQuickview();

    expect(quickview.state.resultContent).toEqual(content);
  });

  it(`when configured result uniqueId matches the uniqueId in state,
  #state.resultContent returns an empty string`, () => {
    engine.state.resultPreview = {uniqueId: '1', content: '<div></div>'};
    options.result = buildMockResult({uniqueId: '2'});
    initQuickview();

    expect(quickview.state.resultContent).toEqual('');
  });
});
