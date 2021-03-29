import {createElement} from 'lwc';
import QuanticSearchInterface from 'quanticSearchInterface/quanticSearchInterface';
import {cleanup} from 'c/testUtils';

describe('c-quantic-search-interface', () => {
  afterEach(() => {
    cleanup();
  });

  it('construct itself without throwing', () => {
    expect(() =>
      createElement('c-quantic-search-interface', {is: QuanticSearchInterface})
    ).not.toThrow();
  });
});
