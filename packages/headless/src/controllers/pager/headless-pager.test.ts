/* eslint-disable @typescript-eslint/no-explicit-any */
import {fetchPage} from '../../features/search/search-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildPager,
  type Pager,
  type PagerInitialState,
  type PagerOptions,
} from './headless-pager.js';

vi.mock('../../features/search/search-actions');

describe('Pager', () => {
  let engine: MockedSearchEngine;
  let options: PagerOptions;
  let initialState: PagerInitialState;
  let pager: Pager;

  function setMaxPage(page: number) {
    const {numberOfResults} = engine.state.pagination!;
    engine.state.pagination!.totalCountFiltered = page * numberOfResults;
  }

  function initPager() {
    pager = buildPager(engine, {options, initialState});
  }

  beforeEach(() => {
    options = {};
    initialState = {};
    engine = buildMockSearchEngine(createMockState());
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
