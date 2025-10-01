import {expect, test} from '@playwright/test';

const baseUrl = 'http://localhost:3333';

const urls = [
  '/',
  '/examples/custom.html',
  '/examples/external.html',
  '/examples/folding.html',
  '/examples/slack.html',
  '/examples/headless.html',
  '/examples/standalone.html',
  '/examples/modal.html',
  '/examples/suggestions.html',
  '/examples/fashion.html',
  '/examples/insights.html',
  '/examples/recommendations.html',
  '/examples/horizontal-facets.html',
  '/examples/genqa.html',
  '/examples/tabs.html',
  '/examples/commerce-website/homepage.html',
  '/examples/commerce-website/search.html',
  '/examples/commerce-website/listing-pants.html',
];

const styles: {[key: string]: string} = {
  '--atomic-primary': 'rgb(255, 192, 203)',
  '--atomic-primary-light': 'rgb(0, 128, 0)',
  '--atomic-primary-dark': 'rgb(255, 0, 0)',
  '--atomic-on-primary': 'rgb(255, 165, 0)',
  '--atomic-ring-primary': 'rgb(250, 128, 114)',
  '--atomic-neutral-dark': 'rgb(0, 255, 255)',
  '--atomic-neutral-dim': 'rgb(255, 127, 80)',
  '--atomic-neutral': 'rgb(38, 91, 128)',
  '--atomic-neutral-light': 'rgb(89, 119, 86)',
  '--atomic-neutral-lighter': 'rgb(147, 41, 41)',
  '--atomic-background': 'rgb(54, 54, 54)',
  '--atomic-on-background': 'rgb(128, 0, 0)',
  '--atomic-success': 'rgb(222, 222, 0)',
  '--atomic-error': 'rgb(206, 0, 0)',
  '--atomic-visited': 'rgb(113, 129, 101)',
  '--atomic-disabled': 'rgb(21, 64, 107)',
  '--atomic-success-background': 'rgb(0, 20, 0)',
  '--atomic-error-background': 'rgb(0, 0, 20)',
  '--atomic-primary-background': 'rgb(49, 58, 68)',
  '--atomic-inline-code': 'rgb(135, 86, 82)',
  '--atomic-text-base': '24px',
  '--atomic-text-xl': '30px',
  '--atomic-rating-icon-active-color': 'rgb(0, 0, 255)',
  '--atomic-rating-icon-inactive-color': 'rgb(128, 0, 128)',
};
test.describe('style encapsulation', () => {
  for (const url of urls) {
    test(`style encapsulation for ${url}`, async ({page}) => {
      await page.goto(baseUrl + url);

      const coveoCssLocator = page.locator(
        'link[rel="stylesheet"][href*="coveo.css"], style[data-vite-dev-id*="themes/coveo.css"]'
      );
      await expect(coveoCssLocator).toHaveCount(1);

      const interfaceComponents = [
        'atomic-search-interface',
        'atomic-recs-interface',
        'atomic-insight-interface',
        'atomic-commerce-interface',
        'atomic-external',
        'atomic-commerce-recommendation-interface',
      ];

      for (const component of interfaceComponents) {
        const element = page.locator(component);
        if (await element.count()) {
          await element.last().waitFor();
          break;
        }
      }

      const stylesError = page.locator('.styles-error');
      await stylesError.waitFor({state: 'attached'});
      await expect(stylesError).not.toBeVisible();
    });
  }
});

test.describe('theme customization', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:3333/themingTests.html#q=connect');
    const resultTitle = page
      .locator('atomic-result')
      .first()
      .locator('atomic-result-section-title atomic-result-text')
      .first();
    await expect(resultTitle).not.toBeEmpty();
  });

  const outsideResultTemplateTests = [
    {
      style: '--atomic-background',
      selector: 'atomic-search-box .bg-background',
      property: 'background-color',
    },
    {
      style: '--atomic-on-background',
      selector: 'atomic-query-summary div',
      property: 'color',
    },
    {
      style: '--atomic-text-base',
      selector: 'atomic-query-summary',
      property: 'font-size',
    },
  ];

  const inResultTemplateTests = [
    {
      style: '--atomic-on-background',
      selector: 'atomic-result-section-title atomic-result-text',
      property: 'color',
    },
    {
      style: '--atomic-primary',
      selector: 'atomic-result-section-title-metadata a',
      property: 'color',
    },
    {
      style: '--atomic-neutral-dark',
      selector: 'atomic-result-section-bottom-metadata atomic-text',
      property: 'color',
    },
    {
      style: '--atomic-text-xl',
      selector: 'atomic-result-section-title atomic-result-text',
      property: 'font-size',
    },
  ];

  test.describe('outside of result template', () => {
    for (const {style, selector, property} of outsideResultTemplateTests) {
      test(`${style} with ${selector}`, async ({page}) => {
        const element = page.locator(selector).first();
        await expect(element).toHaveCSS(property, styles[style]);
      });
    }
  });

  test.describe('in result template', () => {
    for (const {style, selector, property} of inResultTemplateTests) {
      test(`${style} with ${selector}`, async ({page}) => {
        const element = page
          .locator('atomic-result')
          .first()
          .locator(selector)
          .first();
        await expect(element).toHaveCSS(property, styles[style]);
      });
    }
  });
});
