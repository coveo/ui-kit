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

  test.describe('when providing an invalid field', async () => {
    test('should return error', async ({page, productDescription}) => {
      await productDescription.load({
        args: {
          // @ts-expect-error needed to test error on invalid field
          field: 'ec_name',
        },
      });

      const errorMessage = await page.waitForEvent('console', (msg) => {
        return msg.type() === 'error';
      });

      expect(errorMessage.text()).toContain(
        'field: value should be one of: ec_shortdesc, ec_description.'
      );
    });
  });
  test.describe('when providing an invalid truncate-after value', async () => {
    const invalidValues = ['foo', '0', '-1', '5'];

    invalidValues.forEach((value) => {
      test(`should return error for value: ${value}`, async ({
        page,
        productDescription,
      }) => {
        await productDescription.load({
          args: {
            // @ts-expect-error needed to test error on invalid value
            truncateAfter: value,
          },
        });

        const errorMessage = await page.waitForEvent('console', (msg) => {
          return msg.type() === 'error';
        });

        expect(errorMessage.text()).toContain(
          'truncateAfter: value should be one of: none, 1, 2, 3, 4'
        );
      });
    });
  });

  const fields: Array<'ec_description' | 'ec_shortdesc'> = [
    'ec_description',
    'ec_shortdesc',
  ];

  fields.forEach((field) => {
    test(`should render description for ${field} field`, async ({
      productDescription,
    }) => {
      await productDescription.load({args: {field}});
      await productDescription.hydrated.first().waitFor();

      await expect(productDescription.textContent.first()).toBeVisible();
    });
  });

  test.describe('when description is truncated', async () => {
    const truncateValues: Array<{
      value: '1' | '4';
      expectedClass: RegExp;
    }> = [
      {value: '1', expectedClass: /line-clamp-1/},
      {value: '4', expectedClass: /line-clamp-4/},
    ];

    truncateValues.forEach(({value, expectedClass}) => {
      test.beforeEach(async ({productDescription}) => {
        await productDescription.withLongDescription();
      });
      test.describe(`when truncateAfter is set to ${value}`, async () => {
        test(`should truncate description after ${value} lines`, async ({
          productDescription,
        }) => {
          await productDescription.load({
            args: {truncateAfter: value},
          });
          await productDescription.hydrated.first().waitFor();

          const descriptionText = productDescription.textContent.first();
          await expect(descriptionText).toHaveClass(expectedClass);
        });

        test('should show "Show More" button', async ({productDescription}) => {
          const showMoreButton = productDescription.showMoreButton.first();
          await expect(showMoreButton).toBeVisible();
        });

        test.describe('when clicking the "Show More" button', async () => {
          test.describe('when isCollapsible is true', async () => {
            test.beforeEach(async ({productDescription}) => {
              await productDescription.load({
                args: {truncateAfter: value, isCollapsible: true},
              });
              await productDescription.hydrated.first().waitFor();
              await productDescription.showMoreButton.first().click();
            });

            test('should expand description', async ({productDescription}) => {
              const descriptionText = productDescription.textContent.first();
              await expect(descriptionText).not.toHaveClass(expectedClass);
            });

            test('should show "Show Less" button', async ({
              productDescription,
            }) => {
              const showLessButton = productDescription.showLessButton.first();
              await expect(showLessButton).toBeVisible();
            });

            test('should collapse description when clicking the "Show Less" button', async ({
              productDescription,
            }) => {
              const descriptionText = productDescription.textContent.first();
              await productDescription.showLessButton.first().click();

              await expect(descriptionText).toHaveClass(expectedClass);
            });
          });

          test.describe('when isCollapsible is false', async () => {
            test.beforeEach(async ({productDescription}) => {
              await productDescription.load({
                args: {truncateAfter: value, isCollapsible: false},
              });
              await productDescription.hydrated.first().waitFor();
              await productDescription.showMoreButton.first().click();
            });

            test('should expand description', async ({productDescription}) => {
              const descriptionText = productDescription.textContent.first();
              await expect(descriptionText).not.toHaveClass(expectedClass);
            });

            test('should not show "Show Less" button', async ({
              productDescription,
            }) => {
              await expect(productDescription.showLessButton).not.toBeVisible();
            });
          });
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

      await expect(productDescription.showMoreButton).not.toBeVisible();
    });
  });
});
