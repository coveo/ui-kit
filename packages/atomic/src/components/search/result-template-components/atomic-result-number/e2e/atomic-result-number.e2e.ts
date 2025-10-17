import {expect, test} from './fixture';

test.describe('atomic-result-number', () => {
  test.beforeEach(async ({resultNumber}) => {
    await resultNumber.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
