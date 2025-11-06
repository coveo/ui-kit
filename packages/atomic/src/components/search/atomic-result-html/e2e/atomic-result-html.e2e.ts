import {expect, test} from './fixture';

test.describe('atomic-result-html', () => {
  test.beforeEach(async ({resultHtml}) => {
    await resultHtml.load();
    await resultHtml.hydrated.first().waitFor();
  });

  test('should render HTML content from the excerpt field', async ({
    resultHtml,
  }) => {
    await resultHtml.load({args: {field: 'excerpt'}});
    await resultHtml.hydrated.first().waitFor();

    const htmlContent = resultHtml.htmlContent.first();
    await expect(htmlContent).toBeVisible();
  });

  test('should be accessible', async ({resultHtml, makeAxeBuilder}) => {
    await resultHtml.load({args: {field: 'excerpt'}});
    await resultHtml.hydrated.first().waitFor();

    const accessibilityScanResults = await makeAxeBuilder().analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
