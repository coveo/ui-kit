import {expect, test} from './fixture';

test.describe('When using a list layout', () => {
  test.beforeEach(async ({resultList}) => {
    await resultList.load();
  });

  test.describe('when clicking a result', () => {
    test.beforeEach(async ({result}) => {
      await result.hydrated.first().click();
    });

    test('should not navigate', async ({page}) => {
      expect(page.url()).toContain('/iframe.html');
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
test.describe('When using a table layout', () => {
  test.beforeEach(async ({resultList}) => {
    await resultList.load({story: 'table-display'});
  });

  test.describe('when clicking a result', () => {
    test.beforeEach(async ({result}) => {
      await result.hydrated.first().click();
    });

    test('should not navigate', async ({page}) => {
      expect(page.url()).toContain('/iframe.html');
    });
  });
});
