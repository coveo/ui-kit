import {expect, test} from './fixture';

test.describe('atomic-insight-folded-result-list', () => {
  test.describe('when there are results with children', () => {
    test.beforeEach(async ({insightFoldedResultList}) => {
      await insightFoldedResultList.load({story: 'default'});
      await insightFoldedResultList.hydrated.first().waitFor();
    });

    test('should render results', async ({insightFoldedResultList}) => {
      await expect(insightFoldedResultList.results.first()).toBeVisible();
    });

    test('should render child results when available', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.resultChildren.first()
      ).toBeVisible();
    });
  });

  test.describe('when there are no result children', () => {
    test.beforeEach(async ({insightFoldedResultList}) => {
      await insightFoldedResultList.load({story: 'with-no-result-children'});
      await insightFoldedResultList.hydrated.first().waitFor();
    });

    test('should render results', async ({insightFoldedResultList}) => {
      await expect(insightFoldedResultList.results.first()).toBeVisible();
    });

    test('should NOT show result children', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.resultChildren.first()
      ).not.toBeVisible();
    });
  });

  test.describe('when there are result children', () => {
    test.beforeEach(async ({insightFoldedResultList}) => {
      await insightFoldedResultList.load({story: 'with-result-children'});
      await insightFoldedResultList.hydrated.first().waitFor();
    });

    test('should show result children', async ({insightFoldedResultList}) => {
      await expect(
        insightFoldedResultList.resultChildren.first()
      ).toBeVisible();
    });
  });
});
