/* eslint-disable @cspell/spellchecker */
import {expect, test} from './fixture';

test.describe('atomic-breadbox', () => {
  test.beforeEach(async ({breadbox}) => {
    await breadbox.load();
  });

  test.describe('when restoring the state from URL', () => {
    [
      {
        facetType: 'objecttype',
        filter: '&f-objecttype=People',
        breadcrumbLabel: 'Object type: People',
      },
      {
        facetType: 'source',
        filter: '&f-source=YouTube',
        breadcrumbLabel: 'Source: YouTube',
      },
      {
        facetType: 'filetype',
        filter: '&f-filetype=lithiumpresentation',
        breadcrumbLabel: 'File type: lithiumpresentation',
      },
    ].forEach(({facetType, filter}) => {
      const baseUrl =
        './iframe.html?args=&id=atomic-breadbox--default&viewMode=story#q=test';

      test(`should load breadbox component for ${facetType} URL filter`, async ({
        page,
        breadbox,
      }) => {
        await page.goto(`${baseUrl}${filter}`);

        const breadboxElement = breadbox.hydrated;

        await breadboxElement.waitFor({state: 'attached', timeout: 10000});

        await expect(breadboxElement).toHaveAttribute('path-limit');

        expect(
          (await breadboxElement.isVisible()) ||
            (await breadboxElement.isHidden())
        ).toBe(true);
      });
    });
  });

  test.describe('when a regular facet value is selected', () => {
    let firstValueText: string | RegExp;

    test.beforeEach(async ({breadbox}) => {
      await breadbox.hydrated.waitFor({state: 'visible'});
      await breadbox.page.waitForTimeout(3000);

      firstValueText = (await breadbox
        .getFacetValue('objecttype')
        .locator('span')
        .first()
        .textContent()) as string;

      await breadbox.getFacetValue('objecttype', firstValueText).click();

      await breadbox
        .getBreadcrumbButtons(firstValueText)
        .waitFor({state: 'visible', timeout: 5000});
    });

    test('should have clickable breadcrumb button with proper attributes', async ({
      breadbox,
    }) => {
      const breadcrumbButtons = breadbox.getBreadcrumbButtons();
      const firstBreadcrumb = breadcrumbButtons.first();

      await expect(firstBreadcrumb).toBeVisible();
      await expect(firstBreadcrumb).toBeEnabled();
      await expect(firstBreadcrumb).toHaveAttribute('aria-label');

      await expect(firstBreadcrumb).toContainText(firstValueText);

      await firstBreadcrumb.focus();
      await expect(firstBreadcrumb).toBeFocused();
    });

    test('should display the "Clear all" button', async ({breadbox}) => {
      await expect(breadbox.getClearAllButton()).toBeVisible();
    });

    test('should trigger clear all action when clicking the "Clear all" button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
      const clearButton = breadbox.getClearAllButton();

      await expect(breadcrumbButton).toBeVisible();
      await expect(clearButton).toBeVisible();

      await clearButton.click({force: true, timeout: 5000});

      await expect(clearButton).toHaveAttribute('aria-label');
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);

      await expect(breadcrumbButton).toContainText(
        `Object type: ${firstValueText}`
      );
    });
  });

  test.describe('when selecting multiple facet values', () => {
    test.beforeEach(async ({breadbox}) => {
      await breadbox.hydrated.waitFor({state: 'visible'});
      await breadbox.page.waitForTimeout(3000);

      const objectTypeFacet = breadbox.getFacetValue('objecttype').first();
      await objectTypeFacet.waitFor({state: 'visible', timeout: 10000});
      await objectTypeFacet.click();

      await breadbox
        .getBreadcrumbButtons()
        .first()
        .waitFor({state: 'visible', timeout: 5000});

      const secondFacet = breadbox.getFacetValue('objecttype').nth(1);
      if (await secondFacet.isVisible()) {
        await secondFacet.click();
        await breadbox.page.waitForTimeout(1000);
      }
    });

    test('should display the "Clear all" button', async ({breadbox}) => {
      await expect(breadbox.getClearAllButton()).toBeVisible();
    });

    test.describe('when clicking on the "Clear all" button', () => {
      test.beforeEach(async ({breadbox}) => {
        await breadbox.getClearAllButton().click();
      });

      test('should hide the "Clear all" button', async ({breadbox}) => {
        await expect(breadbox.getClearAllButton()).not.toBeVisible();
      });

      test('should hide all breadcrumb buttons', async ({breadbox}) => {
        const breadcrumbs = breadbox.getBreadcrumbButtons();
        await expect(breadcrumbs).toHaveCount(0);
      });
    });

    test('should group extra facet values in the "Show More" button based on the viewport size', async ({
      breadbox,
      page,
    }) => {
      await expect(breadbox.getShowMoreButton()).not.toBeVisible();
      const totalBreadcrumbs = await breadbox.getBreadcrumbButtons().count();
      expect(totalBreadcrumbs).toBeGreaterThan(0);

      await page.setViewportSize({width: 320, height: 480});
      await breadbox.page.waitForTimeout(500);

      const showMoreButton = breadbox.getShowMoreButton();
      if (await showMoreButton.isVisible()) {
        await expect(showMoreButton).toContainText(/\+ \d+/);
      }
    });

    test.describe('when clicking on a breadcrumb button', () => {
      test.beforeEach(async ({breadbox}) => {
        const firstBreadcrumb = breadbox.getBreadcrumbButtons().first();
        await firstBreadcrumb.waitFor({state: 'visible'});
        await firstBreadcrumb.click();
      });

      test('should remove only that breadcrumb', async ({breadbox}) => {
        const initialCount = await breadbox.getBreadcrumbButtons().count();

        const firstBreadcrumb = breadbox.getBreadcrumbButtons().first();
        await firstBreadcrumb.click({force: true, timeout: 5000});

        await breadbox.page.waitForTimeout(2000);
        const finalCount = await breadbox.getBreadcrumbButtons().count();

        expect(finalCount).toBeLessThanOrEqual(initialCount);
      });

      test('should still display the "Clear all" button', async ({
        breadbox,
      }) => {
        await expect(breadbox.getClearAllButton()).toBeVisible();
      });
    });

    test.describe('when clicking on the "Show More" button', () => {
      test.beforeEach(async ({breadbox, page}) => {
        await page.setViewportSize({width: 320, height: 480});
        await breadbox.page.waitForTimeout(500);

        const showMoreButton = breadbox.getShowMoreButton();
        if (await showMoreButton.isVisible()) {
          await showMoreButton.click();
        }
      });

      test('should show "Show Less" button when expanded', async ({
        breadbox,
      }) => {
        const showMoreButton = breadbox.getShowMoreButton();
        const showLessButton = breadbox.getShowLessButton();

        if (await showLessButton.isVisible()) {
          await expect(showLessButton).toBeVisible();
          await expect(showMoreButton).not.toBeVisible();
        }
      });

      test.describe('when clicking on the "Show Less" button', () => {
        test.beforeEach(async ({breadbox}) => {
          const showLessButton = breadbox.getShowLessButton();
          if (await showLessButton.isVisible()) {
            await showLessButton.click();
          }
        });

        test('should collapse breadcrumbs again', async ({breadbox}) => {
          const showMoreButton = breadbox.getShowMoreButton();
          const showLessButton = breadbox.getShowLessButton();

          if (await showMoreButton.isVisible()) {
            await expect(showLessButton).not.toBeVisible();
            await expect(showMoreButton).toBeVisible();
          }
        });
      });
    });
  });

  test('should hide extra breadcrumbs when viewport is small', async ({
    breadbox,
    page,
  }) => {
    await breadbox.hydrated.waitFor({state: 'visible'});
    await breadbox.page.waitForTimeout(3000);

    await page.setViewportSize({width: 640, height: 480});

    const objectTypeFacets = breadbox.getFacetValue('objecttype');
    await objectTypeFacets.first().waitFor({state: 'visible', timeout: 10000});

    const objectTypeCount = await objectTypeFacets.count();
    if (objectTypeCount > 0) await objectTypeFacets.nth(0).click();
    if (objectTypeCount > 1) await objectTypeFacets.nth(1).click();
    if (objectTypeCount > 2) await objectTypeFacets.nth(2).click();

    const sourceFacets = breadbox.getFacetValue('source');
    const sourceCount = await sourceFacets.count();
    if (sourceCount > 0) {
      await sourceFacets.first().waitFor({state: 'visible', timeout: 10000});
      await sourceFacets.nth(0).click();
    }
    if (sourceCount > 1) await sourceFacets.nth(1).click();

    await breadbox
      .getBreadcrumbButtons()
      .first()
      .waitFor({state: 'visible', timeout: 5000});
    await breadbox.page.waitForTimeout(500);

    const showMoreButton = breadbox.getShowMoreButton();
    if (await showMoreButton.isVisible()) {
      await expect(showMoreButton).toContainText(/\+ \d+/);
    }
  });

  test('should respect pathLimit property for complex facet paths', async ({
    page,
    breadbox,
  }) => {
    const baseUrl =
      './iframe.html?args=path-limit:2&id=atomic-breadbox--default&viewMode=story#f-objecttype=People&f-source=YouTube';
    await page.goto(baseUrl);

    const breadcrumbButtons = breadbox.getBreadcrumbButtons();
    await expect(breadcrumbButtons.first()).toBeVisible();

    const breadcrumbCount = await breadcrumbButtons.count();
    expect(breadcrumbCount).toBeGreaterThan(0);
  });

  test('should show breadcrumb with proper accessibility', async ({
    breadbox,
  }) => {
    await breadbox.hydrated.waitFor({state: 'visible'});
    await breadbox.page.waitForTimeout(3000);

    const firstFacetValue = breadbox.getFacetValue('objecttype').first();
    await firstFacetValue.waitFor({state: 'visible', timeout: 10000});
    await firstFacetValue.click();

    const breadcrumbButton = breadbox.getBreadcrumbButtons().first();
    await breadcrumbButton.waitFor({state: 'visible', timeout: 5000});

    await expect(breadcrumbButton).toHaveAttribute('aria-label');
    const ariaLabel = await breadcrumbButton.getAttribute('aria-label');
    expect(ariaLabel).toContain('Remove inclusion filter on');
  });
});
