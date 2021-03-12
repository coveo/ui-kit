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
});
