import {expect, test} from './fixture';

test.describe('atomic-commerce-search-box-instant-products', () => {
  test.beforeEach(async ({instantProduct, searchBox}) => {
    await instantProduct.load();
    await searchBox.hydrated.waitFor();
    await searchBox.searchInput.click();
  });

  test('should display instant products', async ({instantProduct}) => {
    const products = await instantProduct.instantProducts.all();
    for (let i = 0; i < products.length; i++) {
      await expect(products[i]).toBeVisible();
    }
  });

  test('should be clickable anywhere on the instant product component', async ({
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
      await expect(instantProduct.productRoots.first()).toHaveClass(/.*density-comfortable.*/);
    });
  });

  test.describe('with imageSize set to none', () => {
    test.beforeEach(async ({instantProduct, searchBox}) => {
      await instantProduct.load({story: 'with-no-image'});
      await searchBox.hydrated.waitFor();
      await searchBox.searchInput.click();
    });

    test('should apply no image class', async ({instantProduct}) => {
      await expect(instantProduct.productRoots.first()).toHaveClass(/.*image-none.*/);
    });
  });

  test.describe('when clicking on "See All Products"', () => {
    test.beforeEach(async ({instantProduct, searchBox}) => {
      await instantProduct.load();
      await searchBox.hydrated.waitFor();
      await searchBox.component.evaluate((node) =>
        node.setAttribute(
          'redirection-url',
          './iframe.html?id=atomic-commerce-interface--with-product-list&viewMode=story'
        )
      );
      await searchBox.searchInput.click();
    });
    test('should redirect to the specified url after selecting a suggestion', async ({
      instantProduct,
      page,
    }) => {
      await instantProduct.showAllButton.click();
      await page.waitForURL('**/iframe.html?id=atomic-commerce-interface--with-product-list*');
    });
  });

  test.describe('with a custom aria label generator', () => {
    test.beforeEach(async ({instantProduct, searchBox}) => {
      await instantProduct.load();
      await searchBox.hydrated.waitFor();
      // A function can't go through Storybook URL args, so set the property directly.
      await instantProduct.hydrated.evaluate((el) => {
        (el as HTMLElement & {ariaLabelGenerator: () => string}).ariaLabelGenerator = () =>
          'custom-aria-label';
      });
      // The story's play function already rendered the products; a new query renders them again.
      await searchBox.searchInput.fill('kayak');
    });

    test('should update the instant product aria label', async ({instantProduct}) => {
      await expect(instantProduct.instantProducts.first()).toBeVisible();
      const products = await instantProduct.instantProducts.all();
      expect(products.length).toBeGreaterThan(0);
      for (const product of products) {
        await expect(product).toHaveAttribute(
          'aria-label',
          /^custom-aria-label, instant product\./
        );
      }
    });
  });
});
