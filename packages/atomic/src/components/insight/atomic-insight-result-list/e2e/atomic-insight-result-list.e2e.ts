import {expect, test} from './fixture';

test.describe('atomic-insight-result-list', () => {
  test.beforeEach(async ({resultList}) => {
    await resultList.load({story: 'default'});
  });

  test('should render results', async ({resultList}) => {
    await expect(resultList.firstResult).toBeVisible();
  });

  test('should display multiple results', async ({resultList}) => {
    await expect(resultList.results).toHaveCount(10);
  });

  test('should render the result list container', async ({resultList}) => {
    await expect(resultList.hydrated).toBeVisible();
  });
});
