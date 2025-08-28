import {expect, test} from './fixture';

test.describe('AtomicInsightTab', () => {
  test.beforeEach(async ({insightTab}) => {
    await insightTab.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
