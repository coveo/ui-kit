import {fetchPage} from '../../../features/insight-search/insight-search-actions.js';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {
  Pager,
  PagerOptions,
  PagerInitialState,
  buildPager,
} from './headless-insight-pager.js';

vi.mock('../../../features/insight-search/insight-search-actions');

describe('Pager', () => {
  let engine: MockedInsightEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;

  function initPager() {
    pager = buildPager(engine, {options, initialState});
  }

  function setMaxPage(page: number) {
    const {numberOfResults} = engine.state.pagination!;
    engine.state.pagination!.totalCountFiltered = page * numberOfResults;
  }

  beforeEach(() => {
    options = {};
    initialState = {};
    engine = buildMockInsightEngine(buildMockInsightState());
    initPager();
  });

  it('initializes', () => {
    expect(pager).toBeTruthy();
  });

  it('#state.currentPages returns 5 pages by default', () => {
    setMaxPage(10);
    expect(pager.state.currentPages.length).toBe(5);
  });

  it('#selectPage dispatches #fetchPage', () => {
    pager.selectPage(2);
    expect(fetchPage).toHaveBeenCalled();
  });

  it('#nextPage dispatches #fetchPage', () => {
    pager.nextPage();
    expect(fetchPage).toHaveBeenCalled();
  });

  it('#previousPage dispatches #fetchPage', () => {
    pager.previousPage();
    expect(fetchPage).toHaveBeenCalled();
  });
});
