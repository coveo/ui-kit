import {expect, test} from './fixture';

test.describe('atomic-ipx-body', () => {
  test.beforeEach(async ({ipxBody}) => {
    await ipxBody.load();
    await ipxBody.hydrated.waitFor();
  });

  test.describe('structure and rendering', () => {
    test('should render the component', async ({ipxBody}) => {
      await expect(ipxBody.hydrated).toBeVisible();
    });

    test('should render the container', async ({ipxBody}) => {
      await expect(ipxBody.container).toBeVisible();
    });

    test('should render the header wrapper', async ({ipxBody}) => {
      await expect(ipxBody.headerWrapper).toBeVisible();
    });

    test('should render the body wrapper', async ({ipxBody}) => {
      await expect(ipxBody.bodyWrapper).toBeVisible();
    });

    test('should render the footer wrapper', async ({ipxBody}) => {
      await expect(ipxBody.footerWrapper).toBeVisible();
    });

    test('should render the header ruler', async ({ipxBody}) => {
      await expect(ipxBody.headerRuler).toBeVisible();
    });
  });

  test.describe('slot content', () => {
    test('should display header slot content', async ({ipxBody}) => {
      await expect(ipxBody.headerSlot).toBeVisible();
      await expect(ipxBody.headerSlot).toContainText('Header Content');
    });

    test('should display body slot content', async ({ipxBody}) => {
      await expect(ipxBody.bodySlot).toBeVisible();
      await expect(ipxBody.bodySlot).toContainText('main body content');
    });

    test('should display footer slot content', async ({ipxBody}) => {
      await expect(ipxBody.footerSlot).toBeVisible();
      await expect(ipxBody.footerSlot).toContainText('Action Button');
    });
  });

  test.describe('scrollable behavior', () => {
    test('should have scrollable body wrapper', async ({ipxBody}) => {
      const bodyWrapper = ipxBody.bodyWrapper;
      const overflow = await bodyWrapper.evaluate(
        (el) => getComputedStyle(el).overflow
      );
      expect(overflow).toBe('auto');
    });
  });

  test.describe('footer visibility', () => {
    test('should hide footer when displayFooterSlot is false', async ({
      ipxBody,
    }) => {
      await ipxBody.load({
        story: 'without-footer',
      });
      await ipxBody.hydrated.waitFor();

      await expect(ipxBody.footerWrapper).not.toBeVisible();
    });
  });
});
