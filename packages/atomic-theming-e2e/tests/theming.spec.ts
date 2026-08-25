import {expect, initializeSearchInterface, test} from './fixture.js';

const themeValues: Record<string, string> = {
  '--atomic-primary': 'rgb(255, 192, 203)',
  '--atomic-neutral-dark': 'rgb(0, 255, 255)',
  '--atomic-background': 'rgb(54, 54, 54)',
  '--atomic-on-background': 'rgb(128, 0, 0)',
  '--atomic-text-base': '24px',
  '--atomic-text-xl': '30px',
};

const outsideResultTemplateAssertions = [
  {
    token: '--atomic-background',
    selector: 'atomic-search-box .bg-background',
    property: 'background-color',
  },
  {
    token: '--atomic-on-background',
    selector: 'atomic-query-summary div',
    property: 'color',
  },
  {
    token: '--atomic-text-base',
    selector: 'atomic-query-summary',
    property: 'font-size',
  },
];

const inResultTemplateAssertions = [
  {
    token: '--atomic-on-background',
    selector: 'atomic-result-section-title atomic-result-text',
    property: 'color',
  },
  {
    token: '--atomic-primary',
    selector: 'atomic-result-section-title-metadata a',
    property: 'color',
  },
  {
    token: '--atomic-neutral-dark',
    selector: 'atomic-result-section-bottom-metadata atomic-text',
    property: 'color',
  },
  {
    token: '--atomic-text-xl',
    selector: 'atomic-result-section-title atomic-result-text',
    property: 'font-size',
  },
];

test.describe('theme customization', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/theming.html');
    await initializeSearchInterface(page);

    const firstResult = page.locator('atomic-result').first();
    await expect(firstResult).toBeVisible();
    await expect(firstResult.locator('atomic-result-section-title a').first()).toBeVisible();
  });

  test.describe('outside of a result template', () => {
    for (const {token, selector, property} of outsideResultTemplateAssertions) {
      test(`${token} applies to ${selector}`, async ({page}) => {
        await expect(page.locator(selector).first()).toHaveCSS(property, themeValues[token]);
      });
    }
  });

  test.describe('inside a result template', () => {
    for (const {token, selector, property} of inResultTemplateAssertions) {
      test(`${token} applies to ${selector}`, async ({page}) => {
        const element = page.locator('atomic-result').first().locator(selector).first();
        await expect(element).toHaveCSS(property, themeValues[token]);
      });
    }
  });
});
