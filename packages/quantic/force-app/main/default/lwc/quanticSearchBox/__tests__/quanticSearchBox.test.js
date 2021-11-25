import {createElement} from 'lwc';
import QuanticSearchBox from 'c/quanticSearchBox';

describe('c-quantic-search-box', () => {
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
      createElement('c-quantic-search-box', {is: QuanticSearchBox})
    ).not.toThrow();
  });
});
