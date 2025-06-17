import {testInsight} from './fixture';

let test = testInsight;

test.describe('Example Insight Panel E2E Tests', () => {
  test.describe('when loading the Insight Panel', () => {
    test('should render correctly and load results automatically', async ({}) => {});
  });

  test.describe('when typing a search query', () => {
    test('should trigger a search query', async ({}) => {});
  });

  test.describe('when interacting with facets', () => {
    test('should open the refine toggle modal and display facets when clicking on the toggle', async ({}) => {});
    test('should send a search request when selecting a facet', async ({}) => {});
    test('should clear facets and send a search request after clicking on the clear facets button', async ({}) => {});
  });
  test.describe('when changing the result page', () => {
    test('should request a new result page', async ({}) => {});
  });
  test.describe('when changing tabs', () => {
    test('should send a search request with the new tab', async ({}) => {});
  });
});