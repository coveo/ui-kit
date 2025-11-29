import {describe, it} from 'vitest';

//TODO: Write those tests during the lit migration
describe('AtomicSearchBox', () => {
  describe('with instant results & suggestions', () => {
    describe('when using keyboard navigation', () => {
      it('should be able to navigate from the suggestions to the instant results and vice-versa', async () => {});
      it('should execute the search after pressing "Enter" on a suggestion', async () => {});
      it('should redirect to the result page after pressing "Enter" on an instant result', async () => {});
    });

    describe('when typing and then hovering a suggestion', () => {
      it('should execute the search reflected in the search box', () => {});
    });

    describe('with recent queries', () => {
      it('should display a "Recent searches Clear" button', () => {});
      it('when clicking the "Recent searches Clear" button, should not reset the input value', () => {});
    });
    describe('when the search box text area is not empty', () => {
      it('should display a clear button', () => {});
      describe('when clicking the clear button', () => {
        it('should clear the search box', () => {});
        it('should clear the suggestions', () => {});
        it('should not collapse the suggestions list if suggestions are available', () => {});
        it('should collapse the suggestion list if no suggestions are available', () => {});
        it('should focus the search box', () => {});
      });
    });
  });
});
