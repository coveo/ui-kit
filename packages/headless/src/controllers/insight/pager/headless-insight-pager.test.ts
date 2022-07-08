/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Pager,
  PagerOptions,
  PagerInitialState,
  buildPager,
} from './headless-insight-pager';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {fetchPage} from '../../../features/insight-search/insight-search-actions';

describe('Pager', () => {
  let engine: MockInsightEngine;
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
    engine = buildMockInsightEngine();
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
    const action = engine.findAsyncAction(fetchPage.pending);
    expect(action).toBeTruthy();
  });

  it('#nextPage dispatches #fetchPage', () => {
    pager.nextPage();
    const action = engine.findAsyncAction(fetchPage.pending);
    expect(action).toBeTruthy();
  });

  it('#previousPage dispatches #fetchPage', () => {
    pager.previousPage();
    const action = engine.findAsyncAction(fetchPage.pending);
    expect(engine.actions).toContainEqual(action);
  });
});
