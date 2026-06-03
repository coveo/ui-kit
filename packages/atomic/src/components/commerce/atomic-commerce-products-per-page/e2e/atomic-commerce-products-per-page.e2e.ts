import {expect, test} from './fixture';

test.describe('atomic-commerce-products-per-page', () => {
  test.beforeEach(async ({productsPerPage}) => {
    await productsPerPage.load();
    await productsPerPage.hydrated.waitFor();
  });

  test('should display the correct number of choices', async ({
    productsPerPage,
  }) => {
    await expect(productsPerPage.choice(10)).toBeVisible();
    await expect(productsPerPage.choice(25)).toBeVisible();
    await expect(productsPerPage.choice(50)).toBeVisible();
    await expect(productsPerPage.choice(100)).toBeVisible();
  });

  test('should select the initial choice', async ({productsPerPage}) => {
    await expect(productsPerPage.choice(10)).toBeChecked();
  });

  test('should update the number of products per page when a choice is selected', async ({
    productsPerPage,
  }) => {
    await productsPerPage.choice(25).click();
    await expect(productsPerPage.choice(25)).toBeChecked();
  });
});
