import {expect, test} from './fixture';

test.describe('AtomicProductChildren', () => {
  test.beforeEach(async ({productChildren}) => {
    await productChildren.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
