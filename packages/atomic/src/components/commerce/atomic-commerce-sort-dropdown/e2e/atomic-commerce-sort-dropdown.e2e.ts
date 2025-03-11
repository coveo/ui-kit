import {test, expect} from './fixture';

test.describe('AtomicCommerceSortDropdown', () => {
  test.beforeEach(async ({commerceSortDropdown}) => {
    await commerceSortDropdown.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
