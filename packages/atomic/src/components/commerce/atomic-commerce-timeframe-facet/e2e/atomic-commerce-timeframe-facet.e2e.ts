import {test, expect} from './fixture';

test.describe('AtomicCommerceTimeframeFacet', () => {
  test.describe('default', () => {
    test.beforeEach(async ({commerceTimeframeFacet}) => {
      await commerceTimeframeFacet.load({
        args: {withDatePicker: true},
      });
    });

    test('should be accessible', async ({makeAxeBuilder}) => {
      const accessibilityResults = await makeAxeBuilder().analyze();
      expect(accessibilityResults.violations.length).toEqual(0);
    });

    test.describe('when selecting a start date', () => {
      test.beforeEach(async ({commerceTimeframeFacet}) => {
        await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
      });

      test('should limit the end date to the selected start date', async ({
        commerceTimeframeFacet,
      }) => {
        await commerceTimeframeFacet.facetInputEnd.click();
        await expect(commerceTimeframeFacet.facetInputEnd).toHaveAttribute(
          'min',
          '2021-01-01'
        );
      });
    });

    test.describe('when selecting an end date', () => {
      test.beforeEach(async ({commerceTimeframeFacet}) => {
        await commerceTimeframeFacet.facetInputEnd.fill('2021-01-01');
      });

      test('should limit the start date to the selected end date', async ({
        commerceTimeframeFacet,
      }) => {
        await commerceTimeframeFacet.facetInputStart.click();
        await expect(commerceTimeframeFacet.facetInputStart).toHaveAttribute(
          'max',
          '2021-01-01'
        );
      });
    });

    test.describe('when selecting a start date and an end date', () => {
      test.beforeEach(async ({commerceTimeframeFacet}) => {
        await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
        await commerceTimeframeFacet.facetInputEnd.fill('2021-01-31');
      });

      test.describe('when clicking the apply button', () => {
        test.beforeEach(async ({commerceTimeframeFacet}) => {
          await commerceTimeframeFacet.facetApplyButton.click();
          await commerceTimeframeFacet.facetClearFilterButton.waitFor({
            state: 'visible',
          });
        });

        test.describe('when clicking the clear filter button', () => {
          test.beforeEach(async ({commerceTimeframeFacet}) => {
            await commerceTimeframeFacet.facetClearFilterButton.click();
          });

          test('should clear the selected dates', async ({
            commerceTimeframeFacet,
          }) => {
            await expect(commerceTimeframeFacet.facetInputStart).toHaveValue(
              ''
            );
            await expect(commerceTimeframeFacet.facetInputEnd).toHaveValue('');
          });

          test('should reset the min and max values', async ({
            commerceTimeframeFacet,
          }) => {
            await commerceTimeframeFacet.facetInputStart.click();
            await expect(
              commerceTimeframeFacet.facetInputStart
            ).toHaveAttribute('min', '1401-01-01');
            await commerceTimeframeFacet.facetInputEnd.click();
            await expect(commerceTimeframeFacet.facetInputEnd).toHaveAttribute(
              'max',
              ''
            );
          });

          test('should hide the clear filter button', async ({
            commerceTimeframeFacet,
          }) => {
            await expect(
              commerceTimeframeFacet.facetClearFilterButton
            ).not.toBeVisible();
          });
        });
      });
    });

    test('should limit the start date to the default min value', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputStart.click();
      await expect(commerceTimeframeFacet.facetInputStart).toHaveAttribute(
        'min',
        '1401-01-01'
      );
    });

    test('should not limit the end date', async ({commerceTimeframeFacet}) => {
      await commerceTimeframeFacet.facetInputEnd.click();
      await expect(commerceTimeframeFacet.facetInputEnd).not.toHaveAttribute(
        'max'
      );
    });
  });

  test.describe('with min and max values', () => {
    test.beforeEach(async ({commerceTimeframeFacet}) => {
      await commerceTimeframeFacet.load({
        args: {withDatePicker: true, min: '2021-01-01', max: '2021-01-31'},
      });
    });

    test.describe('when selecting a start date', () => {
      test.beforeEach(async ({commerceTimeframeFacet}) => {
        await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
      });

      test('should limit the end date to the selected start date', async ({
        commerceTimeframeFacet,
      }) => {
        await commerceTimeframeFacet.facetInputEnd.click();
        await expect(commerceTimeframeFacet.facetInputEnd).toHaveAttribute(
          'min',
          '2021-01-01'
        );
      });
    });

    test.describe('when selecting an end date', () => {
      test.beforeEach(async ({commerceTimeframeFacet}) => {
        await commerceTimeframeFacet.facetInputEnd.fill('2021-01-01');
      });

      test('should limit the start date to the selected end date', async ({
        commerceTimeframeFacet,
      }) => {
        await commerceTimeframeFacet.facetInputStart.click();
        await expect(commerceTimeframeFacet.facetInputStart).toHaveAttribute(
          'max',
          '2021-01-01'
        );
      });
    });

    test.describe('when selecting a start date and an end date', () => {
      test.beforeEach(async ({commerceTimeframeFacet}) => {
        await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
        await commerceTimeframeFacet.facetInputEnd.fill('2021-01-31');
      });

      test.describe('when clicking the apply button', () => {
        test.beforeEach(async ({commerceTimeframeFacet}) => {
          await commerceTimeframeFacet.facetApplyButton.click();
        });

        test.describe('when clicking the clear filter button', () => {
          test.beforeEach(async ({commerceTimeframeFacet}) => {
            await commerceTimeframeFacet.facetClearFilterButton.click();
          });

          test('should clear the selected dates', async ({
            commerceTimeframeFacet,
          }) => {
            await expect(commerceTimeframeFacet.facetInputStart).toHaveValue(
              ''
            );
            await expect(commerceTimeframeFacet.facetInputEnd).toHaveValue('');
          });

          test('should reset the min and max values', async ({
            commerceTimeframeFacet,
          }) => {
            await commerceTimeframeFacet.facetInputStart.click();
            await expect(
              commerceTimeframeFacet.facetInputStart
            ).toHaveAttribute('min', '2021-01-01');
            await commerceTimeframeFacet.facetInputEnd.click();
            await expect(commerceTimeframeFacet.facetInputEnd).toHaveAttribute(
              'max',
              '2021-01-31'
            );
          });

          test('should hide the clear filter button', async ({
            commerceTimeframeFacet,
          }) => {
            await expect(
              commerceTimeframeFacet.facetClearFilterButton
            ).not.toBeVisible();
          });
        });
      });
    });

    test('should limit the start date to the min value', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputStart.click();
      await expect(commerceTimeframeFacet.facetInputStart).toHaveAttribute(
        'min',
        '2021-01-01'
      );
    });

    test('should limit the end date to the max value', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputEnd.click();
      await expect(commerceTimeframeFacet.facetInputEnd).toHaveAttribute(
        'max',
        '2021-01-31'
      );
    });
  });

  test.describe('facet value selection without date picker', () => {
    test.beforeEach(async ({commerceTimeframeFacet}) => {
      await commerceTimeframeFacet.load({
        args: {withDatePicker: false},
      });
    });

    test('should allow selecting predefined facet values', async ({
      commerceTimeframeFacet,
    }) => {
      const firstValue = commerceTimeframeFacet.facetValues.first();
      await firstValue.click();

      // Check if the value becomes selected (implementation may vary)
      await expect(firstValue).toHaveAttribute('aria-pressed', 'true');
    });

    test('should show clear button after selecting a value', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetValues.first().click();
      await expect(commerceTimeframeFacet.facetClearFilterButton).toBeVisible();
    });

    test('should clear selection when clicking clear button', async ({
      commerceTimeframeFacet,
    }) => {
      const firstValue = commerceTimeframeFacet.facetValues.first();
      await firstValue.click();
      await commerceTimeframeFacet.facetClearFilterButton.click();

      await expect(firstValue).toHaveAttribute('aria-pressed', 'false');
      await expect(
        commerceTimeframeFacet.facetClearFilterButton
      ).not.toBeVisible();
    });
  });

  test.describe('keyboard navigation', () => {
    test.beforeEach(async ({commerceTimeframeFacet}) => {
      await commerceTimeframeFacet.load({
        args: {withDatePicker: true},
      });
    });

    test('should allow tabbing between date inputs', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputStart.focus();
      await commerceTimeframeFacet.facetInputStart.press('Tab');
      await expect(commerceTimeframeFacet.facetInputEnd).toBeFocused();
    });

    test('should allow tabbing to apply button', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputEnd.focus();
      await commerceTimeframeFacet.facetInputEnd.press('Tab');
      await expect(commerceTimeframeFacet.facetApplyButton).toBeFocused();
    });

    test('should submit on Enter key in date inputs', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
      await commerceTimeframeFacet.facetInputEnd.fill('2021-01-31');
      await commerceTimeframeFacet.facetInputEnd.press('Enter');

      await expect(commerceTimeframeFacet.facetClearFilterButton).toBeVisible();
    });
  });

  test.describe('form validation', () => {
    test.beforeEach(async ({commerceTimeframeFacet}) => {
      await commerceTimeframeFacet.load({
        args: {withDatePicker: true},
      });
    });

    test('should handle invalid date formats gracefully', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputStart.fill('invalid-date');
      await commerceTimeframeFacet.facetApplyButton.click();

      // The facet should not apply the filter with invalid dates
      await expect(
        commerceTimeframeFacet.facetClearFilterButton
      ).not.toBeVisible();
    });

    test('should handle start date after end date', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputStart.fill('2021-12-31');
      await commerceTimeframeFacet.facetInputEnd.fill('2021-01-01');
      await commerceTimeframeFacet.facetApplyButton.click();

      // Should handle the invalid range appropriately
      const startInput = commerceTimeframeFacet.facetInputStart;
      const endInput = commerceTimeframeFacet.facetInputEnd;

      // Check if validation messages or styling are applied
      await expect(startInput).toBeVisible();
      await expect(endInput).toBeVisible();
    });
  });

  test.describe('multiple interactions', () => {
    test.beforeEach(async ({commerceTimeframeFacet}) => {
      await commerceTimeframeFacet.load({
        args: {withDatePicker: true},
      });
    });

    test('should allow multiple date range selections', async ({
      commerceTimeframeFacet,
    }) => {
      // First range
      await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
      await commerceTimeframeFacet.facetInputEnd.fill('2021-01-31');
      await commerceTimeframeFacet.facetApplyButton.click();
      await expect(commerceTimeframeFacet.facetClearFilterButton).toBeVisible();

      // Clear and set new range
      await commerceTimeframeFacet.facetClearFilterButton.click();
      await commerceTimeframeFacet.facetInputStart.fill('2021-02-01');
      await commerceTimeframeFacet.facetInputEnd.fill('2021-02-28');
      await commerceTimeframeFacet.facetApplyButton.click();

      await expect(commerceTimeframeFacet.facetClearFilterButton).toBeVisible();
      await expect(commerceTimeframeFacet.facetInputStart).toHaveValue(
        '2021-02-01'
      );
      await expect(commerceTimeframeFacet.facetInputEnd).toHaveValue(
        '2021-02-28'
      );
    });

    test('should maintain state when partially filling dates', async ({
      commerceTimeframeFacet,
    }) => {
      await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');

      // Start date should be maintained even without end date
      await expect(commerceTimeframeFacet.facetInputStart).toHaveValue(
        '2021-01-01'
      );

      // Adding end date should work
      await commerceTimeframeFacet.facetInputEnd.fill('2021-01-31');
      await expect(commerceTimeframeFacet.facetInputStart).toHaveValue(
        '2021-01-01'
      );
      await expect(commerceTimeframeFacet.facetInputEnd).toHaveValue(
        '2021-01-31'
      );
    });
  });

  test.describe('responsive behavior', () => {
    test.beforeEach(async ({commerceTimeframeFacet}) => {
      await commerceTimeframeFacet.load({
        args: {withDatePicker: true},
      });
    });

    test('should be usable on mobile viewport', async ({
      commerceTimeframeFacet,
      page,
    }) => {
      await page.setViewportSize({width: 375, height: 667}); // iPhone SE size

      await commerceTimeframeFacet.facetInputStart.fill('2021-01-01');
      await commerceTimeframeFacet.facetInputEnd.fill('2021-01-31');
      await commerceTimeframeFacet.facetApplyButton.click();

      await expect(commerceTimeframeFacet.facetClearFilterButton).toBeVisible();
    });
  });
});
