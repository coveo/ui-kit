import AxeBuilder from '@axe-core/playwright';
import {expect, test} from './fixture';

test.describe('atomic-result-fields-list', () => {
  test.beforeEach(async ({resultFieldsList}) => {
    await resultFieldsList.load();
    await resultFieldsList.hydrated.first().waitFor();
  });

  test('should render children', async ({resultFieldsList}) => {
    const children = await resultFieldsList.children.all();
    expect(children.length).toBeGreaterThan(0);
  });

  test('should be accessible', async ({page}) => {
    const accessibilityScanResults = await new AxeBuilder({page})
      .include('atomic-result-fields-list')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
