import {expect, test} from './fixture';

test.describe('AtomicSmartSnippet', () => {
  test('should render correctly', async ({smartSnippet}) => {
    await smartSnippet.load();
    await smartSnippet.hydrated.waitFor();
    await expect(smartSnippet.smartSnippet).toBeVisible();
  });
});
