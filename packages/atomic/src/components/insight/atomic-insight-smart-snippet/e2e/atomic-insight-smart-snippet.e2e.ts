import {expect, test} from './fixture';

test.describe('AtomicInsightSmartSnippet', () => {
  test('should render correctly', async ({insightSmartSnippet}) => {
    await insightSmartSnippet.load();
    await insightSmartSnippet.hydrated.waitFor();
    await expect(insightSmartSnippet.smartSnippet).toBeVisible();
  });
});
