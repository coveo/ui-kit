import {expect, test} from './fixture';

test.describe('atomic-folded-result-list', () => {
  test.describe('when more results are NOT available & there are NO result children', () => {
    test.beforeEach(async ({foldedResultList}) => {
      await foldedResultList.load({story: 'with-no-result-children'});
    });

    test('should show a "no results" label', async ({foldedResultList}) => {
      await expect(foldedResultList.noResultsLabel.first()).toBeVisible();
    });

    test('should NOT show the "load all results" button', async ({
      foldedResultList,
    }) => {
      await expect(
        foldedResultList.loadAllResultsButton.first()
      ).not.toBeVisible();
    });

    test('should NOT show result children', async ({foldedResultList}) => {
      await expect(foldedResultList.resultChildren.first()).not.toBeVisible();
    });
  });

  test.describe('when more results are NOT available & there are result children', () => {
    test.beforeEach(async ({foldedResultList}) => {
      await foldedResultList.load({story: 'with-few-result-children'});
    });

    test('should show result children', async ({foldedResultList}) => {
      await expect(foldedResultList.resultChildren.first()).toBeVisible();
    });

    test('should NOT show a "no results" label', async ({foldedResultList}) => {
      await expect(foldedResultList.noResultsLabel.first()).not.toBeVisible();
    });

    test('should NOT show "load all results" button', async ({
      foldedResultList,
    }) => {
      await expect(
        foldedResultList.loadAllResultsButton.first()
      ).not.toBeVisible();
    });
  });

  test.describe('when more results are available & there are result children', () => {
    test.beforeEach(async ({foldedResultList}) => {
      await foldedResultList.load();
    });

    test('should show the "load all results" button', async ({
      foldedResultList,
    }) => {
      await expect(foldedResultList.loadAllResultsButton.first()).toBeVisible();
    });

    test('should show the "Collapse results" button after loading all results', async ({
      foldedResultList,
    }) => {
      await foldedResultList.loadAllResultsButton.first().click();
      await expect(
        foldedResultList.collapseResultsButton.first()
      ).toBeVisible();
    });

    test('should show result children', async ({foldedResultList}) => {
      await expect(foldedResultList.resultChildren.first()).toBeVisible();
    });

    test('should NOT show the "no results" label', async ({
      foldedResultList,
    }) => {
      await expect(foldedResultList.noResultsLabel.first()).not.toBeVisible();
    });
  });

  test.describe('when more results are available & there are NO result children', () => {
    test.beforeEach(async ({foldedResultList}) => {
      await foldedResultList.load({
        story: 'with-more-results-available-and-no-children',
      });
    });

    test('should show the "load all results" button', async ({
      foldedResultList,
    }) => {
      await expect(foldedResultList.loadAllResultsButton.first()).toBeVisible();
    });

    test('should NOT show result children', async ({foldedResultList}) => {
      await expect(foldedResultList.resultChildren.first()).not.toBeVisible();
    });

    test('should NOT show the "no results" label', async ({
      foldedResultList,
    }) => {
      await expect(foldedResultList.noResultsLabel.first()).not.toBeVisible();
    });
  });
});
