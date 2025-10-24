import {expect, test} from './fixture';

test.describe('atomic-html', () => {
  test.beforeEach(async ({html}) => {
    await html.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
