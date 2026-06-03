import {expect, test} from './fixture';

test.describe('AtomicResultIcon', () => {
  test.beforeEach(async ({resultIcon}) => {
    await resultIcon.load();
    await resultIcon.hydrated.waitFor();
  });

  test('should load and display an icon', async ({resultIcon}) => {
    await expect(resultIcon.svg).toBeVisible();
    await expect(resultIcon.atomicIcon).toBeVisible();
  });
});
