import {expect, test} from '@playwright/test';

test.describe('Storybook MDX Pages - Introduction pages', () => {
  const introductionPages = [
    {
      id: 'coveo-atomic-storybook--docs',
      heading: 'Welcome to the Coveo Atomic Storybook',
    },
    {
      id: 'commerce-introduction--docs',
      heading: 'Atomic Commerce Components',
    },
    {
      id: 'search-introduction--docs',
      heading: 'Atomic Search Components',
    },
    {
      id: 'insight-introduction--docs',
      heading: 'Atomic Insight Components',
    },
    {
      id: 'common-introduction--docs',
      heading: 'Atomic Common Components',
    },
    {
      id: 'recommendations-introduction--docs',
      heading: 'Atomic Recommendation Components',
    },
  ];

  for (const {id, heading} of introductionPages) {
    test(`should render the "${heading}" introduction page`, async ({page}) => {
      await page.goto(`./?path=/docs/${id}`);
      await page.waitForLoadState('domcontentloaded');

      const docsRoot = page.frameLocator('#storybook-preview-iframe');
      await expect(
        docsRoot.getByRole('heading', {name: heading})
      ).toBeVisible();
    });
  }
});

test.describe('Storybook MDX Pages - Component doc pages (AtomicDocTemplate)', () => {
  const componentDocPages = [
    {id: 'atomic-search-box--docs', title: 'Atomic Search Box'},
    {id: 'atomic-commerce-pager--docs', title: 'Atomic Commerce Pager'},
    {id: 'atomic-insight-pager--docs', title: 'Atomic Insight Pager'},
    {id: 'atomic-layout-section--docs', title: 'Atomic Layout Section'},
    {id: 'atomic-recs-list--docs', title: 'Atomic Recs List'},
  ];

  for (const {id, title} of componentDocPages) {
    test(`should render the "${title}" doc page with expected sections`, async ({
      page,
    }) => {
      await page.goto(`./?path=/docs/${id}`);
      await page.waitForLoadState('domcontentloaded');

      const docsRoot = page.frameLocator('#storybook-preview-iframe');

      await expect(
        docsRoot.getByRole('heading', {name: 'Usage'}).first()
      ).toBeVisible();
      await expect(
        docsRoot.getByRole('heading', {name: 'Examples'}).first()
      ).toBeVisible();
      await expect(
        docsRoot.getByRole('heading', {name: 'Reference'}).first()
      ).toBeVisible();
    });
  }
});
