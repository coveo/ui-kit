/* eslint-disable @cspell/spellchecker */
import {Locator} from '@playwright/test';
import {test, expect} from './fixture';

test.describe('Default', () => {
  test.beforeEach(async ({breadbox}) => {
    await breadbox.load();
  });

  test('should be A11y compliant', async ({breadbox, makeAxeBuilder}) => {
    await breadbox.getRegularFacetValue('Nike').click();
    await breadbox.getBreadcrumbButtons('Nike').waitFor({state: 'visible'});

    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test.describe('when a regular facet value is selected', () => {
    test.beforeEach(async ({breadbox}) => {
      await breadbox.getRegularFacetValue('Nike').click();
      await breadbox.getBreadcrumbButtons('Nike').waitFor({state: 'visible'});
    });

    test('should disappear when clicking on the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons('Nike');
      await breadcrumbButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons('Nike');

      await expect(breadcrumbButton).toHaveText('Brand:Nike');
    });
  });
  test.describe('when a category facet value is selected', () => {
    test.beforeEach(async ({breadbox}) => {
      await breadbox.getCategoryFacetValue('Sandals & Shoes').click();
      await breadbox
        .getBreadcrumbButtons('Sandals & Shoes')
        .waitFor({state: 'visible'});
    });

    test('should disappear when clicking on the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons('Sandals & Shoes');
      await breadcrumbButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons('Sandals & Shoes');

      await expect(breadcrumbButton).toHaveText('Category:Sandals & Shoes');
    });
    test.describe('when a nested category facet value is selected', () => {
      test.beforeEach(async ({breadbox}) => {
        await breadbox.getCategoryFacetValue(/^Sandals$/).click();
        await breadbox
          .getBreadcrumbButtons()
          .first()
          .waitFor({state: 'visible'});
      });

      test('should disappear when clicking on the breadcrumb button', async ({
        breadbox,
      }) => {
        const breadcrumbButton = breadbox.getBreadcrumbButtons().first();
        await breadcrumbButton.click();

        await expect(breadcrumbButton).not.toBeVisible();
      });

      test('should contain the selected value and the facet name in the breadcrumb button', async ({
        breadbox,
      }) => {
        const breadcrumbButton = breadbox.getBreadcrumbButtons().first();

        await expect(breadcrumbButton).toHaveText(
          'Category:Sandals & Shoes / Sandals'
        );
      });
    });
  });
  test.describe('when a numerical facet value is selected', () => {
    let firstValueText: string | RegExp;

    test.beforeEach(async ({breadbox}) => {
      await breadbox.getNumericalFacetValue().first().click();
      firstValueText = (await breadbox
        .getNumericalFacetValue()
        .first()
        .textContent()) as string;
      await breadbox
        .getBreadcrumbButtons(firstValueText)
        .waitFor({state: 'visible'});
    });

    test('should disappear when clicking on the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
      await breadcrumbButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);

      await expect(breadcrumbButton).toHaveText('Price:' + firstValueText);
    });
  });

  test.describe('when a date range facet value is selected', () => {
    let firstValueText: string | RegExp;

    test.beforeEach(async ({breadbox, page}) => {
      await page.goto(
        'http://localhost:4400/iframe.html?id=atomic-commerce-breadbox--with-date-facet&viewMode=story'
      );

      await breadbox.getDateRangeFacetValue().first().click();
      firstValueText = (await breadbox
        .getDateRangeFacetValue()
        .first()
        .textContent()) as string;
      await breadbox
        .getBreadcrumbButtons(firstValueText)
        .waitFor({state: 'visible'});
    });

    test('should disappear when clicking on the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
      await breadcrumbButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);

      await expect(breadcrumbButton).toHaveText('Date:' + firstValueText);
    });
  });

  test.describe('when selecting 6 facet values', () => {
    test.beforeEach(async ({breadbox}) => {
      for (let i = 0; i < 6; i++) {
        await breadbox.getRegularFacetValue().nth(i).click();
        await breadbox
          .getBreadcrumbButtons()
          .nth(i)
          .waitFor({state: 'visible'});
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
        await breadbox.getClearAllButton().waitFor({state: 'hidden'});

        expect(await breadbox.getBreadcrumbButtons().count()).toBe(0);
      });
    });

    test('should group extra facet values in the "Show More" button based on the viewport size', async ({
      breadbox,
      page,
    }) => {
      await expect(breadbox.getShowMorebutton()).not.toBeVisible();
      expect(await breadbox.getBreadcrumbButtons().count()).toBe(6);

      await page.setViewportSize({width: 240, height: 480});
      await page.waitForTimeout(1000);
      expect(await breadbox.getBreadcrumbButtons().count()).toBe(0);
      await expect(breadbox.getShowMorebutton()).toContainText('+ 6');

      await page.setViewportSize({width: 1920, height: 480});
      await page.waitForTimeout(1000);
      await expect(breadbox.getShowMorebutton()).not.toBeVisible();
      expect(await breadbox.getBreadcrumbButtons().count()).toBe(6);
    });

    test.describe('when clicking on a breadcrumb button', () => {
      let firstButton: Locator;
      let firstButtonText: string | RegExp;

      test.beforeEach(async ({breadbox, page}) => {
        firstButton = breadbox.getBreadcrumbButtons().first();
        firstButtonText = (await firstButton.textContent()) as string;
        await firstButton.click();
        await page.setViewportSize({width: 240, height: 480});
      });

      test('should hide the breadcrumb button', async ({breadbox}) => {
        await expect(
          breadbox.getBreadcrumbButtons(firstButtonText)
        ).not.toBeVisible();
      });

      test('should uncheck the facet value', async ({breadbox}) => {
        const facetValueButton = breadbox.getRegularFacetValue(firstButtonText);
        if (await facetValueButton.isVisible()) {
          await expect(facetValueButton).not.toBeChecked();
        }
      });

      test('should update the "Show More" button count', async ({breadbox}) => {
        await expect(breadbox.getShowMorebutton()).toContainText('+ 5');
      });
    });

    test.describe('when clicking on the "Show More" button', () => {
      test.beforeEach(async ({breadbox, page}) => {
        await page.setViewportSize({width: 640, height: 480});
        await breadbox.getShowMorebutton().click();
      });

      test('should display all facet values', async ({breadbox}) => {
        await expect(breadbox.getShowMorebutton()).not.toBeVisible();
        expect(await breadbox.getBreadcrumbButtons().count()).toBe(6);
      });

      test('should display the "Show Less" button', async ({breadbox}) => {
        await expect(breadbox.getShowMorebutton()).not.toBeVisible();
        await expect(breadbox.getShowLessbutton()).toBeVisible();
      });

      test('should show the "Show More" button when clicking on the "Show Less" button', async ({
        breadbox,
      }) => {
        await breadbox.getShowLessbutton().click();
        await expect(breadbox.getShowMorebutton()).toBeVisible();
        await expect(breadbox.getShowLessbutton()).not.toBeVisible();
      });
    });
  });
});
