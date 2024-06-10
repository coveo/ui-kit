import {test, expect} from './fixture';
import {
  assertAccessibility,
  assertDisabled,
  assertEnabled,
  assertPageInHash,
  assertPagerSelected,
} from './pager-assertions';

test.describe('Default', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=story'
    );
  });

  assertEnabled('nextButton');
  assertDisabled('previousButton');
  assertAccessibility();

  test('should display numeric Button', async ({pager}) => {
    const buttons = await pager.numericButtons;
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const element = buttons.nth(i);
      await expect(element).toBeVisible();
    }
  });

  test('should display a previous button', async ({pager}) => {
    await expect(pager.previousButton).toBeVisible();
  });

  test('should display a next button', async ({pager}) => {
    await expect(pager.nextButton).toBeVisible();
  });

  test('should display 5 page Buttons', async ({pager}) => {
    await expect(pager.numericButtons).toHaveCount(5);
  });

  test.describe('after clicking the button next', () => {
    test.beforeEach(async ({pager}) => {
      await pager.nextButton.click();
    });

    assertPagerSelected(2, true);
    assertPagerSelected(1, false);
    assertPageInHash(2);
    assertEnabled('nextButton');
    assertEnabled('previousButton');
  });

  test.describe('after clicking the button previous', () => {
    test.beforeEach(async ({pager}) => {
      await pager.nextButton.click();
      await pager.previousButton.click();
    });

    assertPagerSelected(1, true);
    assertPagerSelected(2, false);
    assertPageInHash(1);
    assertEnabled('nextButton');
    assertDisabled('previousButton');
  });

  test.describe('after clicking the pager button', () => {
    test.beforeEach(async ({pager}) => {
      await pager.numericButtons.nth(2).click();
    });

    assertPagerSelected(3, true);
    assertPagerSelected(1, false);
    assertPageInHash(3);
    assertEnabled('nextButton');
    assertEnabled('previousButton');
  });

  describe('after clicking on page 5', () => {
    test.beforeEach(async ({pager}) => {
      await pager.numericButtons.nth(5).click();
    });

    assertPagerSelected(6, false);
  });
});

describe('with numberOfPages=2', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=story#page=2&perPage=48'
    );
  });

  assertPagerSelected(3, true);
  assertAccessibility();
});

describe('with numberOfPages=8k3', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=story#page=8k3&perPage=48'
    );
  });

  assertPagerSelected(9, true);
  assertAccessibility();
});

// TODO: assert error
// describe('with numberOfPages=-5', () => {
//   test.beforeEach(async ({page}) => {
//     await page.goto(
//       'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=story#page=-5&perPage=48'
//     );
//   });

// });
