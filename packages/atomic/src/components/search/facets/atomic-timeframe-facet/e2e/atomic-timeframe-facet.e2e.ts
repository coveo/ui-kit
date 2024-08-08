import {test, expect} from './fixture';

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
        await facet.facetClearFilter.waitFor({state: 'visible'});
      });

      test.describe('when clicking the clear filter button', () => {
        test.beforeEach(async ({facet}) => {
          await facet.facetClearFilter.click();
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
          await expect(facet.facetInputEnd).toHaveAttribute('max', '');
        });

        test('should hide the clear filter button', async ({facet}) => {
          await expect(facet.facetClearFilter).not.toBeVisible();
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

  test('should not limit the end date', async ({facet}) => {
    await facet.facetInputEnd.click();
    await expect(facet.facetInputEnd).not.toHaveAttribute('max');
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
          await facet.facetClearFilter.click();
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
          await expect(facet.facetClearFilter).not.toBeVisible();
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
