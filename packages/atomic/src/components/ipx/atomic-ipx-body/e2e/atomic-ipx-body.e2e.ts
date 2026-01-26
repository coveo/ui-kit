import {expect, test} from './fixture';

test.describe('atomic-ipx-body', () => {
  test.beforeEach(async ({ipxBody}) => {
    await ipxBody.load({
      story: 'atomic-ipx-body--default',
    });
    await ipxBody.hydrated.waitFor();
  });

  test.describe('structure and rendering', () => {
    test('should render the component', async ({ipxBody}) => {
      await expect(ipxBody.component).toBeVisible();
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
        story: 'atomic-ipx-body--without-footer',
      });
      await ipxBody.hydrated.waitFor();

      await expect(ipxBody.footerWrapper).not.toBeVisible();
    });
  });

  test.describe('accessibility', () => {
    test('should use semantic HTML elements', async ({ipxBody}) => {
      const container = ipxBody.container;
      const tagName = await container.evaluate((el) => el.tagName);
      expect(tagName.toLowerCase()).toBe('article');

      const headerWrapper = ipxBody.headerWrapper;
      const headerTag = await headerWrapper.evaluate((el) => el.tagName);
      expect(headerTag.toLowerCase()).toBe('header');

      const footerWrapper = ipxBody.footerWrapper;
      const footerTag = await footerWrapper.evaluate((el) => el.tagName);
      expect(footerTag.toLowerCase()).toBe('footer');
    });

    test('should have proper accessibility tree structure', async ({
      ipxBody,
    }) => {
      await expect(ipxBody.component).toMatchAriaSnapshot(`
        - article:
          - header
          - separator
          - generic
          - generic
      `);
    });
  });
});
