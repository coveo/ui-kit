import {expect, test} from './fixture';

test.describe('AtomicInsightPager', () => {
  test.beforeEach(async ({insightPager}) => {
    await insightPager.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
