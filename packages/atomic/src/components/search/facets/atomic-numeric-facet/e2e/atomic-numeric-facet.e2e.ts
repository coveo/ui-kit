import {expect, test} from './fixture';

test.describe('Visual Regression', () => {
  test('should match baseline with number input in default state', async ({
    facet,
  }) => {
    await test.step('Load component', async () => {
      await facet.load({story: 'with-input-integer'});
      await facet.hydrated.waitFor();
    });

    await test.step('Capture and compare screenshot', async () => {
      const screenshot = await facet.captureScreenshot();
      expect(screenshot).toMatchSnapshot(
        'numeric-facet-with-input-default.png',
        {
          maxDiffPixelRatio: 0.04,
        }
      );
    });
  });
});

test.describe('Number Input Functionality', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'with-input-integer'});
    await facet.hydrated.waitFor();
  });

  test('should render number input form with min and max inputs', async ({
    facet,
  }) => {
    await expect(facet.numberInput).toBeVisible();
    await expect(facet.facetInputStart).toBeVisible();
    await expect(facet.facetInputEnd).toBeVisible();
  });

  test('should render apply button', async ({facet}) => {
    await expect(facet.facetApplyButton).toBeVisible();
  });

  test('should allow filling in start and end values', async ({facet}) => {
    await test.step('Fill in values', async () => {
      await facet.facetInputStart.fill('100');
      await facet.facetInputEnd.fill('1000');
    });

    await test.step('Verify values are filled', async () => {
      await expect(facet.facetInputStart).toHaveValue(100);
      await expect(facet.facetInputEnd).toHaveValue(1000);
    });
  });

  test('should apply custom range when apply button is clicked', async ({
    facet,
  }) => {
    await test.step('Fill in and apply values', async () => {
      await facet.facetInputStart.fill('100');
      await facet.facetInputEnd.fill('1000');
      await facet.facetApplyButton.click();
    });

    await test.step('Verify filter is applied', async () => {
      // Clear button appears when a filter is applied
      await expect(facet.facetClearFilterButton).toBeVisible();
    });
  });

  test('should update breadcrumb when custom range is applied', async ({
    facet,
  }) => {
    await test.step('Apply custom range', async () => {
      await facet.facetInputStart.fill('100');
      await facet.facetInputEnd.fill('1000');
      await facet.facetApplyButton.click();
    });

    await test.step('Verify breadcrumb appears', async () => {
      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();
    });
  });

  test('should clear custom range when clear button is clicked', async ({
    facet,
  }) => {
    await test.step('Apply custom range', async () => {
      await facet.facetInputStart.fill('100');
      await facet.facetInputEnd.fill('1000');
      await facet.facetApplyButton.click();
      await expect(facet.facetClearFilterButton).toBeVisible();
    });

    await test.step('Clear the filter', async () => {
      await facet.facetClearFilterButton.click();
    });

    await test.step('Verify filter is cleared', async () => {
      await expect(facet.facetClearFilterButton).not.toBeVisible();
      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).not.toBeVisible();
    });
  });
});

test.describe('Number Input Validation', () => {
  test.beforeEach(async ({facet}) => {
    await facet.load({story: 'with-input-integer'});
    await facet.hydrated.waitFor();
  });

  test('should show validation error when both inputs are empty', async ({
    facet,
  }) => {
    await test.step('Try to apply with empty inputs', async () => {
      await facet.facetApplyButton.click();
    });

    await test.step('Verify inputs are invalid', async () => {
      await expect(facet.facetInputStart).not.toBeValid();
      await expect(facet.facetInputEnd).not.toBeValid();
    });
  });

  test('should show validation error when start input is empty', async ({
    facet,
  }) => {
    await test.step('Fill only end input', async () => {
      await facet.facetInputEnd.fill('1000');
      await facet.facetApplyButton.click();
    });

    await test.step('Verify start input is invalid', async () => {
      await expect(facet.facetInputStart).not.toBeValid();
    });
  });

  test('should show validation error when end input is empty', async ({
    facet,
  }) => {
    await test.step('Fill only start input', async () => {
      await facet.facetInputStart.fill('100');
      await facet.facetApplyButton.click();
    });

    await test.step('Verify end input is invalid', async () => {
      await expect(facet.facetInputEnd).not.toBeValid();
    });
  });

  test('should show validation error when min is greater than max', async ({
    facet,
  }) => {
    await test.step('Enter invalid range', async () => {
      await facet.facetInputStart.fill('1000');
      await facet.facetInputEnd.fill('100');
      await facet.facetApplyButton.click();
    });

    await test.step('Verify validation error', async () => {
      // When min > max, the end input should be invalid
      await expect(facet.facetInputEnd).not.toBeValid();
    });
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
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

      await expect(facet.facet).not.toBeVisible();
    });

    test('should clear previously selected dependent facet range', async ({
      facet,
    }) => {
      await facet.facetValues.first().click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      const parent = facet.page.getByTestId('regular-facet');
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

      await breadbox.waitFor({state: 'hidden'});
      await expect(breadbox).not.toBeVisible();
    });
    test('should clear previously selected dependent facet input range', async ({
      facet,
    }) => {
      await facet.facetInputStart.fill('900000');
      await facet.facetInputEnd.fill('90000000');
      await facet.facetApplyButton.click();

      const breadbox = facet.page.getByTestId('breadbox');
      await expect(breadbox).toBeVisible();

      const parent = facet.page.getByTestId('regular-facet');
      await parent.getByLabel('Inclusion filter on YouTubeVideo').click();

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
      await facet.facetInputStart.fill('900000');
      await facet.facetInputEnd.fill('90000000');
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
