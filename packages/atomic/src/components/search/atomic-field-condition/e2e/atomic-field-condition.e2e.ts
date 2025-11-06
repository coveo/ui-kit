import {expect, test} from './fixture.js';

test.describe('atomic-field-condition', () => {
  test.beforeEach(async ({fieldCondition}) => {
    await fieldCondition.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
