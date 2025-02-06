import {describe, test} from 'vitest';

//TODO: Write those tests during the lit migration
describe('AtomicSearchBoxInstantResults', () => {
  describe('when clicking', () => {
    test('on a instant result, it should redirect to the result page', async () => {});
    test('on the "See all results" button, it should execute the proper search', async () => {});
  });

  describe('when using keyboard navigation', () => {
    test('on instant results, it should redirect to the result page', async () => {});
    test('on the "See all results" button, it should execute the proper search', async () => {});
  });

  describe('when using keyboard navigation and then switching to mouse and hovering a new result', () => {
    test('it should execute the search reflected in the search box', () => {});
  });

  // This is a bug currently in the component
  describe('when using the "See all results" button', () => {
    test('it should reflect the query in the search box', async () => {});
  });
});
