import {expect, test} from './fixture';

test.describe('atomic-insight-folded-result-list', () => {
  test.beforeEach(async ({foldedResultList}) => {
    await foldedResultList.load({story: 'default'});
  });

  test('should render results', async ({foldedResultList}) => {
    await expect(foldedResultList.firstResult).toBeVisible();
  });

  test('should display multiple results', async ({foldedResultList}) => {
    await expect(foldedResultList.results).toHaveCount(10);
  });

  test('should render the result list container', async ({
    foldedResultList,
  }) => {
    await expect(foldedResultList.hydrated).toBeVisible();
  });
});
