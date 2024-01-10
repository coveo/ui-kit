import {configuration} from '../../../app/common-reducers';
import {
  SearchEngine,
  buildSearchEngine,
} from '../../../app/search-engine/search-engine';
import {paginationReducer as pagination} from '../../../features/pagination/pagination-slice';
import {createMockState} from '../../../test/mock-state';
import {
  Pager,
  PagerOptions,
  PagerInitialState,
  buildCorePager,
} from './headless-core-pager';

describe('Pager', () => {
  let engine: SearchEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;
  let addReducersSpy: jest.SpyInstance;
  let maxPageNumber: number = 10;

  function initEngine() {
    const preloadedState = createMockState();
    preloadedState.pagination.totalCountFiltered =
      preloadedState.pagination.numberOfResults * maxPageNumber;
    engine = buildSearchEngine({
      configuration: {
        accessToken: 'token',
        organizationId: 'organizationId',
      },
      loggerOptions: {level: 'silent'},
      preloadedState,
    });
    addReducersSpy = jest.spyOn(engine, 'addReducers');
  }

  function initPager() {
    pager = buildCorePager(engine, {options, initialState});
  }

  beforeEach(() => {
    options = {};
    initialState = {};
    initEngine();
    initPager();
  });

  it('initializes', () => {
    expect(pager).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(addReducersSpy).toHaveBeenCalledWith({
      pagination,
      configuration,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(pager.subscribe).toBeTruthy();
  });

  it('when initialState #isActive is an invalid value, it throws an error', () => {
    initialState.page = '1' as unknown as number;
    expect(() => initPager()).toThrow('Check the initialState of buildPager');
  });

  it('when options #expression is an invalid value, it throws an error', () => {
    options.numberOfPages = '1' as unknown as number;
    expect(() => initPager()).toThrow('Check the options of buildPager');
  });

  it('#state.currentPages returns 5 pages by default', () => {
    expect(pager.state.currentPages.length).toBe(5);
  });

  it('when numberOfPages is 2, #state.currentPages returns two page numbers', () => {
    options.numberOfPages = 2;
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

    expect(engine.state.pagination?.firstResult).toEqual(10);
  });

  it('#selectPage dispatches #updatePage with the passed page', () => {
    pager.selectPage(2);
    expect(engine.state.pagination?.firstResult).toEqual(10);
  });

  it('#nextPage dispatches a #nextPage action', () => {
    pager.nextPage();
    expect(engine.state.pagination?.firstResult).toEqual(10);
  });

  it('#previousPage dispatches a #previousPage action', () => {
    pager.selectPage(2);

    pager.previousPage();
    expect(engine.state.pagination?.firstResult).toEqual(0);
  });

  it('calling #isCurrentPage with a page number not equal to the one in state returns false', () => {
    pager.selectPage(2);
    expect(pager.isCurrentPage(1)).toBe(false);
  });

  it('calling #isCurrentPage with a page number equal to the one in state returns true', () => {
    pager.selectPage(2);
    expect(pager.isCurrentPage(2)).toBe(true);
  });

  it('state exposes a maxPage property', () => {
    expect(pager.state.maxPage).toBe(10);
  });

  it('when on page 1 and maxPage is 10, #state.hasNextPage is true', () => {
    pager.selectPage(1);

    expect(pager.state.hasNextPage).toBe(true);
  });

  it('when on page 10 and maxPage is 10, #state.hasNextPage returns false', () => {
    pager.selectPage(10);

    expect(pager.state.hasNextPage).toBe(false);
  });

  it('when on page 10 and maxPage is 10, #state.hasPreviousPage returns true', () => {
    pager.selectPage(10);

    expect(pager.state.hasPreviousPage).toBe(true);
  });

  it('when on page 1 and maxPage is 10, #state.hasPreviousPage returns false', () => {
    pager.selectPage(1);

    expect(pager.state.hasPreviousPage).toBe(false);
  });

  it('when maxPage is 0 and page 1 is selected, #state.hasPreviousPage should returns false', () => {
    maxPageNumber = 0;
    initEngine();
    initPager();

    pager.selectPage(1);

    expect(pager.state.hasPreviousPage).toBe(false);
  });
});
