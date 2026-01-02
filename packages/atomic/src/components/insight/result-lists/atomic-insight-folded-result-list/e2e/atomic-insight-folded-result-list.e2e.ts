import {expect, test} from './fixture';

test.describe('atomic-insight-folded-result-list', () => {
  test.describe('when more results are NOT available & there are NO result children', () => {
    test.beforeEach(async ({insightFoldedResultList}) => {
      await insightFoldedResultList.load({story: 'with-no-result-children'});
    });

    test('should show a "no results" label', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.noResultsLabel.first()
      ).toBeVisible();
    });

    test('should NOT show the "load all results" button', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.loadAllResultsButton.first()
      ).not.toBeVisible();
    });

    test('should NOT show result children', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.resultChildren.first()
      ).not.toBeVisible();
    });
  });

  test.describe('when more results are NOT available & there are result children', () => {
    test.beforeEach(async ({insightFoldedResultList}) => {
      await insightFoldedResultList.load({story: 'with-few-result-children'});
    });

    test('should show result children', async ({insightFoldedResultList}) => {
      await expect(
        insightFoldedResultList.resultChildren.first()
      ).toBeVisible();
    });

    test('should NOT show a "no results" label', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.noResultsLabel.first()
      ).not.toBeVisible();
    });

    test('should NOT show "load all results" button', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.loadAllResultsButton.first()
      ).not.toBeVisible();
    });
  });

  test.describe('when more results are available & there are result children', () => {
    test.beforeEach(async ({insightFoldedResultList}) => {
      await insightFoldedResultList.load();
    });

    test('should show the "load all results" button', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.loadAllResultsButton.first()
      ).toBeVisible();
    });

    test('should show the "Collapse results" button after loading all results', async ({
      insightFoldedResultList,
    }) => {
      await insightFoldedResultList.loadAllResultsButton.first().click();
      await expect(
        insightFoldedResultList.collapseResultsButton.first()
      ).toBeVisible();
    });

    test('should show result children', async ({insightFoldedResultList}) => {
      await expect(
        insightFoldedResultList.resultChildren.first()
      ).toBeVisible();
    });

    test('should NOT show the "no results" label', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.noResultsLabel.first()
      ).not.toBeVisible();
    });
  });

  test.describe('when more results are available & there are NO result children', () => {
    test.beforeEach(async ({insightFoldedResultList}) => {
      await insightFoldedResultList.load({
        story: 'with-more-results-available-and-no-children',
      });
    });

    test('should show the "load all results" button', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.loadAllResultsButton.first()
      ).toBeVisible();
    });

    test('should NOT show result children', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.resultChildren.first()
      ).not.toBeVisible();
    });

    test('should NOT show the "no results" label', async ({
      insightFoldedResultList,
    }) => {
      await expect(
        insightFoldedResultList.noResultsLabel.first()
      ).not.toBeVisible();
    });
  });
});
