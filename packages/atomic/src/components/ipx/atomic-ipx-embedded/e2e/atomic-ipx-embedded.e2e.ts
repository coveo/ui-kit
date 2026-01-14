import {expect, test} from './fixture';

test.describe('atomic-ipx-embedded', () => {
  test.beforeEach(async ({ipxEmbedded}) => {
    await ipxEmbedded.load({
      story: 'atomic-ipx-embedded--default',
    });
  });

  test('should render the backdrop part', async ({ipxEmbedded}) => {
    await expect(ipxEmbedded.backdrop).toBeVisible();
  });

  test('should render the atomic-ipx-body element', async ({ipxEmbedded}) => {
    await expect(ipxEmbedded.ipxBody).toBeVisible();
  });

  test('should render slotted content', async ({ipxEmbedded}) => {
    await expect(ipxEmbedded.headerSlot).toBeVisible();
    await expect(ipxEmbedded.bodySlot).toBeVisible();
    await expect(ipxEmbedded.footerSlot).toBeVisible();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const results = await makeAxeBuilder()
      .include('atomic-ipx-embedded')
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
