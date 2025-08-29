import {expect, test} from './fixture';

test.describe('AtomicInsightRefineModal', () => {
  test.beforeEach(async ({insightRefineModal}) => {
    await insightRefineModal.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
