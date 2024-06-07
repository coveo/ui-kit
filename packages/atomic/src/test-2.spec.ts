import {test, expect} from '@playwright/test';

test('test', async ({page}) => {
  await page.goto('http://localhost:4400/');
  await page.goto(
    'http://localhost:4400/?path=/story/atomic-automatic-facet-generator--default'
  );
  await page.getByRole('button', {name: 'Facets'}).click();
  await page.getByRole('link', {name: 'atomic-commerce-facets'}).click();
  await page
    .frameLocator('iframe[title="storybook-preview-iframe"]')
    .getByText('Barca Sports(40)')
    .click();
  await expect(
    page
      .frameLocator('iframe[title="storybook-preview-iframe"]')
      .getByLabel('Inclusion filter on Barca')
  ).toBeVisible();
});
