import {test, expect} from './fixture';

test('atomic-icon loads assets:// files', async ({icon}) => {
  await icon.load();
  await expect(icon.svg).toBeVisible();
});
