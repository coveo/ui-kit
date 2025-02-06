import {describe, test} from 'vitest';

//TODO: Write those tests during the lit migration
describe('AtomicSearchBox', () => {
  describe('with instant results & suggestions', () => {
    describe('when using keyboard navigation', () => {
      test('should be able to navigate from the suggestions to the instant results and vice-versa', async () => {});
      test('should execute the search after pressing "Enter" on a suggestion', async () => {});
      test('should redirect to the result page after pressing "Enter" on an instant result', async () => {});
      describe('and then switching to mouse and hovering a new suggestion', () => {
        test('should execute the search reflected in the search box', () => {});
      });
    });

    describe('when typing and then hovering a suggestion', () => {
      test('should execute the search reflected in the search box', () => {});
    });
  });
});
