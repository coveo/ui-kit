import {vi} from 'vitest';

export default () => {
  return {
    // controller states
    searchOrListingState: {
      responseId: 'some-id',
      products: [{}],
      isLoading: false,
      error: null,
    },
    sortState: {
      availableSorts: [
        {by: 'fields', fields: [{name: 'foo'}]},
        {by: 'fields', fields: [{name: 'bar'}]},
      ],
    },
    // controllers
    sort: {
      isSortedBy: vi.fn(),
      sortBy: vi.fn(),
    },
    searchOrListing: vi.fn(() => ({
      sort: vi.fn(),
    })),
  };
};
