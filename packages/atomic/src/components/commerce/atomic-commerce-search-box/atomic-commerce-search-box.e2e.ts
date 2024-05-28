import {test, expect} from '@playwright/test';

test.describe('atomic-commerce-search-box', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-search-box--rich-search-box&viewMode=story'
    );
  });

  test('should display the suggested queries after clicking the searchbox', async ({
    page,
  }) => {
    await page.getByPlaceholder('Search').click();
    await expect(
      page.getByLabel(/suggested query\. Button\. 1 of \d?\. In Left list\./)
    ).toBeVisible();
  });

  test('should display the instant results after hovering a suggested query', async ({
    page,
  }) => {
    await page.getByPlaceholder('Search').click();
    await page
      .getByLabel(/suggested query\. Button\. 1 of \d?\. In Left list./)
      .hover();
    await expect(
      page.getByLabel(/instant result\. Button\. 1 of \d?\. In Right list\./)
    ).toBeVisible();
  });
});
