import {test, expect} from './fixture';

test.describe('atomic-product-description', async () => {
  test.beforeEach(async ({page, productDescription}) => {
    await page.setViewportSize({width: 375, height: 667});
    await productDescription.load();
    await productDescription.hydrated.first().waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  const fields: Array<'ec_description' | 'ec_shortdesc' | 'excerpt'> = [
    'ec_description',
    'ec_shortdesc',
    'excerpt',
  ];

  fields.forEach((field) => {
    test(`should render description for ${field} field`, async ({
      productDescription,
    }) => {
      await productDescription.load({args: {field}});
      await productDescription.hydrated.first().waitFor();

      expect(productDescription.textContent.first()).toBeVisible();
    });
  });

  test.describe('when description is truncated', async () => {
    const truncateValues: Array<{
      value: '1' | '2' | '3' | '4';
      expectedClass: RegExp;
    }> = [
      {value: '1', expectedClass: /line-clamp-1/},
      {value: '2', expectedClass: /line-clamp-2/},
      {value: '3', expectedClass: /line-clamp-3/},
      {value: '4', expectedClass: /line-clamp-4/},
    ];

    truncateValues.forEach(({value, expectedClass}) => {
      test.describe(`when truncateAfter is set to ${value}`, async () => {
        test(`should truncate description after ${value} lines`, async ({
          productDescription,
        }) => {
          await productDescription.load({
            args: {truncateAfter: value},
          });
          await productDescription.hydrated.first().waitFor();

          const descriptionText = productDescription.textContent.first();
          expect(descriptionText).toHaveClass(expectedClass);
        });

        test('should show "Show More" button', async ({productDescription}) => {
          const showMoreButton = productDescription.showMoreButton.first();
          expect(showMoreButton).toBeVisible();
        });

        test('should expand description', async ({productDescription}) => {
          await productDescription.showMoreButton.first().click();
          const descriptionText = productDescription.textContent.first();
          expect(descriptionText).not.toHaveClass(/line-clamp-2/);
        });
      });
    });
  });

  test.describe('when description is not truncated', async () => {
    test('should hide "Show More" button ', async ({productDescription}) => {
      await productDescription.load({
        args: {truncateAfter: 'none'},
      });
      await productDescription.hydrated.first().waitFor();

      expect(productDescription.showMoreButton).not.toBeVisible();
    });
  });
});
