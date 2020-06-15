import {Pager} from './headless-pager';
import {buildMockEngine, MockEngine} from '../../test/mock-engine';
import {updatePage} from '../../features/pagination/pagination-actions';
import {executeSearch} from '../../features/search/search-actions';
import {createMockState} from '../../test/mock-state';
import {buildMockPagination} from '../../test/mock-pagination';

describe('Pager', () => {
  let engine: MockEngine;
  let pager: Pager;

  function initPager() {
    pager = new Pager(engine);
  }

  beforeEach(() => {
    engine = buildMockEngine();
    initPager();
  });

  it('initializes', () => {
    expect(pager).toBeTruthy();
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
