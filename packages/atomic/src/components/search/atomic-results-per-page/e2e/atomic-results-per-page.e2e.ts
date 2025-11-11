import {test} from './fixture';

test.describe('atomic-results-per-page', () => {
  test.beforeEach(async ({resultsPerPage}) => {
    await resultsPerPage.load();
    await resultsPerPage.hydrated.waitFor();
  });
});
