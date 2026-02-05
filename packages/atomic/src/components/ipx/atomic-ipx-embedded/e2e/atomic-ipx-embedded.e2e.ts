import {expect, test} from './fixture';

test.describe('atomic-ipx-embedded', () => {
  test.beforeEach(async ({ipxEmbedded}) => {
    await ipxEmbedded.load();
  });

  test('should render the backdrop and ipx-body container', async ({
    ipxEmbedded,
  }) => {
    await expect(ipxEmbedded.backdrop).toBeVisible();
    await expect(ipxEmbedded.container).toBeVisible();
  });
});
