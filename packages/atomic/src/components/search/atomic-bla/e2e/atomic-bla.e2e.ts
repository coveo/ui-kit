import {test, expect} from './fixture';

test.describe('AtomicBla', () => {
  test.beforeEach(async ({bla}) => {
    await bla.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
