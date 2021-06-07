import {createMockState} from '../../test';
import {firstSearchExecutedSelector} from './search-selectors';

describe('search selectors', () => {
  it(`when the response searchUid is truthy,
  #firstSearchExecutedSelector returns true`, () => {
    const state = createMockState();
    state.search.response.searchUid = 'a';

    const result = firstSearchExecutedSelector(state);
    expect(result).toBe(true);
  });

  it(`when the response searchUid is an empty string,
  #firstSearchExecutedSelector returns false`, () => {
    const state = createMockState();
    state.search.response.searchUid = '';

    const result = firstSearchExecutedSelector(state);
    expect(result).toBe(false);
  });
});
