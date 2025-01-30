import {test, expect} from './fixture';

test.describe('when a "depends-on" prop is provided', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'with-depends-on'});
    await facet.facet.waitFor({state: 'visible'});
  });

  test('when the specified dependency is selected in the parent facet, should be visible', async ({
    facet,
  }) => {
    expect(facet.facet).toBeVisible();
  });

  test.describe('when the specified dependency is cleared in the parent facet', () => {
    test('should not be visible', async ({facet}) => {
      const parent = facet.page.getByTestId('parent-facet');
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

      expect(facet.facet).not.toBeVisible();
    });

    test('should clear previously selected range', async ({facet}) => {
      await facet.getFacetValue.first().click();

      const breadbox = facet.page.getByTestId('breadbox');
      expect(breadbox).toBeVisible();

      const parent = facet.page.getByTestId('parent-facet');
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

      await breadbox.waitFor({state: 'hidden'});
      expect(breadbox).not.toBeVisible();
    });
    test('should clear previously selected input range', async ({facet}) => {
      await facet.facetInputStart.fill('900000');
      await facet.facetInputEnd.fill('90000000');
      await facet.facetApplyButton.click();

      const breadbox = facet.page.getByTestId('breadbox');
      expect(breadbox).toBeVisible();

      const parent = facet.page.getByTestId('parent-facet');
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

      await breadbox.waitFor({state: 'hidden'});
      expect(breadbox).not.toBeVisible();
    });
  });
});
