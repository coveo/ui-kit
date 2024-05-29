import {test, expect} from '@playwright/test';

test.describe('default', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--default&viewMode=story'
    );
  });

  test('should have an enabled search button', async ({page}) => {
    await expect(page.getByLabel('Search', {exact: true})).toBeEnabled();
  });

  test.describe('after clicking the searchbox', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').click();
    });

    test('should display the suggested queries', async ({page}) => {
      await expect(
        page.getByLabel(/suggested query\. 1 of \d?\./)
      ).toBeVisible();
    });

    test.describe('after clicking the search button', () => {
      test.beforeEach(async ({page}) => {
        await page
          .getByLabel(/suggested query\. 1 of \d?\./)
          .waitFor({state: 'visible'});
        await page.getByLabel('Search', {exact: true}).click();
      });

      test('should collapse the suggested queries', async ({page}) => {
        await expect(
          page.getByLabel(/suggested query\. 1 of \d?\./)
        ).not.toBeVisible();
      });
    });
  });
});

test.describe('with instant results & query suggestions', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--rich-search-box&viewMode=story'
    );
    await page.setViewportSize({width: 1920, height: 1080});
  });

  test.describe('after clicking the searchbox', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').click();
    });

    test('should display the suggested queries', async ({page}) => {
      await expect(
        page.getByLabel(/suggested query\. 1 of \d?\.$/)
      ).toBeVisible();
    });

    test.describe('after hovering over the suggested query', () => {
      test.beforeEach(async ({page}) => {
        await page.getByLabel(/suggested query\. 1 of \d?\.$/).hover();
      });

      test('should update the suggested query label', async ({page}) => {
        await expect(
          page.getByLabel(/suggested query\. 1 of \d?\. In Left list./)
        ).toBeVisible();
        await expect(
          page.getByLabel(/suggested query\. 1 of \d?\.$/)
        ).not.toBeVisible();
      });

      test('should display the instant results', async ({page}) => {
        await expect(
          page.getByLabel(/instant result\. 1 of \d?\. In Right list\./)
        ).toBeVisible();
      });
    });
  });
});

test.describe('with disable-search=true and minimum-query-length=1', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--default&viewMode=story&args=disable-search:!true;minimum-query-length:1'
    );
  });

  test('the search button is disabled', async ({page}) => {
    await expect(page.getByLabel('Search', {exact: true})).toBeDisabled();
  });

  test.describe('after clicking the searchbox', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').click();
    });

    test('the search button is still disabled', async ({page}) => {
      await page.getByPlaceholder('Search').click();
      await expect(page.getByLabel('Search', {exact: true})).toBeDisabled();
    });

    test('there are no search suggestions', async ({page}) => {
      await page.getByPlaceholder('Search').click();
      await expect(
        page.getByLabel(/suggested query\. 1 of \d?\./)
      ).not.toBeVisible();
    });
  });

  test.describe('after typing a query above the threshold', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').fill('kayak');
    });

    test('the search button is still disabled', async ({page}) => {
      await expect(page.getByLabel('Search', {exact: true})).toBeDisabled();
    });

    test('no query suggestions appears', async ({page}) => {
      await expect(
        page.getByLabel(/suggested query\. 1 of \d?\./)
      ).not.toBeVisible();
    });
  });
});

test.describe('with minimum-query-length=3', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--default&viewMode=story&args=minimum-query-length:4'
    );
  });

  test('the search button is disabled', async ({page}) => {
    await expect(page.getByLabel('Search', {exact: true})).toBeDisabled();
  });

  test.describe('after clicking the searchbox', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').click();
    });

    test('the search button is still disabled', async ({page}) => {
      await page.getByPlaceholder('Search').click();
      await expect(page.getByLabel('Search', {exact: true})).toBeDisabled();
    });

    test('there are no search suggestions', async ({page}) => {
      await page.getByPlaceholder('Search').click();
      await expect(
        page.getByLabel(/suggested query\. 1 of \d?\./)
      ).not.toBeVisible();
    });
  });

  test.describe('after typing a query below the threshold', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').fill('kay');
    });

    test('the search button is still disabled', async ({page}) => {
      await expect(page.getByLabel('Search', {exact: true})).toBeDisabled();
    });

    test('there are no search suggestions', async ({page}) => {
      await expect(
        page.getByLabel(/suggested query\. 1 of \d?\./)
      ).not.toBeVisible();
    });
  });

  test.describe('after typing a query above the threshold', () => {
    test.beforeEach(async ({page}) => {
      await page.getByPlaceholder('Search').fill('kayak');
    });

    test('the search button is still disabled', async ({page}) => {
      await expect(page.getByLabel('Search', {exact: true})).toBeEnabled();
    });

    test('there are no search suggestions', async ({page}) => {
      await expect(
        page.getByLabel(/suggested query\. 1 of \d?\./)
      ).toBeVisible();
    });
  });
});

test.describe('with a facet & clear-filters set to true', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--in-page&args=clear-filters:!true'
    );
  });

  test('clicking the search button should clear the facet value', async ({
    page,
  }) => {
    await page
      .getByLabel(/Inclusion filter/)
      .first()
      .click();
    await page.getByLabel(/Clear 1 filter for/).waitFor({state: 'visible'});
    await page.getByLabel('Search', {exact: true}).click();
    await expect(page.getByLabel(/Clear 1 filter for/)).not.toBeVisible();
  });
});

test.describe('with a facet & clear-filters set to false', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--in-page&args=clear-filters:!false'
    );
  });

  test('clicking the search button should not clear the facet value', async ({
    page,
  }) => {
    await page
      .getByLabel(/Inclusion filter/)
      .first()
      .click();
    await page.getByLabel(/Clear 1 filter for/).waitFor({state: 'visible'});
    await page.getByLabel('Search', {exact: true}).click();
    await expect(page.getByLabel(/Clear 1 filter for/)).toBeVisible();
  });
});

test.describe('with enable-query-syntax=true', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--in-page&viewMode=story&args=enable-query-syntax:!true'
    );
  });

  test('should use query syntax', async ({page}) => {
    await page
      .getByRole('button', {name: 'Load more results'})
      .waitFor({state: 'visible'});
    await page
      .getByLabel('Search field with suggestions')
      // eslint-disable-next-line @cspell/spellchecker
      .fill('@urihash=bzo5fpM1vf8Xñds1');
    await page.getByLabel('Search', {exact: true}).click();
    await expect(page.getByText('Showing 1 of 1 results')).toBeVisible();
    await expect(page.getByText('WiLife Life Jacket WiLife')).toBeVisible();
  });
});
