import {createElement} from 'lwc';
import SearchInterface from 'c/searchInterface';
import {cleanup} from 'c/testUtils';

describe('c-search-interface', () => {
  afterEach(() => {
    cleanup();
  });

  it('construct itself without throwing', () => {
    expect(() =>
      createElement('c-search-interface', {is: SearchInterface})
    ).not.toThrow();
  });
});
