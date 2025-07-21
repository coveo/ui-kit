import {expect, test} from './fixture';

test.describe('AtomicProductFieldCondition', () => {
  test.beforeEach(async ({productFieldCondition}) => {
    await productFieldCondition.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
