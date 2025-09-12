import {expect, test} from './fixture';

test.describe('AtomicInsightResult', () => {
  test.beforeEach(async ({insightResult}) => {
    await insightResult.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
