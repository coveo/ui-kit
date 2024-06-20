import {expect, test} from '../../atomic-commerce-text/e2e/fixture';

test.describe('default', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?path=/story/atomic-commerce-text--default'
    );
  });

  test('should show text', async ({text}) => {
    await expect(text.getText).toHaveText('Atomic Commerce Text');
  });

  test('should be A11y compliant', async ({text, makeAxeBuilder}) => {
    await text.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});
