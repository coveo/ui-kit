import {test, expect} from './fixture';

test.describe('AtomicLoadMoreItems', () => {
  test.beforeEach(async ({loadMoreItems}) => {
    await loadMoreItems.load();
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });
});
