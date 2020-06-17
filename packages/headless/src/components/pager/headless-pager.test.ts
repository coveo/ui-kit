import {Pager, PagerOptions, PagerInitialState} from './headless-pager';
import {buildMockEngine, MockEngine} from '../../test/mock-engine';
import {
  updatePage,
  registerPage,
  nextPage,
  previousPage,
} from '../../features/pagination/pagination-actions';
import {executeSearch} from '../../features/search/search-actions';

describe('Pager', () => {
  let engine: MockEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;

  function setCurrentPage(page: number) {
    const {numberOfResults} = engine.state.pagination;
    engine.state.pagination.firstResult = (page - 1) * numberOfResults;
  }

  function setMaxPage(page: number) {
    const {numberOfResults} = engine.state.pagination;
    engine.state.pagination.totalCountFiltered = page * numberOfResults;
  }

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

  it('#state.currentPages returns 5 pages by default', () => {
    setMaxPage(10);
    expect(pager.state.currentPages.length).toBe(5);
  });

  it('when numberOfPages is 2, #state.currentPages returns two page numbers', () => {
    options.numberOfPages = 2;
    setMaxPage(10);
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

  it('#nextPage dispatches a #nextPage action', () => {
    pager.nextPage();
    expect(engine.actions).toContainEqual(nextPage());
  });

  it('#nextPage dispatches #executeSearch', () => {
    pager.nextPage();
    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(action).toBeTruthy();
  });

  it('#previousPage dispatches a #previousPage action', () => {
    pager.previousPage();
    expect(engine.actions).toContainEqual(previousPage());
  });

  it('#previousPage dispatches #executeSearch', () => {
    pager.previousPage();
    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(engine.actions).toContainEqual(action);
  });

  it('calling #isCurrentPage with a page number not equal to the one in state returns false', () => {
    setCurrentPage(2);
    expect(pager.isCurrentPage(1)).toBe(false);
  });

  it('calling #isCurrentPage with a page number equal to the one in state returns true', () => {
    setCurrentPage(2);
    expect(pager.isCurrentPage(2)).toBe(true);
  });

  it('state exposes a maxPage property', () => {
    setMaxPage(10);
    expect(pager.state.maxPage).toBe(10);
  });

  it('when on page 1 and maxPage is 2, #hasNextPage returns true', () => {
    setCurrentPage(1);
    setMaxPage(2);

    expect(pager.hasNextPage).toBe(true);
  });

  it('when on page 2 and maxPage is 2, #hasNextPage returns false', () => {
    setCurrentPage(2);
    setMaxPage(2);

    expect(pager.hasNextPage).toBe(false);
  });

  it('when on page 2 and maxPage is 2, #hasPreviousPage returns true', () => {
    setCurrentPage(2);
    setMaxPage(2);

    expect(pager.hasPreviousPage).toBe(true);
  });

  it('when on page 1 and maxPage is 2, #hasPreviousPage returns false', () => {
    setCurrentPage(1);
    setMaxPage(2);

    expect(pager.hasPreviousPage).toBe(false);
  });

  it('when on page 2 and maxPage is 0, #hasPreviousPage returns false', () => {
    setCurrentPage(2);
    setMaxPage(0);

    expect(pager.hasPreviousPage).toBe(false);
  });
});
