import {
  Pager,
  PagerOptions,
  PagerInitialState,
  buildPager,
} from './headless-pager';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {executeSearch} from '../../features/search/search-actions';

describe('Pager', () => {
  let engine: MockSearchEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;

  function setMaxPage(page: number) {
    const {numberOfResults} = engine.state.pagination;
    engine.state.pagination.totalCountFiltered = page * numberOfResults;
  }

  function initPager() {
    pager = buildPager(engine, {options, initialState});
  }

  beforeEach(() => {
    options = {};
    initialState = {};
    engine = buildMockSearchAppEngine();
    initPager();
  });

  it('initializes', () => {
    expect(pager).toBeTruthy();
  });

  it('#state.currentPages returns 5 pages by default', () => {
    setMaxPage(10);
    expect(pager.state.currentPages.length).toBe(5);
  });

  it('#selectPage dispatches #executeSearch', () => {
    pager.selectPage(2);
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(action).toBeTruthy();
  });

  it('#nextPage dispatches #executeSearch', () => {
    pager.nextPage();
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(action).toBeTruthy();
  });

  it('#previousPage dispatches #executeSearch', () => {
    pager.previousPage();
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(engine.actions).toContainEqual(action);
  });
});
