import {
  currentPageSelector,
  maxPageSelector,
  currentPagesSelector,
} from './pagination-selectors';
import {createMockState} from '../../test/mock-state';
import {HeadlessState} from '../../state';
import {
  maximumNumberOfResultsFromIndex,
  calculateFirstResult,
} from './pagination-slice';

describe('pagination selectors', () => {
  let state: HeadlessState;

  beforeEach(() => {
    state = createMockState();
  });

  describe('currentPageSelector', () => {
    it('firstResult 0, numberOfResults 10, the page is 1', () => {
      state.pagination.firstResult = 0;
      state.pagination.numberOfResults = 10;

      const page = currentPageSelector(state);
      expect(page).toBe(1);
    });

    it('firstResult 10, numberOfResults 10, the page is 2', () => {
      state.pagination.firstResult = 10;
      state.pagination.numberOfResults = 10;

      const page = currentPageSelector(state);
      expect(page).toBe(2);
    });
  });

  describe('maxPageSelector', () => {
    it('totalCountFiltered 10, numberOfResults 10, maxPage is 1', () => {
      state.pagination.numberOfResults = 10;
      state.search.response.totalCountFiltered = 10;
      const maxPage = maxPageSelector(state);

      expect(maxPage).toBe(1);
    });

    it('totalCountFiltered 11, numberOfResults 10, maxPage is 2', () => {
      state.pagination.numberOfResults = 10;
      state.search.response.totalCountFiltered = 11;
      const maxPage = maxPageSelector(state);

      expect(maxPage).toBe(2);
    });

    it(`totalCountFiltered greater than ${maximumNumberOfResultsFromIndex}, numberOfResults 10, maxPage is 100`, () => {
      state.pagination.numberOfResults = 10;
      state.search.response.totalCountFiltered =
        maximumNumberOfResultsFromIndex + 10;
      const maxPage = maxPageSelector(state);

      expect(maxPage).toBe(100);
    });
  });

  describe('currentPagesSelector', () => {
    const numberOfResults = 10;
    const maxPage = 5;

    function setPage(page: number) {
      state.pagination.numberOfResults = numberOfResults;
      state.pagination.firstResult = calculateFirstResult(
        page,
        numberOfResults
      );
    }

    function setMaxPage(page: number) {
      state.pagination.numberOfResults = numberOfResults;
      state.search.response.totalCountFiltered = page * numberOfResults;
    }

    beforeEach(() => setMaxPage(maxPage));

    describe('desiredNumberOfPages 3 (odd)', () => {
      it('page 1 gives current pages [1,2,3]', () => {
        setPage(1);
        const currentPages = currentPagesSelector(state, 3);

        expect(currentPages).toEqual([1, 2, 3]);
      });

      it('page 3 gives current pages [2,3,4]', () => {
        setPage(3);
        const currentPages = currentPagesSelector(state, 3);

        expect(currentPages).toEqual([2, 3, 4]);
      });

      it('page equal to maxPage gives current pages [3,4,5]', () => {
        setPage(maxPage);
        const currentPages = currentPagesSelector(state, 3);

        expect(currentPages).toEqual([3, 4, 5]);
      });
    });

    it('desiredNumberOfPages 4 (even), page 3 gives current pages [1,2,3,4] (one extra to the left compared to the right)', () => {
      setPage(3);
      const currentPages = currentPagesSelector(state, 4);
      expect(currentPages).toEqual([1, 2, 3, 4]);
    });

    it('page 1, desiredNumberOfPages greater than maxPage, gives current pages [1,2,3,4,5]', () => {
      setPage(1);
      const currentPages = currentPagesSelector(state, maxPage + 2);

      expect(currentPages).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
