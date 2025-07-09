import {expect, test} from './fixture';

test.describe('AtomicResultIcon', () => {
  test.beforeEach(async ({resultIcon}) => {
    await resultIcon.load();
  });

  test('atomic-result-icon loads an icon', async ({resultIcon}) => {
    await expect(resultIcon.svg).toBeVisible();
  });
});
