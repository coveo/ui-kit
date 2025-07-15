import {expect, test} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({instantProduct, searchBox}) => {
    await instantProduct.load();
    await searchBox.hydrated.waitFor();
    await searchBox.searchInput.click();
  });

  //TODO: This test should pass once KIT-4449 is addressed
  test.skip('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display instant products', async ({instantProduct}) => {
    const products = await instantProduct.instantProducts.all();
    for (let i = 0; i < products.length; i++) {
      await expect(products[i]).toBeVisible();
    }
  });

  test('should be clickable anywhere on the instant result component', async ({
    instantProduct,
    page,
  }) => {
    await expect(instantProduct.instantProducts.first()).toBeEnabled();
    await instantProduct.instantProducts.first().click();
    await page.waitForURL(/https:\/\/sports\.barca\.group\/*/);
  });

  test.describe('with density set to comfortable', () => {
    test.beforeEach(async ({instantProduct, searchBox}) => {
      await instantProduct.load({story: 'with-comfortable-density'});
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.click();
    });

    test('should apply comfortable density class', async ({instantProduct}) => {
      await expect(instantProduct.productRoots.first()).toHaveClass(
        /.*density-comfortable.*/
      );
    });
  });

  test.describe('with imageSize set to none', () => {
    test.beforeEach(async ({instantProduct, searchBox}) => {
      await instantProduct.load({story: 'with-no-image'});
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.click();
    });

    test('should apply no image class', async ({instantProduct}) => {
      await expect(instantProduct.productRoots.first()).toHaveClass(
        /.*image-none.*/
      );
    });
  });

  test.describe('when clicking on "See All Results"', () => {
    test.beforeEach(async ({instantProduct, searchBox}) => {
      await instantProduct.load();
      await searchBox.component.evaluate((node) =>
        node.setAttribute(
          'redirection-url',
          './iframe.html?id=atomic-commerce-search-box--in-page&viewMode=story'
        )
      );
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.click();
    });
    test('should redirect to the specified url after selecting a suggestion', async ({
      instantProduct,
      page,
    }) => {
      await instantProduct.showAllButton.click();
      await page.waitForURL(
        '**/iframe.html?id=atomic-commerce-search-box--in-page*'
      );
    });
  });

  //TODO: Fix this failing test https://coveord.atlassian.net/browse/KIT-4352
  test.describe('with a custom aria label generator', async () => {
    test.beforeEach(async ({instantProduct, searchBox}) => {
      await instantProduct.load({
        args: {ariaLabelGenerator: () => 'custom-aria-label'},
      });
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.click();
    });

    test.skip('should update the instant product aria label', async ({
      instantProduct,
    }) => {
      const products = await instantProduct.instantProducts.all();
      for (let i = 0; i < products.length; i++) {
        await expect(products[i]).toHaveAttribute(
          'aria-label',
          'custom-aria-label'
        );
      }
    });
  });
});
