import {expect, test} from './fixture';

test.describe('AtomicInsightQueryError', () => {
  test.beforeEach(async ({insightQueryError}) => {
    await insightQueryError.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
