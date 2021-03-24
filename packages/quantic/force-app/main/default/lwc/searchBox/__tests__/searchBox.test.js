import {createElement} from 'lwc';
import SearchBox from 'c/searchBox';
import {cleanup} from 'c/testUtils';

describe('c-search-box', () => {
  afterEach(() => {
    cleanup();
  });

  it('construct itself without throwing', () => {
    expect(() =>
      createElement('c-search-box', {is: SearchBox})
    ).not.toThrow();
  });
});
