import {Pager, PagerOptions, PagerInitialState} from './headless-pager';
import {buildMockEngine, MockEngine} from '../../test/mock-engine';
import {
  updatePage,
  registerPage,
} from '../../features/pagination/pagination-actions';
import {executeSearch} from '../../features/search/search-actions';
import {createMockState} from '../../test/mock-state';
import {buildMockPagination} from '../../test/mock-pagination';

describe('Pager', () => {
  let engine: MockEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;

  function initPager() {
    pager = new Pager(engine, {options, initialState});
  }

  beforeEach(() => {
    options = {};
    initialState = {};
    engine = buildMockEngine();
    initPager();
  });

  it('initializes', () => {
    expect(pager).toBeTruthy();
  });

  it('#state.currentPages returns two page numbers returns 5 pages by default', () => {
    engine.state.search.response.totalCountFiltered = 100;
    expect(pager.state.currentPages.length).toBe(5);
  });

  it('when numberOfPages is 2, #state.currentPages returns two page numbers', () => {
    options.numberOfPages = 2;
    engine.state.search.response.totalCountFiltered = 100;
    initPager();

    expect(pager.state.currentPages.length).toBe(2);
  });

  it('when numberOfPages is -1, the pager fails to initialize', () => {
    options.numberOfPages = -1;
    expect(() => initPager()).toThrow();
  });

  it('when #initialState.page is defined, it registers the page', () => {
    initialState.page = 2;
    initPager();

    expect(engine.actions).toContainEqual(registerPage(2));
  });

  it('#selectPage dispatches #updatePage with the passed page', () => {
    pager.selectPage(2);
    expect(engine.actions).toContainEqual(updatePage(2));
  });

  it('#selectPage dispatches #executeSearch', () => {
    pager.selectPage(2);
    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(action).toBeTruthy();
  });

  it('calling #isCurrentPage with a page number not equal to the one in state returns false', () => {
    const pagination = buildMockPagination({
      firstResult: 10,
      numberOfResults: 10,
    });
    const state = createMockState({pagination});
    engine.state = state;

    expect(pager.isCurrentPage(1)).toBe(false);
  });

  it('calling #isCurrentPage with a page number equal to the one in state returns true', () => {
    const pagination = buildMockPagination({
      firstResult: 10,
      numberOfResults: 10,
    });
    const state = createMockState({pagination});
    engine.state = state;

    expect(pager.isCurrentPage(2)).toBe(true);
  });
});
