import {test, expect} from './fixture';

test.describe('When no child results', () => {
  test('should show a "no results" label', async ({foldedResultList}) => {
    await foldedResultList.load({story: 'with-no-result-children'});

    await expect(foldedResultList.noResultsLabel.first()).toBeVisible();
  });
});
