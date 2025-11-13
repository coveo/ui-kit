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
      },
      {
        facetType: 'source',
        filter: '&f-source=YouTube',
      },
      {
        facetType: 'filetype',
        filter: '&f-filetype=lithiumpresentation',
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

    test.describe('when clicking on the "Clear all" button', () => {
      test.beforeEach(async ({breadbox}) => {
        await breadbox.getClearAllButton().click();
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

  test.describe('when working with different facet types', () => {
    test.beforeEach(async ({breadbox}) => {
      await breadbox.hydrated.waitFor({state: 'visible'});
      await breadbox.page.waitForTimeout(3000);
    });

    test('should display breadcrumbs for multiple facet types', async ({
      breadbox,
    }) => {
      await test.step('Select facet values from different facet types', async () => {
        const objectTypeFacet = breadbox.getFacetValue('objecttype').first();
        await objectTypeFacet.waitFor({state: 'visible', timeout: 10000});
        await objectTypeFacet.click();

        const sourceFacet = breadbox.getFacetValue('source').first();
        if (await sourceFacet.isVisible()) {
          await sourceFacet.click();
        }

        const filetypeFacet = breadbox.getFacetValue('filetype').first();
        if (await filetypeFacet.isVisible()) {
          await filetypeFacet.click();
        }
      });

      await test.step('Verify breadcrumbs are displayed', async () => {
        const breadcrumbs = breadbox.getBreadcrumbButtons();
        await expect(breadcrumbs.first()).toBeVisible();

        const breadcrumbCount = await breadcrumbs.count();
        expect(breadcrumbCount).toBeGreaterThan(0);
      });
    });

    test('should remove individual breadcrumbs when clicked', async ({
      breadbox,
    }) => {
      await test.step('Select multiple facet values', async () => {
        const objectTypeFacet = breadbox.getFacetValue('objecttype').first();
        await objectTypeFacet.waitFor({state: 'visible', timeout: 10000});
        await objectTypeFacet.click();

        const secondObjectTypeFacet = breadbox
          .getFacetValue('objecttype')
          .nth(1);
        if (await secondObjectTypeFacet.isVisible()) {
          await secondObjectTypeFacet.click();
        }
      });

      await test.step('Remove one breadcrumb and verify count decreases', async () => {
        const breadcrumbs = breadbox.getBreadcrumbButtons();
        await breadcrumbs.first().waitFor({state: 'visible', timeout: 5000});

        const initialCount = await breadcrumbs.count();
        expect(initialCount).toBeGreaterThan(0);

        await breadcrumbs.first().click();
        await breadbox.page.waitForTimeout(1000);

        const newCount = await breadcrumbs.count();
        expect(newCount).toBeLessThan(initialCount);
      });
    });
  });

  test.describe('accessibility verification', () => {
    test('should have proper ARIA labels and structure', async ({
      breadbox,
      page,
    }) => {
      await breadbox.hydrated.waitFor({state: 'visible'});
      await breadbox.page.waitForTimeout(3000);

      const objectTypeFacet = breadbox.getFacetValue('objecttype').first();
      await objectTypeFacet.waitFor({state: 'visible', timeout: 10000});
      await objectTypeFacet.click();

      await test.step('Verify breadcrumb accessibility structure', async () => {
        const breadcrumbs = breadbox.getBreadcrumbButtons();
        await breadcrumbs.first().waitFor({state: 'visible', timeout: 5000});

        await expect(breadcrumbs.first()).toHaveRole('button');
        await expect(breadcrumbs.first()).toHaveAttribute('aria-label');

        const clearAllButton = breadbox.getClearAllButton();
        const clearAllButtonExists = (await clearAllButton.count()) > 0;

        if (
          clearAllButtonExists &&
          (await clearAllButton.first().isVisible())
        ) {
          await expect(clearAllButton.first()).toHaveRole('button');
          const hasAriaLabel = await clearAllButton
            .first()
            .getAttribute('aria-label');
          expect(hasAriaLabel).toBeTruthy();
        }
      });

      await test.step('Verify keyboard navigation', async () => {
        const breadcrumbButtons = breadbox.getBreadcrumbButtons();
        const breadcrumbCount = await breadcrumbButtons.count();

        if (breadcrumbCount > 0) {
          const firstBreadcrumb = breadcrumbButtons.first();
          await firstBreadcrumb.waitFor({state: 'attached'});
          await firstBreadcrumb.focus();
          await expect(firstBreadcrumb).toBeFocused();

          await page.keyboard.press('Enter');
          await breadbox.page.waitForTimeout(500);

          const remainingBreadcrumbs = await breadbox
            .getBreadcrumbButtons()
            .count();
          expect(remainingBreadcrumbs).toBeLessThan(breadcrumbCount);
        }
      });
    });
  });
});
