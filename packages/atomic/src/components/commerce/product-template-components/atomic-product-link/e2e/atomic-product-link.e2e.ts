import {test, expect} from './fixture';

// TODO : add tests for this case https://github.com/coveo/ui-kit/pull/4259
test.describe('default', () => {
  test.beforeEach(async ({productLink}) => {
    await productLink.load();
    await productLink.hydrated.first().waitFor({state: 'visible'});
  });

  test('should render as links', async ({productLink, page}) => {
    expect(await productLink.anchor().count()).toBeGreaterThan(1);
    // (await productLink.anchor().all()).forEach((anchor) => {
    //   expect(anchor).toHaveAttribute('href');
    // });
    await productLink.anchor().first().click({force: true});
    expect(page.url()).toContain('barca');
  });
});

test.describe('with slot for attributes', () => {
  test.beforeEach(async ({productLink}) => {
    await productLink.load({story: 'with-slots-attributes'});
    await productLink.hydrated.first().waitFor({state: 'visible'});
  });

  test('should support to open in new tab', async ({productLink}) => {
    const anchor = productLink.anchor().first();
    await expect(anchor).toHaveAttribute('target', '_blank');
  });
});

test.describe('with alternative content', () => {
  test.beforeEach(async ({productLink}) => {
    await productLink.load({story: 'with-alternative-content'});
    await productLink.hydrated.first().waitFor({state: 'visible'});
  });

  test('should render alternative content', async ({productLink}) => {
    await expect(productLink.anchor().first()).toHaveText(
      'Alternative content'
    );

    await expect(productLink.anchor().first().locator('img')).toBeVisible();
  });
});
