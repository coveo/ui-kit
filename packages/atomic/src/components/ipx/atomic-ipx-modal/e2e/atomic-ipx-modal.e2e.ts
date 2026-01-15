import {expect, test} from './fixture';

test.describe('atomic-ipx-modal', () => {
  test.beforeEach(async ({ipxModal}) => {
    await ipxModal.load();
    await ipxModal.hydrated.waitFor();
  });

  test('should display the modal with all slots', async ({ipxModal}) => {
    await expect(ipxModal.backdrop).toBeVisible();
    await expect(ipxModal.headerSlot).toBeVisible();
    await expect(ipxModal.bodySlot).toBeVisible();
    await expect(ipxModal.footerSlot).toBeVisible();
  });
});
