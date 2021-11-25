import {createElement} from 'lwc';
import QuanticSearchInterface from 'c/quanticSearchInterface';

describe('c-quantic-search-interface', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  }  

  afterEach(() => {
    cleanup();
  });

  it('construct itself without throwing', () => {
    expect(() =>
      createElement('c-quantic-search-interface', {is: QuanticSearchInterface})
    ).not.toThrow();
  });
});
