import {expect, test} from './fixture';

test.describe('atomic-ipx-modal', () => {
  test.beforeEach(async ({ipxModal}) => {
    await ipxModal.load();
    await ipxModal.hydrated.waitFor();
  });

  test('should display the modal backdrop', async ({ipxModal}) => {
    await expect(ipxModal.backdrop).toBeVisible();
  });
});
