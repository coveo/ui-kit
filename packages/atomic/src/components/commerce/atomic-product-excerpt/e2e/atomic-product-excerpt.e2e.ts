import {expect, test} from './fixture';

test.describe('atomic-product-excerpt', async () => {
  test.beforeEach(async ({page, productExcerpt}) => {
    await page.setViewportSize({width: 200, height: 667});
    await productExcerpt.load();
    await productExcerpt.hydrated.first().waitFor();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test.describe('when providing an invalid truncate-after value', async () => {
    const invalidValues = ['foo', '0', '-1', '5'];

    invalidValues.forEach((value) => {
      test(`should return error for value: ${value}`, async ({
        page,
        productExcerpt,
      }) => {
        await productExcerpt.load({
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

  test('should render excerpt text', async ({productExcerpt}) => {
    await productExcerpt.hydrated.first().waitFor();

    await expect(productExcerpt.textContent.first()).toBeVisible();
  });

  test.describe('when excerpt is truncated', async () => {
    const truncateValues: Array<{
      value: '2' | '3';
      expectedClass: RegExp;
    }> = [
      {value: '2', expectedClass: /line-clamp-2/},
      {value: '3', expectedClass: /line-clamp-3/},
    ];

    truncateValues.forEach(({value, expectedClass}) => {
      test.beforeEach(async ({productExcerpt}) => {
        await productExcerpt.withLongExcerpt();
      });
      test.describe(`when truncateAfter is set to ${value}`, async () => {
        test(`should truncate excerpt after ${value} lines`, async ({
          productExcerpt,
        }) => {
          await productExcerpt.load({
            args: {truncateAfter: value},
          });
          await productExcerpt.hydrated.first().waitFor();

          const excerptText = productExcerpt.textContent.first();
          await expect(excerptText).toHaveClass(expectedClass);
        });

        test('should show "Show More" button', async ({productExcerpt}) => {
          const showMoreButton = productExcerpt.showMoreButton.first();
          await expect(showMoreButton).toBeVisible();
        });

        test.describe('when clicking the "Show More" button', async () => {
          test.describe('when isCollapsible is true', async () => {
            test.beforeEach(async ({productExcerpt}) => {
              await productExcerpt.load({
                args: {truncateAfter: value, isCollapsible: true},
              });
              await productExcerpt.hydrated.first().waitFor();
              await productExcerpt.showMoreButton.first().click();
            });

            test('should expand excerpt', async ({productExcerpt}) => {
              const excerptText = productExcerpt.textContent.first();
              await expect(excerptText).not.toHaveClass(expectedClass);
            });

            test('should show "Show Less" button', async ({productExcerpt}) => {
              const showLessButton = productExcerpt.showLessButton.first();
              await expect(showLessButton).toBeVisible();
            });

            test('should collapse excerpt when clicking the "Show Less" button', async ({
              productExcerpt,
            }) => {
              const excerptText = productExcerpt.textContent.first();
              await productExcerpt.showLessButton.first().click();

              await expect(excerptText).toHaveClass(expectedClass);
            });
          });

          test.describe('when isCollapsible is false', async () => {
            test.beforeEach(async ({productExcerpt}) => {
              await productExcerpt.load({
                args: {truncateAfter: value, isCollapsible: false},
              });
              await productExcerpt.hydrated.first().waitFor();
              await productExcerpt.showMoreButton.first().click();
            });

            test('should expand excerpt', async ({productExcerpt}) => {
              const excerptText = productExcerpt.textContent.first();
              await expect(excerptText).not.toHaveClass(expectedClass);
            });

            test('should not show "Show Less" button', async ({
              productExcerpt,
            }) => {
              await expect(productExcerpt.showLessButton).not.toBeVisible();
            });
          });
        });
      });
    });
  });

  test.describe('when excerpt is not truncated', async () => {
    test('should hide "Show More" button ', async ({productExcerpt}) => {
      await productExcerpt.load({
        args: {truncateAfter: 'none'},
      });
      await productExcerpt.hydrated.first().waitFor();

      await expect(productExcerpt.showMoreButton).not.toBeVisible();
    });
  });
});
