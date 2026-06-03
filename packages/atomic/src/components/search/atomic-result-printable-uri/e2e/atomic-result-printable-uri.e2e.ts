import {expect, test} from './fixture';

test.describe('atomic-result-printable-uri', () => {
  test.beforeEach(async ({printableUri}) => {
    await printableUri.load();
    await printableUri.hydrated.first().waitFor();
  });

  test('should render printable URI component', async ({printableUri}) => {
    await expect(printableUri.hydrated.first()).toBeVisible();
  });
});
