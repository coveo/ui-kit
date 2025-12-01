import {expect, test} from './fixture';

test.describe('atomic-breadbox', () => {
  test.beforeEach(async ({breadbox}) => {
    await breadbox.load();
  });

  test('should show breadcrumb when facet value is selected', async ({
    breadbox,
  }) => {
    await breadbox.getFacetValue('objecttype').first().click();
    const breadcrumbButton = breadbox.getBreadcrumbButtons().first();

    await expect(breadcrumbButton).toBeVisible();
    await expect(breadcrumbButton).toContainText('Object type:');
  });

  test('should remove breadcrumb when clicked', async ({breadbox}) => {
    await breadbox.getFacetValue('objecttype').first().click();
    await breadbox.getBreadcrumbButtons().first().waitFor({state: 'visible'});

    await breadbox.getBreadcrumbButtons().first().click();
    await expect(breadbox.getBreadcrumbButtons()).toHaveCount(0);
  });

  test('should show Clear All button when breadcrumbs exist', async ({
    breadbox,
  }) => {
    await breadbox.getFacetValue('objecttype').first().click();
    await breadbox.getBreadcrumbButtons().first().waitFor({state: 'visible'});

    const clearAllButton = breadbox.getClearAllButton();
    await expect(clearAllButton).toBeVisible();
  });

  test('should clear all breadcrumbs when Clear All is clicked', async ({
    breadbox,
  }) => {
    await breadbox.getFacetValue('objecttype').first().click();
    await breadbox.getFacetValue('filetype').first().click();

    await expect(breadbox.getBreadcrumbButtons()).toHaveCount(2, {
      timeout: 10000,
    });

    const clearAllButton = breadbox.getClearAllButton();
    await clearAllButton.click();
    await expect(breadbox.getBreadcrumbButtons()).toHaveCount(0);
  });

  test('should restore breadcrumb from URL state', async ({page, breadbox}) => {
    const urlWithFilter =
      './iframe.html?args=&id=atomic-breadbox--default&viewMode=story#q=test&f-objecttype=People';
    await page.goto(urlWithFilter);

    await breadbox.hydrated.waitFor({state: 'visible'});

    const breadcrumbButton = breadbox.getBreadcrumbButtons();
    await expect(breadcrumbButton).toHaveCount(1);
    await expect(breadcrumbButton.first()).toContainText('Object type: People');
  });

  test('should display breadcrumb when selecting a facet value', async ({
    breadbox,
  }) => {
    await breadbox.getFacetValue('objecttype').first().click();

    await expect(breadbox.getBreadcrumbButtons()).toHaveCount(1);

    await expect(breadbox.getBreadcrumbButtons().nth(0)).toContainText(
      'Object type:'
    );
  });

  test('should show more/less functionality with viewport changes', async ({
    breadbox,
    page,
  }) => {
    await breadbox.getFacetValue('objecttype').first().click();
    await breadbox.getFacetValue('objecttype').nth(1).click();
    await breadbox.getFacetValue('objecttype').nth(2).click();
    await breadbox.getFacetValue('objecttype').nth(3).click();
    await breadbox.getFacetValue('objecttype').nth(4).click();

    await expect(breadbox.getBreadcrumbButtons()).toHaveCount(5, {
      timeout: 10000,
    });

    await page.setViewportSize({width: 1200, height: 800});
    await expect(breadbox.getBreadcrumbButtons()).toHaveCount(5);

    await page.setViewportSize({width: 280, height: 600});

    const showMoreButton = breadbox.getShowMoreButton();
    const isShowMoreVisible = await showMoreButton
      .isVisible()
      .catch(() => false);

    if (isShowMoreVisible) {
      await showMoreButton.click();
      await expect(breadbox.getShowLessButton()).toBeVisible();

      await breadbox.getShowLessButton().click();
      await expect(breadbox.getShowMoreButton()).toBeVisible();
    }
  });
});
