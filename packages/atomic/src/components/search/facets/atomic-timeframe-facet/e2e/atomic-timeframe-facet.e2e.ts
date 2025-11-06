import {expect, test} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({
      args: {withDatePicker: true},
    });
  });

  test.describe('when selecting a start date', () => {
    test.beforeEach(async ({facet}) => {
      await facet.facetInputStart.fill('2021-01-01');
    });

    test('should limit the end date to the selected start date', async ({
      facet,
    }) => {
      await facet.facetInputEnd.click();
      await expect(facet.facetInputEnd).toHaveAttribute('min', '2021-01-01');
    });
  });

  test.describe('when selecting an end date', () => {
    test.beforeEach(async ({facet}) => {
      await facet.facetInputEnd.fill('2021-01-01');
    });

    test('should limit the start date to the selected end date', async ({
      facet,
    }) => {
      await facet.facetInputStart.click();
      await expect(facet.facetInputStart).toHaveAttribute('max', '2021-01-01');
    });
  });

  test.describe('when selecting a start date and an end date', () => {
    test.beforeEach(async ({facet}) => {
      await facet.facetInputStart.fill('2021-01-01');
      await facet.facetInputEnd.fill('2021-01-31');
    });

    test.describe('when clicking the apply button', () => {
      test.beforeEach(async ({facet}) => {
        await facet.facetApplyButton.click();
        await facet.facetClearFilterButton.waitFor({state: 'visible'});
      });

      test.describe('when clicking the clear filter button', () => {
        test.beforeEach(async ({facet}) => {
          await facet.facetClearFilterButton.click();
        });

        test('should clear the selected dates', async ({facet}) => {
          await expect(facet.facetInputStart).toHaveValue('');
          await expect(facet.facetInputEnd).toHaveValue('');
        });

        test('should reset the min and max values', async ({facet}) => {
          await facet.facetInputStart.click();
          await expect(facet.facetInputStart).toHaveAttribute(
            'min',
            '1401-01-01'
          );
          await facet.facetInputEnd.click();
          await expect(facet.facetInputEnd).toHaveAttribute(
            'max',
            '9999-12-31'
          );
        });

        test('should hide the clear filter button', async ({facet}) => {
          await expect(facet.facetClearFilterButton).not.toBeVisible();
        });
      });
    });
  });

  test('should limit the start date to the default min value', async ({
    facet,
  }) => {
    await facet.facetInputStart.click();
    await expect(facet.facetInputStart).toHaveAttribute('min', '1401-01-01');
  });

  test('should limit the end date to max', async ({facet}) => {
    await facet.facetInputEnd.click();
    await expect(facet.facetInputEnd).toHaveAttribute('max', '9999-12-31');
  });
});

test.describe('with min and max values', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({
      args: {withDatePicker: true, min: '2021-01-01', max: '2021-01-31'},
    });
  });

  test.describe('when selecting a start date', () => {
    test.beforeEach(async ({facet}) => {
      await facet.facetInputStart.fill('2021-01-01');
    });

    test('should limit the end date to the selected start date', async ({
      facet,
    }) => {
      await facet.facetInputEnd.click();
      await expect(facet.facetInputEnd).toHaveAttribute('min', '2021-01-01');
    });
  });

  test.describe('when selecting an end date', () => {
    test.beforeEach(async ({facet}) => {
      await facet.facetInputEnd.fill('2021-01-01');
    });

    test('should limit the start date to the selected end date', async ({
      facet,
    }) => {
      await facet.facetInputStart.click();
      await expect(facet.facetInputStart).toHaveAttribute('max', '2021-01-01');
    });
  });

  test.describe('when selecting a start date and an end date', () => {
    test.beforeEach(async ({facet}) => {
      await facet.facetInputStart.fill('2021-01-01');
      await facet.facetInputEnd.fill('2021-01-31');
    });

    test.describe('when clicking the apply button', () => {
      test.beforeEach(async ({facet}) => {
        await facet.facetApplyButton.click();
      });

      test.describe('when clicking the clear filter button', () => {
        test.beforeEach(async ({facet}) => {
          await facet.facetClearFilterButton.click();
        });

        test('should clear the selected dates', async ({facet}) => {
          await expect(facet.facetInputStart).toHaveValue('');
          await expect(facet.facetInputEnd).toHaveValue('');
        });

        test('should reset the min and max values', async ({facet}) => {
          await facet.facetInputStart.click();
          await expect(facet.facetInputStart).toHaveAttribute(
            'min',
            '2021-01-01'
          );
          await facet.facetInputEnd.click();
          await expect(facet.facetInputEnd).toHaveAttribute(
            'max',
            '2021-01-31'
          );
        });

        test('should hide the clear filter button', async ({facet}) => {
          await expect(facet.facetClearFilterButton).not.toBeVisible();
        });
      });
    });
  });

  test('should limit the start date to the min value', async ({facet}) => {
    await facet.facetInputStart.click();
    await expect(facet.facetInputStart).toHaveAttribute('min', '2021-01-01');
  });

  test('should limit the end date to the max value', async ({facet}) => {
    await facet.facetInputEnd.click();
    await expect(facet.facetInputEnd).toHaveAttribute('max', '2021-01-31');
  });
});

test.describe('when a "depends-on" prop is provided', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'with-depends-on'});
    await facet.facet.waitFor({state: 'visible'});
  });

  test('when the specified dependency is selected in the parent facet, dependent facet should be visible', async ({
    facet,
  }) => {
    await expect(facet.facet).toBeVisible();
  });

  test.describe('when the specified dependency is cleared from the parent facet', () => {
    test('dependent facet should not be visible', async ({facet}) => {
      const parent = facet.page.getByTestId('regular-facet');
      await parent.locator('[part="clear-button"]').click();

      await expect(facet.facet).not.toBeVisible();
    });

    test('should clear previously selected dependent facet range', async ({
      facet,
    }) => {
      await facet.facetValues.first().click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      const parent = facet.page.getByTestId('regular-facet');
      await parent.locator('[part="clear-button"]').click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
    test('should clear previously selected dependent facet input range', async ({
      facet,
    }) => {
      await facet.facetInputStart.fill('2025-01-01');
      await facet.facetInputEnd.fill('2025-02-01');
      await facet.facetApplyButton.click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      const parent = facet.page.getByTestId('regular-facet');
      await parent.locator('[part="clear-button"]').click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
  });

  test.describe('when the specified dependency is cleared from the breadbox', () => {
    test('dependent facet should not be visible', async ({facet}) => {
      const breadbox = facet.page.getByTestId('breadbox');
      await breadbox
        .getByLabel('Remove inclusion filter on File Type: YouTubeVideo')
        .click();

      await expect(facet.facet).not.toBeVisible();
    });

    test('should clear previously selected dependent facet range', async ({
      facet,
    }) => {
      await facet.facetValues.first().click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      await breadbox
        .getByLabel('Remove inclusion filter on File Type: YouTubeVideo')
        .click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
    test('should clear previously selected dependent facet input range', async ({
      facet,
    }) => {
      await facet.facetInputStart.fill('2025-01-01');
      await facet.facetInputEnd.fill('2025-02-01');
      await facet.facetApplyButton.click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      await breadbox
        .getByLabel('Remove inclusion filter on File Type: YouTubeVideo')
        .click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
  });
});
