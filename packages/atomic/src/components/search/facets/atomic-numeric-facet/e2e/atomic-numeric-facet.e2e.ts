import {expect, test} from './fixture';

test.describe('when a "depends-on" prop is provided', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'with-depends-on'});
    await facet.facet.waitFor({state: 'visible'});
  });

  test('when the specified dependency is selected in the parent facet, dependent facet should be visible', async ({
    facet,
  }) => {
    await expect(facet.facet).toBeVisible();
  });

  test.describe('when the specified dependency is cleared from the parent facet', () => {
    test('dependent facet should not be visible', async ({facet}) => {
      const parent = facet.page.getByTestId('regular-facet');
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

      await expect(facet.facet).not.toBeVisible();
    });

    test('should clear previously selected dependent facet range', async ({
      facet,
    }) => {
      await facet.facetValues.first().click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      const parent = facet.page.getByTestId('regular-facet');
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
    test('should clear previously selected dependent facet input range', async ({
      facet,
    }) => {
      await facet.facetInputStart.fill('900000');
      await facet.facetInputEnd.fill('90000000');
      await facet.facetApplyButton.click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      const parent = facet.page.getByTestId('regular-facet');
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
  });

  test.describe('when the specified dependency is cleared from the breadbox', () => {
    test('dependent facet should not be visible', async ({facet}) => {
      const breadbox = facet.page.getByTestId('breadbox');
      await breadbox
        .getByLabel('Remove inclusion filter on File Type: YouTubeVideo')
        .click();

      await expect(facet.facet).not.toBeVisible();
    });

    test('should clear previously selected dependent facet range', async ({
      facet,
    }) => {
      await facet.facetValues.first().click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      await breadbox
        .getByLabel('Remove inclusion filter on File Type: YouTubeVideo')
        .click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
    test('should clear previously selected dependent facet input range', async ({
      facet,
    }) => {
      await facet.facetInputStart.fill('900000');
      await facet.facetInputEnd.fill('90000000');
      await facet.facetApplyButton.click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      await breadbox
        .getByLabel('Remove inclusion filter on File Type: YouTubeVideo')
        .click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
  });
});
