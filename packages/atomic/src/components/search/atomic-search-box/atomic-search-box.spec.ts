import {describe, test} from 'vitest';

//TODO: Write those tests during the lit migration
describe('AtomicSearchBox', () => {
  describe('with instant results & suggestions', () => {
    describe('when using keyboard navigation', () => {
      test('should be able to navigate from the suggestions to the instant results and vice-versa', async () => {});
      test('should execute the search after pressing "Enter" on a suggestion', async () => {});
      test('should redirect to the result page after pressing "Enter" on an instant result', async () => {});
    });

    describe('when typing and then hovering a suggestion', () => {
      test('should execute the search reflected in the search box', () => {});
    });

    describe('when the search box text area is not empty', () => {
      test('should display a clear button', () => {});
      describe('when clicking the clear button', () => {
        test('should clear the search box', () => {});
        test('should clear the suggestions', () => {});
        test('should focus the search box', () => {});
      });
    });
  });
});
