import {expect, test} from './fixture';

test.describe('atomic-recs-list', () => {
  test.beforeEach(async ({recsList}) => {
    await recsList.load();
    await recsList.hydrated.waitFor();
  });

  test('should render recommendations', async ({recsList}) => {
    const count = await recsList.recommendations.count();
    expect(count).toBeGreaterThan(0);
  });
});
