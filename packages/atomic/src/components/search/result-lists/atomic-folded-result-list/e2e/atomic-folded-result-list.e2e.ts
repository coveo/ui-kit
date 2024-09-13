import {test, expect} from './fixture';

// TODO: KIT-3546 - Make this test pass
test.describe('When no child results', () => {
  test.fixme('should show a "no results" label', async ({foldedResultList}) => {
    await foldedResultList.load({story: 'with-no-result-children'});
    await foldedResultList.loadAllResultsButton.click();
    await expect(foldedResultList.noResultsLabel.first()).toBeVisible();
  });
});
