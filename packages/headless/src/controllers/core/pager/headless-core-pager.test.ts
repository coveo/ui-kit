import {configuration} from '../../../app/common-reducers.js';
import {
  nextPage,
  previousPage,
  registerPage,
  updatePage,
} from '../../../features/pagination/pagination-actions.js';
import {
  currentPageSelector,
  currentPagesSelector,
  maxPageSelector,
} from '../../../features/pagination/pagination-selectors.js';
import {paginationReducer as pagination} from '../../../features/pagination/pagination-slice.js';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  Pager,
  PagerOptions,
  PagerInitialState,
  buildCorePager,
} from './headless-core-pager.js';

jest.mock('../../../features/pagination/pagination-actions');
jest.mock('../../../features/pagination/pagination-selectors');

describe('Pager', () => {
  let engine: MockedSearchEngine;
  let pager: Pager;

  function initEngine(preloadedState = createMockState()) {
    engine = buildMockSearchEngine(preloadedState);
  }

  function initPager({
    initialState,
    options,
  }: {initialState?: PagerInitialState; options?: PagerOptions} = {}) {
    pager = buildCorePager(engine, {
      options: options ?? {},
      initialState: initialState ?? {},
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
    initEngine();
    initPager();
  });

  it('initializes', () => {
    expect(pager).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      pagination,
      configuration,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(pager.subscribe).toBeTruthy();
  });

  it('when initialState #isActive is an invalid value, it throws an error', () => {
    expect(() =>
      initPager({initialState: {page: '1' as unknown as number}})
    ).toThrow('Check the initialState of buildPager');
  });

  it('when options #expression is an invalid value, it throws an error', () => {
    expect(() =>
      initPager({options: {numberOfPages: '1' as unknown as number}})
    ).toThrow('Check the options of buildPager');
  });

  it('#state calls #currentPagesSelector with a number of page of 5 by default', () => {
    pager.state;

    expect(currentPagesSelector).toHaveBeenCalledWith(expect.anything(), 5);
  });

  it('when numberOfPages is 2, #state calls #currentPagesSelector with a number of page of 2', () => {
    initPager({options: {numberOfPages: 2}});

    pager.state;

    expect(currentPagesSelector).toHaveBeenCalledWith(expect.anything(), 2);
  });

  it('when numberOfPages is -1, the pager fails to initialize', () => {
    expect(() => initPager({options: {numberOfPages: -1}})).toThrow();
  });

  it('when #initialState.page is defined, it registers the page', () => {
    const mockedRegisterPageAction = jest.mocked(registerPage);

    initPager({initialState: {page: 2}});

    expect(registerPage).toHaveBeenCalledWith(2);
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedRegisterPageAction.mock.results[0].value
    );
  });

  it('#selectPage dispatches #updatePage with the passed page', () => {
    const mockedUpdatePageAction = jest.mocked(updatePage);

    pager.selectPage(2);

    expect(mockedUpdatePageAction).toHaveBeenCalledWith(2);
  });

  it('#nextPage dispatches a #nextPage action', () => {
    const mockedNextPage = jest.mocked(nextPage);

    pager.nextPage();

    expect(mockedNextPage).toHaveBeenCalled();
  });

  it('#previousPage dispatches a #previousPage action', () => {
    const mockedPreviousPage = jest.mocked(previousPage);

    pager.previousPage();

    expect(mockedPreviousPage).toHaveBeenCalled();
  });

  it('calling #isCurrentPage with a page number not equal to the one in state returns false', () => {
    jest.mocked(currentPageSelector).mockReturnValue(2);

    initPager();

    expect(pager.isCurrentPage(1)).toBe(false);
  });

  it('calling #isCurrentPage with a page number equal to the one in state returns true', () => {
    jest.mocked(currentPageSelector).mockReturnValue(2);

    initPager();

    pager.selectPage(2);
    expect(pager.isCurrentPage(2)).toBe(true);
  });

  it('state exposes a maxPage property', () => {
    jest.mocked(maxPageSelector).mockReturnValue(10);

    expect(pager.state.maxPage).toBe(10);
  });

  it('when on page 1 and maxPage is 10, #state.hasNextPage is true', () => {
    jest.mocked(maxPageSelector).mockReturnValue(10);
    jest.mocked(currentPageSelector).mockReturnValue(1);

    expect(pager.state.hasNextPage).toBe(true);
  });

  it('when on page 10 and maxPage is 10, #state.hasNextPage returns false', () => {
    jest.mocked(maxPageSelector).mockReturnValue(10);
    jest.mocked(currentPageSelector).mockReturnValue(10);

    expect(pager.state.hasNextPage).toBe(false);
  });

  it('when on page 10 and maxPage is 10, #state.hasPreviousPage returns true', () => {
    jest.mocked(maxPageSelector).mockReturnValue(10);
    jest.mocked(currentPageSelector).mockReturnValue(10);

    expect(pager.state.hasPreviousPage).toBe(true);
  });

  it('when on page 1 and maxPage is 10, #state.hasPreviousPage returns false', () => {
    jest.mocked(maxPageSelector).mockReturnValue(10);
    jest.mocked(currentPageSelector).mockReturnValue(1);

    expect(pager.state.hasPreviousPage).toBe(false);
  });

  it('when maxPage is 0 and page 1 is selected, #state.hasPreviousPage should returns false', () => {
    jest.mocked(maxPageSelector).mockReturnValue(0);
    jest.mocked(currentPageSelector).mockReturnValue(1);

    expect(pager.state.hasPreviousPage).toBe(false);
  });
});
