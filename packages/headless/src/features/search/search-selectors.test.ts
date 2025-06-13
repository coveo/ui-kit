import {createMockState} from '../../test/mock-state.js';
import {
  firstSearchExecutedSelector,
  selectSearchActionCause,
} from './search-selectors.js';

describe('#firstSearchExecutedSelector', () => {
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

describe('#selectSearchActionCause', () => {
  it('returns the actionCause when present', () => {
    const state = createMockState();
    state.search.searchAction = {actionCause: 'searchboxSubmit'};
    expect(selectSearchActionCause(state)).toBe('searchboxSubmit');
  });

  it('returns an empty string when SearchState is missing', () => {
    const state = {};
    expect(selectSearchActionCause(state)).toBe('');
  });

  it('returns an empty string when actionCause is missing', () => {
    const state = createMockState();
    state.search.searchAction = {actionCause: ''};
    expect(selectSearchActionCause(state)).toBe('');
  });
});
