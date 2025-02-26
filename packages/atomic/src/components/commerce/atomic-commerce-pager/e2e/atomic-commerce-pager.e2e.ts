import {test, expect} from './fixture';

test.describe('Default', () => {
  test.beforeEach(async ({pager}) => {
    await pager.load();
  });

  test('nextButton should be enabled', async ({pager}) => {
    await expect(pager.nextButton).toBeEnabled();
  });

  test('previousButton should be disabled', async ({pager}) => {
    await expect(pager.previousButton).toBeDisabled();
  });

  test('should be A11y compliant', async ({pager, makeAxeBuilder}) => {
    await pager.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

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

    test('pager button 2 should be selected', async ({pager}) => {
      await expect(pager.numericButton(2)).toHaveAttribute(
        'part',
        expect.stringContaining('active-page-button')
      );
    });

    test('pager button 1 should not be selected', async ({pager}) => {
      await expect(pager.numericButton(1)).not.toHaveAttribute(
        'part',
        'active-page-button'
      );
    });

    test('should include the page in the hash', async ({page}) => {
      expect(page.url()).toContain('#page=1');
    });

    test('nextButton should be enabled', async ({pager}) => {
      await expect(pager.nextButton).toBeEnabled();
    });

    test('previousButton should be enabled', async ({pager}) => {
      await expect(pager.previousButton).toBeEnabled();
    });
  });

  test.describe('after clicking the button previous', () => {
    test.beforeEach(async ({pager}) => {
      await pager.nextButton.click();
      await pager.previousButton.click();
    });

    test('pager button 1 should be selected', async ({pager}) => {
      await expect(pager.numericButton(1)).toHaveAttribute(
        'part',
        expect.stringContaining('active-page-button')
      );
    });

    test('pager button 2 should not be selected', async ({pager}) => {
      await expect(pager.numericButton(2)).not.toHaveAttribute(
        'part',
        'active-page-button'
      );
    });

    test('should not include the first page in the hash', async ({page}) => {
      await expect(page.url()).not.toContain('#page');
    });

    test('nextButton should be enabled', async ({pager}) => {
      await expect(pager.nextButton).toBeEnabled();
    });

    test('previousButton should be disabled', async ({pager}) => {
      await expect(pager.previousButton).toBeDisabled();
    });
  });

  test.describe('after clicking the pager button', () => {
    test.beforeEach(async ({pager}) => {
      await pager.numericButton(3).click();
    });

    test('pager button 3 should be selected', async ({pager}) => {
      await expect(pager.numericButton(3)).toHaveAttribute(
        'part',
        expect.stringContaining('active-page-button')
      );
    });

    test('pager button 1 should not be selected', async ({pager}) => {
      await expect(pager.numericButton(1)).not.toHaveAttribute(
        'part',
        'active-page-button'
      );
    });

    test('should include the page in the hash', async ({page}) => {
      await expect(page.url()).toContain('#page=2');
    });

    test('nextButton should be enabled', async ({pager}) => {
      await expect(pager.nextButton).toBeEnabled();
    });
    test('previousButton should be enabled', async ({pager}) => {
      await expect(pager.previousButton).toBeEnabled();
    });
  });

  test.describe('after clicking on page 5', () => {
    test.beforeEach(async ({pager}) => {
      await pager.numericButton(5).click();
    });

    test('pager button 5 should not be selected', async ({pager}) => {
      await expect(pager.numericButton(5)).not.toHaveAttribute(
        'part',
        'active-page-button'
      );
    });
  });

  test.describe('with 2 pages of products', () => {
    test('it should disable next button when reaching last page', async ({
      page,
      pager,
    }) => {
      await page.route(/commerce\/v2\/search/, async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        body['pagination']['totalPages'] = 2;
        body['pagination']['page'] = 1;
        await route.fulfill({
          response,
          body: JSON.stringify(body),
        });
      });
      await expect(pager.nextButton).toBeDisabled();
    });
  });
});

test.describe('with a valid page in the hash', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-commerce-pager--default&viewMode=story#page=2'
    );
  });

  test('pager button 3 should be selected', async ({pager}) => {
    await expect(pager.numericButton(3)).toHaveAttribute(
      'part',
      expect.stringContaining('active-page-button')
    );
  });

  test('should be A11y compliant', async ({pager, makeAxeBuilder}) => {
    await pager.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
});

test.describe('with number-of-pages=3', () => {
  test.beforeEach(async ({pager}) => {
    await pager.load({args: {numberOfPages: 3}});
  });

  test('should display 3 pages', async ({pager}) => {
    await expect(pager.pages).toHaveCount(3);
  });
});

test.describe('with numberOfPages=-5', () => {
  test.beforeEach(async ({pager}) => {
    await pager.load({args: {numberOfPages: -5}});
  });

  test('should display an error component', async ({pager}) => {
    await expect(pager.errorComponent).toBeVisible();
  });
});

test.describe('should allow custom icons', () => {
  const customIcon =
    'https://raw.githubusercontent.com/coveo/ui-kit/master/packages/atomic/src/images/arrow-top-rounded.svg';

  test.beforeEach(async ({pager}) => {
    await pager.load({story: 'custom-icon'});
  });

  test('previous button', async ({pager, page}) => {
    await page.waitForRequest(/arrow-top-rounded/);
    await expect(pager.previousButtonIcon).toHaveAttribute('icon', customIcon);
  });
});
