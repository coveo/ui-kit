import {expect, test} from './fixture';

test.describe('edit toggle', () => {
  test.beforeEach(async ({editToggle}) => {
    await editToggle.load();
  });

  test('should display the edit toggle button', async ({editToggle}) => {
    await expect(editToggle.editButton).toBeVisible();
  });
});
