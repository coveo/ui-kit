import {expect, test} from './fixture';

test.describe('atomic-refine-toggle', () => {
  test.beforeEach(async ({refineToggle, page}) => {
    await refineToggle.load({
      story: 'with-atomic-externals',
    });
    await page.setViewportSize({width: 400, height: 845});
  });
  test.describe('when the button is clicked', () => {
    test.beforeEach(async ({refineToggle}) => {
      await refineToggle.button.click();
    });

    test('should open the refine modal', async ({refineModal}) => {
      await expect(refineModal.modal).toBeVisible();
    });

    test('should display the facets in the right order', async ({facet}) => {
      await expect(facet.expandButtons).toHaveText([
        'facet1',
        'facet2',
        'facet3',
        'facet4',
        'facet5',
        'facet6',
        'facet7',
        'facet8',
        'facet9',
      ]);
    });
  });
});
