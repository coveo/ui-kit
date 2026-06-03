/* eslint-disable @cspell/spellchecker */
import type {Locator} from '@playwright/test';
import {expect, test} from './fixture';

test.describe('atomic-commerce-breadbox', () => {
  test.beforeEach(async ({breadbox}) => {
    await breadbox.load();
  });

  test.describe('when restoring the state from URL', () => {
    [
      {
        facetType: 'regular',
        filter: '&f-cat_color=Brown',
        breadcrumbLabel: 'Color: Brown',
      },
      {
        facetType: 'numerical range',
        filter: '&nf-ec_price=15..20 ',
        breadcrumbLabel: 'Price: $15.00 to $20.00',
      },
      {
        facetType: 'date range',
        filter: '&df-cat_date_added=2021/01/01@12:00:00..2021/12/31@12:00:00',
        breadcrumbLabel: 'Date: 2021-01-01 to 2021-12-31',
      },
      {
        facetType: 'category',
        filter: '&cf-ec_category=Accessories',
        breadcrumbLabel: 'Category: Accessories',
      },
      {
        facetType: 'category (nested)',
        filter: '&cf-ec_category=Accessories,Surf%20Accessories',
        breadcrumbLabel: 'Category: Accessories / Surf Accessories',
      },
    ].forEach(({facetType, filter, breadcrumbLabel}) => {
      const baseUrl =
        './iframe.html?args=&id=atomic-commerce-breadbox--default&viewMode=story#sortCriteria=relevance';

      test(`should show the breadcrumb for ${facetType} facet value`, async ({
        page,
        breadbox,
      }) => {
        await page.goto(baseUrl + filter);
        await breadbox.hydrated.waitFor();

        const breadcrumbButton = breadbox.getBreadcrumbButtons(breadcrumbLabel);

        await expect(breadcrumbButton).toContainText(breadcrumbLabel);
      });
    });
  });

  test('when restoring a manual numerical range from URL, should show the corresponding breadcrumb', async ({
    page,
    breadbox,
  }) => {
    const baseUrl =
      './iframe.html?args=&id=atomic-commerce-breadbox--default&viewMode=story#sortCriteria=relevance&mnf-ec_price=20..30';
    await page.goto(baseUrl);

    const expectedBreadcrumbLabel = 'Price: $20.00 to $30.00';

    const breadcrumbButton = breadbox.getBreadcrumbButtons(
      expectedBreadcrumbLabel
    );

    await expect(breadcrumbButton).toContainText(expectedBreadcrumbLabel);
  });

  test.describe('when a regular facet value is selected', () => {
    let firstValueText: string | RegExp;

    test.beforeEach(async ({breadbox}) => {
      firstValueText = (await breadbox
        .getFacetValue('regular')
        .locator('span')
        .first()
        .textContent()) as string;
      await breadbox.getFacetValue('regular', firstValueText).click();
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

    test('should display the "Clear all" button', async ({breadbox}) => {
      await expect(breadbox.getClearAllButton()).toBeVisible();
    });

    test('should disappear when clicking on the "Clear all" button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
      const clearButton = breadbox.getClearAllButton();
      await clearButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);

      await expect(breadcrumbButton).toContainText(`Brand: ${firstValueText}`);
    });
  });
  test.describe('when a category facet value is selected', () => {
    let firstValueText: string | RegExp;
    test.beforeEach(async ({breadbox}) => {
      firstValueText = (await breadbox
        .getFacetValue('category')
        .first()
        .locator('span')
        .first()
        .textContent()) as string;
      await breadbox
        .getFacetValue('category', firstValueText)
        .locator('button')
        .click();
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

    test('should display the "Clear all" button', async ({breadbox}) => {
      await expect(breadbox.getClearAllButton()).toBeVisible();
    });

    test('should disappear when clicking on the "Clear all" button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
      const clearButton = breadbox.getClearAllButton();
      await clearButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);

      await expect(breadcrumbButton).toContainText(
        `Category: ${firstValueText}`
      );
    });

    test.describe('when a nested category facet value is selected', () => {
      let breadcrumbText: string | RegExp;

      test.beforeEach(async ({breadbox}) => {
        breadcrumbText =
          (await breadbox
            .getFacetValue('category')
            .first()
            .locator('li span')
            .first()
            .textContent()) +
          ' / ' +
          (await breadbox
            .getFacetValue('nestedCategory')
            .first()
            .locator('span')
            .first()
            .textContent());
        await breadbox
          .getFacetValue('nestedCategory')
          .first()
          .locator('button')
          .click();
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

      test('should display the "Clear all" button', async ({breadbox}) => {
        await expect(breadbox.getClearAllButton()).toBeVisible();
      });

      test('should disappear when clicking on the "Clear all" button', async ({
        breadbox,
      }) => {
        const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
        const clearButton = breadbox.getClearAllButton();
        await clearButton.click();

        await expect(breadcrumbButton).not.toBeVisible();
      });

      test('should contain the selected value and the facet name in the breadcrumb button', async ({
        breadbox,
      }) => {
        const breadcrumbButton = breadbox.getBreadcrumbButtons().first();

        await expect(breadcrumbButton).toContainText(
          `Category: ${breadcrumbText}`
        );
      });
    });
  });
  test.describe('when a numerical facet value is selected', () => {
    let firstValueText: string | RegExp;

    test.beforeEach(async ({breadbox}) => {
      await breadbox.getFacetValue('numerical').first().click();
      firstValueText = (await breadbox
        .getFacetValue('numerical')
        .locator('span')
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

    test('should display the "Clear all" button', async ({breadbox}) => {
      await expect(breadbox.getClearAllButton()).toBeVisible();
    });

    test('should disappear when clicking on the "Clear all" button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
      const clearButton = breadbox.getClearAllButton();
      await clearButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);

      await expect(breadcrumbButton).toContainText(`Price: ${firstValueText}`);
    });
  });

  test.describe('when a manual numerical facet range is applied', () => {
    let firstValueText: string | RegExp;

    test.beforeEach(async ({breadbox}) => {
      await breadbox.applyManualNumericalRange(20, 30);
      firstValueText = '$20.00 to $30.00';
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

    test('should display the "Clear all" button', async ({breadbox}) => {
      await expect(breadbox.getClearAllButton()).toBeVisible();
    });

    test('should disappear when clicking on the "Clear all" button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
      const clearButton = breadbox.getClearAllButton();
      await clearButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);

      await expect(breadcrumbButton).toContainText(`Price: ${firstValueText}`);
    });
  });

  test.describe('when a date range facet value is selected', () => {
    let firstValueText: string | RegExp;

    test.beforeEach(async ({breadbox}) => {
      await breadbox.getFacetValue('dateRange').first().click();
      firstValueText = (await breadbox
        .getFacetValue('dateRange')
        .first()
        .locator('span')
        .nth(1)
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

    test('should display the "Clear all" button', async ({breadbox}) => {
      await expect(breadbox.getClearAllButton()).toBeVisible();
    });

    test('should disappear when clicking on the "Clear all" button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);
      const clearButton = breadbox.getClearAllButton();
      await clearButton.click();

      await expect(breadcrumbButton).not.toBeVisible();
    });

    test('should contain the selected value and the facet name in the breadcrumb button', async ({
      breadbox,
    }) => {
      const breadcrumbButton = breadbox.getBreadcrumbButtons(firstValueText);

      await expect(breadcrumbButton).toContainText(`Date: ${firstValueText}`);
    });
  });

  test.describe('when selecting multiple facet values', () => {
    test.beforeEach(async ({breadbox}) => {
      for (let i = 0; i < 6; i++) {
        await breadbox.getFacetValue('regular').nth(i).click();
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
      await breadbox.getBreadcrumbButtons().first().waitFor({state: 'hidden'});
      await expect(breadbox.getShowMorebutton()).toContainText('+ 6');

      await page.setViewportSize({width: 1920, height: 480});
      await breadbox.getBreadcrumbButtons().first().waitFor({state: 'visible'});
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
        const facetValueButton = breadbox.getFacetValue(
          'regular',
          firstButtonText
        );
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

  test('should hide the breadcrumb while selecting facets and while viewport does not change', async ({
    breadbox,
    page,
  }) => {
    await page.setViewportSize({width: 640, height: 480});

    for (let i = 0; i < 4; i++) {
      await breadbox.getFacetValue('regular').nth(i).click();
      if (i < 3) {
        await breadbox
          .getBreadcrumbButtons()
          .nth(i)
          .waitFor({state: 'visible'});
      }
    }

    await expect(breadbox.getShowMorebutton()).toBeVisible();
    await expect(breadbox.getShowMorebutton()).toContainText('+ 1');
  });
});
