import {expect, test} from './fixture';

test.describe('atomic-result-timespan', () => {
  test.beforeEach(async ({resultTimespan}) => {
    await resultTimespan.load();
    await resultTimespan.hydrated.waitFor();
  });

  test('should display time in HH:mm:ss format', async ({resultTimespan}) => {
    await expect(resultTimespan.hydrated).toBeVisible();

    const text = await resultTimespan.hydrated.textContent();
    expect(text).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});
