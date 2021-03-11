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
});
