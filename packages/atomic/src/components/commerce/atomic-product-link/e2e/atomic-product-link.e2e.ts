import {expect, test} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({productLink}) => {
    await productLink.load();
    await productLink.hydrated.first().waitFor({state: 'visible'});
  });

  test('should be accessible', async ({makeAxeBuilder}) => {
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations.length).toEqual(0);
  });

  test('should render as links', async ({productLink, page}) => {
    expect(await productLink.anchor().count()).toBeGreaterThan(1);

    await expect(productLink.anchor().first()).toHaveAttribute('href');

    await productLink.anchor().first().click({force: true});
    expect(page.url()).toContain('barca');
  });
});
