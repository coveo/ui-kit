import {pageSelector} from './pagination-selectors';
import {buildMockPagination} from '../../test/mock-pagination';
import {createMockState} from '../../test/mock-state';

describe('pagination selectors', () => {
  it('with firstResult as 0, and numberOfResults 10, the page is 1', () => {
    const pagination = buildMockPagination({
      firstResult: 0,
      numberOfResults: 10,
    });
    const state = createMockState({pagination});
    const page = pageSelector(state);

    expect(page).toBe(1);
  });

  it('with firstResult as 10, and numberOfResults 10, the page is 2', () => {
    const pagination = buildMockPagination({
      firstResult: 10,
      numberOfResults: 10,
    });
    const state = createMockState({pagination});
    const page = pageSelector(state);

    expect(page).toBe(2);
  });
});
