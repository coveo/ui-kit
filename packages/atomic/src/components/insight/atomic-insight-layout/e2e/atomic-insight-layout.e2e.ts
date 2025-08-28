import {expect, test} from './fixture';

test.describe('AtomicInsightLayout', () => {
  test.beforeEach(async ({insightLayout}) => {
    await insightLayout.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
