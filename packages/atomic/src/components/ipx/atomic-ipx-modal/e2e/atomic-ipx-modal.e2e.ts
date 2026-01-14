import {expect, test} from './fixture';

test.describe('atomic-ipx-modal', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/iframe.html?id=atomic-ipx-modal--default');
    await page.locator('atomic-ipx-modal').waitFor();
  });

  test('should display the modal when isOpen is true', async ({ipxModal}) => {
    await expect(ipxModal.hydrated).toBeVisible();
    await expect(ipxModal.modalContainer).toBeVisible();
    await expect(ipxModal.backdrop).toBeVisible();
  });

  test('should display header content', async ({ipxModal}) => {
    await expect(ipxModal.headerSlot).toBeVisible();
    await expect(ipxModal.headerSlot).toContainText('Modal Header');
  });

  test('should display body content', async ({ipxModal}) => {
    await expect(ipxModal.bodySlot).toBeVisible();
    await expect(ipxModal.bodySlot).toContainText('modal body content');
  });

  test('should display footer content', async ({ipxModal}) => {
    await expect(ipxModal.footerSlot).toBeVisible();
    await expect(ipxModal.footerSlot).toContainText('Action Button');
  });

  test('should be able to close the modal', async ({page}) => {
    const closeButton = page.getByRole('button', {name: 'Close'});
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Wait a bit for the modal to close
    await page.waitForTimeout(500);

    // Check that the modal has the closed class
    const modalElement = await page.locator('atomic-ipx-modal').first();
    const isOpenAttr = await modalElement.getAttribute('is-open');
    expect(isOpenAttr).toBe('false');
  });

  test('should add atomic-ipx-modal-opened class to body when open', async ({
    page,
  }) => {
    const bodyClasses = await page.evaluate(() => document.body.className);
    expect(bodyClasses).toContain('atomic-ipx-modal-opened');
  });
});

test.describe('atomic-ipx-modal - without footer', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/iframe.html?id=atomic-ipx-modal--without-footer');
    await page.locator('atomic-ipx-modal').waitFor();
  });

  test('should not display footer when no footer slot provided', async ({
    ipxModal,
  }) => {
    await expect(ipxModal.headerSlot).toBeVisible();
    await expect(ipxModal.bodySlot).toBeVisible();

    // Footer should not be visible
    const footerCount = await ipxModal.footerSlot.count();
    expect(footerCount).toBe(0);
  });
});

test.describe('atomic-ipx-modal - closed state', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/iframe.html?id=atomic-ipx-modal--closed');
    await page.locator('atomic-ipx-modal').waitFor();
  });

  test('should not be visible when isOpen is false', async ({page}) => {
    const modal = page.locator('atomic-ipx-modal');
    await expect(modal).toBeAttached();

    // Modal should not have the open class
    const modalContainer = modal.locator('[part="atomic-ipx-modal"]').first();
    const hasOpenClass = await modalContainer.evaluate((el) =>
      el.classList.contains('open')
    );
    expect(hasOpenClass).toBe(false);
  });

  test('should be able to open the modal programmatically', async ({page}) => {
    const openButton = page.getByRole('button', {name: 'Open Modal'});
    await expect(openButton).toBeVisible();
    await openButton.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Check that the modal is now open
    const modalElement = await page.locator('atomic-ipx-modal').first();
    const isOpenAttr = await modalElement.getAttribute('is-open');
    expect(isOpenAttr).toBe('true');
  });
});
