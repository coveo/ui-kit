import {vi} from 'vitest';

export default {
  pagerState: {
    page: 0,
    totalPages: 10,
    pageSize: 10,
    totalEntries: 100,
  },
  pager: {
    previousPage: vi.fn(),
    selectPage: vi.fn(),
    nextPage: vi.fn(),
  },
  searchOrListing: vi.fn(() => ({
    pagination: vi.fn(() => ({
      previousPage: vi.fn(),
      selectPage: vi.fn(),
      nextPage: vi.fn(),
    })),
  })),
  listing: vi.fn(() => ({
    pagination: vi.fn(() => ({
      previousPage: vi.fn(),
      selectPage: vi.fn(),
      nextPage: vi.fn(),
    })),
  })),
  search: vi.fn(() => ({
    pagination: vi.fn(() => ({
      previousPage: vi.fn(),
      selectPage: vi.fn(),
      nextPage: vi.fn(),
    })),
  })),
};
