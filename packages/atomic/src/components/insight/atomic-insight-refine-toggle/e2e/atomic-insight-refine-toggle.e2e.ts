import {expect, test} from './fixture';

test.describe('atomic-insight-refine-toggle', () => {
  test.beforeEach(async ({refineToggle}) => {
    await refineToggle.load();
  });

  test('should render the button', async ({refineToggle}) => {
    await expect(refineToggle.button).toBeVisible();
  });

  test('should render the filter icon', async ({refineToggle}) => {
    await expect(refineToggle.icon).toBeVisible();
  });

  test('should have accessible button with Filters label', async ({
    refineToggle,
  }) => {
    await expect(refineToggle.button).toHaveAccessibleName('Filters');
  });

  test('should be focusable', async ({refineToggle}) => {
    await refineToggle.button.focus();
    await expect(refineToggle.button).toBeFocused();
  });
});
