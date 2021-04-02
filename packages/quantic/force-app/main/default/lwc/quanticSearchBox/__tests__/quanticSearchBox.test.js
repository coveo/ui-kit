import {createElement} from 'lwc';
import QuanticSearchBox from 'c/quanticSearchBox';
import {cleanup} from 'c/testUtils';

describe('c-quantic-search-box', () => {
  afterEach(() => {
    cleanup();
  });

  it('construct itself without throwing', () => {
    expect(() =>
      createElement('c-quantic-search-box', {is: QuanticSearchBox})
    ).not.toThrow();
  });
});
