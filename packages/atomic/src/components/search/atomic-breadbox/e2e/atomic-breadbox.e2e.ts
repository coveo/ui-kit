import {expect, test} from './fixture';

test.describe('atomic-breadbox', () => {
  test.beforeEach(async ({breadbox}) => {
    await breadbox.load();
  });

  test('should restore breadcrumbs from URL state', async ({
    page,
    breadbox,
  }) => {
    const baseUrl =
      './iframe.html?args=&id=atomic-breadbox--default&viewMode=story#q=test&f-objecttype=People';

    await page.goto(baseUrl);
    await breadbox.hydrated.waitFor({state: 'attached', timeout: 10000});

    const breadcrumbs = breadbox.getBreadcrumbButtons();
    await expect(breadcrumbs.first()).toBeVisible();
  });

  test('should display breadcrumbs when selecting facet values', async ({
    breadbox,
  }) => {
    await breadbox.hydrated.waitFor({state: 'visible'});
    await breadbox.page.waitForTimeout(3000);

    const objectTypeFacet = breadbox.getFacetValue('objecttype').first();
    await objectTypeFacet.waitFor({state: 'visible', timeout: 10000});
    await objectTypeFacet.click();

    const breadcrumbs = breadbox.getBreadcrumbButtons();
    await expect(breadcrumbs.first()).toBeVisible();
  });

  test('should clear all breadcrumbs when clicking clear all button', async ({
    breadbox,
  }) => {
    await breadbox.hydrated.waitFor({state: 'visible'});
    await breadbox.page.waitForTimeout(3000);

    const objectTypeFacet = breadbox.getFacetValue('objecttype').first();
    await objectTypeFacet.waitFor({state: 'visible', timeout: 10000});
    await objectTypeFacet.click();

    await breadbox
      .getBreadcrumbButtons()
      .first()
      .waitFor({state: 'visible', timeout: 5000});

    await breadbox.getClearAllButton().click();

    const breadcrumbs = breadbox.getBreadcrumbButtons();
    await expect(breadcrumbs).toHaveCount(0);
  });

  test('should show more/less functionality with viewport changes', async ({
    breadbox,
    page,
  }) => {
    await breadbox.hydrated.waitFor({state: 'visible'});
    await breadbox.page.waitForTimeout(3000);

    const objectTypeFacets = breadbox.getFacetValue('objecttype');
    await objectTypeFacets.first().waitFor({state: 'visible', timeout: 10000});

    const objectTypeCount = await objectTypeFacets.count();
    if (objectTypeCount > 0) await objectTypeFacets.nth(0).click();
    if (objectTypeCount > 1) await objectTypeFacets.nth(1).click();
    if (objectTypeCount > 2) await objectTypeFacets.nth(2).click();

    await page.setViewportSize({width: 320, height: 480});
    await breadbox.page.waitForTimeout(500);

    const showMoreButton = breadbox.getShowMoreButton();
    if (await showMoreButton.isVisible()) {
      await expect(showMoreButton).toContainText(/\+ \d+/);

      await showMoreButton.click();
      await expect(breadbox.getShowLessButton()).toBeVisible();

      await breadbox.getShowLessButton().click();
      await expect(showMoreButton).toBeVisible();
    }
  });
});
