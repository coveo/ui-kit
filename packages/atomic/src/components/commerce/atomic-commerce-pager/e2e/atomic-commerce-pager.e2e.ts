import {test, expect} from './fixture';
import {
  assertAccessibility,
  assertContainsComponentError,
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

  test('should display 5 pages', async ({pager}) => {
    await expect(pager.pages).toHaveCount(5);
  });

  test('should display numeric Button', async ({pager}) => {
    for (let i = 1; i < 5; i++) {
      await expect(pager.numericButton(i)).toBeVisible();
    }
  });

  test('should display a previous button', async ({pager}) => {
    await expect(pager.previousButton).toBeVisible();
  });

  test('should display a next button', async ({pager}) => {
    await expect(pager.nextButton).toBeVisible();
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
      await pager.numericButton(3).click();
    });

    assertPagerSelected(3, true);
    assertPagerSelected(1, false);
    assertPageInHash(3);
    assertEnabled('nextButton');
    assertEnabled('previousButton');
  });

  test.describe('after clicking on page 5', () => {
    test.beforeEach(async ({pager}) => {
      await pager.numericButton(5).click();
    });

    assertPagerSelected(5, false);
  });
});

test.describe('with a valid page in the hash', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=story#page=2'
    );
  });

  assertPagerSelected(3, true);
  assertAccessibility();
});

test.describe('with an invalid page in the hash', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=story#page=8k3'
    );
  });

  assertPagerSelected(9, true);
  assertAccessibility();
});

test.describe('with number-of-pages=3', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=story&args=number-of-pages:3'
    );
  });

  test('should display 3 pages', async ({pager}) => {
    await expect(pager.pages).toHaveCount(3);
  });
});

test.describe('with numberOfPages=-5', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=storyargs=number-of-pages=-5'
    );
  });
  assertContainsComponentError(true);
});

test.describe('should allow custom icons', () => {
  // TODO: pass the argument via the URL instead of creating a story
  const customIcon =
    'https://raw.githubusercontent.com/coveo/ui-kit/master/packages/atomic/src/images/arrow-top-rounded.svg';

  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--custom-icon&viewMode=story'
    );
  });

  test('previous button', async ({pager, page}) => {
    await page.waitForRequest(/arrow-top-rounded/);
    await expect(pager.previousButtonIcon).toHaveAttribute('icon', customIcon);
  });
});
