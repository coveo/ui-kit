import {test, expect} from './fixture';

test.describe('When using a list layout', () => {
  test.beforeEach(async ({resultList}) => {
    await resultList.load();
  });

  test.describe('when clicking a result', () => {
    test.beforeEach(async ({result}) => {
      await result.hydrated.first().click();
    });

    test('should not navigate', async ({page}) => {
      expect(page.url()).toContain('http://localhost:4400/iframe.html');
    });
  });
});

test.describe('When using a grid layout', () => {
  test.beforeEach(async ({resultList}) => {
    await resultList.load({story: 'grid'});
  });

  test.describe('when clicking a result', () => {
    test.beforeEach(async ({result}) => {
      await result.hydrated.first().click();
    });

    test('should navigate', async ({page}) => {
      await expect
        .poll(() => page.url())
        .toContain('https://docs.coveo.com/en/3160');
    });
  });
});
