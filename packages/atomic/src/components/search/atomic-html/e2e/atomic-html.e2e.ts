import {test} from './fixture';

test.describe('atomic-html', () => {
  test.beforeEach(async ({html}) => {
    await html.load();
  });
});
