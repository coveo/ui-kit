import {expect, test} from './fixture';

test.describe('atomic-insight-refine-toggle', () => {
  test.beforeEach(async ({refineToggle}) => {
    await refineToggle.load();
  });

  test('should render the component', async ({refineToggle}) => {
    await expect(refineToggle.button).toBeVisible();
    await expect(refineToggle.icon).toBeVisible();
  });

  test('should open the modal when the button is clicked', async ({
    refineToggle,
  }) => {
    await refineToggle.button.click();

    await expect(refineToggle.modal).toBeVisible();
  });
});
